-- 0007_survey — pulse survey module (PRD §3.7, Appendix A).
-- Apply via: npm run db:deploy:devex

create table if not exists devex.survey_teams (
  id   text primary key,
  name text not null
);

create table if not exists devex.survey_forms (
  id         text primary key,
  type       text not null check (type in ('baseline', 'progress')),
  version    text not null,
  title      text not null,
  intro_text text not null
);

create table if not exists devex.survey_questions (
  id              text primary key,
  form_id         text not null references devex.survey_forms (id) on delete cascade,
  code            text not null,
  sort_order      int not null,
  section         text not null,
  text            text not null,
  response_type   text not null
    check (response_type in ('likert5_na', 'share_band', 'nps_0_10', 'multi_select', 'open_text')),
  reverse_coded   boolean not null default false,
  maps_to_metric  text,
  space_dimension text,
  journey_stage   text,
  options         jsonb,
  required        boolean not null default true,
  unique (form_id, code)
);

create table if not exists devex.survey_runs (
  id                     text primary key,
  form_id                text not null references devex.survey_forms (id) on delete restrict,
  label                  text,
  open_date              date not null,
  close_date             date not null,
  status                 text not null default 'draft'
    check (status in ('draft', 'open', 'closed')),
  rotating_question_code text
);

-- No user identity; submitted_date is day precision only (PRD §4).
create table if not exists devex.survey_responses (
  id             uuid primary key default gen_random_uuid(),
  run_id         text not null references devex.survey_runs (id) on delete cascade,
  team_id        text not null references devex.survey_teams (id) on delete restrict,
  submitted_date date not null default (current_date),
  answers        jsonb not null default '{}'::jsonb
);

-- Open text stored detached — never joined to likert in small-n cuts (G7).
create table if not exists devex.survey_open_text (
  id             uuid primary key default gen_random_uuid(),
  run_id         text not null references devex.survey_runs (id) on delete cascade,
  team_id        text not null references devex.survey_teams (id) on delete restrict,
  question_code  text not null,
  body           text not null,
  submitted_date date not null default (current_date)
);

create index if not exists survey_responses_run_team_idx
  on devex.survey_responses (run_id, team_id);

grant select on devex.survey_teams, devex.survey_forms, devex.survey_questions,
  devex.survey_runs to anon, authenticated;
grant select, insert on devex.survey_responses, devex.survey_open_text to anon, authenticated;
grant all on devex.survey_teams, devex.survey_forms, devex.survey_questions,
  devex.survey_runs, devex.survey_responses, devex.survey_open_text to service_role;

alter table devex.survey_teams enable row level security;
alter table devex.survey_forms enable row level security;
alter table devex.survey_questions enable row level security;
alter table devex.survey_runs enable row level security;
alter table devex.survey_responses enable row level security;
alter table devex.survey_open_text enable row level security;

drop policy if exists survey_teams_select on devex.survey_teams;
create policy survey_teams_select on devex.survey_teams for select to anon, authenticated using (true);

drop policy if exists survey_forms_select on devex.survey_forms;
create policy survey_forms_select on devex.survey_forms for select to anon, authenticated using (true);

drop policy if exists survey_questions_select on devex.survey_questions;
create policy survey_questions_select on devex.survey_questions for select to anon, authenticated using (true);

drop policy if exists survey_runs_select on devex.survey_runs;
create policy survey_runs_select on devex.survey_runs for select to anon, authenticated using (true);

drop policy if exists survey_responses_insert on devex.survey_responses;
create policy survey_responses_insert on devex.survey_responses for insert to anon, authenticated with check (true);

drop policy if exists survey_open_text_insert on devex.survey_open_text;
create policy survey_open_text_insert on devex.survey_open_text for insert to anon, authenticated with check (true);

-- Aggregates are computed server-side; direct SELECT on responses blocked for anon.
drop policy if exists survey_responses_select on devex.survey_responses;
create policy survey_responses_select on devex.survey_responses for select to service_role using (true);

drop policy if exists survey_open_text_select on devex.survey_open_text;
create policy survey_open_text_select on devex.survey_open_text for select to service_role using (true);
