# FTDS Developer Experience — Handover & App Brief

**Audience:** A receiving agent taking over the FTDS Developer Experience / Platform Engineering initiative, and/or building an app from its deliverables.
**Owner:** Carlos ("Charlie") Zapata — one of the 2–4 engineering leaders on the initiative.
**Status:** Foundational artifacts complete; instrumentation not yet started; initiative in its pre-commit (disagree-and-commit) window.

**How to use this doc:** Sections 1–8 give you everything to take over the *work*. Section 9 is a buildable spec for the *app*. Full detail for any metric or plan lives in the companion files listed in Section 6 — treat those as source of truth; treat this doc as the map.

---

## 1. The mandate

Rahul Patel (Charlie's leader, primary stakeholder) launched a sustained, high-priority initiative to fix developer experience in FTDS. The problem: environment setup, merge cycles, and debugging are all slower and more painful than they should be — across pipeline/infrastructure *and* the product codebase. Prior yearly investments (refactors, shift-left, GitHub, observability, test infra) each moved the needle but never enough. Weak DevEx is capping engineering velocity today and will become a hard ceiling as the org accelerates into agentic-AI development.

**The goal:** measurable improvement in developer experience, tracked by cycle time *and* effort across the full developer workflow — from spinning up a dev environment to getting code to main. Developers are the customers. Maximum time in development and debugging; minimum time fighting environments and pipelines.

**How it runs:** a small team of 2–4 engineering leaders owning it end-to-end — establish baseline, orchestrate initiatives with a 360 view, continuously revalidate against baseline. It absorbs both AI threads: AI improving internal DevOps productivity, and AI improving developer experience directly. Internal org constructs (Cheetah, Pegasus, etc.) must not get in the way of the outcome. It is one of three org pillars for the rest of the year: **DevEx (this effort), SRE / Release Engineering, FinOps** — all underpinned by agentic-AI maturity.

**Disagree-and-commit:** the framing is still open for honest pushback. Once aligned, the team marches — no revisiting unless data forces it.

---

## 2. Roles & stakeholders

| Role | Who | Notes |
|---|---|---|
| Primary stakeholder | Rahul Patel | Sets direction; comms mirror his numbered format |
| Committed stakeholders | Tim, Wei, JD (or delegates) | "Committed, not involved" |
| Leaders (own it end-to-end) | Charlie, Bill, +1–2 TBD | Roster not fully confirmed |
| Adjacent thread | Bill, Ravi, Rahul | The AI-in-DevOps session that folds in |

---

## 3. Decision log

| # | Decision | Rationale | Status |
|---|---|---|---|
| D1 | Metrics framework = **DORA + SPACE + a Rahul-derived tier** | DORA for throughput/stability, SPACE for the effort/experience side telemetry misses, Rahul-derived for what the mandate names directly | **Locked** |
| D2 | **North star = Value-vs-Overhead time split** (% time in dev/debug vs. fighting env + pipelines) | Rahul's literal ask; the headline the whole scorecard ladders up to | **Locked** |
| D3 | **Agentic-AI leverage is in V1**, not staged | Ties to the "underpinned by agentic-AI maturity" line and the AI-in-DevOps thread; leading indicator | **Locked** |
| D4 | **Endpoint = merge-to-main**; prod-deploy tracked separately downstream | Rahul's stated finish line; keeps it from blurring into the SRE pillar | **Locked** |
| D5 | **Baseline before targets**; distributions (median + spread), not point estimates | Mirrors the FinOps cost-band method; lets investigate/escalate bands be derived later | **Locked** |
| D6 | **Team/system level only — never individual evaluation** | Protects trust of the customers being served; DORA/SPACE both warn against it | **Locked (non-negotiable)** |
| D7 | **Every system metric paired with a perceptual one** | Guards against gaming; captures effort | **Locked** |
| D8 | Exec view collapses into **DX Core 4** (Speed / Effectiveness / Quality / Business Impact) | Keeps the stakeholder read legible | **Locked** |
| D9 | Pulse survey ≈ 15 items, anonymous, ~3–4 min, 5-pt Likert + eNPS + 2 open-text; twice per baseline window | Short enough to protect response rate across repeated runs | **Locked (content), assumptions on cadence** |
| D10 | Baseline window ≈ 8 weeks / one PI; min ~20–30 merges to publish a team baseline; anonymity floor ~5 respondents | Enough data for a stable distribution; protect anonymity | **Assumptions — confirm against real cadence** |
| D11 | Data integrity: verbatim values, documented sources/exclusions, gaps marked "Not recorded," no fabrication; one-offs excluded only with justification | Charlie's consistent analytical posture | **Locked** |

---

## 4. The metrics model (summary)

Full definitions in `FTDS_DevEx_V1_Metrics_Scorecard.md`. In brief:

- **DORA:** Deployment Frequency (at merge-to-main), Lead Time for Changes, Change Failure Rate, Failed-Deployment Recovery Time, Reliability.
- **SPACE:** Satisfaction/eNPS, Performance (change-fail/escaped defects), Activity (context only), Communication & collaboration (review latency/load, onboarding), Efficiency & flow (flow/wait/focus time).
- **Rahul-derived (V1):** Value-vs-Overhead split *(north star)*, Environment spin-up, End-to-end workflow cycle time (decomposed by journey stage), Agentic-AI leverage.
- **Journey stages:** env setup → **code & debug (protect/grow)** → build/CI → review & merge → get-to-main. Cycle time is decomposed across these so friction localizes to a stage.

---

## 5. Operating posture & guardrails (carry these forward)

1. Baseline before targets — no committed numbers until the baseline exists.
2. Team/system level only — never individual.
3. Distributions, not points — central tendency + spread.
4. Every system metric paired with a perceptual one.
5. Endpoint is merge-to-main; prod-deploy is downstream.
6. Data integrity over completeness — mark gaps, document exclusions, never fabricate.
7. Disagree-and-commit: pre-commit, stress-test the framing; post-commit, don't relitigate.

---

## 6. Deliverables inventory

| File | What it is | Role |
|---|---|---|
| `FTDS_DevEx_V1_Metrics_Scorecard.md` | Metric definitions across the three tiers + journey decomposition + exec roll-up | **Metrics source of truth** |
| `FTDS_DevEx_Baseline_Collection_Plan.md` | How data is gathered: sources, cadence, window, computation, timeline, integrity rules | Baseline playbook |
| `FTDS_DevEx_Pulse_Survey.md` | The developer-facing perceptual instrument (~15 items) | Survey instrument |
| `FTDS_DevEx_Project_Instructions.md` | Behavior/voice/guardrails for the Claude Project assistant | Assistant config |
| `FTDS_DevEx_Project_Setup_Guide.md` | How to stand up the Claude Project + knowledge manifest | Setup guide |

---

## 7. Open items & gates

**The four Phase-0 instrumentation questions gate everything downstream:**
1. Source of truth for lead time / deploy freq — GitHub, CI, or a combined pipeline-analytics layer?
2. Does a pulse-survey channel exist, or must one be stood up?
3. Which agentic-AI tools are in use, and which emit usable telemetry?
4. Shortest statistically defensible baseline window given real release cadence?

**Also open:** leader roster (+1–2 TBD); glossary of internal constructs (FTDS, Cheetah, Pegasus + others); prior-effort retros ("why it didn't move"); AI-in-DevOps session output; confirm the D10 numeric assumptions; Q13 AI-tool list in the survey is a placeholder.

**Immediate next natural task:** draft Charlie's disagree-and-commit response to Rahul (mirror his numbered format; strengthen the framing but supply the strongest counter-arguments).

---

## 8. Context the receiving agent still needs

If any of these aren't in the knowledge base yet, request them: leader roster & stakeholder map, internal-construct glossary, prior-effort history/retros, AI-in-DevOps notes, and any existing DORA / pipeline / GitHub dashboards plus Rahul's written tenets.

---

## 9. App specification (buildable)

### 9.1 Purpose
A **DevEx Scorecard & Baseline dashboard** that renders the entire measurement model in one place: the north-star time split up top, the DX Core 4 exec roll-up, the three metric tiers, the journey-stage decomposition, pulse results, and the instrumentation-gate status. It is the visual home of the initiative — the thing shown in stakeholder reviews and used by the leaders to revalidate against baseline.

### 9.2 Users
- **Leaders (Charlie, Bill, +):** full view, manage baseline windows, launch pulse runs.
- **Stakeholders (Rahul, Tim, Wei, JD):** read-only exec view.
- **No individual developer view of any kind** — see guardrails below.

### 9.3 Core screens
1. **Exec Roll-Up** — North-star gauge (dev/debug % vs. overhead %), four DX Core 4 cards (Speed / Effectiveness / Quality / Business Impact), overall RAG status. Landing screen.
2. **Scorecard** — the three tiers (DORA / SPACE / Rahul-derived). Each metric shows its baseline distribution, current reading, direction, and trend. Every system metric visually paired with its perceptual counterpart.
3. **Journey Map** — env setup → code & debug → build/CI → review & merge → get-to-main. Cycle time + friction per stage; **code & debug** highlighted as protect/grow.
4. **Pulse** — results by SPACE dimension, eNPS, and coded open-text themes; admin to launch a run and see response counts. Enforces the anonymity floor.
5. **Baseline & Bands** — distribution charts (median + spread) per metric/team, exclusions log, and proposed investigate/escalate bands (shown only once baseline status = established).
6. **Instrumentation Status** — the four Phase-0 gates with owner and status; blocks/greys downstream views that depend on an unanswered gate.

### 9.4 Data model (entities)
- `Team(id, name)`
- `Metric(id, name, tier[DORA|SPACE|Rahul], unit, direction, source, is_system|is_perceptual, paired_metric_id)`
- `MetricObservation(metric_id, team_id, timestamp, value)`
- `SurveyRun(id, window_id, date, respondent_count)`
- `PulseResponse(survey_run_id, team_id, question_id, value)` — **no user identity stored**
- `BaselineWindow(id, start, end, status[collecting|established])`
- `Baseline(metric_id, team_id, window_id, median, mean, spread, sample_n, exclusions[])`
- `Band(metric_id, team_id, investigate_threshold, escalate_threshold)` — derived, post-baseline
- `InstrumentationGate(id, question, status, owner, answer)`

### 9.5 Guardrails encoded in the UI (must-haves)
- **Smallest unit is a team.** No screen, filter, drill-down, or export exposes an individual. This is non-negotiable (D6).
- **Anonymity floor:** any perceptual cut with respondents below the floor renders as "Insufficient responses to protect anonymity," not data.
- **Baseline-first:** targets/bands are hidden or greyed until the relevant `BaselineWindow.status = established`. No target numbers appear on a collecting baseline (D5).
- **Distributions, not points:** metric detail shows median + spread, not a single number.
- **Pairing:** system and perceptual counterparts are displayed together, never a system metric alone.

### 9.6 Data strategy
No real telemetry exists yet — the four gates are unanswered. Build against a **clearly-labeled mock/sample dataset** that exercises every state (collecting vs established baselines, low-n anonymity blocks, one-off exclusions). Structure a clean data-access seam so real feeds (GitHub/CI, observability, provisioning, pulse) slot in later without UI rework. Label sample data visibly as sample.

### 9.7 Suggested build
- **React single-page app.** Charts via a distribution-friendly library (e.g., Recharts) for median/spread visuals; tables for comparisons.
- Keep state in memory (no browser storage if built as a Claude artifact).
- Structure: `data/` (mock + adapter interface), `views/` (the six screens), `components/` (gauge, DX-Core-4 card, distribution chart, paired-metric row, anonymity-guard wrapper).
- **MVP scope:** Exec Roll-Up + Scorecard + Instrumentation Status, on sample data, with guardrails enforced. **Phase 2:** Journey Map, Pulse, Baseline & Bands.

### 9.8 Definition of done (MVP)
Renders the north-star headline and DX Core 4 from sample data; shows all three tiers with paired metrics; enforces team-only + anonymity-floor + baseline-first in the UI; surfaces the four instrumentation gates; sample data clearly labeled; data seam ready for real feeds.

---

## 10. First actions for the receiving agent
1. Confirm which deliverable files you have; request any missing context from Section 8.
2. If continuing the *initiative*: pick up the disagree-and-commit response to Rahul, and drive the four Phase-0 gates to answers.
3. If building the *app*: scaffold the MVP (§9.7) on labeled sample data with guardrails (§9.5) enforced from the first commit.
