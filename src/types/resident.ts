/** Full Supabase row shape — matches `residents` table columns. */
export interface ResidentRow {
  id: string;
  property_id: string;
  prospect_id: string | null;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}
