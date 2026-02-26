import type { ProspectStatus } from './enums';

/** Full Supabase row shape — matches `prospects` table columns. */
export interface ProspectRow {
  id: string;
  property_id: string;
  target_unit_id: string | null;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  status: ProspectStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
