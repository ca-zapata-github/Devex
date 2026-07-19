-- 0004_status_updates — frozen readout snapshots per stakeholder send (PRD §4).
-- Apply via: npm run db:deploy:devex

create table if not exists devex.status_updates (
  id                       text primary key default gen_random_uuid()::text,
  snapshot_date            date not null default current_date,
  generated_at             timestamptz not null default now(),
  label                    text,
  generated_snapshot_json  jsonb not null
);

create index if not exists status_updates_generated_at_idx
  on devex.status_updates (generated_at desc);

grant select on devex.status_updates to anon, authenticated;
grant all on devex.status_updates to service_role;

alter table devex.status_updates enable row level security;

drop policy if exists status_updates_select on devex.status_updates;
create policy status_updates_select on devex.status_updates
  for select to anon, authenticated using (true);
