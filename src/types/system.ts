import type { SystemType, SystemCondition } from './enums';

/** Full Supabase row shape — matches `systems` table columns. */
export interface SystemRow {
  id: string;
  property_id: string;
  system_type: SystemType;
  make: string | null;
  model: string | null;
  condition: SystemCondition | null;
  install_date: string | null;
  expected_life_years: number | null;
  replacement_cost: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/** Junction table linking a system to specific buildings/units. */
export interface SystemUnitRow {
  id: string;
  system_id: string;
  building_id: string | null;
  unit_id: string | null;
  created_at: string;
}
