import type { BuildingType } from './enums';

/** Full Supabase row shape — matches `buildings` table columns. */
export interface BuildingRow {
  id: string;
  property_id: string;
  name: string;
  building_type: BuildingType;
  year_built: number | null;
  stories: number | null;
  total_square_feet: number | null;
  created_at: string;
  updated_at: string;
}
