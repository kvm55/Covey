-- ============================================================
-- Migration 004: Property Hierarchy Tables
-- Creates 13 tables for the normalized property data model.
-- Auto-migrates existing properties into buildings + units.
-- ============================================================

-- ── Helper: updated_at trigger function ─────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;


-- ============================================================
-- 1. BUILDINGS
-- ============================================================
create table buildings (
  id          uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  name        text not null default 'Primary',
  building_type text not null default 'single_family'
    check (building_type in (
      'single_family','duplex','triplex','fourplex',
      'apartment','townhouse','commercial','mixed_use','other'
    )),
  year_built        integer,
  stories           integer,
  total_square_feet integer,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_buildings_property on buildings(property_id);

create trigger trg_buildings_updated
  before update on buildings
  for each row execute function update_updated_at();

alter table buildings enable row level security;
create policy "Public read buildings"  on buildings for select using (true);
create policy "Public insert buildings" on buildings for insert with check (true);
create policy "Public update buildings" on buildings for update using (true);
create policy "Public delete buildings" on buildings for delete using (true);


-- ============================================================
-- 2. UNITS
-- ============================================================
create table units (
  id          uuid primary key default gen_random_uuid(),
  building_id uuid not null references buildings(id) on delete cascade,
  property_id uuid not null references properties(id) on delete cascade,
  unit_label  text not null default 'Primary',
  bedrooms    integer,
  bathrooms   integer,
  square_feet integer,
  status      text not null default 'vacant'
    check (status in ('vacant','occupied','renovation','offline')),
  market_rent numeric,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_units_building on units(building_id);
create index idx_units_property on units(property_id);

create trigger trg_units_updated
  before update on units
  for each row execute function update_updated_at();

alter table units enable row level security;
create policy "Public read units"  on units for select using (true);
create policy "Public insert units" on units for insert with check (true);
create policy "Public update units" on units for update using (true);
create policy "Public delete units" on units for delete using (true);


-- ============================================================
-- 3. ROOMS
-- ============================================================
create table rooms (
  id          uuid primary key default gen_random_uuid(),
  unit_id     uuid not null references units(id) on delete cascade,
  room_type   text not null default 'other'
    check (room_type in (
      'bedroom','bathroom','kitchen','living','dining',
      'office','storage','garage','laundry','other'
    )),
  name        text,
  square_feet integer,
  floor_level integer,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_rooms_unit on rooms(unit_id);

create trigger trg_rooms_updated
  before update on rooms
  for each row execute function update_updated_at();

alter table rooms enable row level security;
create policy "Public read rooms"  on rooms for select using (true);
create policy "Public insert rooms" on rooms for insert with check (true);
create policy "Public update rooms" on rooms for update using (true);
create policy "Public delete rooms" on rooms for delete using (true);


-- ============================================================
-- 4. SYSTEMS
-- ============================================================
create table systems (
  id              uuid primary key default gen_random_uuid(),
  property_id     uuid not null references properties(id) on delete cascade,
  system_type     text not null
    check (system_type in (
      'hvac','roof','water_heater','sewer_septic','plumbing','electrical'
    )),
  make            text,
  model           text,
  condition       text
    check (condition is null or condition in (
      'excellent','good','fair','poor','failed'
    )),
  install_date       date,
  expected_life_years integer,
  replacement_cost   numeric,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_systems_property on systems(property_id);

create trigger trg_systems_updated
  before update on systems
  for each row execute function update_updated_at();

alter table systems enable row level security;
create policy "Public read systems"  on systems for select using (true);
create policy "Public insert systems" on systems for insert with check (true);
create policy "Public update systems" on systems for update using (true);
create policy "Public delete systems" on systems for delete using (true);


-- ============================================================
-- 5. SYSTEM_UNITS (junction)
-- ============================================================
create table system_units (
  id          uuid primary key default gen_random_uuid(),
  system_id   uuid not null references systems(id) on delete cascade,
  building_id uuid references buildings(id) on delete cascade,
  unit_id     uuid references units(id) on delete cascade,
  created_at  timestamptz not null default now(),
  check (building_id is not null or unit_id is not null)
);

create index idx_system_units_system   on system_units(system_id);
create index idx_system_units_building on system_units(building_id);
create index idx_system_units_unit     on system_units(unit_id);

alter table system_units enable row level security;
create policy "Public read system_units"  on system_units for select using (true);
create policy "Public insert system_units" on system_units for insert with check (true);
create policy "Public update system_units" on system_units for update using (true);
create policy "Public delete system_units" on system_units for delete using (true);


-- ============================================================
-- 6. UTILITIES
-- ============================================================
create table utilities (
  id             uuid primary key default gen_random_uuid(),
  property_id    uuid not null references properties(id) on delete cascade,
  building_id    uuid references buildings(id) on delete set null,
  unit_id        uuid references units(id) on delete set null,
  utility_type   text not null
    check (utility_type in ('water','electric','gas','sewer','trash','internet')),
  provider       text,
  account_number text,
  monthly_cost   numeric,
  responsibility text not null default 'owner'
    check (responsibility in ('owner','tenant','shared')),
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index idx_utilities_property on utilities(property_id);
create index idx_utilities_building on utilities(building_id);
create index idx_utilities_unit     on utilities(unit_id);

create trigger trg_utilities_updated
  before update on utilities
  for each row execute function update_updated_at();

alter table utilities enable row level security;
create policy "Public read utilities"  on utilities for select using (true);
create policy "Public insert utilities" on utilities for insert with check (true);
create policy "Public update utilities" on utilities for update using (true);
create policy "Public delete utilities" on utilities for delete using (true);


-- ============================================================
-- 7. PROSPECTS
-- ============================================================
create table prospects (
  id             uuid primary key default gen_random_uuid(),
  property_id    uuid not null references properties(id) on delete cascade,
  target_unit_id uuid references units(id) on delete set null,
  first_name     text not null,
  last_name      text not null,
  email          text,
  phone          text,
  status         text not null default 'lead'
    check (status in ('lead','applied','approved','converted','rejected')),
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index idx_prospects_property on prospects(property_id);
create index idx_prospects_unit     on prospects(target_unit_id);
create index idx_prospects_status   on prospects(status);

create trigger trg_prospects_updated
  before update on prospects
  for each row execute function update_updated_at();

alter table prospects enable row level security;
create policy "Public read prospects"  on prospects for select using (true);
create policy "Public insert prospects" on prospects for insert with check (true);
create policy "Public update prospects" on prospects for update using (true);
create policy "Public delete prospects" on prospects for delete using (true);


-- ============================================================
-- 8. RESIDENTS
-- ============================================================
create table residents (
  id          uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  prospect_id uuid references prospects(id) on delete set null,
  first_name  text not null,
  last_name   text not null,
  email       text,
  phone       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_residents_property on residents(property_id);
create index idx_residents_prospect on residents(prospect_id);

create trigger trg_residents_updated
  before update on residents
  for each row execute function update_updated_at();

alter table residents enable row level security;
create policy "Public read residents"  on residents for select using (true);
create policy "Public insert residents" on residents for insert with check (true);
create policy "Public update residents" on residents for update using (true);
create policy "Public delete residents" on residents for delete using (true);


-- ============================================================
-- 9. RESIDENT_ASSIGNMENTS
-- ============================================================
create table resident_assignments (
  id          uuid primary key default gen_random_uuid(),
  resident_id uuid not null references residents(id) on delete cascade,
  building_id uuid references buildings(id) on delete set null,
  unit_id     uuid references units(id) on delete set null,
  room_id     uuid references rooms(id) on delete set null,
  move_in_date  date,
  move_out_date date,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_resident_assignments_resident on resident_assignments(resident_id);
create index idx_resident_assignments_unit     on resident_assignments(unit_id);
create index idx_resident_assignments_active   on resident_assignments(is_active) where is_active = true;

create trigger trg_resident_assignments_updated
  before update on resident_assignments
  for each row execute function update_updated_at();

alter table resident_assignments enable row level security;
create policy "Public read resident_assignments"  on resident_assignments for select using (true);
create policy "Public insert resident_assignments" on resident_assignments for insert with check (true);
create policy "Public update resident_assignments" on resident_assignments for update using (true);
create policy "Public delete resident_assignments" on resident_assignments for delete using (true);


-- ============================================================
-- 10. LEASES
-- ============================================================
create table leases (
  id                uuid primary key default gen_random_uuid(),
  unit_id           uuid not null references units(id) on delete cascade,
  status            text not null default 'draft'
    check (status in ('draft','active','renewed','expired','terminated')),
  original_move_in  date,
  original_move_out date,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index idx_leases_unit   on leases(unit_id);
create index idx_leases_status on leases(status);

create trigger trg_leases_updated
  before update on leases
  for each row execute function update_updated_at();

alter table leases enable row level security;
create policy "Public read leases"  on leases for select using (true);
create policy "Public insert leases" on leases for insert with check (true);
create policy "Public update leases" on leases for update using (true);
create policy "Public delete leases" on leases for delete using (true);


-- ============================================================
-- 11. LEASE_CONTRACTS
-- ============================================================
create table lease_contracts (
  id            uuid primary key default gen_random_uuid(),
  lease_id      uuid not null references leases(id) on delete cascade,
  resident_id   uuid references residents(id) on delete set null,
  term_type     text not null
    check (term_type in ('nightly','weekly','monthly','annual','multi_year')),
  start_date    date not null,
  end_date      date not null,
  base_rent     numeric not null,
  signed_doc_url text,
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_lease_contracts_lease    on lease_contracts(lease_id);
create index idx_lease_contracts_resident on lease_contracts(resident_id);

create trigger trg_lease_contracts_updated
  before update on lease_contracts
  for each row execute function update_updated_at();

alter table lease_contracts enable row level security;
create policy "Public read lease_contracts"  on lease_contracts for select using (true);
create policy "Public insert lease_contracts" on lease_contracts for insert with check (true);
create policy "Public update lease_contracts" on lease_contracts for update using (true);
create policy "Public delete lease_contracts" on lease_contracts for delete using (true);


-- ============================================================
-- 12. RENT_SCHEDULES
-- ============================================================
create table rent_schedules (
  id           uuid primary key default gen_random_uuid(),
  contract_id  uuid not null references lease_contracts(id) on delete cascade,
  period_start date not null,
  period_end   date not null,
  rent_amount  numeric not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index idx_rent_schedules_contract on rent_schedules(contract_id);

create trigger trg_rent_schedules_updated
  before update on rent_schedules
  for each row execute function update_updated_at();

alter table rent_schedules enable row level security;
create policy "Public read rent_schedules"  on rent_schedules for select using (true);
create policy "Public insert rent_schedules" on rent_schedules for insert with check (true);
create policy "Public update rent_schedules" on rent_schedules for update using (true);
create policy "Public delete rent_schedules" on rent_schedules for delete using (true);


-- ============================================================
-- 13. UNDERWRITING_SCENARIOS
-- ============================================================
create table underwriting_scenarios (
  id            uuid primary key default gen_random_uuid(),
  property_id   uuid not null references properties(id) on delete cascade,
  unit_id       uuid references units(id) on delete set null,
  name          text not null default 'Base Case',
  strategy_type text not null
    check (strategy_type in ('long_term_hold','fix_and_flip','short_term_rental')),
  inputs        jsonb not null default '{}',
  results       jsonb not null default '{}',
  is_primary    boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_uw_scenarios_property on underwriting_scenarios(property_id);
create index idx_uw_scenarios_unit     on underwriting_scenarios(unit_id);
create index idx_uw_scenarios_primary  on underwriting_scenarios(property_id) where is_primary = true;

create trigger trg_uw_scenarios_updated
  before update on underwriting_scenarios
  for each row execute function update_updated_at();

alter table underwriting_scenarios enable row level security;
create policy "Public read underwriting_scenarios"  on underwriting_scenarios for select using (true);
create policy "Public insert underwriting_scenarios" on underwriting_scenarios for insert with check (true);
create policy "Public update underwriting_scenarios" on underwriting_scenarios for update using (true);
create policy "Public delete underwriting_scenarios" on underwriting_scenarios for delete using (true);


-- ============================================================
-- DATA MIGRATION: Seed buildings + units from existing properties
-- For each property → 1 building (Primary) + 1 unit (Primary)
-- ============================================================

-- Insert one building per existing property
insert into buildings (property_id, name, building_type, total_square_feet)
select
  id,
  'Primary',
  'single_family',
  square_feet
from properties;

-- Insert one unit per building, pulling bed/bath/sqft/rent from the property
insert into units (building_id, property_id, unit_label, bedrooms, bathrooms, square_feet, status, market_rent)
select
  b.id,
  b.property_id,
  'Primary',
  p.bedrooms,
  p.bathrooms,
  p.square_feet,
  'vacant',
  p.stabilized_rent
from buildings b
join properties p on p.id = b.property_id;
