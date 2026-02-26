# Covey

**Real Estate Investment Platform**
*by The Upland Group*

---

## Overview

Covey is a real estate investment platform for sourcing, underwriting, and managing residential real estate deals. It supports SFR, multifamily, and hospitality-style properties with a built-in underwriting engine, multi-scenario analysis, and a marketplace organized around five bird-named fund strategies.

The platform serves both sides of the capital stack: equity funds (The Birds) that own properties, and a captive debt fund that provides financing to deals on the platform.

## Current Status

**MVP — Active Development (Phase 2 Complete)**

See [STATUS.md](STATUS.md) for detailed phase tracking and roadmap.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.1.6 (App Router) |
| Language | TypeScript 5.4 |
| UI | React 19.1 |
| Styling | CSS Modules |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth (email/password) |
| Deployment | Vercel (production) |

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Supabase project (with `.env.local` configured)

### Installation

```bash
git clone https://github.com/kvm55/Covey.git
cd Covey
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                        # Next.js App Router pages
│   ├── page.tsx               # Landing page
│   ├── dashboard/             # Portfolio dashboard
│   ├── marketplace/           # Property marketplace (fund strategy filters)
│   ├── coveyselect/           # Fund bundles page (CoveySelect)
│   ├── property/
│   │   ├── new/               # Underwriting form (6-section wizard)
│   │   └── [id]/              # Property detail, scenarios, compare
│   └── (auth)/                # Sign in / sign up
├── components/
│   ├── Header/                # Navigation (Bobwhite logo)
│   ├── Footer/
│   ├── PropertyCard/          # Marketplace listing card
│   ├── PropertyFilter/        # Fund strategy filters
│   ├── ScenarioList/          # Scenario cards + compare
│   └── SiteLayout/
├── data/
│   ├── properties.ts          # Seed property data
│   └── funds.ts               # Bird fund strategy definitions
├── types/                     # Centralized TypeScript types
│   ├── enums.ts               # Strategy types, property types, etc.
│   ├── underwriting.ts        # Scenario row shape
│   ├── property.ts            # Property entity
│   ├── building.ts, unit.ts, room.ts, ...
│   └── index.ts
├── utils/
│   ├── underwriting.ts        # Underwriting engine (calc + formatting)
│   ├── scenarios.ts           # Scenario CRUD + properties sync
│   └── supabase.ts            # Supabase client
└── styles/
    └── styles.css             # Global styles (Ammunition design system)
```

## Features

- **Marketplace** — Browse properties filtered by fund strategy, with search, sort, and pagination
- **Underwriting Engine** — Full P&L analysis for Long Term Rental, Fix & Flip, and Short Term Rental
- **Multi-Scenario** — Create, compare, promote, and delete underwriting scenarios per property
- **CoveySelect** — Fund bundles organized by 5 bird-named strategies (Bobwhite → Grouse)
- **Property Detail** — Deal summary, year-by-year projections, scenario selector, side-by-side compare
- **Auth** — Email/password sign in and sign up with route protection
- **Dashboard** — Portfolio overview scaffold

## Fund Strategies (The Birds)

| Fund | Strategy | Risk |
|------|----------|------|
| Bobwhite | Midwest LTR cash flow | Low |
| Pheasant | SE balanced total return | Medium |
| Chukar | Sun Belt appreciation | Med-High |
| Woodcock | Workforce housing / Impact | Medium |
| Grouse | Fix-and-flip / Value-add | High |

## License

Private — The Upland Group LLC. All rights reserved.
