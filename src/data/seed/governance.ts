import type { Decision, Risk } from "@/types/governance";

/** Risks from EXECUTION_PLAN.md §6 + collection-plan cross-refs. */
export const risks: Risk[] = [
  {
    id: "risk-gate-slip",
    text: "Phase-0 gate slips compress Phase C (zero-slack calendar)",
    likelihood: "Med-High",
    owner: "CZ",
    mitigation:
      "Gates run in parallel from Day 0; window opens Aug 3 regardless, missing sources marked per D11; bands review can slip to D85 without moving M6",
    status: "open",
    reviewDate: "2026-08-07",
  },
  {
    id: "risk-survey-fatigue",
    text: "Dual-survey fatigue (Bill's monthly + pulse)",
    likelihood: "High if DEC-1 unresolved",
    owner: "BS",
    mitigation: "Close DEC-1 by D10; one instrument, one comms stream",
    status: "open",
    reviewDate: "2026-07-30",
  },
  {
    id: "risk-stex-confound",
    text: "STEX cutover mid-window contaminates the baseline",
    likelihood: "Med",
    owner: "BS",
    mitigation: "DEC-2: experiment tags; pre/post cuts computed separately",
    status: "monitoring",
    reviewDate: "2026-09-01",
  },
  {
    id: "risk-quick-win-deflate",
    text: 'Quick wins read as "we already fixed it" and deflate urgency for structural work (Dan\'s tail-end architecture friction)',
    likelihood: "Med",
    owner: "CZ",
    mitigation:
      "Readout explicitly separates quick-win gains from the structural backlog (event-driven/service-isolation thread → Q+1)",
    status: "monitoring",
    reviewDate: "2026-10-01",
  },
  {
    id: "risk-surveillance-perception",
    text: "Metrics perceived as surveillance despite guardrails",
    likelihood: "Med",
    owner: "CZ",
    mitigation:
      "E8.3 norms doc + anonymity floor enforced in every artifact incl. the app; no individual cut exists anywhere",
    status: "open",
    reviewDate: "2026-08-14",
  },
];

/** D1–D11 ratified (Handover §9.7) — locked closed. */
const ratifiedDecisions: Omit<Decision, "id">[] = [
  {
    code: "D1",
    text: "Metrics framework = DORA + SPACE + a Rahul-derived tier",
    status: "closed",
    rationale: "DORA for throughput/stability, SPACE for effort/experience, Rahul-derived for mandate metrics",
    locked: true,
  },
  {
    code: "D2",
    text: "North star = Value-vs-Overhead time split (% dev/debug vs env + pipelines)",
    status: "closed",
    rationale: "Rahul's literal ask; headline the scorecard ladders up to",
    locked: true,
  },
  {
    code: "D3",
    text: "Agentic-AI leverage is in V1, not staged",
    status: "closed",
    rationale: "Ties to agentic-AI maturity line and AI-in-DevOps thread",
    locked: true,
  },
  {
    code: "D4",
    text: "Endpoint = merge-to-main; prod-deploy tracked separately downstream",
    status: "closed",
    rationale: "Rahul's stated finish line; keeps from blurring into SRE pillar",
    locked: true,
  },
  {
    code: "D5",
    text: "Baseline before targets; distributions (median + spread), not point estimates",
    status: "closed",
    rationale: "Mirrors FinOps cost-band method; investigate/escalate bands derived later",
    locked: true,
  },
  {
    code: "D6",
    text: "Team/system level only — never individual evaluation",
    status: "closed",
    rationale: "Protects trust; DORA/SPACE both warn against individual eval",
    locked: true,
  },
  {
    code: "D7",
    text: "Every system metric paired with a perceptual one",
    status: "closed",
    rationale: "Guards against gaming; captures effort",
    locked: true,
  },
  {
    code: "D8",
    text: "Exec view collapses into DX Core 4 (Speed / Effectiveness / Quality / Business Impact)",
    status: "closed",
    rationale: "Keeps stakeholder read legible",
    locked: true,
  },
  {
    code: "D9",
    text: "Pulse survey ≈ 15 items, anonymous, ~3–4 min, 5-pt Likert + eNPS + 2 open-text; twice per baseline window",
    status: "closed",
    rationale: "Short enough to protect response rate across repeated runs",
    locked: true,
  },
  {
    code: "D10",
    text: "Baseline window ≈ 8 weeks / one PI; min ~20–30 merges to publish team baseline; anonymity floor ~5 respondents",
    status: "closed",
    rationale: "Enough data for stable distribution; protect anonymity — confirm against real cadence",
    locked: true,
  },
  {
    code: "D11",
    text: 'Data integrity: verbatim values, documented sources/exclusions, gaps marked "Not recorded," no fabrication',
    status: "closed",
    rationale: "Charlie's consistent analytical posture",
    locked: true,
  },
];

/** DEC-1…DEC-4 — open in Phase A (EXECUTION_PLAN.md §4). */
const phaseADecisions: Omit<Decision, "id">[] = [
  {
    code: "DEC-1",
    text: "Bill's monthly 1–5 productivity survey vs. the 15-item pulse — one instrument or two?",
    status: "open",
    rationale:
      "Recommend one instrument: Bill's Q0 in the pulse; full pulse twice in-window; light Q0+open-text monthly heartbeat between. Two surveys kill response rate.",
    locked: false,
  },
  {
    code: "DEC-2",
    text: "STEX-replacement dependency: measure the old world, the new one, or both?",
    status: "open",
    rationale:
      "Recommend both, tagged: baseline captures current state; GitHub-Actions/E2E cutover gets experiment tag. Do not delay baseline for new platform.",
    locked: false,
  },
  {
    code: "DEC-3",
    text: "Do Dan's architecture-assessment scores and the XServices survey join the knowledge base as baseline inputs?",
    status: "open",
    rationale:
      "Recommend yes — as qualitative/prior evidence, clearly labeled pre-baseline. Corroborates tail-end validation friction.",
    locked: false,
  },
  {
    code: "DEC-4",
    text: "Anonymity floor + minimum merges (D10 assumptions ≈5 respondents / 20–30 merges)",
    status: "open",
    rationale: "Confirm against real cadence in E2; lock by M2. Currently assumptions, not decisions.",
    locked: false,
  },
];

function withIds(items: Omit<Decision, "id">[]): Decision[] {
  return items.map((d) => ({
    ...d,
    id: d.code.toLowerCase().replace(".", "-"),
  }));
}

export const decisions: Decision[] = [
  ...withIds(phaseADecisions),
  ...withIds(ratifiedDecisions),
];

export const governanceSeed = { risks, decisions };
