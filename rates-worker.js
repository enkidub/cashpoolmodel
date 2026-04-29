/**
 * cpm-rates — Cloudflare Worker
 * Deploy to: cpm-rates.kuba-houser.workers.dev
 *
 * Fetches live benchmark rates from free public APIs:
 *   • €STR    — ECB Data Portal (no auth required)
 *   • SOFR    — NY Fed Markets API (no auth required)
 *   • PRIBOR  — Czech National Bank API (no auth required)
 *
 * SONIA and SARON are not available via free CORS-friendly APIs,
 * so the dashboard uses indicative fallback values for those two.
 *
 * Edge cache TTL: 24 hours (Cloudflare CDN caches the response).
 * On cache miss the Worker fetches all three in parallel with a 6s timeout.
 *
 * Deploy steps:
 *   1. wrangler deploy rates-worker.js --name cpm-rates
 *   OR paste into dashboard.cloudflare.com › Workers › Create Worker
 */

const CACHE_TTL   = 86400;           // 24 h in seconds
const FETCH_MS    = 6000;            // per-source timeout
const CACHE_URL   = 'https://cpm-rates.internal/v1';

export default {
  async fetch(request, env, ctx) {

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
      'Cache-Control': `public, max-age=${CACHE_TTL}, stale-while-revalidate=${CACHE_TTL}`,
    };

    // Check Cloudflare edge cache
    const cache    = caches.default;
    const cacheReq = new Request(CACHE_URL);
    const cached   = await cache.match(cacheReq);
    if (cached) {
      const body = await cached.text();
      return new Response(body, { headers: { ...corsHeaders, 'X-Cache': 'HIT' } });
    }

    // Fetch all three sources in parallel
    const [estr, sofr, pribor] = await Promise.allSettled([
      withTimeout(fetchESTR(),   FETCH_MS),
      withTimeout(fetchSOFR(),   FETCH_MS),
      withTimeout(fetchPRIBOR(), FETCH_MS),
    ]);

    const rates = [];
    if (estr.status   === 'fulfilled' && estr.value)   rates.push(estr.value);
    if (sofr.status   === 'fulfilled' && sofr.value)   rates.push(sofr.value);
    if (pribor.status === 'fulfilled' && pribor.value) rates.push(pribor.value);

    const payload = JSON.stringify({
      rates,
      asOf: new Date().toISOString().slice(0, 10),
      live: rates.map(r => r.name),
    });

    const response = new Response(payload, { headers: corsHeaders });
    ctx.waitUntil(cache.put(cacheReq, response.clone()));
    return response;
  },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ]);
}

function signedChg(cur, prev) {
  if (prev == null) return { chg: null, pos: null };
  const diff = parseFloat((cur - prev).toFixed(2));
  return {
    chg: diff > 0 ? `+${diff.toFixed(2)}%` : diff < 0 ? `${diff.toFixed(2)}%` : '0.00%',
    pos: diff > 0 ? true : diff < 0 ? false : null,
  };
}

// ── €STR from ECB Data Portal ─────────────────────────────────────────────────
async function fetchESTR() {
  const res = await fetch(
    'https://data-api.ecb.europa.eu/service/data/EST/B.EU000A2X2A25.WT?format=jsondata&lastNObservations=2',
    { headers: { Accept: 'application/json' } }
  );
  if (!res.ok) return null;
  const d   = await res.json();
  const obs = d?.dataSets?.[0]?.series?.['0:0:0']?.observations;
  if (!obs) return null;
  const keys = Object.keys(obs).sort((a, b) => parseInt(a) - parseInt(b));
  if (keys.length < 1) return null;
  const cur  = parseFloat(obs[keys[keys.length - 1]]?.[0]);
  const prev = keys.length >= 2 ? parseFloat(obs[keys[keys.length - 2]]?.[0]) : null;
  return { name: '€STR', val: cur.toFixed(2), ...signedChg(cur, prev), src: 'ECB' };
}

// ── SOFR from NY Fed ──────────────────────────────────────────────────────────
async function fetchSOFR() {
  const res = await fetch('https://markets.newyorkfed.org/api/rates/sofr/last/2.json');
  if (!res.ok) return null;
  const d     = await res.json();
  const items = d?.refRates || [];
  if (!items.length) return null;
  const cur  = parseFloat(items[0]?.percentRate);
  const prev = items.length >= 2 ? parseFloat(items[1]?.percentRate) : null;
  return { name: 'SOFR', val: cur.toFixed(2), ...signedChg(cur, prev), src: 'NY Fed' };
}

// ── PRIBOR 3M from ČNB ───────────────────────────────────────────────────────
async function fetchPRIBOR() {
  const res = await fetch(
    'https://api.cnb.cz/cnbapi/financial-markets/money-market/pribor/actual?lang=EN'
  );
  if (!res.ok) return null;
  const d     = await res.json();
  const items = Array.isArray(d) ? d : (d?.items || d?.data || []);
  const m3 = items.find(x => {
    const mat = String(x.maturity || x.tenor || '').toUpperCase();
    return mat === '3M' || mat === 'P3M' || mat.startsWith('3M');
  });
  if (!m3) return null;
  const val = parseFloat(m3.rate ?? m3.value ?? m3.percentRate);
  if (isNaN(val)) return null;
  return { name: 'PRIBOR 3M', val: val.toFixed(2), chg: null, pos: null, src: 'ČNB' };
}
