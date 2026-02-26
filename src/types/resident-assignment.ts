/** Full Supabase row shape — matches `resident_assignments` table columns. */
export interface ResidentAssignmentRow {
  id: string;
  resident_id: string;
  building_id: string | null;
  unit_id: string | null;
  room_id: string | null;
  move_in_date: string | null;
  move_out_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
