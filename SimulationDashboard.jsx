/**
 * SimulationDashboard.jsx — CashPoolModel
 *
 * Stack:  React 18 + Tailwind CSS 3
 * Fonts:  add to your HTML <head> or _document.js:
 *   <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=DM+Mono:wght@300;400&display=swap" rel="stylesheet">
 * Icons:  inline SVG — zero extra dependencies
 */

'use client';
import React, { useState } from 'react';

// ─── Tiny SVG icon system ──────────────────────────────────────────────────

const PATHS = {
  layout:    <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
  share2:    <><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></>,
  trending:  <><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></>,
  grid:      <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></>,
  download:  <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
  chevron:   <polyline points="9 18 15 12 9 6"/>,
  clock:     <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
  check:     <><polyline points="20 6 9 17 4 12"/></>,
  arrowUp:   <><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></>,
  file:      <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></>,
  sparkle:   <><path d="M12 3l1.9 5.8H20l-4.9 3.6 1.9 5.6-5-3.6-5 3.6 1.9-5.6L4.1 8.8H10.1z"/></>,
};

const Ico = ({ name, size = 15, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    className={className} aria-hidden>
    {PATHS[name]}
  </svg>
);

// ─── Circular progress ring ────────────────────────────────────────────────

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
  { id: 'export',      label: 'Export / RFP Data',   icon: 'download' },
];

const KPIS = [
  {
    label:    'Net Interest Savings',
    value:    '€842k',
    badge:    '↑ 18.3%',
    sub:      'vs. standalone arrangement',
    positive: true,
    ring:     null,
    accent:   '#10b981',
  },
  {
    label:    'Netting Efficiency',
    value:    '73%',
    badge:    '↑ 12pp',
    sub:      'above sector benchmark',
    positive: true,
    ring:     73,
    accent:   '#4f46e5',
  },
  {
    label:    'Freed-up Liquidity',
    value:    '€1.2M',
    badge:    'Released',
    sub:      'from idle entity buffers',
    positive: true,
    ring:     null,
    accent:   '#10b981',
  },
  {
    label:    'Avg. Yield Spread',
    value:    '+1.2%',
    badge:    '+120 bp',
    sub:      'over pool benchmark rate',
    positive: true,
    ring:     null,
    accent:   '#10b981',
  },
];

const CHART = [
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

// ─── KPI Card ──────────────────────────────────────────────────────────────

function KPICard({ label, value, badge, sub, positive, ring }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col gap-0">

      {/* Label row */}
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest"
          style={{ letterSpacing: '0.08em' }}>
          {label}
        </span>
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full tabular-nums
          ${positive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
          {badge}
        </span>
      </div>

      {/* Value row */}
      <div className="flex items-end justify-between mb-2">
        <span
          className="leading-none text-slate-900 tabular-nums"
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 36,
            fontWeight: 600,
            letterSpacing: '-0.5px',
          }}>
          {value}
        </span>

        {ring !== null && (
          <div className="relative flex items-center justify-center" style={{ width: 46, height: 46 }}>
            <Ring value={ring} />
            <span
              className="absolute text-[9px] font-bold text-slate-700 tabular-nums"
              style={{ fontFamily: "'DM Mono', monospace" }}>
              {ring}%
            </span>
          </div>
        )}
      </div>

      {/* Sub */}
      <p className="text-[11px] text-slate-400 leading-snug font-light">{sub}</p>
    </div>
  );
}

// ─── Bar Chart ─────────────────────────────────────────────────────────────

const CHART_H   = 200;  // px — chart area height
const CHART_MAX = 380;  // scale ceiling (above all data points)
const Y_TICKS   = [0, 100, 200, 300];
const INDIGO    = '#4f46e5';
const SLATE_BAR = '#e2e8f0';

function BarChart() {
  const [hovered, setHovered] = useState(null); // { groupIdx, which }

  const pxH = v => `${(v / CHART_MAX) * CHART_H}px`;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3
            className="text-[14px] font-semibold text-slate-800"
            style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Interest Cost: Before vs. After Pooling
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Quarterly interest expense · EUR thousands · illustrative simulation output
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-5 shrink-0">
          {[
            { color: SLATE_BAR, border: '#cbd5e1', label: 'Without pooling' },
            { color: INDIGO,    border: INDIGO,    label: 'With CashPoolModel' },
          ].map(({ color, border, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-[3px] shrink-0"
                style={{ background: color, border: `1.5px solid ${border}` }} />
              <span className="text-[11px] text-slate-500">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Chart ── */}
      <div className="flex items-start gap-0">

        {/* Y-axis labels */}
        <div className="relative shrink-0" style={{ width: 38, height: CHART_H }}>
          {Y_TICKS.map(v => (
            <span
              key={v}
              className="absolute right-2 text-[9px] text-slate-400 leading-none"
              style={{
                fontFamily: "'DM Mono', monospace",
                bottom: `calc(${pxH(v)} - 6px)`,
              }}>
              {v}k
            </span>
          ))}
        </div>

        {/* Grid + bars */}
        <div
          className="flex-1 relative border-l border-b border-slate-200"
          style={{ height: CHART_H }}>

          {/* Horizontal grid lines */}
          {Y_TICKS.slice(1).map(v => (
            <div
              key={v}
              className="absolute inset-x-0 border-t border-dashed border-slate-100 pointer-events-none"
              style={{ bottom: pxH(v) }}
            />
          ))}

          {/* Bar groups */}
          <div className="absolute inset-0 flex items-end justify-around px-6 pb-0">
            {CHART.map((d, gi) => (
              <div key={gi} className="flex items-end gap-1.5">

                {/* Without bar */}
                <div
                  className="relative group cursor-default"
                  onMouseEnter={() => setHovered({ gi, which: 'without' })}
                  onMouseLeave={() => setHovered(null)}>
                  <div
                    className="w-9 rounded-t-[3px] transition-opacity duration-100"
                    style={{
                      height: pxH(d.without),
                      backgroundColor: SLATE_BAR,
                      opacity: hovered && (hovered.gi !== gi || hovered.which !== 'without') ? 0.55 : 1,
                    }}
                  />
                  {/* Tooltip */}
                  {hovered?.gi === gi && hovered?.which === 'without' && (
                    <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap
                      bg-slate-800 text-white text-[10px] font-mono px-2 py-1 rounded shadow-md z-10">
                      €{d.without}k
                    </div>
                  )}
                </div>

                {/* Pooled bar */}
                <div
                  className="relative cursor-default"
                  onMouseEnter={() => setHovered({ gi, which: 'pooled' })}
                  onMouseLeave={() => setHovered(null)}>
                  <div
                    className="w-9 rounded-t-[3px] transition-opacity duration-100"
                    style={{
                      height: pxH(d.pooled),
                      backgroundColor: INDIGO,
                      opacity: hovered && (hovered.gi !== gi || hovered.which !== 'pooled') ? 0.55 : 1,
                    }}
                  />
                  {/* Savings badge on hover */}
                  {hovered?.gi === gi && hovered?.which === 'pooled' && (
                    <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap
                      bg-indigo-700 text-white text-[10px] font-mono px-2 py-1 rounded shadow-md z-10">
                      €{d.pooled}k · save €{d.without - d.pooled}k
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* X-axis labels */}
      <div className="flex justify-around mt-2" style={{ paddingLeft: 38 }}>
        {CHART.map((d, i) => (
          <span key={i} className="text-[10px] text-slate-400 font-medium" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {d.period}
          </span>
        ))}
      </div>

      {/* ── Summary strip ── */}
      <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-3 gap-4">
        {[
          { label: 'Total cost without pooling', value: '€1,222k', color: 'text-slate-600' },
          { label: 'Total cost with CashPoolModel', value: '€610k',   color: 'text-indigo-600' },
          { label: 'Total annual interest saved',   value: '€612k ↓ 50%', color: 'text-emerald-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex flex-col gap-0.5">
            <span className="text-[10px] text-slate-400">{label}</span>
            <span
              className={`text-[14px] font-semibold tabular-nums ${color}`}
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 16, fontWeight: 600 }}>
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Subsidiaries Table ────────────────────────────────────────────────────

function SubsidiaryTable() {
  const maxPct = Math.max(...SUBS.map(s => s.pct));

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

      {/* Table header bar */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-[13px] font-semibold text-slate-800"
            style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Top Contributing Subsidiaries
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Ranked by projected annual savings · 6 of 8 entities shown
          </p>
        </div>
        <button className="flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
          View all <Ico name="chevron" size={11} color="#4f46e5" />
        </button>
      </div>

      {/* Column headers */}
      <div
        className="grid px-6 py-2.5 bg-slate-50 border-b border-slate-100"
        style={{ gridTemplateColumns: '2fr 80px 1fr 1fr 160px' }}>
        {['Subsidiary', 'Ccy', 'Avg Balance', 'Proj. Savings', 'Contribution'].map(h => (
          <span key={h} className="text-[10px] font-semibold text-slate-400 uppercase"
            style={{ letterSpacing: '0.07em' }}>
            {h}
          </span>
        ))}
      </div>

      {/* Rows */}
      {SUBS.map((s, i) => (
        <div
          key={i}
          className={`grid px-6 items-center transition-colors hover:bg-slate-50
            ${i < SUBS.length - 1 ? 'border-b border-slate-50' : ''}`}
          style={{ gridTemplateColumns: '2fr 80px 1fr 1fr 160px', paddingTop: 13, paddingBottom: 13 }}>

          {/* Name */}
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
              <span className="text-[7px] font-bold text-slate-500 uppercase">{s.cc}</span>
            </div>
            <span className="text-[12px] font-medium text-slate-700" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              {s.name}
            </span>
          </div>

          {/* Currency badge */}
          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 rounded px-1.5 py-0.5 w-fit font-mono">
            {s.cc}
          </span>

          {/* Balance */}
          <span className="text-[12px] text-slate-500 tabular-nums" style={{ fontFamily: "'DM Mono', monospace" }}>
            {s.balance}
          </span>

          {/* Savings */}
          <span className="text-[13px] font-semibold tabular-nums text-emerald-600"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 15, fontWeight: 600 }}>
            {s.savings}
          </span>

          {/* Contribution bar + pct */}
          <div className="flex items-center gap-2.5">
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(s.pct / maxPct) * 100}%`,
                  backgroundColor: INDIGO,
                  opacity: 0.7 + (s.pct / maxPct) * 0.3,
                }}
              />
            </div>
            <span className="text-[10px] text-slate-500 tabular-nums font-mono w-8 text-right shrink-0">
              {s.pct}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Sidebar ───────────────────────────────────────────────────────────────

function Sidebar({ active, onNav }) {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 select-none">

      {/* Logo */}
      <div className="px-5 pt-5 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          {/* Logo mark */}
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
            <div className="text-[9px] text-slate-400 mt-0.5" style={{ letterSpacing: '0.04em' }}>
              by Intercompany.io
            </div>
          </div>
        </div>
      </div>

      {/* Report meta chip */}
      <div className="mx-3 mt-3 mb-1 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2.5">
        <div className="text-[9px] font-semibold text-slate-400 uppercase mb-1" style={{ letterSpacing: '0.08em' }}>
          Active Simulation
        </div>
        <div className="text-[12px] font-semibold text-slate-800" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Acme Manufacturing Group
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] text-slate-400">8 entities</span>
          <span className="text-slate-300">·</span>
          <span className="text-[10px] text-slate-400">6 currencies</span>
          <span className="text-slate-300">·</span>
          <span className="text-[10px] text-slate-400">Apr 2025</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        <div className="text-[9px] font-semibold text-slate-300 uppercase px-3 pt-2 pb-1" style={{ letterSpacing: '0.1em' }}>
          Report sections
        </div>
        {NAV.map(item => {
          const isActive = item.id === active;
          return (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all duration-100 group
                ${isActive
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
              <Ico
                name={item.icon}
                size={13}
                color={isActive ? '#0f172a' : '#94a3b8'}
              />
              <span className={`text-[12px] transition-colors ${isActive ? 'font-semibold text-slate-900' : 'font-medium'}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="ml-auto w-1 h-1 rounded-full bg-indigo-500" />
              )}
            </button>
          );
        })}
      </nav>

      {/* CTA card */}
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

// ─── Main view content ─────────────────────────────────────────────────────

function MainContent() {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-8 space-y-5"
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* ── Page header ── */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[10px] font-semibold text-slate-400 uppercase mb-1.5"
            style={{ letterSpacing: '0.1em' }}>
            Simulation Report
          </div>
          <h1 className="text-slate-900 leading-tight"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 28, fontWeight: 600 }}>
            Executive Summary
          </h1>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-1">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mr-1">
            <Ico name="clock" size={12} color="#94a3b8" />
            <span>Generated April 2025</span>
          </div>
          <div className="w-px h-4 bg-slate-200" />
          <button className="flex items-center gap-1.5 text-[12px] font-semibold text-white
            bg-slate-900 hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors shadow-sm">
            <Ico name="download" size={13} color="white" />
            Export to PDF
          </button>
        </div>
      </div>

      {/* ── Subheader metadata ── */}
      <div className="flex items-center gap-2 -mt-2">
        {[
          'Acme Manufacturing Group',
          '8 entities',
          '6 currencies',
          'ZBA structure',
        ].map((t, i, arr) => (
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

      {/* ── KPI Grid ── */}
      <div className="grid grid-cols-4 gap-4">
        {KPIS.map((k, i) => <KPICard key={i} {...k} />)}
      </div>

      {/* ── Bar Chart ── */}
      <BarChart />

      {/* ── Subsidiaries Table ── */}
      <SubsidiaryTable />

    </div>
  );
}

// ─── Root export ───────────────────────────────────────────────────────────

export default function SimulationDashboard() {
  const [activeNav, setActiveNav] = useState('summary');

  return (
    <div
      className="flex w-full min-h-[800px] bg-slate-50"
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <Sidebar active={activeNav} onNav={setActiveNav} />
      <MainContent />
    </div>
  );
}
