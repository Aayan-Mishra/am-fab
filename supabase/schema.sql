-- PFAB Supabase schema.
-- Run in the Supabase SQL editor (or `supabase db push`) to provision the
-- tables the app writes to. Single-user for now; RLS is enabled and locked so
-- only the service-role key (server-side) can read/write until auth is added.

-- ── Episodic memory: events, captures, decisions, milestones ──
create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null check (kind in ('capture','session','decision','milestone')),
  text        text not null,
  tag         text,
  metadata    jsonb default '{}'::jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists events_created_idx on public.events (created_at desc);
create index if not exists events_tag_idx on public.events (tag);

-- ── Behavioral streams: one row per (stream, timestamp) measurement ──
create table if not exists public.metrics (
  id      bigint generated always as identity primary key,
  stream  text not null,                 -- e.g. 'sleep','hrv','steps','net_worth','focus'
  value   double precision not null,
  ts      timestamptz not null default now(),
  meta    jsonb default '{}'::jsonb
);
create index if not exists metrics_stream_ts_idx on public.metrics (stream, ts desc);

-- ── Identity memory: values, mission, goals, non-negotiables ──
create table if not exists public.identity (
  id      uuid primary key default gen_random_uuid(),
  kind    text not null,                 -- 'mission','value','goal','non_negotiable','strength','weakness'
  label   text not null,
  detail  text,
  weight  int default 1,
  created_at timestamptz not null default now()
);

-- ── OAuth tokens for connected integrations (Strava, …) ──
create table if not exists public.integration_tokens (
  provider      text primary key,
  access_token  text not null,
  refresh_token text not null,
  expires_at    bigint not null,         -- unix seconds
  scope         text,
  updated_at    timestamptz not null default now()
);

-- ── Daily AI cache: one row per logical key (reflection, challenge, …) ──
create table if not exists public.ai_cache (
  key        text primary key,           -- e.g. 'reflection:2026-06-28'
  day        date not null,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

-- Lock everything down: service role bypasses RLS, anon/auth get nothing yet.
alter table public.events enable row level security;
alter table public.ai_cache enable row level security;
alter table public.metrics enable row level security;
alter table public.identity enable row level security;
alter table public.integration_tokens enable row level security;
