-- 三策 App 授權機制 Phase 2 schema.
-- Date: 2026-06-19
--
-- This migration is intended to be reviewed and applied manually in Supabase.
-- Do not store plaintext license keys or plaintext device fingerprints.
-- Server-side API routes must use service-role credentials only from Vercel
-- environment variables; no secret belongs in frontend source.

create extension if not exists pgcrypto;

create table if not exists public.licenses (
  id uuid primary key default gen_random_uuid(),
  license_key_hash text not null unique,
  customer_name text,
  customer_email text,
  company_name text,
  plan text not null default 'test',
  status text not null default 'active' check (status in ('active', 'expired', 'revoked', 'suspended')),
  expires_at timestamptz,
  max_devices integer not null default 1 check (max_devices > 0),
  enabled_features jsonb not null default '{}'::jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.license_devices (
  id uuid primary key default gen_random_uuid(),
  license_id uuid not null references public.licenses(id) on delete cascade,
  device_fingerprint_hash text not null,
  device_name text,
  platform text,
  app_version text,
  build text,
  status text not null default 'active' check (status in ('active', 'revoked')),
  activated_at timestamptz not null default now(),
  last_verified_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (license_id, device_fingerprint_hash)
);

create table if not exists public.license_events (
  id uuid primary key default gen_random_uuid(),
  license_id uuid references public.licenses(id) on delete set null,
  device_id uuid references public.license_devices(id) on delete set null,
  event_type text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists licenses_license_key_hash_idx on public.licenses (license_key_hash);
create index if not exists licenses_status_idx on public.licenses (status);
create index if not exists licenses_expires_at_idx on public.licenses (expires_at);

create index if not exists license_devices_license_id_idx on public.license_devices (license_id);
create index if not exists license_devices_device_fingerprint_hash_idx on public.license_devices (device_fingerprint_hash);
create index if not exists license_devices_status_idx on public.license_devices (status);

create index if not exists license_events_license_id_idx on public.license_events (license_id);
create index if not exists license_events_device_id_idx on public.license_events (device_id);
create index if not exists license_events_event_type_idx on public.license_events (event_type);
create index if not exists license_events_created_at_idx on public.license_events (created_at);

alter table public.licenses enable row level security;
alter table public.license_devices enable row level security;
alter table public.license_events enable row level security;
