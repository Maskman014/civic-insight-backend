-- Enable pgcrypto extension for UUID generation
create extension if not exists "pgcrypto";

-- Create profiles table
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  role text default 'user',
  created_at timestamptz default now()
);

-- Create reports table
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles (id) on delete cascade,
  title text not null,
  description text,
  status text default 'open',
  location text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create comments table
create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references reports (id) on delete cascade,
  author uuid references profiles (id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table reports enable row level security;
alter table comments enable row level security;

-- Public read policies
create policy "Public read profiles" on profiles for select using (true);
create policy "Public read reports" on reports for select using (true);
create policy "Public read comments" on comments for select using (true);

-- Insert policies for authenticated users
create policy "Insert own profile" on profiles
  for insert with check (auth.uid() = id);

create policy "Insert own reports" on reports
  for insert with check (auth.uid() = user_id);

create policy "Insert own comments" on comments
  for insert with check (auth.uid() = author);

-- Update policies for own data
create policy "Update own profile" on profiles
  for update using (auth.uid() = id);

create policy "Update own reports" on reports
  for update using (auth.uid() = user_id);

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to automatically update updated_at
create trigger update_reports_updated_at
  before update on reports
  for each row execute function update_updated_at_column();