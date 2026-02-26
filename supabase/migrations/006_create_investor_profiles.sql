-- ============================================================
-- Migration 006: Investor Profiles (Eye Test)
-- Stores breed results, scoring data, and fund allocations
-- for both anonymous and authenticated users.
-- ============================================================

CREATE TABLE investor_profiles (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  breed            TEXT NOT NULL CHECK (breed IN ('setter', 'boykin', 'brittany', 'gsp', 'vizsla')),
  scores           JSONB NOT NULL DEFAULT '{}',
  responses        JSONB NOT NULL DEFAULT '{}',
  fund_allocation  JSONB NOT NULL DEFAULT '[]',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_investor_profiles_user  ON investor_profiles(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_investor_profiles_breed ON investor_profiles(breed);

CREATE TRIGGER trg_investor_profiles_updated
  BEFORE UPDATE ON investor_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE investor_profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can create investor profiles (anonymous eye test)
CREATE POLICY "Anyone can create investor profiles"
  ON investor_profiles FOR INSERT
  WITH CHECK (true);

-- Anyone can read profiles by id (for anonymous reveal step)
CREATE POLICY "Anyone can read investor profiles"
  ON investor_profiles FOR SELECT
  USING (true);

-- Users can update their own profiles (claim, retake)
CREATE POLICY "Users can update own investor profiles"
  ON investor_profiles FOR UPDATE
  USING (user_id = auth.uid());
