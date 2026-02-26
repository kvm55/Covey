ALTER TABLE properties
  ADD COLUMN financing_source TEXT DEFAULT 'external'
    CHECK (financing_source IN ('external', 'covey_debt'));
