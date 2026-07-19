# FTDS Developer Experience — 90-Day Execution Plan & Backlog

**Owner:** Carlos ("Charlie") Zapata · **Co-leads:** Bill Stoltenberg, Petr Louda, Patrick Leduc *(pending Tim's confirm)*
**Primary stakeholder:** Rahul Patel · **Committed stakeholders:** Tim, Wei, JD (or delegates)
**Window:** Mon **Jul 20 → Fri Oct 16, 2026** (Day 0 → Day 90)
**Companion docs:** `FTDS_DevEx_V1_Metrics_Scorecard.md` (metric truth) · `FTDS_DevEx_Baseline_Collection_Plan.md` (baseline playbook) · `FTDS_DevEx_Pulse_Survey.md` (instrument) · `FTDS_SDLC_Infographic.html` (current-state flow map)

---

## TL;DR

In 90 days we go from *"DevEx is bad, we all agree"* to: **commit closed, workflow instrumented, a defensible baseline published with investigate/escalate bands, one wave of friction fixes shipped against the worst measured bottlenecks, and a readout to Rahul that shows the needle and what moves it next.** The plan is organized on **Gene Kim's Three Ways** — Flow, Feedback, Continual Learning — with **DORA** as the hard-number spine, exactly as the V1 scorecard already defines. Three phases: **Commit & Instrument (Days 0–18) → Baseline & First Improvement Wave (Days 15–70) → Compute, Bands & Readout (Days 70–90).** The critical path is the four Phase-0 instrumentation gates; the calendar has **zero slack** on the 8-week baseline window, so Phase A slips eat the bands phase, not the window.

---

## 1. Operating frame — the Three Ways applied to FTDS

The Three Ways aren't a metaphor layer; they're the sort key for every backlog item below. Each task carries a `1W / 2W / 3W` tag.

| Way | Principle | What it means in FTDS, concretely |
|---|---|---|
| **First Way — Flow** | Optimize the whole system left-to-right, from dev laptop to main. Make work visible, shrink batch/wait, remove constraints. | The SDLC infographic *is* our value-stream map. The endpoint is **merge-to-main** (D4). Journey-stage decomposition localizes friction: env setup → code & debug → build/CI → review & merge → get-to-main. Known constraint candidates from the thread: **Rancher spin-up** (Petr: "not done in 3 minutes"), **flaky tests + re-runs** (burns people *and* CPU — Cluster 04's ~$24K/mo), **STEX-based validation** (Bill: replacement in flight), **tail-end validation friction** (Dan's architecture assessment: friction skews to test/merge/validation). |
| **Second Way — Feedback** | Fast, constant feedback from right to left. Amplify signals so problems are seen and fixed at the source. | The **paired system + perceptual model** (D7) is our feedback machinery: DORA/telemetry on one side, pulse survey on the other. Rahul's close on the thread — *"objective… cycle times… and subjective on dev experience perception"* — is literally this. Bill's monthly 1-question productivity survey gets **reconciled into one instrument** (see §4, decision DEC-1) so we don't burn response rate. CI feedback time itself is a scorecard metric — the feedback loop is also a *subject* of measurement. |
| **Third Way — Continual Learning** | Culture of experimentation, learning from failure, mastery through repetition. | We've invested "almost every year" and it hasn't held — so **prior-effort retros** (Ladder, Tag Editor, XServices, shift-left, GitHub/observability) are a first-class backlog item, not archaeology. Improvement work runs as **time-boxed experiments against the baseline** (hypothesis → change → re-measure), not as fire-and-forget projects. Report-back to developers ("you said, we did") closes the loop and protects survey trust. Agentic-AI leverage is tracked as a learning curve, not just adoption. |

**DORA's role:** Tier-1 of the scorecard (Deployment Frequency at merge-to-main, Lead Time, CFR, Recovery Time, Reliability) is the throughput/stability anchor the Three Ways improve *against*. Nothing in this plan invents new metrics — it executes the locked V1 scorecard.

---

## 2. Phase plan

### Phase A — Commit & Instrument · **Jul 20 – Aug 7** (Days 0–18)
Close disagree-and-commit, confirm the fellowship, answer the four instrumentation gates, reconcile the survey instruments, field Pulse #1, and open the baseline window on time.

### Phase B — Baseline & First Improvement Wave · **Aug 3 – Sep 27** (Days 15–70)
The 8-week collection window (Aug 3 → Sep 27) runs continuously. In parallel — because devs won't wait 8 weeks for relief, and Rahul explicitly wants initiatives orchestrated, not paused — we ship a **quick-win wave** against already-obvious constraints, each run as a tagged experiment so its effect is visible in the baseline data. Mid-window checkpoint at Day 45.

### Phase C — Compute, Bands & Readout · **Sep 28 – Oct 16** (Days 70–90)
Close the window, run Pulse #2 (fielded week of Sep 21), compute distributions (median + spread, per D5), propose investigate/escalate bands, review with committed stakeholders, and deliver the **Day-90 readout** to Rahul in his numbered format: baseline, bands, what the improvement wave moved, and the next-quarter plan.

**Calendar reality (flagged):** 13 weeks total. Phase 0 (≤2.5 wks) + 8-wk window + 1 wk compute + 1.5 wks bands/readout = 13. **Zero slack.** Mitigations: gates work starts Day 0 in parallel (not sequential); if a gate slips past Aug 7, we open the window anyway on the sources we *have* confirmed and mark the rest "Not recorded in source" per D11 — we do not compress the window below 8 weeks, and we do not fabricate.

---

## 3. Milestones

| # | Date (Day) | Milestone | Exit criteria |
|---|---|---|---|
| **M1** | Jul 31 (D11) | **Commit closed & fellowship confirmed** | Charlie's disagree-and-commit response delivered; roster locked (Bill, Carlos, Piotr, Patrick — Tim confirmed); charter + operating cadence agreed; D1–D11 ratified by the team |
| **M2** | Aug 7 (D18) | **Instrumented & window open** | All four gates answered (or explicitly waived w/ gap plan); telemetry pipelines pulling; survey instruments reconciled (DEC-1); Pulse #1 fielded; baseline window officially open Aug 3 |
| **M3** | Sep 3 (D45) | **Mid-window checkpoint** | Data quality audit passed (no gaps silently accumulating); ≥1 quick-win shipped with experiment tag; flow map validated against telemetry; stakeholder status #2 sent |
| **M4** | Sep 30 (D72) | **Window closed, Pulse #2 in** | 8 weeks of telemetry captured; Pulse #2 response count ≥ Pulse #1 × 0.8; exclusions log complete |
| **M5** | Oct 9 (D81) | **Baseline & bands reviewed** | Per-metric distributions published; investigate/escalate bands proposed; reviewed with Tim/Wei/JD delegates; anonymity floor verified on every perceptual cut |
| **M6** | Oct 16 (D88) | **Day-90 readout to Rahul** | DX Core 4 exec roll-up + north-star headline; improvement-wave results vs. baseline; Q+1 orchestration plan; progress app live for the review |

---

## 4. Decisions this plan forces (resolve in Phase A)

| ID | Decision needed | My recommendation | Why |
|---|---|---|---|
| **DEC-1** | Bill's monthly 1–5 productivity survey vs. the 15-item pulse — one instrument or two? | **One instrument.** Adopt Bill's 1–5 productivity item verbatim as **Q0** of the pulse; run the full pulse twice in-window (per plan), and run *only Q0 + one open-text* as a light monthly heartbeat in between. Bill's July send becomes the pilot. | Two overlapping surveys kill response rate (top risk in the collection plan). Bill's item is a clean north-star proxy; the pulse gives the diagnostic depth. Nobody's work is discarded. |
| **DEC-2** | STEX-replacement dependency: measure the old world, the new one, or both? | **Both, tagged.** Baseline captures current state; the GitHub-Actions/E2E cutover gets an experiment tag so pre/post is separable. Do **not** delay the baseline waiting for the new platform. | Tim's ask is "quantify how much we moved the needle" — that requires a before. |
| **DEC-3** | Do Dan's architecture-assessment scores and the XServices survey (Karl Staas) join the knowledge base as baseline inputs? | **Yes** — as qualitative/prior evidence, clearly labeled as pre-baseline sources. | They independently corroborate where friction sits (tail-end validation); free triangulation. |
| **DEC-4** | Anonymity floor + minimum merges (D10 assumptions ≈5 respondents / 20–30 merges) | Confirm against real cadence in E2; lock by M2. | Currently assumptions, not decisions. |

---

## 5. Full backlog

Notation: **ID · Task · Way · Owner · Window · Done-when.** Owners: **CZ**=Carlos, **BS**=Bill, **PL**=Petr, **PLe**=Patrick *(assumed — confirm)*, **TL**=team lead TBD. Owners marked * are assumptions.

### E1 — Governance & Commit *(Phase A)*

| ID | Task | Way | Owner | Window | Done when |
|---|---|---|---|---|---|
| E1.1 | Draft & send Charlie's **disagree-and-commit response** to Rahul — mirror his numbered format; strengthen the framing; include the two strongest counter-arguments (scope-creep into SRE pillar; measurement-before-relief risk) | 3W | CZ | D0–D5 | Sent; discussed in Rahul's follow-up |
| E1.2 | Confirm the **fellowship**: Bill, Carlos, Piotr, Patrick — chase Tim's confirm on Patrick; propose role split (see E1.4) | — | CZ | D0–D7 | Roster in charter |
| E1.3 | Write the **initiative charter** (1 page): mandate, north star, endpoint = merge-to-main, guardrails D6/D7, pillar boundaries (SRE, FinOps), decision log D1–D11 attached for ratification | 1W | CZ | D3–D9 | Team ratifies at kickoff |
| E1.4 | Assign **workstream leads**: Measurement (CZ*), Test/CI flow incl. STEX cutover (BS*), Infra/env + geo-latency (PL*), Review/merge flow (PLe*), AI leverage (CZ+Ravi*) | — | Team | D7–D11 | Names against every epic |
| E1.5 | Stand up **operating cadence**: weekly leads sync (30 min), biweekly stakeholder status (async, numbered format), Day-45 and Day-81 stakeholder reviews | 2W | CZ | D7–D11 | Invites out; template agreed (E9.1) |
| E1.6 | Kickoff session: ratify charter, walk the SDLC flow map, agree Phase-A assignments | — | Team | D9–D11 | M1 exit |

### E2 — Instrumentation Gates *(Phase A — critical path)*

| ID | Task | Way | Owner | Window | Done when |
|---|---|---|---|---|---|
| E2.1 | **Gate 1 — Source of truth** for lead time / deploy-freq: audit GitHub vs. CI vs. pipeline-analytics; pick one authoritative source per metric | 2W | CZ* | D0–D10 | Matrix col. "Source of truth" confirmed per metric |
| E2.2 | **Gate 2 — Pulse channel**: does an anonymous survey channel exist (Forms/Qualtrics/other)? Stand one up if not; verify anonymity mechanics + team-level attribution | 2W | BS* | D0–D10 | Test run completed end-to-end |
| E2.3 | **Gate 3 — AI telemetry**: inventory agentic tools actually in use (feeds survey Q13's placeholder list); identify which emit usable usage telemetry; connect what we can | 2W | Ravi*/CZ | D0–D14 | Q13 list final; telemetry feeds documented or marked unavailable |
| E2.4 | **Gate 4 — Window defensibility**: pull last-quarter merge counts per team; confirm 8 wks ≥ 20–30 merges/team; flag low-volume teams for extended windows (per plan §5) | 1W | CZ* | D0–D10 | D10 numbers confirmed or revised; DEC-4 closed |
| E2.5 | Build the **telemetry extraction jobs** (GitHub/CI event exports, provisioning logs, incident data) writing to one landing zone; document every field + exclusion rule per D11 | 2W | TL | D5–D18 | First week of clean data validated |
| E2.6 | **Stage-decomposition mapping**: define the timestamp events that delimit each journey stage (env-ready, first-commit, PR-open, gates-green, merge) against real pipeline events from the SDLC map | 1W | PL* | D5–D18 | Each stage computable from telemetry |

### E3 — Baseline: System Telemetry *(Phase B)*

| ID | Task | Way | Owner | Window | Done when |
|---|---|---|---|---|---|
| E3.1 | Open baseline window **Aug 3**; telemetry runs continuously across DORA Tier-1 + journey stages + review latency/load + env spin-up | 2W | CZ* | D14–D70 | Window closes Sep 27 with 8 full weeks |
| E3.2 | **Weekly data-quality audit**: gaps marked "Not recorded in source," anomaly candidates logged (not yet excluded), source drift checked | 2W | TL | weekly | Zero silent gaps at M3/M4 |
| E3.3 | **Flaky-test & re-run instrumentation**: rerun counts, flake rate per suite, CPU/cost of re-runs (ties to Cluster 04 FinOps lens) — Petr's compounding-frustration loop, quantified | 1W | PL* | D14–D45 | Flake/re-run metrics in the landing zone |
| E3.4 | **Rancher/env spin-up measurement**: time-to-ready-env, setup success rate, manual steps — current DevBox/Rancher path from the SDLC map | 1W | PL* | D14–D45 | Distribution per team available |
| E3.5 | Mid-window **checkpoint pack** (M3): early distributions (unofficial, no targets), data-quality status, constraint shortlist | 1W | CZ | D43–D45 | Presented at Day-45 review |
| E3.6 | Close window; freeze dataset; complete **exclusions log** with written justification per item (FinOps method) | — | CZ* | D70–D72 | M4 exit |

### E4 — Baseline: Perceptual *(Phases A–C)*

| ID | Task | Way | Owner | Window | Done when |
|---|---|---|---|---|---|
| E4.1 | Close **DEC-1**: merge Bill's Q0 into the pulse; lock final instrument; finalize Q13 tool list from E2.3 | 2W | BS+CZ | D0–D10 | Instrument v1.1 locked |
| E4.2 | Field **Pulse #1** (week of Aug 3) with comms: purpose, anonymity floor, team-level-only pledge, "you are the customer" framing | 2W | BS* | D14–D21 | Response rate reported; floor verified |
| E4.3 | Run the **monthly Q0 heartbeat** (Sep) between pulses | 2W | BS* | D45–D50 | Sent + tracked |
| E4.4 | Field **Pulse #2** (week of Sep 21) | 2W | BS* | D63–D70 | ≥80% of Pulse-#1 responses |
| E4.5 | Draft + apply the **open-text coding scheme** for Q14/Q15; code both pulse runs into friction themes mapped to journey stages | 3W | CZ* | D21–D75 | Themes table feeding the readout |
| E4.6 | **"You said, we did"** report-back to all FTDS devs after Pulse #1 (what we heard, what the quick-win wave targets) | 3W | CZ+BS | D35–D45 | Sent before the Sep heartbeat |

### E5 — Flow Map & Constraint Localization *(First Way core, Phase B)*

| ID | Task | Way | Owner | Window | Done when |
|---|---|---|---|---|---|
| E5.1 | Validate the **SDLC infographic against telemetry** — do measured stage times match the drawn flow? Update the map; it becomes the living value-stream map | 1W | CZ | D21–D45 | Map v2 with measured wait/process time per stage |
| E5.2 | **Constraint ranking**: rank journey stages by (median time × spread × pulse-friction score); publish the top-3 constraints | 1W | Team | D40–D50 | Ranked list at M3 |
| E5.3 | Ingest **Dan's architecture assessment + XServices survey results** (DEC-3) as corroborating evidence; map their friction items onto stages | 1W | CZ* | D14–D40 | Cross-walk table in knowledge base |
| E5.4 | **WIP & batch visibility**: stuck-PR count, PRs open >N days, review-load distribution — make queues visible on the progress app | 1W | PLe* | D21–D50 | Feeding the app weekly |

### E6 — First Improvement Wave: Quick Wins *(Phases B–C — every item runs as a tagged experiment: hypothesis → change → re-measure)*

| ID | Task | Way | Owner | Window | Done when |
|---|---|---|---|---|---|
| E6.1 | **Flaky-test quarantine + dedup of overlapping on-demand subsets** (Cluster 04): hypothesis — cuts re-runs ≥X% and CI wait time, saves $ (FinOps co-win) | 1W | PL*+BS | D30–D70 | Pre/post re-run rate measured |
| E6.2 | **STEX→GitHub Actions cutover coordination** (Bill's thread): sequence so cutover is an experiment tag in the baseline, not a confound (DEC-2) | 1W | BS | D14–D70 | Cutover dates logged as tags; pre/post separable |
| E6.3 | **Rancher spin-up attack**: pick the highest-leverage fix (image caching / pre-provisioned envs / tool alternative per Bill) after E3.4 localizes the pain; time-boxed spike first | 1W | PL* | D45–D85 | Spin-up median improvement measured, or spike concludes "replace" with evidence |
| E6.4 | **Review-latency SLO pilot** on 2 volunteer teams (e.g., reviewer-rotation or auto-assignment) — team-level, opt-in, no individual metrics | 1W | PLe* | D45–D80 | PR cycle time pre/post on pilot teams |
| E6.5 | **Maintenance-window / zero-risk-policy review** (Petr's item): document current windows' dev-hour cost; propose one concrete change to stakeholders | 1W | PL | D50–D80 | Proposal in Day-90 readout |
| E6.6 | Guard: every experiment gets an **experiment card** (hypothesis, metric, stage, start/end tag) in the progress app before it ships | 3W | CZ | ongoing | No untagged changes in the window |

### E7 — Agentic-AI Leverage *(Phases A–C; ties to Rahul's "Agentic Engineering OS")*

| ID | Task | Way | Owner | Window | Done when |
|---|---|---|---|---|---|
| E7.1 | Fold in the **AI-in-DevOps session output** (Bill/Ravi/Rahul) as a knowledge-base doc; extract committed threads | 3W | CZ | D0–D10 | Doc in KB; threads in backlog or explicitly parked |
| E7.2 | Baseline **AI leverage**: adoption (Q11–Q13) + whatever telemetry E2.3 surfaced; report as a leading indicator, distributions only | 2W | CZ*+Ravi | D14–D72 | AI-leverage cut in the baseline report |
| E7.3 | One **AI-assisted quick-win experiment** (candidate: AI triage of flaky-test failures, or AI-drafted PR descriptions to cut review rounds) — pick post-E5.2 | 3W | Ravi* | D50–D85 | Experiment card + measured result |
| E7.4 | Position paper (1 pg): how DevEx baseline becomes the **measurement substrate for Agentic Engineering OS** — Rahul's closing point, made operational | 3W | CZ | D60–D85 | In the Day-90 readout appendix |

### E8 — Learning Loop *(Third Way, Phases A–C)*

| ID | Task | Way | Owner | Window | Done when |
|---|---|---|---|---|---|
| E8.1 | **Prior-effort retros**: 3 short interviews/docs — why Ladder/Tag-Editor/XServices, shift-left, and the Platform-Engineering FY goals "moved the needle somewhat" but didn't hold. Extract failure patterns (no baseline? no ownership? no revalidation?) | 3W | CZ* | D10–D40 | Patterns doc; each pattern mapped to a guardrail in this plan |
| E8.2 | Define the **revalidation loop**: after Day 90, every landed initiative re-measures its stage vs. baseline on a set cadence — the "360 view, revalidate" mechanism | 3W | CZ | D60–D80 | Written into Q+1 plan |
| E8.3 | **Blameless norms**: one-pager on how metrics will/won't be used (team-level only, no individual eval, activity = context only) — published to all devs with Pulse #1 comms | 3W | CZ+BS | D10–D18 | Published; linked in every survey |
| E8.4 | Day-90 **initiative retro** (team, 1 hr): what the Three-Ways frame got right/wrong; feed Q+1 | 3W | Team | D85–D90 | Retro notes in KB |

### E9 — Comms & Stakeholder Rhythm *(all phases)*

| ID | Task | Way | Owner | Window | Done when |
|---|---|---|---|---|---|
| E9.1 | **Status template**: numbered format mirroring Rahul, DX Core 4 roll-up, gates status, risks — reusable | 2W | CZ | D5–D11 | Used for status #1 |
| E9.2 | Biweekly **stakeholder statuses** (async) — 5 sends in the window | 2W | CZ | biweekly | All 5 sent on time |
| E9.3 | **Day-45 review** (M3) and **Day-81 bands review** (M5) with stakeholder delegates | 2W | CZ | D45 / D81 | Held; decisions logged |
| E9.4 | **Day-90 readout** to Rahul: baseline + bands, improvement-wave results, Q+1 orchestration plan, app demo | 2W | CZ | D85–D88 | M6 exit |

### E10 — Progress App *(per the companion PRD)*

| ID | Task | Way | Owner | Window | Done when |
|---|---|---|---|---|---|
| E10.1 | Build **MVP** on labeled sample data: Roadmap & Milestones, Backlog board, Gates panel (PRD §6 MVP) | 2W | CZ* | D10–D25 | Used in status #1 |
| E10.2 | Wire **weekly manual data drops** (telemetry summaries, milestone status) — no real-feed dependency | 2W | TL | D25–D40 | Updates in <30 min/wk |
| E10.3 | Add **Experiment cards + North-star strip** (Phase-2 screens) before M3 | 2W | CZ* | D30–D45 | Live at Day-45 review |
| E10.4 | **Readout mode** (stakeholder view) polished for M5/M6 | 2W | CZ* | D70–D85 | Used at Day-81 and Day-90 reviews |

---

## 6. Risks (top 5, beyond the collection plan's)

| Risk | Likelihood | Mitigation |
|---|---|---|
| Phase-0 gate slips compress Phase C (zero-slack calendar) | Med-High | Gates run in parallel from Day 0; window opens Aug 3 regardless, missing sources marked per D11; bands review can slip to D85 without moving M6 |
| Dual-survey fatigue (Bill's monthly + pulse) | High if DEC-1 unresolved | Close DEC-1 by D10; one instrument, one comms stream |
| STEX cutover mid-window contaminates the baseline | Med | DEC-2: experiment tags; pre/post cuts computed separately |
| Quick wins read as "we already fixed it" and deflate urgency for structural work (Dan's tail-end architecture friction) | Med | Readout explicitly separates quick-win gains from the structural backlog (event-driven/service-isolation thread → Q+1) |
| Metrics perceived as surveillance despite guardrails | Med | E8.3 norms doc + anonymity floor enforced in every artifact incl. the app; no individual cut exists anywhere |

---

## 7. What "significant progress" means on Oct 16

1. **Committed:** disagree-and-commit closed; a named, confirmed fellowship operating on a cadence.
2. **Measured:** a published, defensible baseline — distributions + spread across all three tiers, paired system/perceptual, exclusions logged — where today there is none.
3. **Banded:** investigate/escalate thresholds proposed and stakeholder-reviewed, ready to govern Q+1.
4. **Moved:** at least 2 quick-win experiments with measured pre/post deltas (re-runs/flake, and one of spin-up / review latency), plus the STEX cutover cleanly instrumented.
5. **Learning:** prior-effort failure patterns documented and structurally addressed; revalidation loop defined; developers heard back at least twice.
6. **Visible:** the progress app live and used in every stakeholder review.

**Assumptions flagged throughout:** owner assignments marked *, Patrick's participation, D10 numeric floors, Aug 3 window-open date, and the Q13 tool list — all confirm in Phase A.
