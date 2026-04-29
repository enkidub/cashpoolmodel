// guide-data.js — Single source of truth for all field definitions,
// tooltip text, and KPI explanations.
// Used by: simulator-input.html (tooltips) and guide.html (client document).
// To add a new field or KPI: add an item here — both tooltip and guide update automatically.

const GUIDE_DATA = {

  meta: {
    product:  'CashPoolModel',
    subtitle: 'Simulator Setup & Results Guide',
    version:  '1.1',
    date:     'April 2026',
    byline:   'Independent treasury advisory by Intercompany.io · Geneva, Switzerland'
  },

  // Quick tooltip lookup by field ID — used in simulator-input.html
  tip(id) {
    for (const s of this.sections) {
      if (!s.items) continue;
      const item = s.items.find(x => x.id === id);
      if (item && (item.tip || item.summary)) return item.tip || item.summary;
    }
    return '';
  },

  sections: [

    // ─────────────────────────────────────────────────────────────────────────
    {
      id:    'intro',
      title: 'What This Simulator Does',
      type:  'prose',
      content: [
        'CashPoolModel calculates the financial impact of implementing a cash pool for your group. It compares your current standalone banking arrangement — where each entity manages its own liquidity — against a pooled structure where surplus and deficit positions are offset internally before the bank is involved.',
        'The output is a quantified business case: annual interest savings, operational savings, implementation cost, and payback period, structured for a CFO presentation or bank RFP. All figures are generated from your own inputs — not industry benchmarks or vendor estimates.',
        'This guide explains every input field, the three available pool structure types, and how to interpret each metric in the output report.'
      ]
    },

    // ─────────────────────────────────────────────────────────────────────────
    {
      id:    'pool-types',
      title: 'Pool Structure Types',
      type:  'cards',
      items: [
        {
          id:       'zba',
          label:    'Zero-Balancing — Physical ZBA',
          tag:      'Most common',
          summary:  'Cash is physically swept from subsidiary accounts to a central header account each day. Subsidiaries start each morning at or near zero.',
          tip:      'Physical sweep of cash to a central header account each day. Netting eliminates the need for bilateral overdrafts and deposits across entities.',
          pros:     [
            'Simple, transparent mechanics — straightforward to audit and explain',
            'Well understood by all major corporate banks',
            'Maximises netting efficiency — all eligible balances are offset'
          ],
          cons:     [
            'Physical transfers may trigger withholding tax (WHT) on cross-border interest payments from header to subsidiaries',
            'Requires a TMS or robust daily reconciliation process'
          ],
          best_for: 'Single-currency groups, or multi-currency groups with strong bilateral tax treaty networks that reduce WHT to zero or 5%.'
        },
        {
          id:       'notional',
          label:    'Notional Pooling',
          tag:      'Multi-currency friendly',
          summary:  'No cash is physically moved. The bank calculates interest on the combined net position across all accounts. Each entity retains its own balance.',
          tip:      'Interest calculated on the combined net position without physical cash movement. Avoids WHT on intercompany interest.',
          pros:     [
            'No physical cash movement — avoids withholding tax on intercompany interest entirely',
            'Simpler operationally — no daily sweep reconciliation',
            'Each subsidiary retains its own balance and autonomy'
          ],
          cons:     [
            'Not available in all jurisdictions — restricted in several EU countries',
            'Bank typically charges 15–25% higher annual fees than an equivalent ZBA structure',
            'Less intuitive for subsidiary finance teams to understand their interest credit'
          ],
          best_for: 'Multi-currency, multi-jurisdiction groups where cross-border WHT is a significant concern, or where subsidiary autonomy is politically important.'
        },
        {
          id:       'target',
          label:    'Target Balancing',
          tag:      'Operational buffer preserved',
          summary:  'A variant of ZBA where each entity retains a defined minimum balance before sweeping excess cash upward. Only amounts above the target are pooled.',
          tip:      'Entities keep a minimum operational buffer before sweeping to the pool. Set the retained balance amount in the field below.',
          pros:     [
            'Subsidiaries maintain a working capital buffer — reduces treasury friction at subsidiary level',
            'Preserves some local liquidity autonomy while still capturing most pool savings',
            'Flexible — target balance can be set individually per entity in an advanced implementation'
          ],
          cons:     [
            'Lower netting efficiency than full ZBA — retained balances do not participate in the offset',
            'More complex to model and explain in a bank RFP',
            'The retained buffer earns only bilateral deposit rates, not the higher pool credit rate'
          ],
          best_for: 'Groups where subsidiaries have predictable but material working capital needs, or where a full sweep to zero would cause operational friction.'
        }
      ]
    },

    // ─────────────────────────────────────────────────────────────────────────
    {
      id:    'group-setup',
      title: 'Group Setup',
      type:  'fields',
      items: [
        {
          id:      'groupName',
          label:   'Group Name',
          tip:     'Your group or holding company name. Appears on the report cover page.',
          detail:  'Used for labelling on the PDF report only. Has no effect on calculations.'
        },
        {
          id:      'poolBank',
          label:   'Pool Bank',
          tip:     'The bank you are considering for the pool header account.',
          detail:  'The pool bank holds the master or header account and manages the daily sweeping mechanics. Large pan-European banks — ING, Citi, Deutsche Bank, BNP Paribas, HSBC — typically offer the most competitive cash pooling products for multi-country groups. For a CEE-focused group, Erste, Raiffeisen, or UniCredit may offer better regional coverage.\n\nIf you are issuing a bank RFP, you will typically invite 2–3 banks to propose. Use this field to model each bank\'s offer separately and compare.'
        },
        {
          id:      'currency',
          label:   'Base Currency',
          tip:     'The reporting currency for your group — all savings will be expressed in this currency.',
          detail:  'All entity balances and savings are expressed in the base currency. For non-base-currency entities, convert their average daily balance to the base currency equivalent using the prevailing spot rate at the time of the simulation. For notional multi-currency pools, the bank will apply its own FX conversion logic based on daily fixing rates.'
        }
      ]
    },

    // ─────────────────────────────────────────────────────────────────────────
    {
      id:    'entities',
      title: 'Entity Accounts',
      type:  'fields',
      items: [
        {
          id:      'balance',
          label:   'Average Daily Balance',
          tip:     'Average cash position in this entity\'s accounts over 12 months. Positive = surplus (cash provider to the pool). Negative = deficit (cash user from the pool).',
          detail:  'This is the single most important input in the entire simulation.\n\nUse your bank\'s account statements or treasury management system for a 12-month rolling average. Avoid period-end balances — they are typically not representative of the entity\'s true daily position (end-of-month or end-of-quarter balances are often distorted by payment timing).\n\nFor non-base-currency entities: convert at the current spot rate and enter the base currency equivalent.\n\nIf your group has seasonal patterns, consider running two simulations — one with peak season averages and one with trough averages — and use the resulting range in your sensitivity analysis.'
        },
        {
          id:      'accounts',
          label:   'Number of Bank Accounts',
          tip:     'Total number of bank accounts held by this entity across all its banking relationships.',
          detail:  'Used to calculate the per-account fee saving when the pool consolidates banking relationships.\n\nA group with 40 accounts across 8 entities, paying €600–€1,000 per account per year, saves €24k–€40k annually from account rationalisation alone when the pool structure reduces the number of active relationships.\n\nFor the simulation, include all current accounts, short-term deposit accounts, and overdraft facilities. Exclude accounts that will not participate in the pool (e.g., petty cash, restricted accounts).'
        },
        {
          id:      'country',
          label:   'Entity Domicile (Country)',
          tip:     'Legal jurisdiction of this entity. Affects withholding tax applicability and pool eligibility.',
          detail:  'The entity\'s jurisdiction determines three things:\n\n1. Pool eligibility — some jurisdictions restrict or prohibit participation in cross-border notional pools. Check with your local legal counsel for entities in India, Brazil, China, or certain MENA jurisdictions.\n\n2. Withholding tax (WHT) — the applicable treaty rate on interest paid from the pool header to this entity. EU entities in countries with a parent-subsidiary directive may have 0% WHT. Others depend on the bilateral treaty between the header country and the entity country.\n\n3. EU residency badge in the report — indicates which entities benefit from EU regulatory protections and reduced compliance burden.'
        },
        {
          id:      'cc',
          label:   'Account Currency',
          tip:     'The currency in which this entity\'s main accounts are denominated.',
          detail:  'Multi-currency entities can participate in either notional multi-currency pools (no conversion) or ZBA pools with an FX conversion layer (the bank converts each entity\'s position to the base currency before sweeping).\n\nFor this simulation, enter all balances in base currency equivalent regardless of the entity\'s local currency. This simplification is accurate for ZBA pools. For notional multi-currency pools, the bank\'s internal FX management may produce slightly different results.'
        }
      ]
    },

    // ─────────────────────────────────────────────────────────────────────────
    {
      id:    'rates',
      title: 'Interest Rates',
      type:  'fields',
      items: [
        {
          id:      'debitRate',
          label:   'Bilateral Debit Rate (Without Pool)',
          tip:     'What your bank currently charges entities that are in overdraft, without a pool in place.',
          detail:  'This is your current cost of borrowing for deficit entities — the "pain rate" that the pool is designed to eliminate.\n\nTypical bilateral overdraft rates for mid-market corporates are benchmark + 1.0–2.5% (e.g., €STR + 1.5% = approximately 5.4% at current rates). Use the blended average across all your deficit entities if they differ by entity.\n\nIf you do not have confirmed bilateral rates, use the relevant benchmark (€STR, SOFR, SONIA, PRIBOR) plus 1.5–2.0% as a conservative estimate.'
        },
        {
          id:      'creditRate',
          label:   'Bilateral Credit Rate (Without Pool)',
          tip:     'What your bank currently pays surplus entities on their deposits, without a pool.',
          detail:  'This is the rate your cash-rich entities currently earn on positive balances.\n\nFor most mid-sized corporates without negotiating power on individual accounts, bilateral deposit rates are 0.3–0.7% below the relevant benchmark. Many entities earn benchmark − 0.5% or less.\n\nThe gap between your debit rate and your credit rate is the "bilateral spread" — the primary driver of pool savings. Larger spreads create larger savings opportunities.'
        },
        {
          id:      'poolDebit',
          label:   'Pool Debit Rate',
          tip:     'The rate the pool bank will charge on any remaining net deficit position after netting.',
          detail:  'After netting all surplus and deficit positions, if the group\'s combined position is still in deficit, the pool bank charges this rate on the shortfall.\n\nThis should be materially lower than your current bilateral debit rate — if it is not, the bank\'s offer is not competitive. A well-structured pool debit rate should be benchmark + 0.5–1.0%, compared to the bilateral rate of benchmark + 1.5–2.5%.\n\nIf the bank offers a pool debit rate higher than your bilateral rate, reject the offer or use it as a negotiating point.'
        },
        {
          id:      'poolCredit',
          label:   'Pool Credit Rate',
          tip:     'The rate the pool bank will pay on any net surplus position after netting.',
          detail:  'After netting, if the combined group position is in surplus, the bank pays this rate on the balance.\n\nThis should be meaningfully higher than your current bilateral credit rates. A competitive pool credit rate is typically benchmark − 0.0% to − 0.2%, compared to bilateral rates of benchmark − 0.3% to − 0.7%.\n\nThe spread improvement on the net surplus position — the difference between your current bilateral credit rate and the pool credit rate — is often the single largest component of pool value, particularly for groups with large net-positive positions.'
        },
        {
          id:      'whtRate',
          label:   'Withholding Tax (WHT) Rate',
          tip:     'Tax deducted on interest paid from the pool header to surplus subsidiaries in other jurisdictions.',
          detail:  'In a ZBA pool, the header company earns all the credit interest and then allocates a corresponding amount to surplus entities as intercompany interest income. Where the header and the subsidiary are in different jurisdictions, the payment may be subject to withholding tax.\n\nApplicable rate depends on the bilateral tax treaty between the two countries:\n• EU-to-EU (under Parent-Subsidiary Directive): often 0%\n• Treaty countries (e.g., Switzerland–EU, US–EU): typically 5–15%\n• No treaty: up to 25–35%\n\nNotional pooling avoids this issue entirely because there is no intercompany interest payment — the bank calculates interest directly for each participating account.\n\nConsult your group tax adviser to confirm the effective rate for your specific entity domicile combination.'
        }
      ]
    },

    // ─────────────────────────────────────────────────────────────────────────
    {
      id:    'costs',
      title: 'Implementation & Operating Costs',
      type:  'fields',
      items: [
        {
          id:      'implCost',
          label:   'Implementation Cost (One-Off)',
          tip:     'Total one-time cost to set up the pool. Includes legal, TMS integration, bank onboarding, and internal project time.',
          detail:  'Typical breakdown for a mid-sized group (5–10 entities, 1–2 currencies):\n\n• Legal & documentation (intercompany loan agreements, pool agreement, transfer pricing documentation): €30–80k\n• TMS configuration or new TMS implementation: €50–150k\n• Bank onboarding and KYC for all entities: €10–30k\n• Internal project management (FTE time, 4–8 months): €20–60k\n\nTotal range: €100k–€400k. Larger groups with complex multi-bank structures, multiple currencies, or entities in restricted jurisdictions will be at the higher end.\n\nNote: Implementation cost has no effect on the annual savings calculation — it only affects the payback period.'
        },
        {
          id:      'bankFees',
          label:   'Annual Bank Fees',
          tip:     'Recurring annual fees charged by the pool bank for maintaining the cash pooling structure.',
          detail:  'Includes: monthly header account maintenance fees, per-transaction sweep fees, per-account fees for pool participants, and any reporting, API access, or TMS connectivity charges.\n\nTypical range for a 5–10 entity pool with a major European bank: €15k–€60k per year.\n\nThese fees are highly negotiable. Banks often reduce by 30–40% in a competitive RFP. Request itemised fee schedules and benchmark against competing proposals. Multi-year volume commitments typically yield better pricing.'
        },
        {
          id:      'adminCost',
          label:   'Annual Admin Cost',
          tip:     'Internal annual cost of running the pool: treasury FTE time, TMS licensing, intercompany reconciliation.',
          detail:  'Estimate 0.3–0.8 FTE for daily pool management and monthly reconciliation in a mid-sized group. At a blended internal cost of €80–120k per FTE, that is €25–95k per year in internal resource cost.\n\nAdditional items:\n• TMS annual licensing (if applicable): €10–40k\n• Transfer pricing documentation review (annual): €5–15k\n• Intercompany interest settlements: administrative overhead\n\nSome groups partially offset this with headcount reduction from simplified bank relationships and eliminated local credit facility management.'
        },
        {
          id:      'fxVolume',
          label:   'Annual FX Payment Volume (€M)',
          tip:     'Total cross-currency payment volume across the group per year. Used to estimate FX conversion savings.',
          detail:  'A pool structure allows the group to net offsetting cross-currency flows before they reach the FX conversion stage, reducing gross conversion volume.\n\nSavings mechanism:\n• Internal netting reduces the gross volume of FX conversions\n• Consolidated FX flow through one bank improves pricing (tighter bid-offer spread)\n• Elimination of small individual-entity conversions at unfavourable rates\n\nTypical saving: 8–20 basis points (0.08–0.20%) on gross FX volume. On €500M annual volume, that is €400k–€1M per year in FX cost reduction. Include all intercompany payments and external supplier payments in non-base currencies.'
        }
      ]
    },

    // ─────────────────────────────────────────────────────────────────────────
    {
      id:    'kpis',
      title: 'Understanding Your Results',
      type:  'metrics',
      items: [
        {
          id:      'nettingEff',
          label:   'Netting Efficiency',
          tag:     'Key structural indicator',
          tip:     'Percentage of gross surplus and deficit positions that offset each other within the pool.',
          detail:  'Formula: min(Total Surplus, Total Deficit) ÷ max(Total Surplus, Total Deficit) × 100%\n\nA netting efficiency of 70% means that 70% of the gross liquidity imbalance is eliminated internally — without the bank charging borrowing rates or the group leaving deposit rates on the table.\n\nBenchmarks:\n• Below 40% — Low. The pool may not be cost-effective. Consider whether the group structure can be improved.\n• 40–65% — Moderate. Typical for groups with dominant surplus or deficit entities.\n• 65–80% — Good. Strong business case in most rate environments.\n• Above 80% — Excellent. Very strong case, robust even in low-rate environments.\n\nKey driver: the balance of surplus vs. deficit entities. A group with €10M total surplus and €10M total deficit achieves 100% netting. A group with €10M surplus and only €1M deficit achieves 10%.'
        },
        {
          id:      'interestSaving',
          label:   'Net Interest Saving',
          tag:     'Usually the largest component',
          tip:     'Annual saving from eliminating the spread between borrowing and deposit rates across entities.',
          detail:  'This is typically the largest single component of pool value — often 60–75% of total annual benefit.\n\nThree sources:\n\n1. Overdraft elimination — deficit entities stop borrowing at bilateral debit rates. Their deficit is funded from group surplus at the pool debit rate instead.\n\n2. Deposit rate improvement — surplus entities earn the pool credit rate rather than the lower bilateral credit rate.\n\n3. Netting benefit — the portion of surplus that offsets the deficit earns no explicit interest in a notional sense, but eliminates the gross interest cost and income that previously offset imperfectly at bilateral spreads.\n\nIf your group has near-equal surplus and deficit positions, the netting saving dominates. If one side strongly dominates, the rate improvement on the net position drives the saving.'
        },
        {
          id:      'opSaving',
          label:   'Operational Savings',
          tag:     'Secondary but significant',
          tip:     'Annual savings from FX netting, account rationalisation, and reduced external credit facility costs.',
          detail:  'Three sub-components:\n\n• FX conversion saving — netting of offsetting cross-currency flows before external conversion. Typically 8–20 basis points on annual FX volume.\n\n• Facility fee reduction — elimination of unused overdraft and working capital facilities at subsidiaries that no longer need them with pool funding. Often €5–20k per entity per year.\n\n• Account rationalisation — reduced per-account bank fees as the group consolidates to fewer banking relationships. €400–€1,000 per account per year is typical.\n\nOperational savings are typically 25–40% of total pool value. They are more stable than interest savings across different rate environments, making them important for the robustness of the business case.'
        },
        {
          id:      'netBenefit',
          label:   'Net Annual Benefit',
          tag:     'Board headline figure',
          tip:     'Total annual value created by the pool, after deducting all recurring operating costs.',
          detail:  'Formula: Interest Saving + Operational Savings − Annual Bank Fees − Annual Admin Cost (− WHT cost if applicable) (− Notional fee premium if applicable)\n\nThis is the number to lead with in a board presentation or CFO approval memo. A positive net benefit confirms the pool pays for itself on a recurring basis, independently of the one-off implementation cost.\n\nFor the board presentation, also show the net benefit under the stress scenario from the sensitivity matrix — demonstrating the case holds in a rate decline or balance reduction is often the decisive factor in gaining approval.'
        },
        {
          id:      'paybackMo',
          label:   'Payback Period',
          tag:     'Investment return metric',
          tip:     'Number of months until cumulative annual savings fully recover the implementation cost.',
          detail:  'Formula: Implementation Cost ÷ Annual Net Benefit × 12 months\n\nInterpretation benchmarks:\n• Under 12 months — Excellent. Straightforward to approve at any board level.\n• 12–18 months — Strong. Standard treasury project threshold.\n• 18–24 months — Acceptable. Ensure qualitative benefits are documented.\n• 24–36 months — Requires justification. Banking relationship consolidation, risk reduction, or strategic rationale must supplement the financial case.\n• Over 36 months — Marginal. Reconsider structure, negotiate rates, or wait for a more favourable rate environment.'
        },
        {
          id:      'sensitivityMatrix',
          label:   'Sensitivity Matrix',
          tag:     'Risk & robustness analysis',
          tip:     'Shows how net annual benefit changes across different interest rate and balance scenarios.',
          detail:  'The matrix varies two dimensions simultaneously:\n• Rows: average daily balance shift (−20% to +20%)\n• Columns: interest rate level shift (−1.0% to +1.0%)\n\nEach cell shows net annual benefit in €k at that combination.\n\nHow to use it:\n\n1. Identify your worst-case cell — this is the scenario where rates decline significantly and balances shrink. If this is still positive, the case is robust.\n\n2. Show the board the range — from worst case to best case. Boards appreciate seeing the business case is not dependent on a single rate assumption.\n\n3. Use it to set a minimum rate threshold — below which you would pause or restructure the pool. This becomes your monitoring trigger.\n\nColour coding: darker green = stronger benefit. The base case (current rates, current balances) is the centre cell.'
        },
        {
          id:      'goNogo',
          label:   'GO / NO-GO Recommendation',
          tag:     'Executive summary verdict',
          tip:     'Executive recommendation derived from payback period, netting efficiency, and net annual benefit.',
          detail:  'The recommendation algorithm:\n\nGO is issued when all three conditions are met:\n• Payback period < 24 months\n• Netting efficiency > 35%\n• Net annual benefit > 0 (pool is self-funding after costs)\n\nNO-GO is flagged when:\n• Payback period > 36 months, or\n• Net annual benefit is negative (pool costs more than it saves), or\n• Netting efficiency < 20% (group structure is too one-sided to benefit)\n\nNO-GO does not mean a pool is impossible — it means the current inputs do not support a strong business case. Common remedies: negotiate better pool rates, restructure entity banking, or address intercompany balance mismatches before pursuing a pool.\n\nA REVIEW flag (between GO and NO-GO thresholds) indicates the case is marginal and requires qualitative factors to be assessed — relationship banking benefits, operational risk reduction, or strategic consolidation rationale.'
        }
      ]
    },

    // ─────────────────────────────────────────────────────────────────────────
    {
      id:    'next-steps',
      title: 'From Report to Implementation',
      type:  'prose',
      content: [
        'Once you have your simulation results and the GO recommendation, the typical path to a live pool is four phases:',
        '1. Internal approval — present the executive summary and sensitivity matrix to your CFO and board. The payback period and worst-case scenario from the sensitivity matrix are your two most important figures. Attach the full PDF report as the supporting document.',
        '2. Bank RFP — issue a structured request for proposal to 2–3 target banks using the RFP package section of the report. Specify pool type, participating entities, required currencies, and your current bilateral rates as a benchmark. A competitive RFP typically yields 30–40% lower fees than a single-bank negotiation.',
        '3. Legal and tax review — engage your group tax adviser to confirm the intercompany interest structure, applicable WHT treaty positions, and any transfer pricing documentation required for the arm\'s-length interest rate. This is particularly important for ZBA structures and for groups with entities in multiple tax jurisdictions.',
        '4. Implementation — typically 3–6 months from bank mandate to live pool. The four parallel workstreams are: (a) bank account restructuring and KYC, (b) TMS configuration for daily sweep instructions, (c) intercompany loan or cash pooling agreement execution, and (d) internal treasury policy update covering sweep parameters, interest allocation methodology, and reporting.'
      ]
    }

  ] // end sections
};
