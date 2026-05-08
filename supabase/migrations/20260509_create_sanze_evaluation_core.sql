-- Sanze evaluation system core schema draft.
-- Date: 2026-05-09
--
-- This migration is intentionally a draft and must be reviewed before applying.
-- Formal RLS policies must wait until auth and user-case mapping are confirmed.
-- Do not run production tables without effective RLS policies.
-- Supabase service role keys must only be used by trusted backend code and must
-- never be exposed in frontend bundles, Vite env, browser storage, logs, or reports.

create extension if not exists pgcrypto;

create table if not exists public.sanze_cases (
  id uuid primary key default gen_random_uuid(),
  case_code text,
  case_name text not null,
  development_path text,
  case_status text,
  consultant_name text,
  last_updated_label text,
  version_note text,
  created_by uuid null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  archived_at timestamptz null,
  raw_json jsonb default '{}'::jsonb
);

create table if not exists public.sanze_roster_staging (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references public.sanze_cases(id) on delete cascade,
  source_type text,
  source_filename text,
  imported_at timestamptz default now(),
  updated_at timestamptz default now(),
  land_rows jsonb default '[]'::jsonb,
  building_rows jsonb default '[]'::jsonb,
  pg_groups jsonb default '[]'::jsonb,
  summary_json jsonb default '{}'::jsonb,
  version_history jsonb default '[]'::jsonb,
  price_update_history jsonb default '[]'::jsonb
);

create table if not exists public.sanze_base_info (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references public.sanze_cases(id) on delete cascade,
  city text,
  district text,
  section text,
  subsection text,
  lot_count integer,
  land_right_count integer,
  building_right_count integer,
  land_area_sqm numeric,
  land_area_ping numeric,
  announced_current_value_total numeric,
  announced_current_value_weighted_unit numeric,
  announced_current_value_year text,
  declared_land_value_year text,
  base_info_json jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.sanze_capacity_data (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references public.sanze_cases(id) on delete cascade,
  inputs_json jsonb default '{}'::jsonb,
  results_json jsonb default '{}'::jsonb,
  tdr_scoring_json jsonb default '{}'::jsonb,
  tdr_scoring_summary_json jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.sanze_floor_efficiency_data (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references public.sanze_cases(id) on delete cascade,
  params_json jsonb default '{}'::jsonb,
  results_json jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.sanze_cost_data (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references public.sanze_cases(id) on delete cascade,
  inputs_json jsonb default '{}'::jsonb,
  results_json jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.sanze_market_price_import_jobs (
  id uuid primary key default gen_random_uuid(),
  source_name text,
  source_url text,
  city text,
  district text,
  data_period text,
  status text,
  row_count integer default 0,
  checksum text,
  error_message text,
  imported_at timestamptz default now(),
  raw_meta_json jsonb default '{}'::jsonb
);

create table if not exists public.sanze_real_estate_transactions (
  id uuid primary key default gen_random_uuid(),
  import_job_id uuid references public.sanze_market_price_import_jobs(id) on delete set null,
  city text,
  district text,
  transaction_target text,
  location_text text,
  land_area_sqm numeric,
  zoning text,
  transaction_date_roc text,
  transaction_date date,
  transaction_year integer,
  transaction_month integer,
  building_type text,
  main_use text,
  building_completion_date_roc text,
  building_completion_date date,
  building_age_years numeric,
  building_area_sqm numeric,
  building_area_ping numeric,
  total_price numeric,
  unit_price_per_sqm numeric,
  unit_price_per_ping_10k numeric,
  floor text,
  total_floors text,
  parking_type text,
  parking_area_sqm numeric,
  parking_price numeric,
  note text,
  raw_row_json jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.sanze_market_price_queries (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references public.sanze_cases(id) on delete cascade,
  city text,
  district text,
  keyword text,
  date_from date,
  date_to date,
  building_type text,
  main_use text,
  exclude_parking boolean default true,
  exclude_special_notes boolean default true,
  sample_count integer default 0,
  avg_unit_price_10k_ping numeric,
  median_unit_price_10k_ping numeric,
  p25_unit_price_10k_ping numeric,
  p75_unit_price_10k_ping numeric,
  min_unit_price_10k_ping numeric,
  max_unit_price_10k_ping numeric,
  result_json jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.sanze_sales_scenarios (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references public.sanze_cases(id) on delete cascade,
  scenario_name text,
  product_type text,
  saleable_area_ping numeric,
  unit_price_10k_ping numeric,
  unit_count numeric,
  total_sales numeric,
  source_type text,
  source_market_query_id uuid references public.sanze_market_price_queries(id) on delete set null,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists sanze_roster_staging_case_id_idx on public.sanze_roster_staging(case_id);
create index if not exists sanze_base_info_case_id_idx on public.sanze_base_info(case_id);
create index if not exists sanze_capacity_data_case_id_idx on public.sanze_capacity_data(case_id);
create index if not exists sanze_floor_efficiency_data_case_id_idx on public.sanze_floor_efficiency_data(case_id);
create index if not exists sanze_cost_data_case_id_idx on public.sanze_cost_data(case_id);
create index if not exists sanze_real_estate_transactions_city_district_idx on public.sanze_real_estate_transactions(city, district);
create index if not exists sanze_real_estate_transactions_transaction_date_idx on public.sanze_real_estate_transactions(transaction_date);
create index if not exists sanze_market_price_queries_case_id_idx on public.sanze_market_price_queries(case_id);
create index if not exists sanze_sales_scenarios_case_id_idx on public.sanze_sales_scenarios(case_id);

alter table public.sanze_cases enable row level security;
alter table public.sanze_roster_staging enable row level security;
alter table public.sanze_base_info enable row level security;
alter table public.sanze_capacity_data enable row level security;
alter table public.sanze_floor_efficiency_data enable row level security;
alter table public.sanze_cost_data enable row level security;
alter table public.sanze_market_price_import_jobs enable row level security;
alter table public.sanze_real_estate_transactions enable row level security;
alter table public.sanze_market_price_queries enable row level security;
alter table public.sanze_sales_scenarios enable row level security;

comment on table public.sanze_cases is
  'Sanze evaluation case master records. Draft schema; formal RLS policies require auth and user-case mapping.';
comment on table public.sanze_roster_staging is
  'Current roster staging per Sanze case. Keep localStorage in parallel until sync behavior is verified.';
comment on table public.sanze_base_info is
  'Base site information and roster-derived summary for a Sanze case.';
comment on table public.sanze_capacity_data is
  'Capacity/TDR inputs and calculated results. Formula behavior is not changed by this draft.';
comment on table public.sanze_floor_efficiency_data is
  'Floor-efficiency inputs and calculated results. Formula behavior is not changed by this draft.';
comment on table public.sanze_cost_data is
  'Cost and common-burden inputs/results. Formula behavior is not changed by this draft.';
comment on table public.sanze_market_price_import_jobs is
  'Future import job log for public real-estate transaction datasets.';
comment on table public.sanze_real_estate_transactions is
  'Future normalized real-estate transaction rows for market price reference.';
comment on table public.sanze_market_price_queries is
  'Case-level market price query snapshots and aggregate statistics.';
comment on table public.sanze_sales_scenarios is
  'Sales pricing scenarios, optionally linked to a market price query snapshot.';

-- RLS policy TODO:
-- 1. Define Supabase Auth usage or backend session-to-user mapping.
-- 2. Define user-case membership/role table before allowing case reads/writes.
-- 3. Add least-privilege select/insert/update/delete policies per table.
-- 4. Keep service role usage behind Vercel Functions or Supabase Edge Functions only.
-- 5. Never expose service role keys to frontend code or VITE_* variables.
