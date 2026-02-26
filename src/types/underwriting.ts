import type { StrategyType } from './enums';
import type { PropertyInputs, UnderwritingResults } from '@/utils/underwriting';

/** Full Supabase row shape — matches `underwriting_scenarios` table columns. */
export interface UnderwritingScenarioRow {
  id: string;
  property_id: string;
  unit_id: string | null;
  name: string;
  strategy_type: StrategyType;
  inputs: PropertyInputs;
  results: UnderwritingResults;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}
