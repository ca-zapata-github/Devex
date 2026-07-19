-- Seed risks + decisions from src/data/seed/governance.ts (EXECUTION_PLAN §4, §6 + Handover D1–D11).
-- Idempotent: ON CONFLICT DO NOTHING on primary keys.

insert into devex.risks (id, text, likelihood, owner, mitigation, status, review_date) values
  ('risk-gate-slip', 'Phase-0 gate slips compress Phase C (zero-slack calendar)', 'Med-High', 'CZ', 'Gates run in parallel from Day 0; window opens Aug 3 regardless, missing sources marked per D11; bands review can slip to D85 without moving M6', 'open', '2026-08-07'),
  ('risk-survey-fatigue', 'Dual-survey fatigue (Bill''s monthly + pulse)', 'High if DEC-1 unresolved', 'BS', 'Close DEC-1 by D10; one instrument, one comms stream', 'open', '2026-07-30'),
  ('risk-stex-confound', 'STEX cutover mid-window contaminates the baseline', 'Med', 'BS', 'DEC-2: experiment tags; pre/post cuts computed separately', 'monitoring', '2026-09-01'),
  ('risk-quick-win-deflate', 'Quick wins read as "we already fixed it" and deflate urgency for structural work (Dan''s tail-end architecture friction)', 'Med', 'CZ', 'Readout explicitly separates quick-win gains from the structural backlog (event-driven/service-isolation thread → Q+1)', 'monitoring', '2026-10-01'),
  ('risk-surveillance-perception', 'Metrics perceived as surveillance despite guardrails', 'Med', 'CZ', 'E8.3 norms doc + anonymity floor enforced in every artifact incl. the app; no individual cut exists anywhere', 'open', '2026-08-14')
on conflict (id) do nothing;

insert into devex.decisions (id, code, text, status, rationale, locked) values
  ('dec-1', 'DEC-1', 'Bill''s monthly 1–5 productivity survey vs. the 15-item pulse — one instrument or two?', 'open', 'Recommend one instrument: Bill''s Q0 in the pulse; full pulse twice in-window; light Q0+open-text monthly heartbeat between. Two surveys kill response rate.', false),
  ('dec-2', 'DEC-2', 'STEX-replacement dependency: measure the old world, the new one, or both?', 'open', 'Recommend both, tagged: baseline captures current state; GitHub-Actions/E2E cutover gets experiment tag. Do not delay baseline for new platform.', false),
  ('dec-3', 'DEC-3', 'Do Dan''s architecture-assessment scores and the XServices survey join the knowledge base as baseline inputs?', 'open', 'Recommend yes — as qualitative/prior evidence, clearly labeled pre-baseline. Corroborates tail-end validation friction.', false),
  ('dec-4', 'DEC-4', 'Anonymity floor + minimum merges (D10 assumptions ≈5 respondents / 20–30 merges)', 'open', 'Confirm against real cadence in E2; lock by M2. Currently assumptions, not decisions.', false),
  ('d1', 'D1', 'Metrics framework = DORA + SPACE + a Rahul-derived tier', 'closed', 'DORA for throughput/stability, SPACE for effort/experience, Rahul-derived for mandate metrics', true),
  ('d2', 'D2', 'North star = Value-vs-Overhead time split (% dev/debug vs env + pipelines)', 'closed', 'Rahul''s literal ask; headline the scorecard ladders up to', true),
  ('d3', 'D3', 'Agentic-AI leverage is in V1, not staged', 'closed', 'Ties to agentic-AI maturity line and AI-in-DevOps thread', true),
  ('d4', 'D4', 'Endpoint = merge-to-main; prod-deploy tracked separately downstream', 'closed', 'Rahul''s stated finish line; keeps from blurring into SRE pillar', true),
  ('d5', 'D5', 'Baseline before targets; distributions (median + spread), not point estimates', 'closed', 'Mirrors FinOps cost-band method; investigate/escalate bands derived later', true),
  ('d6', 'D6', 'Team/system level only — never individual evaluation', 'closed', 'Protects trust; DORA/SPACE both warn against individual eval', true),
  ('d7', 'D7', 'Every system metric paired with a perceptual one', 'closed', 'Guards against gaming; captures effort', true),
  ('d8', 'D8', 'Exec view collapses into DX Core 4 (Speed / Effectiveness / Quality / Business Impact)', 'closed', 'Keeps stakeholder read legible', true),
  ('d9', 'D9', 'Pulse survey ≈ 15 items, anonymous, ~3–4 min, 5-pt Likert + eNPS + 2 open-text; twice per baseline window', 'closed', 'Short enough to protect response rate across repeated runs', true),
  ('d10', 'D10', 'Baseline window ≈ 8 weeks / one PI; min ~20–30 merges to publish team baseline; anonymity floor ~5 respondents', 'closed', 'Enough data for stable distribution; protect anonymity — confirm against real cadence', true),
  ('d11', 'D11', 'Data integrity: verbatim values, documented sources/exclusions, gaps marked "Not recorded," no fabrication', 'closed', 'Charlie''s consistent analytical posture', true)
on conflict (id) do nothing;
