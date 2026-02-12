-- Create properties table
create table if not exists properties (
  id uuid default gen_random_uuid() primary key,
  street_address text not null,
  city text not null,
  state text not null,
  zip text not null,
  price numeric not null,
  image_url text,
  cap_rate numeric,
  irr numeric,
  equity_multiple numeric,
  type text not null check (type in ('Long Term Hold', 'Fix and Flip', 'Short Term Rental')),
  bedrooms integer,
  bathrooms integer,
  square_feet integer,
  renovations numeric,
  reserves numeric,
  debt_costs numeric,
  equity numeric,
  ltc numeric,
  interest_rate numeric,
  amortization numeric,
  exit_cap_rate numeric,
  net_sale_proceeds numeric,
  net_sale_per_unit numeric,
  profit_multiple numeric,
  in_place_rent numeric,
  stabilized_rent numeric,
  noi_margin numeric,
  dscr numeric,
  spread numeric,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table properties enable row level security;

-- Allow public read access (anon key can read all properties)
create policy "Properties are publicly readable"
  on properties for select
  using (true);

-- Seed with existing property data
insert into properties (
  street_address, city, state, zip, price, image_url,
  cap_rate, irr, equity_multiple, type,
  bedrooms, bathrooms, square_feet,
  renovations, reserves, debt_costs, equity, ltc,
  interest_rate, amortization, exit_cap_rate,
  net_sale_proceeds, net_sale_per_unit, profit_multiple,
  in_place_rent, stabilized_rent, noi_margin, dscr, spread
) values
(
  '123 Oak Street', 'Atlanta', 'GA', '30318', 325000, '/images/property1.jpg',
  0.064, 0.115, 1.75, 'Long Term Hold',
  3, 2, 1450,
  50000, 15000, 20000, 100000, 65,
  6.5, 30, 7.0,
  500000, 250000, 1.75,
  1200, 1500, 0.55, 1.25, 180
),
(
  '456 Maple Avenue', 'Decatur', 'GA', '30030', 289000, '/images/property2.jpg',
  0.089, 0.145, 1.92, 'Fix and Flip',
  4, 3, 1800,
  60000, 12000, 18000, 90000, 70,
  6.8, 25, 7.5,
  520000, 260000, 1.85,
  1300, 1600, 0.60, 1.30, 170
),
(
  '789 Pine Street', 'Savannah', 'GA', '31401', 415000, '/images/property3.jpg',
  0.102, 0.158, 2.12, 'Short Term Rental',
  5, 3, 2100,
  70000, 18000, 22000, 110000, 68,
  6.3, 28, 6.8,
  600000, 300000, 2.05,
  1400, 1700, 0.58, 1.28, 175
);
