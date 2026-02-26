// ── Enums & shared unions ───────────────────────────────────────
export type {
  PropertyType,
  FundStrategy,
  BuildingType,
  UnitStatus,
  RoomType,
  SystemType,
  SystemCondition,
  UtilityType,
  UtilityResponsibility,
  ProspectStatus,
  LeaseStatus,
  LeaseTermType,
  RentPeriod,
  StrategyType,
} from './enums';

// ── Row types (match Supabase table shapes) ─────────────────────
export type { PropertyRow, PropertySummary, PropertyDashboardRow } from './property';
export type { BuildingRow } from './building';
export type { UnitRow } from './unit';
export type { RoomRow } from './room';
export type { SystemRow, SystemUnitRow } from './system';
export type { UtilityRow } from './utility';
export type { ProspectRow } from './prospect';
export type { ResidentRow } from './resident';
export type { ResidentAssignmentRow } from './resident-assignment';
export type { LeaseRow } from './lease';
export type { LeaseContractRow } from './lease-contract';
export type { RentScheduleRow } from './rent-schedule';
export type { UnderwritingScenarioRow } from './underwriting';

// ── Investor / Eye Test ───────────────────────────────────────
export type {
  InvestorBreed,
  BreedScores,
  FundAllocation,
  ABQuestion,
  SliderConfig,
  SliderValues,
  BreedProfile,
  InvestorProfileRow,
  EyeTestStep,
} from './investor';
