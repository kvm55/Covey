# Covey — Project Status

> Last updated: 2026-02-25

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

### Investor Matching (The Dogs — Eye Test Profiles)

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

### Phase 3: CoveySelect + Eye Test — NOT STARTED

**3A: CoveySelect Enhancement**
- [ ] Expand `/coveyselect` from static fund bundles to interactive fund explorer
- [ ] Add debt fund section showing available lending capacity and current pipeline
- [ ] Fund performance cards (target returns, current AUM, deal count)
- [ ] "Invest" CTA per fund linking to onboarding flow

**3B: Eye Test — Investor Risk Profiling**
- [ ] 4-phase onboarding flow:
  1. **Visual A/B Comparisons** — show two deal profiles side by side, investor picks preferred. 6-8 rounds covering yield vs growth, stable vs volatile, impact vs alpha
  2. **Slider Calibration** — fine-tune preferences: risk tolerance, time horizon, min yield, liquidity needs, impact preference
  3. **Breed Reveal** — animated reveal of investor's dog breed profile with personality description
  4. **Recommendation Engine** — map profile to fund allocation (e.g., 60% Pheasant, 25% Bobwhite, 15% debt fund)
- [ ] Persist profile to Supabase (`investor_profiles` table)
- [ ] Include debt fund allocation in recommendations (income-oriented profiles get higher debt fund %)
- [ ] Profile results page with recommended deals from matched funds

**3C: Debt Fund Integration (Underwriting)**
- [ ] Add debt fund as financing source option in underwriting form
- [ ] Show "Covey Debt Fund" vs "External Lender" toggle in debt terms section
- [ ] Debt fund deals get pre-populated terms (rate, LTV, IO period) from fund parameters
- [ ] Scenario compare can show same deal with Covey financing vs external financing

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

---

## Key Files

| Area | Path |
|------|------|
| Underwriting engine | `src/utils/underwriting.ts` |
| Scenario CRUD | `src/utils/scenarios.ts` |
| Fund definitions | `src/data/funds.ts` |
| Type system | `src/types/` (enums, property, building, unit, etc.) |
| New deal form | `src/app/property/new/page.tsx` |
| Deal detail | `src/app/property/[id]/page.tsx` |
| Marketplace | `src/app/marketplace/page.tsx` |
| CoveySelect | `src/app/coveyselect/page.tsx` |
| Migrations | `supabase/migrations/` |

---

## Deployment

- **Platform:** Vercel (production)
- **Database:** Supabase (hosted PostgreSQL)
- **Repo:** github.com/kvm55/Covey (private)
- **Branch:** `main` (linear history, direct commits during MVP sprint)
