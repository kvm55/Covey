import type { LeaseTermType } from './enums';

/** Full Supabase row shape — matches `lease_contracts` table columns. */
export interface LeaseContractRow {
  id: string;
  lease_id: string;
  resident_id: string | null;
  term_type: LeaseTermType;
  start_date: string;
  end_date: string;
  base_rent: number;
  signed_doc_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
