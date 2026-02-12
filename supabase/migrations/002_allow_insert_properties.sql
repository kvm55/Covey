-- Allow anonymous users to insert properties
create policy "Anyone can insert properties"
  on properties for insert
  with check (true);
