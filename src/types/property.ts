import type { PropertyType, FundStrategy } from './enums';

/** Full Supabase row shape — matches `properties` table columns. */
export interface PropertyRow {
  id: string;
  street_address: string;
  city: string;
  state: string;
  zip: string;
  price: number;
  image_url: string | null;
  cap_rate: number | null;
  irr: number | null;
  equity_multiple: number | null;
  type: PropertyType;
  fund_strategy: FundStrategy | null;
  bedrooms: number | null;
  bathrooms: number | null;
  square_feet: number | null;
  renovations: number | null;
  reserves: number | null;
  debt_costs: number | null;
  equity: number | null;
  ltc: number | null;
  interest_rate: number | null;
  amortization: number | null;
  exit_cap_rate: number | null;
  net_sale_proceeds: number | null;
  net_sale_per_unit: number | null;
  profit_multiple: number | null;
  in_place_rent: number | null;
  stabilized_rent: number | null;
  noi_margin: number | null;
  dscr: number | null;
  spread: number | null;
  created_at: string;
}

/** Subset used by PropertyCard on marketplace. */
export interface PropertySummary {
  id: string;
  street_address: string;
  city: string;
  state: string;
  price: number;
  image_url: string | null;
  cap_rate: number | null;
  irr: number | null;
  equity_multiple: number | null;
  type: PropertyType;
  fund_strategy: FundStrategy | null;
  bedrooms: number | null;
  bathrooms: number | null;
  square_feet: number | null;
}

/** Aggregated row for dashboard views (future use). */
export interface PropertyDashboardRow {
  id: string;
  street_address: string;
  city: string;
  state: string;
  price: number;
  type: PropertyType;
  fund_strategy: FundStrategy | null;
  cap_rate: number | null;
  irr: number | null;
  equity_multiple: number | null;
  noi_margin: number | null;
  dscr: number | null;
  building_count: number;
  unit_count: number;
  occupied_unit_count: number;
}
