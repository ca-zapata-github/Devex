# FTDS Developer Experience — Baseline Collection Plan

**Purpose:** Stand up a defensible baseline across the full V1 scorecard — system telemetry + developer pulse — before any targets are set. This is the "establish baseline metrics" leg of the initiative and the input to the improvement bands we'll later report to Rahul.

**Governing posture:** Baseline before targets. Team-level, never individual. Distributions, not point estimates. Document every source and exclusion. No fabrication — gaps are marked, not guessed.

---

## 1. Principles

1. **Baseline first.** We measure before we target. Bands come *after* the baseline stabilizes.
2. **Team / system level only.** No individual cuts, ever. This protects the trust of the customers we're serving.
3. **Statistically defensible.** Each metric gets central tendency *and* spread, so investigate/escalate bands can be derived later — the same method as the FinOps cost-control bands.
4. **Two streams, paired.** Every system metric has a perceptual counterpart from the pulse. Neither is trusted alone.
5. **Integrity over completeness.** Verbatim system values; documented sources; confirmed one-off anomalies excluded only with written justification; missing data marked "Not recorded in source," never estimated to fill a gap.

---

## 2. The two data streams

| Stream | What it captures | How | Cadence |
|---|---|---|---|
| **System telemetry** | Throughput, stability, cycle time, flow, AI-tool usage | GitHub / CI / observability / provisioning exports | Continuous, sampled over the baseline window |
| **Developer pulse** | Satisfaction, friction, focus, perceived time-split, AI adoption | Anonymous survey (see Pulse Survey doc) | Twice in the baseline window (start + end), then per cadence |

---

## 3. Metric collection matrix

| Metric | Tier | Source of truth | Method | Owner *(assumption — confirm)* |
|---|---|---|---|---|
| Deployment Frequency (merge-to-main) | DORA | GitHub / CI | Event export | Metrics lead |
| Lead Time for Changes | DORA | GitHub / CI | Commit→main timestamps | Metrics lead |
| Change Failure Rate | DORA | CI / incident data | Remediation tagging | Metrics lead |
| Failed-Deployment Recovery Time | DORA | Incident / release | Incident timestamps | SRE liaison |
| Reliability | DORA | Observability stack | Availability vs. target | SRE liaison |
| Satisfaction / eNPS | SPACE-S | Pulse | Survey Q9–Q10 | Survey owner |
| Escaped defects | SPACE-P | Defect tracker | Post-merge defect linkage | Metrics lead |
| Review latency / load | SPACE-C | GitHub | PR review timestamps | Metrics lead |
| Onboarding time | SPACE-C | Provisioning + pulse | First-env→first-merge | Metrics lead |
| Flow / wait / focus time | SPACE-E | System + pulse | Q3, Q8 + telemetry | Metrics lead |
| Value-vs-Overhead split *(north star)* | Rahul | Pulse + system | Q1, Q2 + telemetry proxy | Metrics lead |
| Environment spin-up | Rahul | Provisioning + pulse | Time-to-ready, Q4 | Platform liaison |
| E2E workflow cycle time (by stage) | Rahul | GitHub / CI | Stage decomposition | Metrics lead |
| Agentic-AI leverage | Rahul | Tool telemetry + pulse | Q11–Q13 + usage logs | AI-in-DevOps liaison |

---

## 4. Pulse question → metric mapping

| Question | Feeds |
|---|---|
| Q1, Q2 | Value-vs-Overhead time split *(north star)* |
| Q3, Q8 | Efficiency & flow (SPACE-E) |
| Q4 | Environment spin-up |
| Q5 | Code & debug friction |
| Q6 | CI feedback quality |
| Q7 | Review & merge friction |
| Q9, Q10 | Satisfaction & eNPS (SPACE-S) |
| Q11, Q12, Q13 | Agentic-AI leverage |
| Q14, Q15 | Qualitative friction themes (open-text coding) |

---

## 5. Baseline window & sampling

- **Window:** minimum **8 weeks**, or one full PI — whichever yields enough events per team for a stable distribution.
- **Minimum event count:** a team's baseline is not published until it has enough merge/deploy events to be defensible *(proposed floor ≈ 20–30 merges; confirm against real cadence)*. Low-volume teams get an extended window rather than a thin baseline.
- **Pulse cadence in-window:** run the survey **twice** — early and late in the window — so the perceptual baseline carries a spread, not a single reading.
- **Anonymity floor:** no perceptual cut is reported below a minimum respondent count *(proposed ≈ 5)* to prevent re-identification.

---

## 6. Segmentation

- **Primary:** by team. Optionally by repo / service where it localizes friction.
- **Never:** by individual. No exceptions.
- All reporting respects the anonymity floor above.

---

## 7. Baseline computation

For each metric, compute over the window:
- **Central tendency** — median (primary; robust to outliers) and mean.
- **Spread** — IQR or ±1σ, to seed later investigate/escalate bands.
- **One-off handling** — confirmed anomalies excluded only with a documented reason, exactly as done in the FinOps work (e.g., a single infrastructure event that would distort the distribution). Everything excluded is logged.

Output per metric: a distribution and a documented baseline value — the anchor future bands are set from.

---

## 8. Phased timeline

| Phase | Window | Work |
|---|---|---|
| **0 — Confirm** | Week 0 | Nail sources of truth, stand up the pulse channel, locate AI-tool telemetry, lock the window. (Answers the four open instrumentation questions.) |
| **1 — Collect** | Weeks 1–8 | System telemetry runs continuously; Pulse #1 (start) and Pulse #2 (end). |
| **2 — Compute** | Week 9 | Build distributions, draft per-metric baseline report + DX Core 4 exec roll-up. |
| **3 — Bands** | Week 10+ | Propose investigate/escalate bands, review with committed stakeholders, lock, begin the revalidation loop. |

---

## 9. Deliverables

1. **Per-metric baseline report** — distribution, central tendency, spread, exclusions log.
2. **Exec roll-up** — the DX Core 4 view (Speed / Effectiveness / Quality / Business Impact) with the north-star time-split headline, formatted for Rahul.
3. **Proposed bands** — investigate/escalate thresholds seeded off the baseline.
4. **Revalidation cadence** — how baseline is re-checked as initiatives land (the 360 view).

---

## 10. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Survey fatigue kills response rate | Keep it ~3–4 min; report back what changed because of it |
| Metrics perceived as surveillance | Team-level only, stated up front, anonymity floor enforced |
| Metric gaming (e.g., activity padding) | Activity is context-only; every system metric paired with a perceptual one |
| Thin baselines for low-volume teams | Minimum event count + extended window before publishing |
| Source-of-truth ambiguity | Phase 0 confirms one authoritative source per metric before collection starts |

---

## 11. First tasks (the four open instrumentation questions)

1. Which system is the source of truth for lead time / deploy freq — GitHub, CI, or a combined pipeline-analytics layer?
2. Does a pulse-survey channel exist, or do we stand one up?
3. Which agentic-AI tools are in use, and which emit usable telemetry for the leverage metric?
4. What's the shortest statistically defensible baseline window given real release cadence?
