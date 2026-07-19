-- 0001_devex_schema — FTDS DevEx Command Center domain model (PRD §4 MVP).
--
-- ISOLATION: All objects live in the `devex` schema. AgileRadar uses `public`.
-- This migration is additive only — it does NOT modify public.* or auth.*.
--
-- Apply via: node scripts/deploy-devex-schema.mjs
-- After deploy: Supabase Dashboard → Project Settings → API → Exposed schemas → add `devex`

create schema if not exists devex;

-- ---------------------------------------------------------------------------
-- phases
-- ---------------------------------------------------------------------------
create table if not exists devex.phases (
  id         text primary key,
  name       text not null,
  start_date date not null,
  end_date   date not null
);

-- ---------------------------------------------------------------------------
-- milestones
-- ---------------------------------------------------------------------------
create table if not exists devex.milestones (
  id             text primary key,
  name           text not null,
  milestone_date date not null,
  day_number     int not null,
  status         text not null default 'on_track'
    check (status in ('on_track', 'at_risk', 'late', 'done')),
  exit_criteria  jsonb not null default '[]'::jsonb,
  phase_id       text not null references devex.phases (id) on delete restrict
);

-- ---------------------------------------------------------------------------
-- epics
-- ---------------------------------------------------------------------------
create table if not exists devex.epics (
  id          text primary key,
  code        text not null unique,
  name        text not null,
  description text
);

-- ---------------------------------------------------------------------------
-- gates (Phase-0 instrumentation gates)
-- ---------------------------------------------------------------------------
create table if not exists devex.gates (
  id        text primary key,
  question  text not null,
  owner     text not null
    check (owner in (
      'CZ', 'BS', 'PL', 'PLe', 'TL', 'Team', 'Ravi',
      'BS+CZ', 'CZ+BS', 'CZ+Ravi', 'Ravi+CZ', 'PL+BS'
    )),
  status    text not null default 'open'
    check (status in ('open', 'answered', 'waived')),
  answer    text,
  gap_plan  text
);

-- ---------------------------------------------------------------------------
-- tasks
-- ---------------------------------------------------------------------------
create table if not exists devex.tasks (
  id                   text primary key,
  epic_id              text not null references devex.epics (id) on delete restrict,
  code                 text not null unique,
  title                text not null,
  way                  text check (way in ('1W', '2W', '3W')),
  owner                text not null
    check (owner in (
      'CZ', 'BS', 'PL', 'PLe', 'TL', 'Team', 'Ravi',
      'BS+CZ', 'CZ+BS', 'CZ+Ravi', 'Ravi+CZ', 'PL+BS'
    )),
  owner_is_assumption  boolean not null default false,
  start_day            int not null,
  end_day              int not null,
  status               text not null default 'not_started'
    check (status in ('not_started', 'in_progress', 'blocked', 'done')),
  done_when            text not null,
  blocker_note         text,
  gate_dep             text references devex.gates (id) on delete set null
);

-- ---------------------------------------------------------------------------
-- grants — schema must be exposed in Supabase API settings
-- ---------------------------------------------------------------------------
grant usage on schema devex to anon, authenticated, service_role;
grant select on all tables in schema devex to anon, authenticated;
grant all on all tables in schema devex to service_role;

alter default privileges in schema devex
  grant select on tables to anon, authenticated;
alter default privileges in schema devex
  grant all on tables to service_role;

-- ---------------------------------------------------------------------------
-- RLS — MVP: read-only for anon/authenticated; writes via service_role
-- ---------------------------------------------------------------------------
alter table devex.phases enable row level security;
alter table devex.milestones enable row level security;
alter table devex.epics enable row level security;
alter table devex.gates enable row level security;
alter table devex.tasks enable row level security;

drop policy if exists phases_select on devex.phases;
create policy phases_select on devex.phases for select to anon, authenticated using (true);

drop policy if exists milestones_select on devex.milestones;
create policy milestones_select on devex.milestones for select to anon, authenticated using (true);

drop policy if exists epics_select on devex.epics;
create policy epics_select on devex.epics for select to anon, authenticated using (true);

drop policy if exists gates_select on devex.gates;
create policy gates_select on devex.gates for select to anon, authenticated using (true);

drop policy if exists tasks_select on devex.tasks;
create policy tasks_select on devex.tasks for select to anon, authenticated using (true);
