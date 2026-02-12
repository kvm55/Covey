# Covey

**Real Estate Acquisition & Underwriting Platform**
*by Upland Group*

---

## Overview

Covey is a real estate investment platform for sourcing, evaluating, and underwriting residential real estate deals. It supports SFR, multifamily, and hospitality-style properties with built-in deal scoring, portfolio analytics, and marketplace functionality.

## Current Status: MVP (Active Development)

The platform is in its initial MVP phase with a functional frontend and mock data layer.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 15](https://nextjs.org/) (App Router) |
| Language | TypeScript |
| UI | React 19 |
| Styling | CSS Modules |
| Data | Local mock data (`src/data/properties.ts`) |
| Deployment | TBD (Vercel roadmapped) |

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
git clone https://github.com/upland-group/covey.git
cd covey
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
covey/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Home / Landing
│   │   ├── layout.tsx          # Root layout
│   │   ├── dashboard/          # Portfolio dashboard
│   │   ├── marketplace/        # Property marketplace with filters
│   │   └── property/
│   │       ├── new/            # Create new property form
│   │       └── [id]/           # Property detail & underwriting
│   ├── components/
│   │   ├── Header/             # Site navigation
│   │   ├── Footer/             # Site footer
│   │   ├── Hero/               # Landing page hero
│   │   ├── PropertyCard/       # Property listing card
│   │   ├── PropertyDetails/    # Property detail view
│   │   ├── PropertyFilter/     # Marketplace filter sidebar
│   │   ├── PropertyForm/       # New property form
│   │   └── SiteLayout/         # Layout wrapper
│   ├── data/
│   │   └── properties.ts       # Mock property data & types
│   └── styles/
│       └── styles.css          # Global styles
├── public/                     # Static assets
├── package.json
├── tsconfig.json
└── README.md
```

## Features (MVP)

- **Marketplace** — Browse and filter properties by strategy, bedrooms, bathrooms, sq ft, cap rate, IRR, equity multiple
- **Property Detail** — Full underwriting view per property
- **New Property** — Manual property entry with full underwriting inputs
- **Dashboard** — Portfolio overview, buy box criteria, map placeholder, sensitivity analysis scaffold
- **Property Types** — Long Term Hold, Fix and Flip, Short Term Rental

## Branching Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code |
| `dev` | Integration branch for active development |
| `feature/*` | Individual feature branches off `dev` |
| `hotfix/*` | Critical fixes branched from `main` |

## Roadmap

### Near Term
- [ ] Backend integration (database, API)
- [ ] Authentication & user accounts
- [ ] Vercel deployment (staging + production)
- [ ] CI/CD via GitHub Actions
- [ ] Map integration (Mapbox/Google Maps)

### Mid Term
- [ ] Deal scoring engine
- [ ] Portfolio analytics & charting
- [ ] Role-based access (GP/LP views)
- [ ] Export & reporting tools

### Long Term
- [ ] Tokenized ownership structures
- [ ] GP/LP syndication flows
- [ ] SaaS / consulting layer
- [ ] Marketplace-style UI with live listings

## Contributing

1. Create a feature branch from `dev`: `git checkout -b feature/your-feature dev`
2. Make your changes
3. Submit a PR to `dev`
4. After review and merge, `dev` gets promoted to `main` for releases

## License

Private — Upland Group. All rights reserved.
