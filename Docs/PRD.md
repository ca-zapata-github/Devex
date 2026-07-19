# PRD — FTDS DevEx Initiative Progress App ("Command Center")

**Purpose of this doc:** Buildable product spec for the app that shows **progress against the 90-day execution plan** (`FTDS_DevEx_90Day_Execution_Plan.md`). It complements — does not replace — the DevEx Scorecard & Baseline dashboard specified in `FTDS_DevEx_Handover_and_App_Brief.md` §9. That app answers *"how is developer experience doing?"* This one answers *"how is the initiative doing against plan?"*
**Owner:** Carlos Zapata · **Version:** 1.0 · **Status:** Ready to build

---

## 1. Problem & goal

Rahul asked for follow-ups that "turn into trackers and status updates," Tim asked to "see how each initiative moves the needle (or not)," and the plan itself commits to a 360 view with continuous revalidation. Today that lives in email threads and heads. The app makes the plan, its backlog, its experiments, and its gates **visible in one place**, so every stakeholder review starts from the same picture and status updates take minutes, not hours.

**Success =** used in every biweekly status and all three stakeholder reviews (Day-45, Day-81, Day-90); weekly update effort <30 min; zero disputes about "what's the status of X" that the app can't settle.

## 2. Users & access

| User | Access | Primary jobs |
|---|---|---|
| **Leads** (Carlos, Bill, Petr, Patrick) | Full: edit tasks, milestones, experiments, gates | Update status, run the weekly sync from the board, prep reviews |
| **Stakeholders** (Rahul, Tim, Wei, JD / delegates) | Read-only "Readout mode" | Scan RAG, milestones, north-star strip, risks |
| **Developers** | Optional read-only public view (Phase 2) | See "you said, we did" — what's shipping because of their feedback |
| **Nobody** | — | No individual-level data exists anywhere in the app (guardrail G1) |

## 3. Screens

### 3.1 Roadmap & Milestones *(landing)*
- Horizontal 90-day timeline (Jul 20 → Oct 16) with the three phases (Commit & Instrument / Baseline & Improvement Wave / Compute, Bands & Readout) as swim-bands and **M1–M6 as diamonds**, each RAG-colored with exit-criteria checklist on click.
- "Today" line; days-remaining counter; overall initiative RAG derived (not hand-set): red if any past-due milestone or open critical risk, amber if any at-risk milestone, else green.
- Baseline-window bar (Aug 3–Sep 27) drawn as its own track so window integrity is always visible.

### 3.2 Backlog Board
- Epics E1–E10 as groups; tasks as cards with ID, owner, window, Way tag (`1W/2W/3W`), status (Not started / In progress / Blocked / Done), and done-when text.
- Views: **by epic** (default), **by phase**, **by Way** (shows Flow/Feedback/Learning balance), **by owner** (team-level workload only — this is capacity planning, not performance measurement; no completion-rate-per-person stats, ever).
- Blocked cards require a blocker note + who/what unblocks.

### 3.3 Gates Panel
- The four Phase-0 instrumentation gates as large status tiles: question, owner, status (Open / Answered / Waived-with-gap-plan), the answer once known.
- Any unanswered gate past Aug 7 turns the tile red and surfaces on the Roadmap as a risk. Downstream cards that depend on a gate show a chain-link badge.

### 3.4 Experiment Cards *(the Third-Way screen)*
- One card per E6/E7 experiment: hypothesis, target metric + journey stage, start/end tags, status, and — once measured — **pre/post distribution mini-chart** (median + spread, never a single point).
- Explicit "confound log" field (e.g., STEX cutover date) so the baseline team can separate effects.

### 3.5 North-Star Strip & DX Core 4 *(summary embed, not a duplicate scorecard)*
- Thin strip: Value-vs-Overhead split (latest pulse read), plus four small DX Core 4 tiles (Speed / Effectiveness / Quality / Business Impact) each showing baseline-status (Collecting / Established) and direction only.
- **Deep metric detail links out** to the Scorecard app (Handover §9) — this app deliberately shows the headline, not the full model. While `BaselineWindow.status = collecting`: no targets, no bands, no green/red judgment on metric values — status and direction only (guardrail G3).

### 3.6 Risks & Decisions
- Risk register (from plan §6 + emergent), each with owner, mitigation, review date.
- Decision log: D1–D11 (ratified) + DEC-1…DEC-4 and new ones — status Open/Closed, closed-by, date. Post-commit, closed decisions render with a lock icon: the UI itself enforces "don't relitigate."

### 3.7 Survey Module *(baseline + progress instruments)*
- Hosts the two initiative-owned survey forms specified in **Appendix A**: the **Baseline Pulse** (full 15-item instrument, fielded twice in the window per the Baseline Collection Plan) and the **Progress Pulse** (short recurring subset for tracking movement after the baseline is established).
- **Independent of Bill's monthly productivity survey** — that runs on its own channel and cadence; this module owns only the initiative's instruments. The survey-fatigue risk of running both is tracked in the risk register with a coordination mitigation (sequence sends ≥1 week apart; cross-reference in comms).
- Admin side (leads only): launch a run, set open/close dates, watch response counts per team **only as counts** (never identities), close a run.
- Respondent side: anonymous link, team selector, the form itself (spec in Appendix A), confirmation screen restating the anonymity pledge.
- Results side: aggregates by SPACE dimension and journey stage, eNPS, coded open-text themes — every cut behind the anonymity floor (G7).

### 3.8 Readout Mode
- One-click stakeholder view: numbered-format summary auto-assembled from live data — 1) Milestones & RAG, 2) North-star strip, 3) What moved (experiment results), 4) Gates & risks, 5) Asks. Print/export friendly. This *is* the biweekly status skeleton.

## 4. Data model

- `Phase(id, name, start, end)`
- `Milestone(id, name, date, status[on_track|at_risk|late|done], exit_criteria[], phase_id)`
- `Epic(id, code, name, description)`
- `Task(id, epic_id, code, title, way[1W|2W|3W], owner, owner_is_assumption:bool, start, end, status, done_when, blocker_note?, gate_dep?)`
- `Gate(id, question, owner, status[open|answered|waived], answer?, gap_plan?)`
- `Experiment(id, task_id, hypothesis, metric, stage, start_tag, end_tag, status, pre{median,spread,n}?, post{median,spread,n}?, confounds[])`
- `MetricSnapshot(metric_key, date, headline_value?, baseline_status[collecting|established], direction)` — headline feed only; full model lives in the Scorecard app
- `Risk(id, text, likelihood, impact, owner, mitigation, status)`
- `Decision(id, code, text, status[open|closed], closed_date?, rationale)`
- `StatusUpdate(id, date, generated_snapshot_json)` — frozen copies of Readout mode per send, so history is auditable
- `SurveyForm(id, type[baseline|progress], version, questions[])` — versioned so instrument changes never silently break trend comparability
- `Question(id, form_id, code, text, response_type[likert5_na|share_band|nps_0_10|multi_select|open_text], reverse_coded:bool, maps_to_metric)`
- `SurveyRun(id, form_id, window_id?, open_date, close_date, status, respondent_count_by_team{})` — counts only
- `SurveyResponse(id, run_id, team_id, answers{question_code: value})` — **no user identity, no timestamp precision below the day, no free-text metadata**; open-text answers stored detached from other answers in the same response where team n < 2× anonymity floor

**No entity contains an individual developer identifier.** Task `owner` refers to initiative leads only.

## 5. Guardrails (must-haves, mirrors D5/D6/D11)

- **G1 — Team/system only.** No screen, filter, or export shows individual developer data; no per-person productivity stats of any kind, including for leads' task throughput.
- **G2 — Distributions, not points.** Anywhere a metric value renders (experiment cards, snapshots): median + spread.
- **G3 — Baseline-first.** No targets or bands anywhere until baseline status = established; collecting-state renders greyed with "Baseline in progress."
- **G4 — Data integrity.** Missing values render "Not recorded" — never blank, never estimated. Every experiment result links its exclusion/confound notes.
- **G5 — Sample data labeled.** Until real drops land, a persistent "SAMPLE DATA" banner.
- **G6 — Locked decisions render locked.** Closed decisions are read-only in the UI; reopening requires an explicit "new data/facts" note (disagree-and-commit, enforced by design).
- **G7 — Anonymity floor on every perceptual cut.** Any survey aggregate with respondents below the floor (proposed ≈5, confirm at DEC-4) renders "Insufficient responses to protect anonymity" — not the data, not a partial chart.

## 6. Build plan

**Stack:** React SPA, single file if built as a Claude artifact (state in memory — no browser storage); Recharts for the timeline, mini-distributions, and RAG visuals; Tailwind core utilities. Clean data seam: `data/` module with a typed adapter interface so weekly manual JSON drops (Phase 1) can later be swapped for real feeds (GitHub/CI summaries, pulse aggregates) without UI rework.

**Seed content:** the app ships pre-loaded with the actual plan — phases, M1–M6, all E1–E10 tasks with owners/windows/Way tags, gates, DEC-1–4, risks — so it's useful on day one; only *statuses* start as defaults.

| Slice | Scope | Target |
|---|---|---|
| **MVP** | Roadmap & Milestones + Backlog Board + Gates Panel, seeded with the real plan, guardrails G1–G6 enforced | Day 25 (E10.1) — used in status #1 |
| **Phase 2** | Experiment Cards + North-Star Strip + Risks & Decisions + **Survey Module (Baseline Pulse form + results view)** | Day 45 (E10.3) — live at M3 review; form itself needed by Pulse #2 at latest (Pulse #1 can run on the Gate-2 channel if the module isn't ready) |
| **Phase 3** | Readout Mode polish + StatusUpdate snapshots + optional developer public view | Day 85 (E10.4) — used at M5/M6 |

## 7. Definition of done (MVP)

Renders the full seeded plan; milestone RAG derives from data; board filters by epic/phase/Way/owner; gates panel drives roadmap risk state; blocked tasks require notes; no individual-level data representable in the schema; sample-data banner active; weekly update path (edit statuses + drop JSON) takes <30 min; runs as a shareable artifact for stakeholder reviews.

## 8. Explicit non-goals

- Not the metrics dashboard (that's the Scorecard app, Handover §9) — this embeds only the headline strip.
- Not a Jira replacement — it tracks the ~50-task initiative backlog, not team sprint work.
- Not a performance tool — nothing here evaluates any developer or team's output; it evaluates *the plan's* progress.
- Not the host of Bill's monthly survey — that instrument stays on its own channel; this app only coordinates timing.

---

## Appendix A — Survey form specifications

Both forms are initiative-owned instruments, run through the Survey Module (§3.7), **independent of Bill's monthly productivity survey.** Content is sourced verbatim from `FTDS_DevEx_Pulse_Survey.md`; that file remains the content source of truth — this appendix specifies the *form implementation*.

### A.1 Form 1 — Baseline Pulse (full instrument)

**When:** twice inside the baseline window — Pulse #1 week of Aug 3, Pulse #2 week of Sep 21 — so the perceptual baseline carries a spread, not a single reading.
**Length target:** ~3–4 minutes. **Anonymous;** team-level attribution only.

**Form header (rendered to respondent):** the intro text from the Pulse Survey doc — anonymous, team-level only, never tied to individuals, "we're measuring the environment and the pipeline, not you."

**Structure & field spec:**

| # | Section | Question (code) | Response type | Notes |
|---|---|---|---|---|
| 0 | Attribution | Team selector | Single-select (team list) | Required; only demographic field allowed |
| 1 | Time & focus | Q1 — share of week in actual dev/debug vs. overhead | Band select: <25% / 25–50% / 50–75% / >75% | Feeds north star |
| 2 | Time & focus | Q2 — too much time fighting env/pipelines | Likert 1–5 + N/A | **Reverse-coded** |
| 3 | Time & focus | Q3 — enough uninterrupted focus time | Likert 1–5 + N/A | SPACE-E |
| 4 | Workflow stages | Q4 — env spin-up fast and painless | Likert 1–5 + N/A | Env spin-up metric |
| 5 | Workflow stages | Q5 — debugging tools help, not hinder | Likert 1–5 + N/A | Code & debug stage |
| 6 | Workflow stages | Q6 — CI feedback fast and reliable | Likert 1–5 + N/A | Build/CI stage |
| 7 | Workflow stages | Q7 — review & merge smooth and timely | Likert 1–5 + N/A | Review & merge stage |
| 8 | Workflow stages | Q8 — regularly blocked on builds/pipelines/reviews | Likert 1–5 + N/A | **Reverse-coded**; SPACE-E |
| 9 | Overall | Q9 — satisfied with FTDS DevEx overall | Likert 1–5 + N/A | SPACE-S |
| 10 | Overall | Q10 — recommend our env/tooling to another engineer | NPS 0–10 | Tooling eNPS |
| 11 | AI leverage | Q11 — AI tools meaningfully speed up my work today | Likert 1–5 + N/A | AI-leverage tier |
| 12 | AI leverage | Q12 — I know how to apply AI tools to my workflow | Likert 1–5 + N/A | AI-leverage tier |
| 13 | AI leverage | Q13 — which AI tools do you use | Multi-select + Other + None | Options finalized by Gate 3 (E2.3) — placeholder until then |
| 14 | Open text | Q14 — the one thing that slows you down most | Free text, optional | Coded via E4.5 scheme |
| 15 | Open text | Q15 — the one fix you'd make to env/pipeline | Free text, optional | Coded via E4.5 scheme |

**Validation & behavior:** Q1–Q13 required (N/A is a valid answer where offered); Q14–Q15 optional; no back-navigation restrictions; single submission per link-session but **no device/IP fingerprinting** — we accept theoretical duplicate risk over anonymity risk. Reverse-coded items (Q2, Q8) are inverted at aggregation, never in display. Closing screen shows the thank-you line and the "we report what we hear and what we're changing" pledge.

**Scoring/aggregation:** Likert items aggregate as distributions (median + spread) per team and per SPACE dimension/journey stage per the collection plan §4 mapping; Q10 computes standard eNPS (%9–10 minus %0–6); Q1 bands report as a distribution across bands. All cuts obey G7.

### A.2 Form 2 — Progress Pulse (recurring subset)

**Purpose:** lightweight recurring read to track *movement* once the baseline exists — the perceptual side of the revalidation loop (E8.2). Not run inside the baseline window (the two full pulses cover it); starts post-Day-90 on a monthly or per-milestone cadence.
**Length target:** ≤90 seconds.

| # | Question | Response type | Why it's in the subset |
|---|---|---|---|
| 0 | Team selector | Single-select | Attribution |
| 1 | Q1 (dev/debug share of week) | Band select | North-star trend — the headline |
| 2 | Q2 (fighting env/pipelines) | Likert 1–5 + N/A | North-star pair, reverse-coded |
| 3 | Q9 (overall satisfaction) | Likert 1–5 + N/A | SPACE-S trend |
| 4 | Q10 (eNPS) | NPS 0–10 | Comparable headline over time |
| 5 | Rotating stage item — one of Q4/Q6/Q7, chosen to match whatever experiment/initiative landed since the last run | Likert 1–5 + N/A | Ties perception directly to the change being revalidated |
| 6 | Q14 (one thing slowing you down) | Free text, optional | Keeps the qualitative channel open |

**Comparability rule:** Progress Pulse items are verbatim identical to their Baseline Pulse counterparts (same wording, same scale) — `SurveyForm.version` guards this; any wording change forks a new version and breaks-with-notice the trend line rather than silently distorting it.

### A.3 Relationship to Bill's monthly survey

Bill's 1–5 productivity rating + open comment runs independently on its own channel. The two coexist under one coordination rule: sends are sequenced at least a week apart, each references the other in comms ("this is separate from…"), and the survey-fatigue risk stays on the register. If response rates degrade, consolidation gets re-proposed to the team as a new decision — with data.
