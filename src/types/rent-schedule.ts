/** Full Supabase row shape — matches `rent_schedules` table columns. */
export interface RentScheduleRow {
  id: string;
  contract_id: string;
  period_start: string;
  period_end: string;
  rent_amount: number;
  created_at: string;
  updated_at: string;
}
