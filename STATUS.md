# Covey — Project Status

> Last updated: 2026-02-26

## Platform Vision

Covey is TUG's real estate investing platform — deal sourcing, underwriting, portfolio management, and eventually tokenized ownership on XRPL. The platform serves two sides of the capital stack:

1. **Equity Funds (The Birds)** — 5 strategy-specific funds that own properties
2. **Debt Fund (Captive Financing)** — LP capital deployed as loans to Covey platform deals

The debt fund creates a closed-loop flywheel: investors provide loan capital, Covey originations consume it, and the equity funds get fast/preferred financing without external lenders. Debt LPs earn yield; equity funds get speed and certainty of execution.

---

## Capital Architecture

### Equity Funds (5 Strategies)

| Fund | Bird | Strategy | Risk | Target |
|------|------|----------|------|--------|
| Bobwhite | Bobwhite Quail | Midwest LTR cash flow | Low | 5-7% yield |
| Pheasant | Ring-necked Pheasant | SE BTR + LTR total return | Medium | 8-10% yield |
| Chukar | Chukar Partridge | Sun Belt appreciation | Med-High | 12-18% IRR |
| Woodcock | American Woodcock | Workforce / Section 8 / Impact | Medium | 6-8% + ESG |
| Grouse | Ruffed Grouse | Fix-and-flip / Value-add | High | 15-22% IRR |

### Debt Fund (Captive Financing)

| Attribute | Details |
|-----------|---------|
| Purpose | Provide senior/mezzanine debt to properties acquired through Covey equity funds |
| Source | LP capital raised into a dedicated lending vehicle |
| Deployment | Loans to Covey platform deals — acquisition, bridge, construction, rehab |
| Returns | Fixed-rate interest income (target 8-12% initial, refi to sub-6% long-term) |
| Security | First/second lien on real property; cross-collateralized within fund |
| Advantage | Speed to close (no external lender delays), preferred terms, recycling capital |
| Platform integration | Underwriting engine feeds loan sizing; scenario compare shows debt terms |

**Flywheel:** LP capital → Debt Fund → Loans to equity deals → Interest income → LP distributions → Recycle. The equity side gets certainty of execution; the debt side gets deal flow without origination costs.

### Investor Matching (The Dogs — Compass Profiles)

| Profile | Breed | Maps To | Temperament |
|---------|-------|---------|-------------|
| The Setter | English Setter | Bobwhite (Income) | Patient, steady |
| The Boykin | Boykin Spaniel | Woodcock (Impact) | Loyal, community-first |
| The Brittany | Brittany Spaniel | Pheasant (Balanced) | Versatile, balanced |
| The GSP | German Shorthaired Pointer | Chukar (Growth) | Driven, disciplined |
| The Vizsla | Vizsla | Grouse (Alpha) | Intense, first in last out |

Risk spectrum (conservative → aggressive): Setter → Boykin → Brittany → GSP → Vizsla

---

## Build Phases

### Phase 0: Foundation — COMPLETE
*Commits: 26547cc through ac29dd8 (Feb 11-12, 2026)*

- [x] Next.js 16 + TypeScript + React 19 + CSS Modules
- [x] Supabase backend (PostgreSQL + RLS)
- [x] Auth (sign in / sign up / route protection)
- [x] Landing page (5-section hero, Bobwhite branding, Ammunition colors)
- [x] Marketplace (property cards, filters, search, sort, pagination)
- [x] Underwriting engine (3 types: LTR, Flip, STR — pure calc functions)
- [x] New property form (6-section wizard, live sidebar metrics)
- [x] Property detail page (deal summary, year-by-year projections)
- [x] Dashboard scaffold (portfolio overview, buy box, map placeholder)
- [x] Vercel deployment (production)

### Phase 1: Data Model — COMPLETE
*Commit: 3c54dde (Feb 25, 2026)*

- [x] Normalized property hierarchy: Property → Building → Unit → Room
- [x] Supporting entities: Systems, Utilities, Prospects, Residents, Leases, Lease Contracts, Rent Schedules
- [x] Underwriting scenarios table (JSONB inputs/results)
- [x] 13 new Supabase tables with indexes, constraints, triggers, RLS
- [x] Auto-migration of existing properties into buildings + units
- [x] Centralized TypeScript types in `src/types/`
- [x] Zero UI disruption — invisible backend refactor

### Phase 2: Multi-Scenario Underwriting — COMPLETE
*Commit: 8ddd79c (Feb 25, 2026)*

- [x] Scenario CRUD (create, read, update, delete, promote)
- [x] Strategy type mapping (centralized converters)
- [x] Form saves to `underwriting_scenarios` (replaced localStorage)
- [x] Detail page loads from Supabase scenarios
- [x] localStorage auto-migration (backward compat, then cleanup)
- [x] Scenario selector dropdown in header
- [x] Scenarios tab with ScenarioList component
- [x] Side-by-side compare view (up to 3 scenarios)
- [x] Primary scenario syncs to `properties` table (marketplace stays accurate)
- [x] "Long Term Hold" → "Long Term Rental" rename (types, enums, data, DB constraints)
- [x] Unique partial index enforcing one primary per property

### Phase 3: CoveySelect + Compass + Debt Fund — COMPLETE

**3A: CoveySelect Enhancement — COMPLETE**
*Commit: 50c582e (Feb 25, 2026)*

- [x] Capital Stack Grid: 3x2 overview (5 equity funds + 1 debt fund) with click-to-scroll navigation
- [x] Fund performance cards (risk level, target return, deal count, total value)
- [x] Per-fund stats bars (deal count, total value, avg cap rate, avg IRR) computed client-side
- [x] Debt Fund detail section with lending terms table (from `COVEY_DEBT_TERMS`), pipeline stats
- [x] "Invest via Compass" CTA on every fund section + "Fund the Flywheel" debt CTA
- [x] "Explore in Marketplace" links preserved with `?fund=` param
- [x] `targetReturn` field added to `FundConfig` interface and all 5 fund entries
- [x] Full responsive layout (3-col → 2-col → 1-col)

**3B: Compass — Investor Risk Profiling — COMPLETE**
*Commit: e4a6466 (Feb 26, 2026)*

- [x] 5-step state machine: intro → A/B comparisons → slider calibration → breed reveal → allocation recommendation
- [x] 8 A/B comparison rounds (yield vs growth, holding period, market preference, impact, involvement, etc.)
- [x] 5 calibration sliders (risk tolerance, time horizon, min yield, liquidity need, impact preference)
- [x] Animated breed reveal with staggered CSS animations (scaleIn, fadeInUp)
- [x] 5 breed profiles with taglines, descriptions, and trait pills (Setter, Boykin, Brittany, GSP, Vizsla)
- [x] Fund allocation engine with debt fund carve-out (income-oriented → 15-30% debt; growth → 5-10%)
- [x] Supabase `investor_profiles` table with RLS (anonymous insert, public read, owner update)
- [x] No auth required — lead-gen tool, anonymous profiles claimable on sign-in
- [x] Professional copywriting pass (editorial audit + full rewrite of prompts, descriptions, breed profiles)
- [x] Header nav link ("Compass" at `/compass`)
- [x] Type exports from `src/types/index.ts`

**3C: Debt Fund Integration (Underwriting) — COMPLETE**
*Commit: cbcb0b5 (Feb 25, 2026)*

- [x] Covey Debt Fund config: lending parameters by deal type (LTR 75% LTV / 8%, Flip 70% / 10%, STR 70% / 9%)
- [x] DSCR spread tiers: >=1.5x → -50bps, >=1.3x → -25bps, >=1.1x → +0bps, <1.1x → ineligible
- [x] `qualifyForCoveyDebt()` + `applyCoveyDebtTerms()` qualification/application functions
- [x] `financingSource` field added to `PropertyInputs` type (`'external' | 'covey_debt'`)
- [x] Segmented toggle in debt section: External Lender | Covey Debt Fund
- [x] Qualification badge (green eligible with tier, amber ineligible with reason)
- [x] Auto-populate debt fields when Covey selected; fields become read-only (dashed border)
- [x] Auto-switch back to External if user manually edits a locked debt field
- [x] `financing_source` column on properties table (migration 007)
- [x] One-click "Compare with Covey Financing" button on property detail scenarios tab
- [x] Covey Debt Fund badge in Debt Service summary card
- [x] Financing + Interest Rate rows added to scenario compare table
- [x] Primary scenario sync includes `financing_source`

### Performance Enhancements — COMPLETE
*Commit: 93f3109 (Feb 26, 2026)*

- [x] Switched Google Fonts from render-blocking `@import` to `next/font/google` (Jura + Merriweather via CSS variables)
- [x] Replaced `<img>` with `next/image` in PropertyCard and Header; local placeholder replaces `via.placeholder.com`
- [x] Created `next.config.ts` with AVIF/WebP image format optimization
- [x] Added `viewport` export and Open Graph metadata to root layout
- [x] Server-side data fetching: split Marketplace, CoveySelect, Dashboard, and Property Detail into server components (fetch) + client components (interactivity), wiring up `supabase-server.ts`
- [x] Guarded all `console.error` calls with `NODE_ENV === 'development'` checks (scenarios.ts, investor-profiles.ts, property/new)

### Phase 4: Dashboard + Analytics — NOT STARTED
- [ ] Portfolio analytics with charting (chart.js or recharts)
- [ ] Deal scoring engine (automated buy/pass/watch classification)
- [ ] Map integration (Mapbox or Google Maps) with deal pins
- [ ] Fund-level performance dashboards (AUM, returns, deployment pace)
- [ ] Debt fund dashboard: loan book, weighted avg rate, LTV distribution, maturity schedule
- [ ] GP/LP role-based views
- [ ] Export & reporting tools

### Phase 5: Leasing & Operations — NOT STARTED
- [ ] Wire lease management UI to Phase 1 tables (leases, contracts, rent schedules)
- [ ] Tenant/resident management
- [ ] Rent roll reporting
- [ ] Maintenance request tracking
- [ ] Occupancy analytics

### Phase 6: XRPL Tokenization — NOT STARTED
*Depends on: BHW DigiTrust infrastructure*

- [ ] Property tokens: each property = issued currency on XRPL (mirrors series LLC)
- [ ] Fund tokens: BOBWHITE, PHEASANT, CHUKAR, WOODCOCK, GROUSE
- [ ] Debt fund tokens for LP participation in lending vehicle
- [ ] Pre/Post-IPO tiers with loyal holder discounts
- [ ] On-chain dividends (rent → RLUSD → pro-rata distribution)
- [ ] Secondary market trading on XRPL DEX
- [ ] Marketplace/DEX integration
- [ ] Token tickers: COV-[PropertyID] (e.g., COV-ATL-2293)

---

## Database Migrations

| # | Name | Date | Description |
|---|------|------|-------------|
| 001 | create_properties | 2026-02-12 | Properties table + RLS + seed data |
| 002 | allow_insert_properties | 2026-02-12 | Insert policy for anon key |
| 003 | add_fund_strategy | 2026-02-25 | fund_strategy column + CHECK constraint |
| 004 | create_hierarchy_tables | 2026-02-25 | 13 relational tables + auto-migration |
| 005 | scenario_updates | 2026-02-25 | Unique primary index + LTH→LTR rename |
| 006 | create_investor_profiles | 2026-02-26 | Investor profiles table for Compass (breed, scores, allocation) |
| 007 | add_financing_source | 2026-02-25 | financing_source column on properties (external / covey_debt) |

---

## Key Files

| Area | Path |
|------|------|
| Underwriting engine | `src/utils/underwriting.ts` |
| Scenario CRUD | `src/utils/scenarios.ts` |
| Covey Debt Fund config | `src/data/covey-debt.ts` |
| Covey Debt scenario helper | `src/utils/covey-debt-scenarios.ts` |
| Fund definitions | `src/data/funds.ts` |
| Type system | `src/types/` (enums, property, building, unit, etc.) |
| New deal form | `src/app/property/new/page.tsx` |
| Deal detail (server) | `src/app/property/[id]/page.tsx` |
| Deal detail (client) | `src/app/property/[id]/PropertyDetailClient.tsx` |
| Marketplace (server) | `src/app/marketplace/page.tsx` |
| Marketplace (client) | `src/app/marketplace/MarketplaceClient.tsx` |
| CoveySelect (server) | `src/app/coveyselect/page.tsx` |
| CoveySelect (client) | `src/app/coveyselect/CoveySelectClient.tsx` |
| Dashboard (server) | `src/app/dashboard/page.tsx` |
| Dashboard (client) | `src/app/dashboard/DashboardClient.tsx` |
| Next.js config | `next.config.ts` |
| Compass | `src/app/compass/page.tsx` |
| Compass data & scoring | `src/data/eyetest.ts` |
| Investor profile CRUD | `src/utils/investor-profiles.ts` |
| Migrations | `supabase/migrations/` |

---

## Deployment

- **Platform:** Vercel (production)
- **Database:** Supabase (hosted PostgreSQL)
- **Repo:** github.com/kvm55/Covey (private)
- **Branch:** `main` (linear history, direct commits during MVP sprint)
