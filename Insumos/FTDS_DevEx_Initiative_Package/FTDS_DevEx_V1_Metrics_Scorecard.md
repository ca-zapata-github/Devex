# FTDS Developer Experience — V1 Metrics Scorecard

**Purpose:** Define the baseline measurement spine for the FTDS Developer Experience / Platform Engineering initiative. Developers are the customers; the workflow is the product. This scorecard instruments the full developer journey — from spinning up an environment to getting code to main — and gives Rahul a hard-number baseline plus a defensible perceptual layer.

**Posture:** Baseline first. We measure before we target. Improvement bands are set *after* the baseline stabilizes, the same statistically-grounded approach used in the FinOps cost-control work — not pre-committed numbers.

---

## North Star

**Value-vs-Overhead Time Split** — the single headline number the whole scorecard ladders up to.

> % of engineering time spent in **development + debugging** vs. time spent **fighting environments and pipelines.**

This is Rahul's literal ask: *maximum time in dev/debug, minimum time fighting env and pipelines.* Every tier below either moves this ratio or explains why it isn't moving.

---

## Measurement Principles (guardrails)

1. **Team / system level only — never individual performance evaluation.** DORA and SPACE both warn against this. If developers perceive surveillance, we lose the trust of the exact customers we're serving. Non-negotiable.
2. **Every system metric is paired with a perceptual one.** Guards against gaming and captures the "effort" side that telemetry misses.
3. **Endpoint = merge-to-main.** That is Rahul's stated finish line. Production deploy is tracked separately, downstream, so it doesn't blur into the SRE / Release Engineering pillar.
4. **Track shared metrics once, report to both pillars.** Reliability and recovery-time overlap the SRE pillar — measure once, surface in both places for the 360 view.
5. **Activity metrics are context only.** Never read in isolation, never a target.

---

## Tier 1 — DORA (throughput + stability anchor)

The hard-number spine. Four core + reliability.

| Metric | Definition | Direction | Source | FTDS note |
|---|---|---|---|---|
| Deployment Frequency | How often changes reach the finish line | ↑ | GitHub / CI | Anchored at **merge-to-main**; prod-deploy tracked as a separate downstream cut |
| Lead Time for Changes | First commit → change on main | ↓ | GitHub / CI | Core cycle-time number; **decomposed by journey stage** (see below) to localize friction |
| Change Failure Rate | % of changes requiring remediation | ↓ | CI / incident data | Shared with SPACE-Performance |
| Failed-Deployment Recovery Time | Time to restore service after a bad change | ↓ | Incident / release data | Bridges to the SRE / Release-Eng pillar |
| Reliability | Meeting reliability / availability targets | Meet target | Observability stack | Overlaps SRE pillar — track once, report to both |

---

## Tier 2 — SPACE (effort + experience layer)

Captures what telemetry alone cannot: satisfaction, flow, and the *effort* side of the workflow.

| Dimension | Metric | Instrument | Level |
|---|---|---|---|
| **S** — Satisfaction & wellbeing | Developer satisfaction / tooling eNPS | Pulse survey | Team |
| **P** — Performance | Change-failure rate, escaped defects | System | Team / system |
| **A** — Activity | PRs, builds, deploys *(context only)* | System | Team |
| **C** — Communication & collaboration | Review latency, review-load distribution, onboarding time | System + survey | Team |
| **E** — Efficiency & flow | Flow time, wait time, % uninterrupted focus, context-switch count | System + pulse | Team |

---

## Tier 3 — Rahul-Derived (in V1)

What the email asks for that DORA and SPACE don't name directly. **All four are in the V1 scorecard**, including agentic-AI leverage.

| Metric | What it measures | Instrument | Why it's here |
|---|---|---|---|
| **Value-vs-Overhead Time Split** *(north star)* | % time in dev/debug vs. env + pipeline fighting | Pulse + system | His literal ask; the headline number |
| **Environment Spin-up** | Time-to-ready-env, setup success rate, # manual steps | CI / provisioning + pulse | The journey starts at "spinning up a dev environment" — upstream of standard DORA |
| **End-to-End Workflow Cycle Time** | Env-ready → code-on-main, decomposed by stage | GitHub / CI | Localizes friction; DORA lead time is a subset of this |
| **Agentic AI Leverage** | AI-tool adoption, AI-assisted share of changes, estimated time saved | Tool telemetry + pulse | The "underpinned by agentic-AI maturity" line + the AI-in-DevOps thread; a leading indicator of where velocity is heading |

---

## Journey-Stage Decomposition

DORA Lead Time is one number; the value comes from seeing *where* the time goes. Decompose the full workflow so friction is localized to a stage.

| Dev journey stage | Cycle-time metric | Effort / friction signal |
|---|---|---|
| Env setup / spin-up | Time-to-ready environment | Manual steps, setup failure rate, pulse friction |
| **Code & debug** *(protect / grow)* | Debug loop time | Share of week here vs. overhead |
| Build / CI feedback | PR check duration, flaky-test rate | Reruns, wait-blocked time |
| Review & merge | PR cycle time (open → merge), review latency | Rework rounds, stuck-PR count |
| Get to main | Lead time on the final leg | Manual gates, change-fail rate |

The two stages framed as *protect / grow* (code & debug) are where the north-star ratio wants time to accumulate. Every other stage is overhead to be compressed.

---

## Exec Roll-Up (DX Core 4 view for Rahul)

For the stakeholder read, the metrics above collapse into four categories so the executive view stays legible:

- **Speed** — Lead Time, Deployment Frequency, cycle time by stage
- **Effectiveness** — Environment spin-up, flow / focus time, agentic-AI leverage
- **Quality** — Change Failure Rate, escaped defects, reliability
- **Business Impact** — the Value-vs-Overhead north star, developer satisfaction / eNPS

---

## Baseline → Bands (how targets get set later)

1. **Instrument & collect** a baseline window across all tiers (system + first pulse).
2. **Establish defensible baselines** per metric — central tendency plus spread, not single points.
3. **Set improvement bands** off the baseline (investigate / escalate style), not arbitrary targets.
4. **Continuously revalidate** against baseline as initiatives land — the "360 view, re-validate" loop Rahul asked for.

No target numbers are committed until the baseline exists.

---

## Open Instrumentation Questions

- Which system(s) are the source of truth for lead time / deploy freq — GitHub, CI, or a combined pipeline-analytics layer?
- Is there an existing pulse-survey channel, or does the perceptual layer need to be stood up?
- What agentic-AI tools are in use today, and do any emit usage telemetry we can tap for the leverage metric?
- Baseline window length — what's the shortest period that's statistically defensible given release cadence?
