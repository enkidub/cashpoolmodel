/**
 * SimulationDashboard.jsx — CashPoolModel
 *
 * Stack:  React 18 + Tailwind CSS 3
 * Fonts:  add to your HTML <head>:
 *   <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=DM+Mono:wght@300;400&display=swap" rel="stylesheet">
 */

'use client';
import React, { useState, useMemo } from 'react';

// ─── SVG icon paths ────────────────────────────────────────────────────────

const PATHS = {
  layout:    <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
  share2:    <><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></>,
  trending:  <><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></>,
  grid:      <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></>,
  download:  <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
  chevron:   <polyline points="9 18 15 12 9 6"/>,
  clock:     <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
  check:     <polyline points="20 6 9 17 4 12"/>,
  arrowUp:   <><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></>,
  file:      <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></>,
  sparkle:   <path d="M12 3l1.9 5.8H20l-4.9 3.6 1.9 5.6-5-3.6-5 3.6 1.9-5.6L4.1 8.8H10.1z"/>,
  activity:  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>,
  shield:    <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>,
  zap:       <><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></>,
};

const Ico = ({ name, size = 15, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    className={className} aria-hidden>
    {PATHS[name]}
  </svg>
);

// ─── Ring ──────────────────────────────────────────────────────────────────

const Ring = ({ value, size = 46, strokeW = 2.8, color = '#4f46e5', bg = '#f1f5f9' }) => {
  const r   = (size - strokeW * 2) / 2;
  const cir = 2 * Math.PI * r;
  const arc = (value / 100) * cir;
  const c   = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={c} cy={c} r={r} fill="none" stroke={bg} strokeWidth={strokeW} />
      <circle cx={c} cy={c} r={r} fill="none" stroke={color} strokeWidth={strokeW}
        strokeDasharray={`${arc} ${cir}`} strokeLinecap="round"
        style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }} />
    </svg>
  );
};

// ─── Static data ───────────────────────────────────────────────────────────

const NAV = [
  { id: 'summary',     label: 'Executive Summary',  icon: 'layout'   },
  { id: 'structure',   label: 'Pool Structure',      icon: 'share2'   },
  { id: 'pnl',         label: 'P&L & Savings',       icon: 'trending' },
  { id: 'sensitivity', label: 'Sensitivity Matrix',  icon: 'grid'     },
  { id: 'analysis',    label: 'Simulations',         icon: 'activity' },
  { id: 'export',      label: 'Export / RFP Data',   icon: 'download' },
];

const KPIS = [
  { label: 'Net Interest Savings', value: '€842k',  badge: '↑ 18.3%', sub: 'vs. standalone arrangement', positive: true, ring: null, accent: '#10b981' },
  { label: 'Netting Efficiency',   value: '73%',    badge: '↑ 12pp',  sub: 'above sector benchmark',      positive: true, ring: 73,   accent: '#4f46e5' },
  { label: 'Freed-up Liquidity',   value: '€1.2M',  badge: 'Released', sub: 'from idle entity buffers',    positive: true, ring: null, accent: '#10b981' },
  { label: 'Avg. Yield Spread',    value: '+1.2%',  badge: '+120 bp', sub: 'over pool benchmark rate',    positive: true, ring: null, accent: '#10b981' },
];

const CHART_DATA = [
  { period: 'Q1 2025', without: 285, pooled: 142 },
  { period: 'Q2 2025', without: 312, pooled: 156 },
  { period: 'Q3 2025', without: 298, pooled: 149 },
  { period: 'Q4 2025', without: 327, pooled: 163 },
];

const SUBS = [
  { name: 'Acme Germany GmbH',    cc: 'EUR', balance: '€4.2M',    savings: '€218k', pct: 25.9 },
  { name: 'Acme France SAS',      cc: 'EUR', balance: '€3.8M',    savings: '€196k', pct: 23.3 },
  { name: 'Acme UK Ltd',          cc: 'GBP', balance: '£2.1M',    savings: '€142k', pct: 16.9 },
  { name: 'Acme Netherlands BV',  cc: 'EUR', balance: '€1.9M',    savings: '€128k', pct: 15.2 },
  { name: 'Acme Switzerland AG',  cc: 'CHF', balance: 'CHF 1.4M', savings: '€98k',  pct: 11.6 },
  { name: 'Acme Austria GmbH',    cc: 'EUR', balance: '€0.8M',    savings: '€60k',  pct:  7.1 },
];

// Histogram: 1,000 Monte Carlo scenarios, normal dist μ=+20k σ=60k
// viewBox: 400×200, x-axis maps -220k…+180k, each bin 20k wide → 20 bins × 20px
const HIST_BINS = [
  { center: -210, h: 1  }, { center: -190, h: 1  }, { center: -170, h: 2  },
  { center: -150, h: 3  }, { center: -130, h: 7  }, { center: -110, h: 16 },
  { center: -90,  h: 30 }, { center: -70,  h: 53 }, { center: -50,  h: 82 },
  { center: -30,  h: 115}, { center: -10,  h: 143}, { center:  10,  h: 160},
  { center:  30,  h: 160}, { center:  50,  h: 143}, { center:  70,  h: 115},
  { center:  90,  h: 82 }, { center: 110,  h: 53 }, { center: 130,  h: 30 },
  { center: 150,  h: 16 }, { center: 170,  h: 7  },
];
// In viewBox coords: x = center + 220 (maps -220→0, +180→400)
// VaR at -111k → x = 109, y bottom = 185 (5px margin at bottom for axis)
const VAR_X = 109;  // -111 + 220
const HIST_BOTTOM = 185;
const HIST_SCALE  = (HIST_BOTTOM - 10) / 160; // px per unit height (max 160 → fits in 175px)

// ─── Shared primitives ─────────────────────────────────────────────────────

const INDIGO = '#4f46e5';
const NAVY   = '#0f2744';
const SLATE_BAR = '#e2e8f0';

const SectionLabel = ({ children }) => (
  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.1em] mb-1">{children}</div>
);

const SectionTitle = ({ children }) => (
  <h2 className="text-slate-900 leading-tight mb-0"
    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 22, fontWeight: 600 }}>
    {children}
  </h2>
);

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}>
    {children}
  </div>
);

// ─── KPI Card ──────────────────────────────────────────────────────────────

function KPICard({ label, value, badge, sub, positive, ring }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.08em]">{label}</span>
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full tabular-nums
          ${positive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
          {badge}
        </span>
      </div>
      <div className="flex items-end justify-between mb-2">
        <span className="leading-none text-slate-900 tabular-nums"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 36, fontWeight: 600, letterSpacing: '-0.5px' }}>
          {value}
        </span>
        {ring !== null && (
          <div className="relative flex items-center justify-center" style={{ width: 46, height: 46 }}>
            <Ring value={ring} />
            <span className="absolute text-[9px] font-bold text-slate-700 tabular-nums"
              style={{ fontFamily: "'DM Mono', monospace" }}>{ring}%</span>
          </div>
        )}
      </div>
      <p className="text-[11px] text-slate-400 leading-snug font-light">{sub}</p>
    </Card>
  );
}

// ─── Bar Chart ─────────────────────────────────────────────────────────────

const CHART_H   = 200;
const CHART_MAX = 380;
const Y_TICKS   = [0, 100, 200, 300];
const pxH = v => `${(v / CHART_MAX) * CHART_H}px`;

function BarChart() {
  const [hovered, setHovered] = useState(null);
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-[14px] font-semibold text-slate-800" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Interest Cost: Before vs. After Pooling
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Quarterly interest expense · EUR thousands · illustrative simulation output</p>
        </div>
        <div className="flex items-center gap-5 shrink-0">
          {[{ color: SLATE_BAR, border: '#cbd5e1', label: 'Without pooling' }, { color: INDIGO, border: INDIGO, label: 'With CashPoolModel' }]
            .map(({ color, border, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-[3px] shrink-0" style={{ background: color, border: `1.5px solid ${border}` }} />
                <span className="text-[11px] text-slate-500">{label}</span>
              </div>
            ))}
        </div>
      </div>
      <div className="flex items-start gap-0">
        <div className="relative shrink-0" style={{ width: 38, height: CHART_H }}>
          {Y_TICKS.map(v => (
            <span key={v} className="absolute right-2 text-[9px] text-slate-400 leading-none"
              style={{ fontFamily: "'DM Mono', monospace", bottom: `calc(${pxH(v)} - 6px)` }}>
              {v}k
            </span>
          ))}
        </div>
        <div className="flex-1 relative border-l border-b border-slate-200" style={{ height: CHART_H }}>
          {Y_TICKS.slice(1).map(v => (
            <div key={v} className="absolute inset-x-0 border-t border-dashed border-slate-100 pointer-events-none" style={{ bottom: pxH(v) }} />
          ))}
          <div className="absolute inset-0 flex items-end justify-around px-6 pb-0">
            {CHART_DATA.map((d, gi) => (
              <div key={gi} className="flex items-end gap-1.5">
                <div className="relative group cursor-default"
                  onMouseEnter={() => setHovered({ gi, which: 'without' })}
                  onMouseLeave={() => setHovered(null)}>
                  <div className="w-9 rounded-t-[3px] transition-opacity duration-100"
                    style={{ height: pxH(d.without), backgroundColor: SLATE_BAR,
                      opacity: hovered && (hovered.gi !== gi || hovered.which !== 'without') ? 0.55 : 1 }} />
                  {hovered?.gi === gi && hovered?.which === 'without' && (
                    <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-800 text-white text-[10px] font-mono px-2 py-1 rounded shadow-md z-10">
                      €{d.without}k
                    </div>
                  )}
                </div>
                <div className="relative cursor-default"
                  onMouseEnter={() => setHovered({ gi, which: 'pooled' })}
                  onMouseLeave={() => setHovered(null)}>
                  <div className="w-9 rounded-t-[3px] transition-opacity duration-100"
                    style={{ height: pxH(d.pooled), backgroundColor: INDIGO,
                      opacity: hovered && (hovered.gi !== gi || hovered.which !== 'pooled') ? 0.55 : 1 }} />
                  {hovered?.gi === gi && hovered?.which === 'pooled' && (
                    <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-indigo-700 text-white text-[10px] font-mono px-2 py-1 rounded shadow-md z-10">
                      €{d.pooled}k · save €{d.without - d.pooled}k
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex justify-around mt-2" style={{ paddingLeft: 38 }}>
        {CHART_DATA.map((d, i) => (
          <span key={i} className="text-[10px] text-slate-400 font-medium" style={{ fontFamily: "'DM Sans', sans-serif" }}>{d.period}</span>
        ))}
      </div>
      <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-3 gap-4">
        {[
          { label: 'Total cost without pooling',    value: '€1,222k', color: 'text-slate-600' },
          { label: 'Total cost with CashPoolModel', value: '€610k',   color: 'text-indigo-600' },
          { label: 'Total annual interest saved',   value: '€612k ↓ 50%', color: 'text-emerald-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex flex-col gap-0.5">
            <span className="text-[10px] text-slate-400">{label}</span>
            <span className={`tabular-nums ${color}`}
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 16, fontWeight: 600 }}>
              {value}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── Subsidiaries Table ────────────────────────────────────────────────────

function SubsidiaryTable() {
  const maxPct = Math.max(...SUBS.map(s => s.pct));
  return (
    <Card className="overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-[13px] font-semibold text-slate-800" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Top Contributing Subsidiaries
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Ranked by projected annual savings · 6 of 8 entities shown</p>
        </div>
        <button className="flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
          View all <Ico name="chevron" size={11} color="#4f46e5" />
        </button>
      </div>
      <div className="grid px-6 py-2.5 bg-slate-50 border-b border-slate-100"
        style={{ gridTemplateColumns: '2fr 80px 1fr 1fr 160px' }}>
        {['Subsidiary', 'Ccy', 'Avg Balance', 'Proj. Savings', 'Contribution'].map(h => (
          <span key={h} className="text-[10px] font-semibold text-slate-400 uppercase" style={{ letterSpacing: '0.07em' }}>{h}</span>
        ))}
      </div>
      {SUBS.map((s, i) => (
        <div key={i}
          className={`grid px-6 items-center transition-colors hover:bg-slate-50 ${i < SUBS.length - 1 ? 'border-b border-slate-50' : ''}`}
          style={{ gridTemplateColumns: '2fr 80px 1fr 1fr 160px', paddingTop: 13, paddingBottom: 13 }}>
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
              <span className="text-[7px] font-bold text-slate-500 uppercase">{s.cc}</span>
            </div>
            <span className="text-[12px] font-medium text-slate-700" style={{ fontFamily: "'DM Sans', sans-serif" }}>{s.name}</span>
          </div>
          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 rounded px-1.5 py-0.5 w-fit font-mono">{s.cc}</span>
          <span className="text-[12px] text-slate-500 tabular-nums" style={{ fontFamily: "'DM Mono', monospace" }}>{s.balance}</span>
          <span className="tabular-nums text-emerald-600"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 15, fontWeight: 600 }}>{s.savings}</span>
          <div className="flex items-center gap-2.5">
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${(s.pct / maxPct) * 100}%`, backgroundColor: INDIGO, opacity: 0.7 + (s.pct / maxPct) * 0.3 }} />
            </div>
            <span className="text-[10px] text-slate-500 tabular-nums font-mono w-8 text-right shrink-0">{s.pct}%</span>
          </div>
        </div>
      ))}
    </Card>
  );
}

// ─── Section 1: Structure Comparison ──────────────────────────────────────

const STRUCTURE_ROWS = [
  { metric: 'Interest saving p.a.',  zba: { val: '€152k', good: true  }, notional: { val: '€135k', good: false } },
  { metric: 'WHT exposure',          zba: { val: 'None',  good: true  }, notional: { val: '€18k / yr', good: false } },
  { metric: 'Implementation time',   zba: { val: '3–4 months', good: true }, notional: { val: '6–8 months', good: false } },
  { metric: 'Net annual benefit',    zba: { val: '€152k', good: true  }, notional: { val: '€117k', good: false }, highlight: true },
];

function StructureComparison() {
  return (
    <div className="space-y-4">
      <div>
        <SectionLabel>Section 01</SectionLabel>
        <SectionTitle>Executive Summary — Structure Comparison</SectionTitle>
        <p className="text-[12px] text-slate-500 mt-1">ZBA (Zero-Balance Account) vs. Notional Pooling · illustrative model output</p>
      </div>

      <Card className="overflow-hidden">
        {/* Column headers */}
        <div className="grid border-b border-slate-100 bg-slate-50"
          style={{ gridTemplateColumns: '1.6fr 1fr 1fr' }}>
          <div className="px-6 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.08em]">Metric</div>
          {[
            { label: 'ZBA Pooling', tag: 'Recommended', tagColor: 'bg-navy-50 text-indigo-700 border-indigo-200', headerBg: 'bg-indigo-50/60' },
            { label: 'Notional Pooling', tag: null, headerBg: '' },
          ].map(({ label, tag, headerBg }) => (
            <div key={label} className={`px-6 py-3 flex items-center gap-2 ${headerBg}`}>
              <span className="text-[11px] font-semibold text-slate-700">{label}</span>
              {tag && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 uppercase tracking-wide">
                  {tag}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Data rows */}
        {STRUCTURE_ROWS.map(({ metric, zba, notional, highlight }, i) => (
          <div key={i}
            className={`grid border-b border-slate-50 last:border-0 transition-colors
              ${highlight ? 'bg-slate-50' : 'hover:bg-slate-50/60'}`}
            style={{ gridTemplateColumns: '1.6fr 1fr 1fr' }}>
            <div className={`px-6 py-3.5 flex items-center ${highlight ? 'font-semibold' : ''}`}>
              <span className={`text-[12px] ${highlight ? 'text-slate-900 font-semibold' : 'text-slate-600'}`}>{metric}</span>
            </div>
            {/* ZBA */}
            <div className="px-6 py-3.5 bg-indigo-50/30 border-x border-indigo-100/60">
              <span className={`text-[13px] tabular-nums font-semibold
                ${zba.good ? 'text-emerald-700' : 'text-red-500'}`}
                style={{ fontFamily: "'DM Mono', monospace" }}>
                {zba.val}
              </span>
              {zba.good && <span className="ml-1.5 text-emerald-500 text-[10px]">✓</span>}
            </div>
            {/* Notional */}
            <div className="px-6 py-3.5">
              <span className={`text-[13px] tabular-nums
                ${notional.good ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}
                style={{ fontFamily: "'DM Mono', monospace" }}>
                {notional.val}
              </span>
            </div>
          </div>
        ))}
      </Card>

      {/* Recommendation box */}
      <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-4 flex items-start gap-3">
        <div className="mt-0.5 w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
          <Ico name="zap" size={12} color="white" />
        </div>
        <div>
          <div className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider mb-1">Recommendation</div>
          <p className="text-[13px] text-indigo-900 leading-relaxed">
            <strong>ZBA generates €17k more annually</strong> than Notional Pooling under current rate assumptions,
            while eliminating withholding tax exposure and cutting implementation time by up to 50%.
            For this group structure, ZBA is the optimal structure at the current €STR level.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Section 2: Sensitivity Analysis ──────────────────────────────────────

const SENSI_BASE = {
  interestSaving: 135,   // €k
  payback:        27.5,  // months
  poolRate:       3.40,  // %
};

function sensiCalc(shiftBp) {
  return {
    interestSaving: +(SENSI_BASE.interestSaving + shiftBp * 0.20).toFixed(1),
    payback:        +(SENSI_BASE.payback        - shiftBp * 0.05).toFixed(1),
    poolRate:       +(SENSI_BASE.poolRate        + shiftBp / 100).toFixed(2),
  };
}

function SimValue({ base, current, unit = '', isShifted, betterWhenHigher = true }) {
  if (!isShifted) {
    return (
      <span className="text-[18px] font-semibold tabular-nums text-slate-800"
        style={{ fontFamily: "'DM Mono', monospace" }}>
        {unit}{typeof base === 'number' && Number.isInteger(base) ? base : base}{unit === '' ? '' : ''}
      </span>
    );
  }
  const improved = betterWhenHigher ? current > base : current < base;
  const color = improved ? '#059669' : '#dc2626';

  return (
    <div className="flex items-baseline gap-2">
      <span className="text-[14px] tabular-nums text-slate-300 line-through"
        style={{ fontFamily: "'DM Mono', monospace" }}>
        {unit}{base}
      </span>
      <span className="text-[18px] font-semibold tabular-nums" style={{ color, fontFamily: "'DM Mono', monospace" }}>
        {unit}{current}
      </span>
      <span className="text-[10px] font-semibold" style={{ color }}>
        {improved ? '▲' : '▼'} {Math.abs(current - base).toFixed(1)}
      </span>
    </div>
  );
}

function SensitivityAnalysis() {
  const [shift, setShift] = useState(0);
  const calc   = useMemo(() => sensiCalc(shift), [shift]);
  const isShifted = shift !== 0;

  const metrics = [
    {
      label: 'Interest Saving',
      unit: '€',
      suffix: 'k p.a.',
      base: SENSI_BASE.interestSaving,
      current: calc.interestSaving,
      betterWhenHigher: true,
      sub: 'Net annual interest benefit',
    },
    {
      label: 'Payback Period',
      unit: '',
      suffix: ' mo',
      base: SENSI_BASE.payback,
      current: calc.payback,
      betterWhenHigher: false,
      sub: 'Implementation breakeven',
    },
    {
      label: 'Pool Rate',
      unit: '',
      suffix: '%',
      base: SENSI_BASE.poolRate,
      current: calc.poolRate,
      betterWhenHigher: true,
      sub: 'Blended pooling rate',
    },
  ];

  const sliderPct = ((shift + 100) / 200) * 100;

  return (
    <div className="space-y-4">
      <div>
        <SectionLabel>Section 02</SectionLabel>
        <SectionTitle>Sensitivity Analysis — Interest Rates</SectionTitle>
        <p className="text-[12px] text-slate-500 mt-1">Model response to €STR parallel shift · base case at 0 bp</p>
      </div>

      <Card className="p-6">
        {/* Slider */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.08em]">€STR Shift</span>
            <div className="flex items-center gap-1.5">
              <span className={`text-[13px] font-bold tabular-nums px-2.5 py-0.5 rounded-md
                ${shift === 0 ? 'text-slate-500 bg-slate-100' : shift > 0 ? 'text-emerald-700 bg-emerald-50' : 'text-red-600 bg-red-50'}`}
                style={{ fontFamily: "'DM Mono', monospace" }}>
                {shift > 0 ? '+' : ''}{shift} bp
              </span>
              {isShifted && (
                <button onClick={() => setShift(0)}
                  className="text-[10px] text-slate-400 hover:text-slate-600 transition-colors underline underline-offset-2">
                  reset
                </button>
              )}
            </div>
          </div>

          {/* Custom slider track */}
          <div className="relative h-2 rounded-full bg-slate-100 mt-3">
            {/* Fill */}
            <div className="absolute top-0 h-full rounded-full transition-all duration-100"
              style={{
                left: shift >= 0 ? '50%' : `${sliderPct}%`,
                width: shift >= 0 ? `${sliderPct - 50}%` : `${50 - sliderPct}%`,
                backgroundColor: shift > 0 ? '#10b981' : shift < 0 ? '#ef4444' : '#e2e8f0',
              }} />
            {/* Center tick */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-3 bg-slate-300" />
            <input type="range" min={-100} max={100} step={25} value={shift}
              onChange={e => setShift(Number(e.target.value))}
              className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
              style={{ margin: 0 }} />
            {/* Thumb visual */}
            <div className="pointer-events-none absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md transition-all duration-100"
              style={{
                left: `calc(${sliderPct}% - 8px)`,
                backgroundColor: shift > 0 ? '#10b981' : shift < 0 ? '#ef4444' : '#4f46e5',
              }} />
          </div>

          {/* Scale labels */}
          <div className="flex justify-between mt-1.5">
            {[-100, -50, 0, +50, +100].map(v => (
              <span key={v} className={`text-[9px] tabular-nums ${v === 0 ? 'font-semibold text-slate-500' : 'text-slate-300'}`}
                style={{ fontFamily: "'DM Mono', monospace" }}>
                {v > 0 ? '+' : ''}{v}
              </span>
            ))}
          </div>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-3 gap-4">
          {metrics.map(({ label, unit, suffix, base, current, betterWhenHigher, sub }) => (
            <div key={label} className="rounded-lg border border-slate-100 bg-slate-50/60 px-4 py-3.5">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.08em] mb-2">{label}</div>
              <div className="mb-1">
                {!isShifted ? (
                  <span className="text-[22px] font-semibold tabular-nums text-slate-800"
                    style={{ fontFamily: "'DM Mono', monospace" }}>
                    {unit}{base}{suffix}
                  </span>
                ) : (() => {
                  const improved = betterWhenHigher ? current > base : current < base;
                  const col = improved ? '#059669' : '#dc2626';
                  return (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[13px] tabular-nums text-slate-300 line-through leading-none"
                        style={{ fontFamily: "'DM Mono', monospace" }}>
                        {unit}{base}{suffix}
                      </span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-[22px] font-semibold tabular-nums leading-none"
                          style={{ color: col, fontFamily: "'DM Mono', monospace" }}>
                          {unit}{current}{suffix}
                        </span>
                        <span className="text-[10px] font-bold" style={{ color: col }}>
                          {improved ? '▲' : '▼'} {Math.abs(current - base).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>
              <p className="text-[10px] text-slate-400">{sub}</p>
            </div>
          ))}
        </div>

        {/* Base-case note */}
        {!isShifted && (
          <p className="mt-4 text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 inline-block" />
            Move the slider to simulate rate scenarios. Struck-out values will appear when base case is overridden.
          </p>
        )}
      </Card>
    </div>
  );
}

// ─── Section 3: Liquidity & Risk Modeling ─────────────────────────────────

const VAR_BASE = { var95: -111, var99: -156, cvar: -139 };

function MonteCarloHistogram({ vol }) {
  // Scale risk metrics by vol / 12 (base vol = 12%)
  const scale = vol / 12;
  const var95 = Math.round(VAR_BASE.var95 * scale);
  const var99 = Math.round(VAR_BASE.var99 * scale);
  const cvar  = Math.round(VAR_BASE.cvar  * scale);

  // VaR line position in viewBox (x=0 maps to -220k, x=400 maps to +180k)
  // var95 maps to: var95 + 220 (viewBox x)
  const varX = var95 + 220;

  // Scale histogram bins horizontally when vol changes (widen distribution)
  // For simplicity, scale bar heights: tails get heavier, center thins
  const bins = HIST_BINS.map(b => {
    const z = b.center / (60 * scale);
    const pdf = Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI);
    return { ...b, scaledH: Math.max(1, Math.round(pdf / 0.3990 * 160)) };
  });

  return (
    <div className="space-y-4">
      <div>
        <SectionLabel>Section 03</SectionLabel>
        <SectionTitle>Liquidity & Risk Modeling</SectionTitle>
        <p className="text-[12px] text-slate-500 mt-1">Monte Carlo simulation · 1,000 daily scenarios · Cash VaR at 95th percentile</p>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {/* Left: Slider + Chart */}
        <div className="col-span-3 space-y-4">
          {/* Vol slider */}
          <Card className="px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.08em]">Balance Volatility (σ)</span>
              <span className="text-[13px] font-bold tabular-nums text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md"
                style={{ fontFamily: "'DM Mono', monospace" }}>
                {vol}%
              </span>
            </div>
            <div className="relative h-2 rounded-full bg-slate-100">
              <div className="absolute top-0 left-0 h-full rounded-full bg-indigo-500 transition-all duration-100"
                style={{ width: `${((vol - 5) / 25) * 100}%` }} />
              <input type="range" min={5} max={30} step={1}
                defaultValue={12}
                className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
                style={{ margin: 0 }}
                onChange={e => {/* handled by parent */}} />
              <div className="pointer-events-none absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-indigo-600 border-2 border-white shadow-md transition-all duration-100"
                style={{ left: `calc(${((vol - 5) / 25) * 100}% - 8px)` }} />
            </div>
            <div className="flex justify-between mt-1.5">
              {[5, 10, 15, 20, 25, 30].map(v => (
                <span key={v} className="text-[9px] text-slate-300 tabular-nums" style={{ fontFamily: "'DM Mono', monospace" }}>{v}%</span>
              ))}
            </div>
          </Card>

          {/* Histogram */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[12px] font-semibold text-slate-700">Distribution of Daily Balance Changes</span>
              <span className="text-[10px] text-slate-400 font-mono">n = 1,000 scenarios</span>
            </div>

            <div className="w-full overflow-hidden" style={{ borderRadius: 6 }}>
              <svg viewBox="0 0 400 200" width="100%" style={{ display: 'block' }}>
                {/* Grid lines */}
                {[40, 80, 120, 160].map(y => (
                  <line key={y} x1="0" y1={185 - y} x2="400" y2={185 - y}
                    stroke="#f1f5f9" strokeWidth="0.8" />
                ))}

                {/* Bars */}
                {bins.map((b, i) => {
                  const x = b.center + 220 - 10;
                  const barH = Math.min(b.scaledH, 170);
                  const isLoss = (b.center + 220) <= varX;
                  return (
                    <rect key={i}
                      x={x} y={185 - barH} width={19} height={barH}
                      fill={isLoss ? '#fca5a5' : '#c7d2fe'}
                      stroke={isLoss ? '#f87171' : '#a5b4fc'}
                      strokeWidth="0.4"
                      rx="1"
                    />
                  );
                })}

                {/* VaR red line */}
                <line x1={varX} y1="8" x2={varX} y2="185"
                  stroke="#dc2626" strokeWidth="2" strokeDasharray="4 2" />

                {/* VaR label above */}
                <rect x={varX - 52} y="2" width="104" height="14" rx="3" fill="#dc2626" />
                <text x={varX} y="12.5" textAnchor="middle"
                  fill="white" fontSize="7.5" fontFamily="DM Mono, monospace" fontWeight="600">
                  95% Daily VaR ({var95 > 0 ? '+' : ''}€{var95}k)
                </text>

                {/* X-axis line */}
                <line x1="0" y1="185" x2="400" y2="185" stroke="#e2e8f0" strokeWidth="1" />

                {/* X-axis labels */}
                {[-200, -150, -100, -50, 0, +50, +100, +150].map(v => (
                  <text key={v} x={v + 220} y="197" textAnchor="middle"
                    fill="#94a3b8" fontSize="6.5" fontFamily="DM Mono, monospace">
                    {v > 0 ? '+' : ''}{v}k
                  </text>
                ))}

                {/* Legend dots */}
                <rect x="8" y="10" width="8" height="8" rx="1.5" fill="#fca5a5" stroke="#f87171" strokeWidth="0.5" />
                <text x="20" y="17" fill="#64748b" fontSize="7" fontFamily="DM Sans, sans-serif">Loss tail (5%)</text>
                <rect x="80" y="10" width="8" height="8" rx="1.5" fill="#c7d2fe" stroke="#a5b4fc" strokeWidth="0.5" />
                <text x="92" y="17" fill="#64748b" fontSize="7" fontFamily="DM Sans, sans-serif">Normal outcomes</text>
              </svg>
            </div>
          </Card>
        </div>

        {/* Right: Risk Metrics + Interpretation */}
        <div className="col-span-2 flex flex-col gap-4">
          {/* Risk Metrics */}
          <Card className="p-5">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.08em] mb-4">Risk Metrics</div>
            <div className="space-y-3">
              {[
                { label: '95% Daily VaR', value: var95, color: '#dc2626', bg: 'bg-red-50', border: 'border-red-100', desc: '1-in-20 day event' },
                { label: '99% Daily VaR', value: var99, color: '#b91c1c', bg: 'bg-red-50', border: 'border-red-100', desc: '1-in-100 day event' },
                { label: 'CVaR (ES)',      value: cvar,  color: '#9f1239', bg: 'bg-rose-50', border: 'border-rose-100', desc: 'Expected shortfall' },
              ].map(({ label, value, color, bg, border, desc }) => (
                <div key={label} className={`rounded-lg border ${border} ${bg} px-3.5 py-3`}>
                  <div className="text-[10px] text-slate-500 mb-0.5">{label}</div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[20px] font-bold tabular-nums"
                      style={{ color, fontFamily: "'DM Mono', monospace" }}>
                      €{value}k
                    </span>
                    <span className="text-[9px] text-slate-400">{desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Interpretation */}
          <Card className="p-5 flex-1">
            <div className="flex items-center gap-1.5 mb-3">
              <Ico name="shield" size={13} color="#64748b" />
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.08em]">Interpretation</span>
            </div>
            <div className="space-y-2.5 text-[11.5px] text-slate-600 leading-relaxed">
              <p>
                On <strong className="text-slate-800">95% of trading days</strong> the pool balance will not fall
                by more than <strong className="text-red-600">€{Math.abs(var95)}k</strong> (1-in-20 day event).
              </p>
              <p>
                The worst 5% of days may see a balance drop of up to{' '}
                <strong className="text-rose-800">€{Math.abs(cvar)}k</strong> on average (CVaR / Expected Shortfall).
              </p>
              <p>
                At the current volatility assumption of <strong className="text-indigo-700">{vol}%</strong>,
                the pool maintains adequate liquidity buffers under all but extreme stress scenarios.
              </p>
              {vol > 20 && (
                <div className="mt-1 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-[11px] text-amber-800">
                  <strong>Note:</strong> Volatility above 20% triggers elevated VaR — consider intraday sweeps or credit facilities.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Simulations tab root ──────────────────────────────────────────────────

function SimulationsContent() {
  const [vol, setVol] = useState(12);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-8 space-y-10"
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[10px] font-semibold text-slate-400 uppercase mb-1.5" style={{ letterSpacing: '0.1em' }}>
            Simulation Report
          </div>
          <h1 className="text-slate-900 leading-tight"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 28, fontWeight: 600 }}>
            Simulations
          </h1>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mr-1">
            <Ico name="clock" size={12} color="#94a3b8" />
            <span>Generated May 2025</span>
          </div>
          <div className="w-px h-4 bg-slate-200" />
          <button className="flex items-center gap-1.5 text-[12px] font-semibold text-white
            bg-slate-900 hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors shadow-sm">
            <Ico name="download" size={13} color="white" />
            Export to PDF
          </button>
        </div>
      </div>

      {/* Section 1 */}
      <StructureComparison />

      {/* Divider */}
      <div className="border-t border-slate-100" />

      {/* Section 2 */}
      <SensitivityAnalysis />

      {/* Divider */}
      <div className="border-t border-slate-100" />

      {/* Section 3 — pass vol state down so slider works */}
      <div className="space-y-4">
        <div>
          <SectionLabel>Section 03</SectionLabel>
          <SectionTitle>Liquidity & Risk Modeling</SectionTitle>
          <p className="text-[12px] text-slate-500 mt-1">Monte Carlo simulation · 1,000 daily scenarios · Cash VaR at 95th percentile</p>
        </div>

        <div className="grid grid-cols-5 gap-4">
          {/* Left col: slider + histogram */}
          <div className="col-span-3 space-y-4">
            {/* Vol slider */}
            <Card className="px-5 py-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.08em]">Balance Volatility (σ)</span>
                <span className="text-[13px] font-bold tabular-nums text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md"
                  style={{ fontFamily: "'DM Mono', monospace" }}>
                  {vol}%
                </span>
              </div>
              <div className="relative h-2 rounded-full bg-slate-100">
                <div className="absolute top-0 left-0 h-full rounded-full bg-indigo-500 transition-all duration-100"
                  style={{ width: `${((vol - 5) / 25) * 100}%` }} />
                <input type="range" min={5} max={30} step={1} value={vol}
                  onChange={e => setVol(Number(e.target.value))}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
                  style={{ margin: 0 }} />
                <div className="pointer-events-none absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-indigo-600 border-2 border-white shadow-md transition-all duration-100"
                  style={{ left: `calc(${((vol - 5) / 25) * 100}% - 8px)` }} />
              </div>
              <div className="flex justify-between mt-1.5">
                {[5, 10, 15, 20, 25, 30].map(v => (
                  <span key={v} className={`text-[9px] tabular-nums ${v === vol ? 'text-indigo-500 font-semibold' : 'text-slate-300'}`}
                    style={{ fontFamily: "'DM Mono', monospace" }}>{v}%</span>
                ))}
              </div>
            </Card>

            {/* Histogram */}
            <HistogramChart vol={vol} />
          </div>

          {/* Right col: metrics + interpretation */}
          <RiskMetricsPanel vol={vol} />
        </div>
      </div>
    </div>
  );
}

// ─── Histogram sub-component ───────────────────────────────────────────────

function HistogramChart({ vol }) {
  const scale = vol / 12;

  const bins = HIST_BINS.map(b => {
    const z = b.center / (60 * scale);
    const pdf = Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI);
    return { ...b, scaledH: Math.max(1, Math.round((pdf / 0.3990) * 160)) };
  });

  const var95 = Math.round(VAR_BASE.var95 * scale);
  const varX  = var95 + 220;

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[12px] font-semibold text-slate-700">Distribution of Daily Balance Changes</span>
        <span className="text-[10px] text-slate-400 font-mono">n = 1,000 scenarios</span>
      </div>
      <div className="w-full overflow-hidden" style={{ borderRadius: 6 }}>
        <svg viewBox="0 0 400 205" width="100%" style={{ display: 'block' }}>
          {/* Grid lines */}
          {[40, 80, 120, 160].map(y => (
            <line key={y} x1="0" y1={185 - y} x2="400" y2={185 - y} stroke="#f1f5f9" strokeWidth="0.8" />
          ))}

          {/* Bars */}
          {bins.map((b, i) => {
            const x    = b.center + 220 - 10;
            const barH = Math.min(b.scaledH, 172);
            const isLoss = (b.center + 220) <= varX;
            return (
              <rect key={i} x={x} y={185 - barH} width={19} height={barH}
                fill={isLoss ? '#fca5a5' : '#c7d2fe'}
                stroke={isLoss ? '#f87171' : '#a5b4fc'}
                strokeWidth="0.4" rx="1" />
            );
          })}

          {/* VaR red line */}
          <line x1={varX} y1="22" x2={varX} y2="185"
            stroke="#dc2626" strokeWidth="2.5" strokeDasharray="5 2.5" />

          {/* VaR pill label */}
          <rect x={varX - 56} y="2" width="112" height="16" rx="4" fill="#dc2626" />
          <text x={varX} y="13.5" textAnchor="middle"
            fill="white" fontSize="7.5" fontFamily="DM Mono, monospace" fontWeight="700">
            95% Daily VaR (€{var95}k)
          </text>

          {/* Axis */}
          <line x1="0" y1="185" x2="400" y2="185" stroke="#e2e8f0" strokeWidth="1" />

          {/* X-axis labels */}
          {[-200, -100, 0, +100].map(v => (
            <text key={v} x={v + 220} y="197" textAnchor="middle"
              fill="#94a3b8" fontSize="7" fontFamily="DM Mono, monospace">
              {v > 0 ? '+' : ''}{v}k
            </text>
          ))}

          {/* Legend */}
          <rect x="6" y="26" width="8" height="8" rx="1.5" fill="#fca5a5" stroke="#f87171" strokeWidth="0.5" />
          <text x="18" y="33" fill="#64748b" fontSize="7" fontFamily="DM Sans, sans-serif">Loss tail (5%)</text>
          <rect x="80" y="26" width="8" height="8" rx="1.5" fill="#c7d2fe" stroke="#a5b4fc" strokeWidth="0.5" />
          <text x="92" y="33" fill="#64748b" fontSize="7" fontFamily="DM Sans, sans-serif">Normal outcomes</text>
        </svg>
      </div>
    </Card>
  );
}

// ─── Risk metrics panel ────────────────────────────────────────────────────

function RiskMetricsPanel({ vol }) {
  const scale = vol / 12;
  const var95 = Math.round(VAR_BASE.var95 * scale);
  const var99 = Math.round(VAR_BASE.var99 * scale);
  const cvar  = Math.round(VAR_BASE.cvar  * scale);

  return (
    <div className="col-span-2 flex flex-col gap-4">
      <Card className="p-5">
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.08em] mb-4">Risk Metrics</div>
        <div className="space-y-3">
          {[
            { label: '95% Daily VaR', value: var95, color: '#dc2626', bg: 'bg-red-50',  border: 'border-red-100',  desc: '1-in-20 day event'   },
            { label: '99% Daily VaR', value: var99, color: '#b91c1c', bg: 'bg-red-50',  border: 'border-red-100',  desc: '1-in-100 day event'  },
            { label: 'CVaR (ES)',      value: cvar,  color: '#9f1239', bg: 'bg-rose-50', border: 'border-rose-100', desc: 'Expected shortfall'   },
          ].map(({ label, value, color, bg, border, desc }) => (
            <div key={label} className={`rounded-lg border ${border} ${bg} px-3.5 py-3`}>
              <div className="text-[10px] text-slate-500 mb-0.5">{label}</div>
              <div className="flex items-baseline justify-between">
                <span className="text-[20px] font-bold tabular-nums transition-all duration-300"
                  style={{ color, fontFamily: "'DM Mono', monospace" }}>
                  €{value}k
                </span>
                <span className="text-[9px] text-slate-400">{desc}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5 flex-1">
        <div className="flex items-center gap-1.5 mb-3">
          <Ico name="shield" size={13} color="#64748b" />
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.08em]">Interpretation</span>
        </div>
        <div className="space-y-2.5 text-[11.5px] text-slate-600 leading-relaxed">
          <p>
            On <strong className="text-slate-800">95% of trading days</strong> the pool balance will not fall by more than{' '}
            <strong className="text-red-600">€{Math.abs(var95)}k</strong> (a 1-in-20 day event).
          </p>
          <p>
            The worst 5% of days may see a balance drop of up to{' '}
            <strong className="text-rose-800">€{Math.abs(cvar)}k</strong> on average (CVaR / Expected Shortfall).
          </p>
          <p>
            At <strong className="text-indigo-700">{vol}% volatility</strong>, the pool maintains adequate liquidity
            under all but extreme stress scenarios.
          </p>
          {vol > 20 && (
            <div className="mt-2 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-[11px] text-amber-800">
              <strong>Caution:</strong> Volatility above 20% significantly elevates VaR. Consider intraday sweeps or standby credit facilities.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

// ─── Sidebar ───────────────────────────────────────────────────────────────

function Sidebar({ active, onNav }) {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 select-none">
      <div className="px-5 pt-5 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="8" width="3" height="7" rx="1" fill="#60a5fa"/>
              <rect x="6" y="4" width="3" height="11" rx="1" fill="#93c5fd"/>
              <rect x="11" y="1" width="3" height="14" rx="1" fill="#bfdbfe"/>
              <path d="M2 6.5l5.5-2.5 5.5-2.5" stroke="#4ade80" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <div className="text-slate-900 leading-none"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 16, fontWeight: 600 }}>
              CashPoolModel
            </div>
            <div className="text-[9px] text-slate-400 mt-0.5" style={{ letterSpacing: '0.04em' }}>by Intercompany.io</div>
          </div>
        </div>
      </div>

      <div className="mx-3 mt-3 mb-1 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2.5">
        <div className="text-[9px] font-semibold text-slate-400 uppercase mb-1" style={{ letterSpacing: '0.08em' }}>Active Simulation</div>
        <div className="text-[12px] font-semibold text-slate-800" style={{ fontFamily: "'DM Sans', sans-serif" }}>Acme Manufacturing Group</div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] text-slate-400">8 entities</span>
          <span className="text-slate-300">·</span>
          <span className="text-[10px] text-slate-400">6 currencies</span>
          <span className="text-slate-300">·</span>
          <span className="text-[10px] text-slate-400">May 2025</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-0.5">
        <div className="text-[9px] font-semibold text-slate-300 uppercase px-3 pt-2 pb-1" style={{ letterSpacing: '0.1em' }}>
          Report sections
        </div>
        {NAV.map(item => {
          const isActive = item.id === active;
          return (
            <button key={item.id} onClick={() => onNav(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all duration-100
                ${isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
              <Ico name={item.icon} size={13} color={isActive ? '#0f172a' : '#94a3b8'} />
              <span className={`text-[12px] transition-colors ${isActive ? 'font-semibold text-slate-900' : 'font-medium'}`}>
                {item.label}
              </span>
              {isActive && <div className="ml-auto w-1 h-1 rounded-full bg-indigo-500" />}
            </button>
          );
        })}
      </nav>

      <div className="px-3 pb-4">
        <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3.5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Ico name="sparkle" size={11} color="#6366f1" />
            <span className="text-[11px] font-semibold text-indigo-700">Expert Advisory</span>
          </div>
          <p className="text-[10px] text-indigo-500 leading-snug mb-3">
            Discuss this simulation with a senior treasury practitioner before your bank meeting.
          </p>
          <button className="w-full text-[11px] font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2 transition-colors">
            Book Strategy Call →
          </button>
        </div>
      </div>
    </aside>
  );
}

// ─── Summary view ──────────────────────────────────────────────────────────

function SummaryContent() {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-8 space-y-5"
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[10px] font-semibold text-slate-400 uppercase mb-1.5" style={{ letterSpacing: '0.1em' }}>Simulation Report</div>
          <h1 className="text-slate-900 leading-tight"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 28, fontWeight: 600 }}>
            Executive Summary
          </h1>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mr-1">
            <Ico name="clock" size={12} color="#94a3b8" />
            <span>Generated May 2025</span>
          </div>
          <div className="w-px h-4 bg-slate-200" />
          <button className="flex items-center gap-1.5 text-[12px] font-semibold text-white bg-slate-900 hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors shadow-sm">
            <Ico name="download" size={13} color="white" />
            Export to PDF
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2 -mt-2">
        {['Acme Manufacturing Group', '8 entities', '6 currencies', 'ZBA structure'].map((t, i, arr) => (
          <React.Fragment key={t}>
            <span className="text-[12px] text-slate-500">{t}</span>
            {i < arr.length - 1 && <span className="text-slate-300 text-[11px]">·</span>}
          </React.Fragment>
        ))}
        <span className="ml-1 flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
          <Ico name="check" size={9} color="#059669" />
          Simulation complete
        </span>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {KPIS.map((k, i) => <KPICard key={i} {...k} />)}
      </div>
      <BarChart />
      <SubsidiaryTable />
    </div>
  );
}

// ─── Placeholder view ──────────────────────────────────────────────────────

function PlaceholderContent({ label }) {
  return (
    <div className="flex-1 flex items-center justify-center text-slate-300 text-[13px]">
      {label} — coming soon
    </div>
  );
}

// ─── Root ──────────────────────────────────────────────────────────────────

export default function SimulationDashboard() {
  const [activeNav, setActiveNav] = useState('analysis');

  const view = () => {
    switch (activeNav) {
      case 'summary':     return <SummaryContent />;
      case 'analysis':    return <SimulationsContent />;
      default:            return <PlaceholderContent label={NAV.find(n => n.id === activeNav)?.label} />;
    }
  };

  return (
    <div className="flex w-full min-h-[800px] bg-slate-50"
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <Sidebar active={activeNav} onNav={setActiveNav} />
      {view()}
    </div>
  );
}
