// ── Property & Fund ─────────────────────────────────────────────
export type PropertyType =
  | 'Long Term Rental'
  | 'Fix and Flip'
  | 'Short Term Rental'
  | 'Cohabitation'
  | 'Build to Rent'
  | 'Development'
  | 'Workforce Housing'
  | 'Value Add';

export type FundStrategy = 'bobwhite' | 'pheasant' | 'chukar' | 'woodcock' | 'grouse';

// ── Building ────────────────────────────────────────────────────
export type BuildingType =
  | 'single_family'
  | 'duplex'
  | 'triplex'
  | 'fourplex'
  | 'apartment'
  | 'townhouse'
  | 'commercial'
  | 'mixed_use'
  | 'other';

// ── Unit ────────────────────────────────────────────────────────
export type UnitStatus = 'vacant' | 'occupied' | 'renovation' | 'offline';

// ── Room ────────────────────────────────────────────────────────
export type RoomType =
  | 'bedroom'
  | 'bathroom'
  | 'kitchen'
  | 'living'
  | 'dining'
  | 'office'
  | 'storage'
  | 'garage'
  | 'laundry'
  | 'other';

// ── Systems ─────────────────────────────────────────────────────
export type SystemType =
  | 'hvac'
  | 'roof'
  | 'water_heater'
  | 'sewer_septic'
  | 'plumbing'
  | 'electrical';

export type SystemCondition = 'excellent' | 'good' | 'fair' | 'poor' | 'failed';

// ── Utilities ───────────────────────────────────────────────────
export type UtilityType = 'water' | 'electric' | 'gas' | 'sewer' | 'trash' | 'internet';

export type UtilityResponsibility = 'owner' | 'tenant' | 'shared';

// ── Leasing & People ────────────────────────────────────────────
export type ProspectStatus = 'lead' | 'applied' | 'approved' | 'converted' | 'rejected';

export type LeaseStatus = 'draft' | 'active' | 'renewed' | 'expired' | 'terminated';

export type LeaseTermType = 'nightly' | 'weekly' | 'monthly' | 'annual' | 'multi_year';

export type RentPeriod = 'nightly' | 'weekly' | 'monthly' | 'annual';

// ── Underwriting ────────────────────────────────────────────────
export type StrategyType = 'long_term_rental' | 'fix_and_flip' | 'short_term_rental';
