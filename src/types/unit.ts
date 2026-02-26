import type { UnitStatus } from './enums';

/** Full Supabase row shape — matches `units` table columns. */
export interface UnitRow {
  id: string;
  building_id: string;
  property_id: string;
  unit_label: string;
  bedrooms: number | null;
  bathrooms: number | null;
  square_feet: number | null;
  status: UnitStatus;
  market_rent: number | null;
  created_at: string;
  updated_at: string;
}
