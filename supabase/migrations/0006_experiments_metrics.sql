-- 0006_experiments_metrics — experiment cards + metric headline strip (PRD §3.4–3.5).
-- Apply via: npm run db:deploy:devex

create table if not exists devex.experiments (
  id          text primary key,
  task_id     text not null references devex.tasks (id) on delete restrict,
  hypothesis  text not null,
  metric      text not null,
  stage       text not null,
  start_tag   text not null,
  end_tag     text,
  status      text not null default 'planned'
    check (status in ('planned', 'running', 'measured', 'inconclusive')),
  pre_median  numeric,
  pre_spread  numeric,
  pre_n       int,
  post_median numeric,
  post_spread numeric,
  post_n      int,
  confounds   jsonb not null default '[]'::jsonb
);

create table if not exists devex.metric_snapshots (
  metric_key       text primary key,
  snapshot_date    date not null,
  headline_value   text,
  baseline_status  text not null default 'collecting'
    check (baseline_status in ('collecting', 'established')),
  direction        text not null default 'unknown'
    check (direction in ('up', 'down', 'flat', 'unknown'))
);

grant select on devex.experiments to anon, authenticated;
grant select on devex.metric_snapshots to anon, authenticated;
grant all on devex.experiments to service_role;
grant all on devex.metric_snapshots to service_role;

alter table devex.experiments enable row level security;
alter table devex.metric_snapshots enable row level security;

drop policy if exists experiments_select on devex.experiments;
create policy experiments_select on devex.experiments for select to anon, authenticated using (true);

drop policy if exists metric_snapshots_select on devex.metric_snapshots;
create policy metric_snapshots_select on devex.metric_snapshots for select to anon, authenticated using (true);
