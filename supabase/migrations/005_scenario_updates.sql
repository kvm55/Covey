-- ============================================================
-- Migration 005: Scenario Updates
-- 1. Unique partial index: at most one primary scenario per property
-- 2. Rename strategy_type 'long_term_hold' → 'long_term_rental'
-- 3. Rename properties.type 'Long Term Hold' → 'Long Term Rental'
-- ============================================================

-- 1. Unique index ensures only one is_primary=true per property
CREATE UNIQUE INDEX idx_uw_scenarios_one_primary
  ON underwriting_scenarios (property_id) WHERE is_primary = true;

-- 2. Drop CHECK constraints FIRST (before updating data)
ALTER TABLE underwriting_scenarios
  DROP CONSTRAINT IF EXISTS underwriting_scenarios_strategy_type_check;

ALTER TABLE properties
  DROP CONSTRAINT IF EXISTS properties_type_check;

-- 3. Update existing data
UPDATE underwriting_scenarios
  SET strategy_type = 'long_term_rental'
  WHERE strategy_type = 'long_term_hold';

UPDATE properties
  SET type = 'Long Term Rental'
  WHERE type = 'Long Term Hold';

-- 4. Add new CHECK constraints
ALTER TABLE underwriting_scenarios
  ADD CONSTRAINT underwriting_scenarios_strategy_type_check
  CHECK (strategy_type IN ('long_term_rental', 'fix_and_flip', 'short_term_rental'));

ALTER TABLE properties
  ADD CONSTRAINT properties_type_check
  CHECK (type IN (
    'Long Term Rental', 'Fix and Flip', 'Short Term Rental',
    'Cohabitation', 'Build to Rent', 'Development',
    'Workforce Housing', 'Value Add'
  ));
