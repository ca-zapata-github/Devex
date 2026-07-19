import type {
  Epic,
  Gate,
  Milestone,
  Phase,
  PlanSeed,
  Task,
  WayTag,
} from "@/types/domain";
import { parseOwner } from "@/types/owners";

function task(
  epicId: string,
  code: string,
  title: string,
  ownerRaw: string,
  window: string,
  doneWhen: string,
  way?: WayTag,
  gateDep?: string,
): Task {
  const { owner, ownerIsAssumption } = parseOwner(ownerRaw);
  const { startDay, endDay } = parseWindow(window);
  return {
    id: code.toLowerCase().replace(".", "-"),
    epicId,
    code,
    title,
    way,
    owner,
    ownerIsAssumption,
    startDay,
    endDay,
    status: "not_started",
    doneWhen,
    gateDep,
  };
}

function parseWindow(window: string): { startDay: number; endDay: number } {
  const trimmed = window.trim();
  if (trimmed === "weekly") return { startDay: 14, endDay: 70 };
  if (trimmed === "ongoing") return { startDay: 0, endDay: 90 };
  if (trimmed === "biweekly") return { startDay: 7, endDay: 88 };

  const range = trimmed.match(/D(\d+)\s*[–—/]\s*D?(\d+)/i);
  if (range) {
    return { startDay: Number(range[1]), endDay: Number(range[2]) };
  }

  const single = trimmed.match(/^D(\d+)$/i);
  if (single) {
    const day = Number(single[1]);
    return { startDay: day, endDay: day };
  }

  throw new Error(`Unparseable window: "${window}"`);
}

export const phases: Phase[] = [
  {
    id: "phase-a",
    name: "Commit & Instrument",
    start: "2026-07-20",
    end: "2026-08-07",
  },
  {
    id: "phase-b",
    name: "Baseline & First Improvement Wave",
    start: "2026-08-03",
    end: "2026-09-27",
  },
  {
    id: "phase-c",
    name: "Compute, Bands & Readout",
    start: "2026-09-28",
    end: "2026-10-16",
  },
];

export const milestones: Milestone[] = [
  {
    id: "m1",
    name: "Commit closed & fellowship confirmed",
    date: "2026-07-31",
    day: 11,
    status: "on_track",
    phaseId: "phase-a",
    exitCriteria: [
      "Charlie's disagree-and-commit response delivered",
      "Roster locked (Bill, Carlos, Piotr, Patrick — Tim confirmed)",
      "Charter + operating cadence agreed",
      "D1–D11 ratified by the team",
    ],
  },
  {
    id: "m2",
    name: "Instrumented & window open",
    date: "2026-08-07",
    day: 18,
    status: "on_track",
    phaseId: "phase-a",
    exitCriteria: [
      "All four gates answered (or explicitly waived w/ gap plan)",
      "Telemetry pipelines pulling",
      "Survey instruments reconciled (DEC-1)",
      "Pulse #1 fielded",
      "Baseline window officially open Aug 3",
    ],
  },
  {
    id: "m3",
    name: "Mid-window checkpoint",
    date: "2026-09-03",
    day: 45,
    status: "on_track",
    phaseId: "phase-b",
    exitCriteria: [
      "Data quality audit passed (no gaps silently accumulating)",
      "≥1 quick-win shipped with experiment tag",
      "Flow map validated against telemetry",
      "Stakeholder status #2 sent",
    ],
  },
  {
    id: "m4",
    name: "Window closed, Pulse #2 in",
    date: "2026-09-30",
    day: 72,
    status: "on_track",
    phaseId: "phase-b",
    exitCriteria: [
      "8 weeks of telemetry captured",
      "Pulse #2 response count ≥ Pulse #1 × 0.8",
      "Exclusions log complete",
    ],
  },
  {
    id: "m5",
    name: "Baseline & bands reviewed",
    date: "2026-10-09",
    day: 81,
    status: "on_track",
    phaseId: "phase-c",
    exitCriteria: [
      "Per-metric distributions published",
      "Investigate/escalate bands proposed",
      "Reviewed with Tim/Wei/JD delegates",
      "Anonymity floor verified on every perceptual cut",
    ],
  },
  {
    id: "m6",
    name: "Day-90 readout to Rahul",
    date: "2026-10-16",
    day: 88,
    status: "on_track",
    phaseId: "phase-c",
    exitCriteria: [
      "DX Core 4 exec roll-up + north-star headline",
      "Improvement-wave results vs. baseline",
      "Q+1 orchestration plan",
      "Progress app live for the review",
    ],
  },
];

export const epics: Epic[] = [
  {
    id: "epic-e1",
    code: "E1",
    name: "Governance & Commit",
    description: "Phase A",
  },
  {
    id: "epic-e2",
    code: "E2",
    name: "Instrumentation Gates",
    description: "Phase A — critical path",
  },
  {
    id: "epic-e3",
    code: "E3",
    name: "Baseline: System Telemetry",
    description: "Phase B",
  },
  {
    id: "epic-e4",
    code: "E4",
    name: "Baseline: Perceptual",
    description: "Phases A–C",
  },
  {
    id: "epic-e5",
    code: "E5",
    name: "Flow Map & Constraint Localization",
    description: "First Way core, Phase B",
  },
  {
    id: "epic-e6",
    code: "E6",
    name: "First Improvement Wave: Quick Wins",
    description: "Phases B–C — tagged experiments",
  },
  {
    id: "epic-e7",
    code: "E7",
    name: "Agentic-AI Leverage",
    description: "Phases A–C",
  },
  {
    id: "epic-e8",
    code: "E8",
    name: "Learning Loop",
    description: "Third Way, Phases A–C",
  },
  {
    id: "epic-e9",
    code: "E9",
    name: "Comms & Stakeholder Rhythm",
    description: "All phases",
  },
  {
    id: "epic-e10",
    code: "E10",
    name: "Progress App",
    description: "Per the companion PRD",
  },
];

export const gates: Gate[] = [
  {
    id: "gate-1",
    question:
      "Source of truth for lead time / deploy-freq: audit GitHub vs. CI vs. pipeline-analytics; pick one authoritative source per metric",
    owner: "CZ",
    status: "open",
  },
  {
    id: "gate-2",
    question:
      "Pulse channel: does an anonymous survey channel exist (Forms/Qualtrics/other)? Stand one up if not; verify anonymity mechanics + team-level attribution",
    owner: "BS",
    status: "open",
  },
  {
    id: "gate-3",
    question:
      "AI telemetry: inventory agentic tools actually in use (feeds survey Q13's placeholder list); identify which emit usable usage telemetry; connect what we can",
    owner: "Ravi+CZ",
    status: "open",
  },
  {
    id: "gate-4",
    question:
      "Window defensibility: pull last-quarter merge counts per team; confirm 8 wks ≥ 20–30 merges/team; flag low-volume teams for extended windows (per plan §5)",
    owner: "CZ",
    status: "open",
  },
];

export const tasks: Task[] = [
  // E1 — Governance & Commit
  task(
    "epic-e1",
    "E1.1",
    "Draft & send Charlie's disagree-and-commit response to Rahul — mirror his numbered format; strengthen the framing; include the two strongest counter-arguments (scope-creep into SRE pillar; measurement-before-relief risk)",
    "CZ",
    "D0–D5",
    "Sent; discussed in Rahul's follow-up",
    "3W",
  ),
  task(
    "epic-e1",
    "E1.2",
    "Confirm the fellowship: Bill, Carlos, Piotr, Patrick — chase Tim's confirm on Patrick; propose role split (see E1.4)",
    "CZ",
    "D0–D7",
    "Roster in charter",
  ),
  task(
    "epic-e1",
    "E1.3",
    "Write the initiative charter (1 page): mandate, north star, endpoint = merge-to-main, guardrails D6/D7, pillar boundaries (SRE, FinOps), decision log D1–D11 attached for ratification",
    "CZ",
    "D3–D9",
    "Team ratifies at kickoff",
    "1W",
  ),
  task(
    "epic-e1",
    "E1.4",
    "Assign workstream leads: Measurement (CZ*), Test/CI flow incl. STEX cutover (BS*), Infra/env + geo-latency (PL*), Review/merge flow (PLe*), AI leverage (CZ+Ravi*)",
    "Team",
    "D7–D11",
    "Names against every epic",
  ),
  task(
    "epic-e1",
    "E1.5",
    "Stand up operating cadence: weekly leads sync (30 min), biweekly stakeholder status (async, numbered format), Day-45 and Day-81 stakeholder reviews",
    "CZ",
    "D7–D11",
    "Invites out; template agreed (E9.1)",
    "2W",
  ),
  task(
    "epic-e1",
    "E1.6",
    "Kickoff session: ratify charter, walk the SDLC flow map, agree Phase-A assignments",
    "Team",
    "D9–D11",
    "M1 exit",
  ),

  // E2 — Instrumentation Gates
  task(
    "epic-e2",
    "E2.1",
    "Gate 1 — Source of truth for lead time / deploy-freq: audit GitHub vs. CI vs. pipeline-analytics; pick one authoritative source per metric",
    "CZ*",
    "D0–D10",
    'Matrix col. "Source of truth" confirmed per metric',
    "2W",
    "gate-1",
  ),
  task(
    "epic-e2",
    "E2.2",
    "Gate 2 — Pulse channel: does an anonymous survey channel exist (Forms/Qualtrics/other)? Stand one up if not; verify anonymity mechanics + team-level attribution",
    "BS*",
    "D0–D10",
    "Test run completed end-to-end",
    "2W",
    "gate-2",
  ),
  task(
    "epic-e2",
    "E2.3",
    "Gate 3 — AI telemetry: inventory agentic tools actually in use (feeds survey Q13's placeholder list); identify which emit usable usage telemetry; connect what we can",
    "Ravi*/CZ",
    "D0–D14",
    "Q13 list final; telemetry feeds documented or marked unavailable",
    "2W",
    "gate-3",
  ),
  task(
    "epic-e2",
    "E2.4",
    "Gate 4 — Window defensibility: pull last-quarter merge counts per team; confirm 8 wks ≥ 20–30 merges/team; flag low-volume teams for extended windows (per plan §5)",
    "CZ*",
    "D0–D10",
    "D10 numbers confirmed or revised; DEC-4 closed",
    "1W",
    "gate-4",
  ),
  task(
    "epic-e2",
    "E2.5",
    "Build the telemetry extraction jobs (GitHub/CI event exports, provisioning logs, incident data) writing to one landing zone; document every field + exclusion rule per D11",
    "TL",
    "D5–D18",
    "First week of clean data validated",
    "2W",
  ),
  task(
    "epic-e2",
    "E2.6",
    "Stage-decomposition mapping: define the timestamp events that delimit each journey stage (env-ready, first-commit, PR-open, gates-green, merge) against real pipeline events from the SDLC map",
    "PL*",
    "D5–D18",
    "Each stage computable from telemetry",
    "1W",
  ),

  // E3 — Baseline: System Telemetry
  task(
    "epic-e3",
    "E3.1",
    "Open baseline window Aug 3; telemetry runs continuously across DORA Tier-1 + journey stages + review latency/load + env spin-up",
    "CZ*",
    "D14–D70",
    "Window closes Sep 27 with 8 full weeks",
    "2W",
    "gate-4",
  ),
  task(
    "epic-e3",
    "E3.2",
    'Weekly data-quality audit: gaps marked "Not recorded in source," anomaly candidates logged (not yet excluded), source drift checked',
    "TL",
    "weekly",
    "Zero silent gaps at M3/M4",
    "2W",
  ),
  task(
    "epic-e3",
    "E3.3",
    "Flaky-test & re-run instrumentation: rerun counts, flake rate per suite, CPU/cost of re-runs (ties to Cluster 04 FinOps lens) — Petr's compounding-frustration loop, quantified",
    "PL*",
    "D14–D45",
    "Flake/re-run metrics in the landing zone",
    "1W",
  ),
  task(
    "epic-e3",
    "E3.4",
    "Rancher/env spin-up measurement: time-to-ready-env, setup success rate, manual steps — current DevBox/Rancher path from the SDLC map",
    "PL*",
    "D14–D45",
    "Distribution per team available",
    "1W",
  ),
  task(
    "epic-e3",
    "E3.5",
    "Mid-window checkpoint pack (M3): early distributions (unofficial, no targets), data-quality status, constraint shortlist",
    "CZ",
    "D43–D45",
    "Presented at Day-45 review",
    "1W",
  ),
  task(
    "epic-e3",
    "E3.6",
    "Close window; freeze dataset; complete exclusions log with written justification per item (FinOps method)",
    "CZ*",
    "D70–D72",
    "M4 exit",
  ),

  // E4 — Baseline: Perceptual
  task(
    "epic-e4",
    "E4.1",
    "Close DEC-1: merge Bill's Q0 into the pulse; lock final instrument; finalize Q13 tool list from E2.3",
    "BS+CZ",
    "D0–D10",
    "Instrument v1.1 locked",
    "2W",
    "gate-3",
  ),
  task(
    "epic-e4",
    "E4.2",
    'Field Pulse #1 (week of Aug 3) with comms: purpose, anonymity floor, team-level-only pledge, "you are the customer" framing',
    "BS*",
    "D14–D21",
    "Response rate reported; floor verified",
    "2W",
    "gate-2",
  ),
  task(
    "epic-e4",
    "E4.3",
    "Run the monthly Q0 heartbeat (Sep) between pulses",
    "BS*",
    "D45–D50",
    "Sent + tracked",
    "2W",
  ),
  task(
    "epic-e4",
    "E4.4",
    "Field Pulse #2 (week of Sep 21)",
    "BS*",
    "D63–D70",
    "≥80% of Pulse-#1 responses",
    "2W",
  ),
  task(
    "epic-e4",
    "E4.5",
    "Draft + apply the open-text coding scheme for Q14/Q15; code both pulse runs into friction themes mapped to journey stages",
    "CZ*",
    "D21–D75",
    "Themes table feeding the readout",
    "3W",
  ),
  task(
    "epic-e4",
    "E4.6",
    '"You said, we did" report-back to all FTDS devs after Pulse #1 (what we heard, what the quick-win wave targets)',
    "CZ+BS",
    "D35–D45",
    "Sent before the Sep heartbeat",
    "3W",
  ),

  // E5 — Flow Map & Constraint Localization
  task(
    "epic-e5",
    "E5.1",
    "Validate the SDLC infographic against telemetry — do measured stage times match the drawn flow? Update the map; it becomes the living value-stream map",
    "CZ",
    "D21–D45",
    "Map v2 with measured wait/process time per stage",
    "1W",
  ),
  task(
    "epic-e5",
    "E5.2",
    "Constraint ranking: rank journey stages by (median time × spread × pulse-friction score); publish the top-3 constraints",
    "Team",
    "D40–D50",
    "Ranked list at M3",
    "1W",
  ),
  task(
    "epic-e5",
    "E5.3",
    "Ingest Dan's architecture assessment + XServices survey results (DEC-3) as corroborating evidence; map their friction items onto stages",
    "CZ*",
    "D14–D40",
    "Cross-walk table in knowledge base",
    "1W",
  ),
  task(
    "epic-e5",
    "E5.4",
    "WIP & batch visibility: stuck-PR count, PRs open >N days, review-load distribution — make queues visible on the progress app",
    "PLe*",
    "D21–D50",
    "Feeding the app weekly",
    "1W",
  ),

  // E6 — First Improvement Wave
  task(
    "epic-e6",
    "E6.1",
    "Flaky-test quarantine + dedup of overlapping on-demand subsets (Cluster 04): hypothesis — cuts re-runs ≥X% and CI wait time, saves $ (FinOps co-win)",
    "PL*+BS",
    "D30–D70",
    "Pre/post re-run rate measured",
    "1W",
  ),
  task(
    "epic-e6",
    "E6.2",
    "STEX→GitHub Actions cutover coordination (Bill's thread): sequence so cutover is an experiment tag in the baseline, not a confound (DEC-2)",
    "BS",
    "D14–D70",
    "Cutover dates logged as tags; pre/post separable",
    "1W",
  ),
  task(
    "epic-e6",
    "E6.3",
    "Rancher spin-up attack: pick the highest-leverage fix (image caching / pre-provisioned envs / tool alternative per Bill) after E3.4 localizes the pain; time-boxed spike first",
    "PL*",
    "D45–D85",
    'Spin-up median improvement measured, or spike concludes "replace" with evidence',
    "1W",
  ),
  task(
    "epic-e6",
    "E6.4",
    "Review-latency SLO pilot on 2 volunteer teams (e.g., reviewer-rotation or auto-assignment) — team-level, opt-in, no individual metrics",
    "PLe*",
    "D45–D80",
    "PR cycle time pre/post on pilot teams",
    "1W",
  ),
  task(
    "epic-e6",
    "E6.5",
    "Maintenance-window / zero-risk-policy review (Petr's item): document current windows' dev-hour cost; propose one concrete change to stakeholders",
    "PL",
    "D50–D80",
    "Proposal in Day-90 readout",
    "1W",
  ),
  task(
    "epic-e6",
    "E6.6",
    "Guard: every experiment gets an experiment card (hypothesis, metric, stage, start/end tag) in the progress app before it ships",
    "CZ",
    "ongoing",
    "No untagged changes in the window",
    "3W",
  ),

  // E7 — Agentic-AI Leverage
  task(
    "epic-e7",
    "E7.1",
    "Fold in the AI-in-DevOps session output (Bill/Ravi/Rahul) as a knowledge-base doc; extract committed threads",
    "CZ",
    "D0–D10",
    "Doc in KB; threads in backlog or explicitly parked",
    "3W",
  ),
  task(
    "epic-e7",
    "E7.2",
    "Baseline AI leverage: adoption (Q11–Q13) + whatever telemetry E2.3 surfaced; report as a leading indicator, distributions only",
    "CZ*+Ravi",
    "D14–D72",
    "AI-leverage cut in the baseline report",
    "2W",
  ),
  task(
    "epic-e7",
    "E7.3",
    "One AI-assisted quick-win experiment (candidate: AI triage of flaky-test failures, or AI-drafted PR descriptions to cut review rounds) — pick post-E5.2",
    "Ravi*",
    "D50–D85",
    "Experiment card + measured result",
    "3W",
  ),
  task(
    "epic-e7",
    "E7.4",
    "Position paper (1 pg): how DevEx baseline becomes the measurement substrate for Agentic Engineering OS — Rahul's closing point, made operational",
    "CZ",
    "D60–D85",
    "In the Day-90 readout appendix",
    "3W",
  ),

  // E8 — Learning Loop
  task(
    "epic-e8",
    "E8.1",
    'Prior-effort retros: 3 short interviews/docs — why Ladder/Tag-Editor/XServices, shift-left, and the Platform-Engineering FY goals "moved the needle somewhat" but didn\'t hold. Extract failure patterns (no baseline? no ownership? no revalidation?)',
    "CZ*",
    "D10–D40",
    "Patterns doc; each pattern mapped to a guardrail in this plan",
    "3W",
  ),
  task(
    "epic-e8",
    "E8.2",
    'Define the revalidation loop: after Day 90, every landed initiative re-measures its stage vs. baseline on a set cadence — the "360 view, revalidate" mechanism',
    "CZ",
    "D60–D80",
    "Written into Q+1 plan",
    "3W",
  ),
  task(
    "epic-e8",
    "E8.3",
    "Blameless norms: one-pager on how metrics will/won't be used (team-level only, no individual eval, activity = context only) — published to all devs with Pulse #1 comms",
    "CZ+BS",
    "D10–D18",
    "Published; linked in every survey",
    "3W",
  ),
  task(
    "epic-e8",
    "E8.4",
    "Day-90 initiative retro (team, 1 hr): what the Three-Ways frame got right/wrong; feed Q+1",
    "Team",
    "D85–D90",
    "Retro notes in KB",
    "3W",
  ),

  // E9 — Comms & Stakeholder Rhythm
  task(
    "epic-e9",
    "E9.1",
    "Status template: numbered format mirroring Rahul, DX Core 4 roll-up, gates status, risks — reusable",
    "CZ",
    "D5–D11",
    "Used for status #1",
    "2W",
  ),
  task(
    "epic-e9",
    "E9.2",
    "Biweekly stakeholder statuses (async) — 5 sends in the window",
    "CZ",
    "biweekly",
    "All 5 sent on time",
    "2W",
  ),
  task(
    "epic-e9",
    "E9.3",
    "Day-45 review (M3) and Day-81 bands review (M5) with stakeholder delegates",
    "CZ",
    "D45 / D81",
    "Held; decisions logged",
    "2W",
  ),
  task(
    "epic-e9",
    "E9.4",
    "Day-90 readout to Rahul: baseline + bands, improvement-wave results, Q+1 orchestration plan, app demo",
    "CZ",
    "D85–D88",
    "M6 exit",
    "2W",
  ),

  // E10 — Progress App
  task(
    "epic-e10",
    "E10.1",
    "Build MVP on labeled sample data: Roadmap & Milestones, Backlog board, Gates panel (PRD §6 MVP)",
    "CZ*",
    "D10–D25",
    "Used in status #1",
    "2W",
  ),
  task(
    "epic-e10",
    "E10.2",
    "Wire weekly manual data drops (telemetry summaries, milestone status) — no real-feed dependency",
    "TL",
    "D25–D40",
    "Updates in <30 min/wk",
    "2W",
  ),
  task(
    "epic-e10",
    "E10.3",
    "Add Experiment cards + North-star strip (Phase-2 screens) before M3",
    "CZ*",
    "D30–D45",
    "Live at Day-45 review",
    "2W",
  ),
  task(
    "epic-e10",
    "E10.4",
    "Readout mode (stakeholder view) polished for M5/M6",
    "CZ*",
    "D70–D85",
    "Used at Day-81 and Day-90 reviews",
    "2W",
  ),
];

export const planSeed: PlanSeed = {
  phases,
  milestones,
  epics,
  tasks,
  gates,
};
