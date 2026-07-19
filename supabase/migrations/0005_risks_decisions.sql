-- 0005_risks_decisions — risk register + decision log (PRD §3.6).
-- Apply via: npm run db:deploy:devex

create table if not exists devex.risks (
  id          text primary key,
  text        text not null,
  likelihood  text not null,
  impact      text,
  owner       text not null
    check (owner in (
      'CZ', 'BS', 'PL', 'PLe', 'TL', 'Team', 'Ravi',
      'BS+CZ', 'CZ+BS', 'CZ+Ravi', 'Ravi+CZ', 'PL+BS'
    )),
  mitigation  text not null,
  status      text not null default 'open'
    check (status in ('open', 'monitoring', 'closed')),
  review_date date
);

create table if not exists devex.decisions (
  id           text primary key,
  code         text not null unique,
  text         text not null,
  status       text not null default 'open'
    check (status in ('open', 'closed')),
  closed_date  date,
  closed_by    text
    check (closed_by is null or closed_by in (
      'CZ', 'BS', 'PL', 'PLe', 'TL', 'Team', 'Ravi',
      'BS+CZ', 'CZ+BS', 'CZ+Ravi', 'Ravi+CZ', 'PL+BS'
    )),
  rationale    text,
  locked       boolean not null default false
);

grant select on devex.risks to anon, authenticated;
grant select on devex.decisions to anon, authenticated;
grant all on devex.risks to service_role;
grant all on devex.decisions to service_role;

alter table devex.risks enable row level security;
alter table devex.decisions enable row level security;

drop policy if exists risks_select on devex.risks;
create policy risks_select on devex.risks for select to anon, authenticated using (true);

drop policy if exists decisions_select on devex.decisions;
create policy decisions_select on devex.decisions for select to anon, authenticated using (true);
