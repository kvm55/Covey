import type { LeaseStatus } from './enums';

/** Full Supabase row shape — matches `leases` table columns. */
export interface LeaseRow {
  id: string;
  unit_id: string;
  status: LeaseStatus;
  original_move_in: string | null;
  original_move_out: string | null;
  created_at: string;
  updated_at: string;
}
