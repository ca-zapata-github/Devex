-- Seed survey module from src/data/seed/survey.ts

insert into devex.survey_teams (id, name) values
  ('team-controls', 'Controls & Drives'),
  ('team-platform', 'Platform & Tooling'),
  ('team-validation', 'Validation & Test'),
  ('team-apps', 'Applications'),
  ('team-infra', 'Infrastructure')
on conflict (id) do nothing;

insert into devex.survey_forms (id, type, version, title, intro_text) values
  ('form-baseline-v1', 'baseline', '1.0', 'Baseline Pulse',
   'A short, anonymous pulse on your day-to-day developer experience. ~3–4 minutes. Results are aggregated at the team level only and are never tied to individuals — we''re measuring the environment and the pipeline, not you. You are the customer; this is how we find and fix what slows you down.'),
  ('form-progress-v1', 'progress', '1.0', 'Progress Pulse',
   'A short, anonymous pulse on your day-to-day developer experience. ~3–4 minutes. Results are aggregated at the team level only and are never tied to individuals — we''re measuring the environment and the pipeline, not you. You are the customer; this is how we find and fix what slows you down.')
on conflict (id) do nothing;

-- Baseline Pulse questions (verbatim from FTDS_DevEx_Pulse_Survey.md)
insert into devex.survey_questions (id, form_id, code, sort_order, section, text, response_type, reverse_coded, maps_to_metric, space_dimension, journey_stage, options, required) values
  ('form-baseline-v1-q1', 'form-baseline-v1', 'Q1', 1, 'Time & focus',
   'In a typical week, roughly what share of your time goes to actual development and debugging — as opposed to setting up or fixing environments, waiting on or fighting pipelines, and other overhead?',
   'share_band', false, 'value_vs_overhead', null, null, '["Under 25%","25–50%","50–75%","Over 75%"]'::jsonb, true),
  ('form-baseline-v1-q2', 'form-baseline-v1', 'Q2', 2, 'Time & focus',
   'I spend too much time fighting my environment and pipelines instead of building and debugging.',
   'likert5_na', true, 'value_vs_overhead', 'E', null, null, true),
  ('form-baseline-v1-q3', 'form-baseline-v1', 'Q3', 3, 'Time & focus',
   'I get enough uninterrupted focus time to do deep work.', 'likert5_na', false, null, 'E', null, null, true),
  ('form-baseline-v1-q4', 'form-baseline-v1', 'Q4', 4, 'Workflow stages',
   'Spinning up or refreshing my dev environment is fast and painless.', 'likert5_na', false, null, null, 'Environment ready', null, true),
  ('form-baseline-v1-q5', 'form-baseline-v1', 'Q5', 5, 'Workflow stages',
   'When I''m debugging, my tools help me rather than get in the way.', 'likert5_na', false, null, null, 'Code & debug', null, true),
  ('form-baseline-v1-q6', 'form-baseline-v1', 'Q6', 6, 'Workflow stages',
   'CI gives me fast, reliable feedback on my changes.', 'likert5_na', false, null, null, 'Build / verify', null, true),
  ('form-baseline-v1-q7', 'form-baseline-v1', 'Q7', 7, 'Workflow stages',
   'Getting my code reviewed and merged to main is smooth and timely.', 'likert5_na', false, null, null, 'Review / merge', null, true),
  ('form-baseline-v1-q8', 'form-baseline-v1', 'Q8', 8, 'Workflow stages',
   'I''m regularly blocked waiting on builds, pipelines, or reviews.', 'likert5_na', true, null, 'E', null, null, true),
  ('form-baseline-v1-q9', 'form-baseline-v1', 'Q9', 9, 'Overall experience',
   'Overall, I''m satisfied with the developer experience in FTDS.', 'likert5_na', false, null, 'S', null, null, true),
  ('form-baseline-v1-q10', 'form-baseline-v1', 'Q10', 10, 'Overall experience',
   'How likely are you to recommend our dev environment and tooling to another engineer? (0 = not at all likely, 10 = extremely likely)',
   'nps_0_10', false, null, 'S', null, null, true),
  ('form-baseline-v1-q11', 'form-baseline-v1', 'Q11', 11, 'AI leverage',
   'AI tools meaningfully speed up my day-to-day work today.', 'likert5_na', false, 'ai_leverage', null, null, null, true),
  ('form-baseline-v1-q12', 'form-baseline-v1', 'Q12', 12, 'AI leverage',
   'I know how to apply AI tools effectively to my own workflow.', 'likert5_na', false, 'ai_leverage', null, null, null, true),
  ('form-baseline-v1-q13', 'form-baseline-v1', 'Q13', 13, 'AI leverage',
   'Which AI tools do you currently use in your workflow?', 'multi_select', false, null, null, null,
   '["GitHub Copilot","Cursor","Claude / ChatGPT","Internal FTDS agent","Other","None"]'::jsonb, true),
  ('form-baseline-v1-q14', 'form-baseline-v1', 'Q14', 14, 'In your words',
   'What one thing slows you down the most in a typical week?', 'open_text', false, null, null, null, null, false),
  ('form-baseline-v1-q15', 'form-baseline-v1', 'Q15', 15, 'In your words',
   'If we could fix one thing about the environment or pipeline, what should it be?', 'open_text', false, null, null, null, null, false)
on conflict (id) do nothing;

insert into devex.survey_runs (id, form_id, label, open_date, close_date, status) values
  ('run-pulse-1', 'form-baseline-v1', 'Pulse #1 — week of Aug 3', '2026-07-01', '2026-10-16', 'open'),
  ('run-pulse-2', 'form-baseline-v1', 'Pulse #2 — week of Sep 21', '2026-09-21', '2026-09-28', 'draft')
on conflict (id) do nothing;

-- Sample responses (SAMPLE DATA — G5) — ids must be valid UUIDs
insert into devex.survey_responses (id, run_id, team_id, submitted_date, answers) values
  ('a1000001-0001-4000-8000-000000000001', 'run-pulse-1', 'team-controls', '2026-08-04', '{"Q1":"25–50%","Q2":3,"Q3":4,"Q4":3,"Q5":4,"Q6":2,"Q7":3,"Q8":3,"Q9":4,"Q10":7,"Q11":4,"Q12":4,"Q13":["GitHub Copilot","Cursor"]}'::jsonb),
  ('a1000001-0001-4000-8000-000000000002', 'run-pulse-1', 'team-controls', '2026-08-04', '{"Q1":"50–75%","Q2":2,"Q3":3,"Q4":2,"Q5":3,"Q6":3,"Q7":4,"Q8":2,"Q9":3,"Q10":8,"Q11":3,"Q12":3,"Q13":["None"]}'::jsonb),
  ('a1000001-0001-4000-8000-000000000003', 'run-pulse-1', 'team-controls', '2026-08-04', '{"Q1":"Under 25%","Q2":4,"Q3":4,"Q4":3,"Q5":4,"Q6":4,"Q7":3,"Q8":4,"Q9":4,"Q10":6,"Q11":4,"Q12":4,"Q13":["GitHub Copilot"]}'::jsonb),
  ('a1000001-0001-4000-8000-000000000004', 'run-pulse-1', 'team-controls', '2026-08-04', '{"Q1":"25–50%","Q2":3,"Q3":3,"Q4":4,"Q5":3,"Q6":2,"Q7":3,"Q8":3,"Q9":3,"Q10":7,"Q11":3,"Q12":4,"Q13":["Cursor"]}'::jsonb),
  ('a1000001-0001-4000-8000-000000000005', 'run-pulse-1', 'team-controls', '2026-08-04', '{"Q1":"50–75%","Q2":2,"Q3":4,"Q4":2,"Q5":4,"Q6":3,"Q7":4,"Q8":2,"Q9":4,"Q10":9,"Q11":4,"Q12":3,"Q13":["GitHub Copilot","Cursor"]}'::jsonb),
  ('a1000001-0001-4000-8000-000000000006', 'run-pulse-1', 'team-controls', '2026-08-04', '{"Q1":"Over 75%","Q2":3,"Q3":3,"Q4":3,"Q5":3,"Q6":4,"Q7":3,"Q8":3,"Q9":3,"Q10":6,"Q11":3,"Q12":3,"Q13":["None"]}'::jsonb),
  ('a1000001-0001-4000-8000-000000000007', 'run-pulse-1', 'team-controls', '2026-08-04', '{"Q1":"25–50%","Q2":2,"Q3":4,"Q4":3,"Q5":4,"Q6":2,"Q7":4,"Q8":2,"Q9":4,"Q10":8,"Q11":4,"Q12":4,"Q13":["GitHub Copilot"]}'::jsonb),
  ('a1000001-0001-4000-8000-000000000008', 'run-pulse-1', 'team-controls', '2026-08-04', '{"Q1":"50–75%","Q2":3,"Q3":3,"Q4":2,"Q5":3,"Q6":3,"Q7":3,"Q8":4,"Q9":3,"Q10":7,"Q11":3,"Q12":4,"Q13":["Cursor"]}'::jsonb),
  ('a1000001-0001-4000-8000-000000000009', 'run-pulse-1', 'team-platform', '2026-08-05', '{"Q1":"25–50%","Q2":3,"Q3":4,"Q4":3,"Q5":4,"Q6":2,"Q7":4,"Q8":3,"Q9":4,"Q10":7,"Q11":4,"Q12":4,"Q13":["GitHub Copilot"]}'::jsonb),
  ('a1000001-0001-4000-8000-00000000000a', 'run-pulse-1', 'team-platform', '2026-08-05', '{"Q1":"50–75%","Q2":2,"Q3":3,"Q4":2,"Q5":3,"Q6":3,"Q7":3,"Q8":2,"Q9":3,"Q10":8,"Q11":3,"Q12":3,"Q13":["None"]}'::jsonb),
  ('a1000001-0001-4000-8000-00000000000b', 'run-pulse-1', 'team-platform', '2026-08-05', '{"Q1":"Under 25%","Q2":4,"Q3":4,"Q4":3,"Q5":4,"Q6":4,"Q7":4,"Q8":4,"Q9":4,"Q10":6,"Q11":4,"Q12":4,"Q13":["GitHub Copilot","Cursor"]}'::jsonb),
  ('a1000001-0001-4000-8000-00000000000c', 'run-pulse-1', 'team-platform', '2026-08-05', '{"Q1":"25–50%","Q2":3,"Q3":3,"Q4":4,"Q5":3,"Q6":2,"Q7":3,"Q8":3,"Q9":3,"Q10":7,"Q11":3,"Q12":4,"Q13":["Cursor"]}'::jsonb),
  ('a1000001-0001-4000-8000-00000000000d', 'run-pulse-1', 'team-platform', '2026-08-05', '{"Q1":"50–75%","Q2":2,"Q3":4,"Q4":2,"Q5":4,"Q6":3,"Q7":4,"Q8":2,"Q9":4,"Q10":9,"Q11":4,"Q12":3,"Q13":["None"]}'::jsonb),
  ('a1000001-0001-4000-8000-00000000000e', 'run-pulse-1', 'team-platform', '2026-08-05', '{"Q1":"Over 75%","Q2":3,"Q3":3,"Q4":3,"Q5":3,"Q6":4,"Q7":3,"Q8":3,"Q9":3,"Q10":6,"Q11":3,"Q12":3,"Q13":["GitHub Copilot"]}'::jsonb),
  ('a1000001-0001-4000-8000-00000000000f', 'run-pulse-1', 'team-validation', '2026-08-06', '{"Q1":"25–50%","Q2":3,"Q3":4,"Q4":3,"Q5":4,"Q6":2,"Q7":3,"Q8":3,"Q9":4,"Q10":7,"Q11":4,"Q12":4,"Q13":["GitHub Copilot"]}'::jsonb),
  ('a1000001-0001-4000-8000-000000000010', 'run-pulse-1', 'team-validation', '2026-08-06', '{"Q1":"50–75%","Q2":2,"Q3":3,"Q4":2,"Q5":3,"Q6":3,"Q7":4,"Q8":2,"Q9":3,"Q10":8,"Q11":3,"Q12":3,"Q13":["None"]}'::jsonb),
  ('a1000001-0001-4000-8000-000000000011', 'run-pulse-1', 'team-validation', '2026-08-06', '{"Q1":"Under 25%","Q2":4,"Q3":4,"Q4":3,"Q5":4,"Q6":4,"Q7":3,"Q8":4,"Q9":4,"Q10":6,"Q11":4,"Q12":4,"Q13":["Cursor"]}'::jsonb)
on conflict (id) do nothing;

insert into devex.survey_open_text (id, run_id, team_id, question_code, body, submitted_date) values
  ('b1000001-0001-4000-8000-000000000001', 'run-pulse-1', 'team-controls', 'Q14', 'Waiting on CI pipelines to finish before I can merge.', '2026-08-04'),
  ('b1000001-0001-4000-8000-000000000002', 'run-pulse-1', 'team-controls', 'Q15', 'Faster Rancher environment spin-up.', '2026-08-04'),
  ('b1000001-0001-4000-8000-000000000003', 'run-pulse-1', 'team-platform', 'Q14', 'Flaky tests causing re-runs.', '2026-08-05')
on conflict (id) do nothing;
