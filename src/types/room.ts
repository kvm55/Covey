import type { RoomType } from './enums';

/** Full Supabase row shape — matches `rooms` table columns. */
export interface RoomRow {
  id: string;
  unit_id: string;
  room_type: RoomType;
  name: string | null;
  square_feet: number | null;
  floor_level: number | null;
  created_at: string;
  updated_at: string;
}
