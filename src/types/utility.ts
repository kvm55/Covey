import type { UtilityType, UtilityResponsibility } from './enums';

/** Full Supabase row shape — matches `utilities` table columns. */
export interface UtilityRow {
  id: string;
  property_id: string;
  building_id: string | null;
  unit_id: string | null;
  utility_type: UtilityType;
  provider: string | null;
  account_number: string | null;
  monthly_cost: number | null;
  responsibility: UtilityResponsibility;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
