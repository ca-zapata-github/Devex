-- Seed experiments + metric snapshots from src/data/seed/metrics.ts

insert into devex.experiments (id, task_id, hypothesis, metric, stage, start_tag, end_tag, status, pre_median, pre_spread, pre_n, confounds) values
  ('exp-flaky-quarantine', 'e6-1', 'Flaky-test quarantine + dedup cuts re-run rate and CI wait time (FinOps co-win)', 'CI re-run rate (team median + spread)', 'Build / verify', '2026-08-10', null, 'running', 18, 6, 12, '[]'::jsonb),
  ('exp-stex-cutover', 'e6-2', 'STEX→GitHub Actions cutover tagged so baseline pre/post stays separable (DEC-2)', 'Deploy frequency (merge-to-main)', 'Release', '2026-08-03', '2026-09-15', 'running', null, null, null, '["STEX cutover window TBD — tag before/after in confound log"]'::jsonb),
  ('exp-rancher-spinup', 'e6-3', 'Image caching or pre-provisioned envs reduce Rancher spin-up median after E3.4 localizes pain', 'Time-to-ready-env (minutes, median + spread)', 'Environment ready', '2026-08-24', null, 'planned', null, null, null, '[]'::jsonb),
  ('exp-review-slo', 'e6-4', 'Reviewer-rotation SLO on 2 opt-in teams reduces PR cycle time without individual metrics', 'PR cycle time (team-level, pilot teams)', 'Review / merge', '2026-08-24', null, 'planned', null, null, null, '[]'::jsonb),
  ('exp-ai-triage', 'e7-3', 'AI triage of flaky-test failures reduces developer wait on CI feedback loop', 'Time in blocked-on-CI state (self-report pulse + telemetry)', 'Build / verify', '2026-09-01', null, 'planned', null, null, null, '[]'::jsonb)
on conflict (id) do nothing;

insert into devex.metric_snapshots (metric_key, snapshot_date, headline_value, baseline_status, direction) values
  ('value_vs_overhead', '2026-07-20', 'Not recorded', 'collecting', 'unknown'),
  ('dx_speed', '2026-07-20', null, 'collecting', 'flat'),
  ('dx_effectiveness', '2026-07-20', null, 'collecting', 'flat'),
  ('dx_quality', '2026-07-20', null, 'collecting', 'flat'),
  ('dx_business_impact', '2026-07-20', null, 'collecting', 'unknown')
on conflict (metric_key) do nothing;
