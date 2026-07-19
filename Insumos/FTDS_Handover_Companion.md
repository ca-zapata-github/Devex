# FTDS — Handover Companion

**Companion to:** `FTDS_SDLC_Infographic.html` ("How a change travels through FTDS")
**Purpose:** Give another analyst or agent enough working knowledge of FactoryTalk Design Studio (FTDS) to reason about its engineering flow *and* its cloud cost structure, and to fold that context into their own analysis without re-deriving it.
**Prepared by:** Carlos Zapata · FinOps · **As of:** Jun 2026 board cut

---

## 0. How to use this document

The infographic is the map of the *engineering* pipeline — a code change from a laptop to Production. This companion adds the two things a map can't hold: the **cost/ownership context** wrapped around that pipeline, and the **analytical caveats** that make FTDS data easy to misread. If you are doing cost, forecasting, or governance analysis, read §7–§11 before trusting any raw number.

A note on provenance: the SDLC flow and cluster roles come from an FTDS engineering working session and are cross-checked against the FinOps Board roll-out plan (Jun 2026). Some terms were captured phonetically in that session and are flagged below. Financial figures are from the Jun 2026 FinOps board cut and **shift by scenario and data cut** — always state which.

---

## 1. What FTDS is

FactoryTalk Design Studio is a cloud-native, **multi-tenant** platform running on **Azure Kubernetes Service (AKS)**. Customers ("tenants") are provisioned onto shared AKS **clusters**; a cluster currently holds up to ~40 tenants (an initiative is validating 50, with a hard ceiling of ~53 driven by the Azure 800-storage-account-per-subscription limit). The whole engineering fleet — dev, QA, and production — is the same kind of AKS infrastructure, which is why *engineering criticality* and *cloud cost* land on the same objects. That overlap is the single most important thing to understand about FTDS: **the clusters the pipeline depends on are the clusters the FinOps program is trying to optimize.**

---

## 2. The SDLC in brief (mirrors the infographic)

A change reaches Production only by clearing four phases in order. The only *mandatory, automatic* stops are the two gates in Phase 2; everything in Phase 1 and all "on-demand" testing is the developer's judgment.

1. **Local development (developer's machine).** Set up workspace (DevTools + Rancher Desktop on a DevBox or local box ≥ 32 GB RAM, provisioned by Python scripts from the `ran-disp` repo; ~1–2 days to ramp) → build the feature on a branch → optionally run the branch locally (Rancher Desktop) or in the cloud on the developer cluster (Cluster 10).
2. **Continuous integration (pull request).** Push opens a PR and fires the gates automatically. **Mandatory gates: BVTs (Cluster 02) + BITs (Cluster 07) must go green — no green, no merge.** Optional deeper E2E/STEX subsets and performance/load sims can run on the CI clusters (04, and ad-hoc 12/15) at the dev's or reviewer's discretion.
3. **Merge & system test (master).** Gates green + reviewer approval = Definition of Done; the change lands on master. The **nightly regression** ("nailis", Cluster 01) and **STEX On-Demand with physical-control suites** (Cluster 09) then exercise the merged build; chaos testing runs on Cluster 16.
4. **QA & release.** Testers run **manual** suites against the nightly build; sign-off gates promotion. The validated change ships to **Production (subscriptions 0413 / 0485)**.

---

## 3. The cluster map (Dev/QA, subscription 0301)

The five **load-bearing** clusters are **01, 02, 04, 07, 09**. Merge depends on 02 and 07; the nightly/system signal depends on 01 and 09; 04 is the cost hotspot.

| Cluster | Role | Criticality | If it goes down | Escalates to |
|---|---|---|---|---|
| **01** | STEX Nightly ("nailis") | Critical | No nightly build; testers blocked | Andrea (test) |
| **02** | BVTs & DIST | **Merge-blocking** | Nobody merges → program stalls | Tim Florenki (+ Rahul on program impact) |
| **04** | CI On-Demand | Critical (cost) | On-demand CI unavailable | — |
| **07** | CI BITs | **Merge-blocking** | Nobody merges → program stalls | Tim Florenki (+ Rahul) |
| **09** | STEX On-Demand (physical controls) | Critical | Critical / manual control tests stop | Andrea (test) |
| **10** | Rancher — Developer | Standard | Cloud debug / branch runs unavailable | — |
| **12** | CI Ad-hoc | Standard | Interchangeable with 15 | — |
| **14** | CI AOps | Standard | Automated-ops CI runs | — |
| **15** | CI Ad-hoc | Standard | Interchangeable with 12 | — |
| **16** | Chaos testing | Standard | Resilience / fault-injection suites | — |

---

## 4. Environments & Azure subscriptions

| Subscription | Environment | Prod? | Notes |
|---|---|---|---|
| **0413** | Production | Prod | Core production clusters |
| **0485** | Demo | Prod-adjacent | HoL / Automation Fair demos; treated as production, not a test env |
| **0301** | Dev / QA AKS | Non-prod | Primary focus of the cluster-band analysis |
| **0126** | SandBox | Non-prod | Includes SSEA (Asia), PreDev |
| **0133** | STEX Testing | Non-prod | Test execution |
| **0102** | DevBoxes | Non-prod | Microsoft Dev Box fleet (~350+) |
| **0055** | AI Foundry / AI PoC | Non-prod | Discretionary AI spend |
| **0633** | EaaS Dev | Non-prod | New FY26 subscription |

**Fiscal calendar:** FY runs **Oct → Sep**. FY26 = Oct 2025 → Sep 2026; FY25 = Oct 2024 → Sep 2025.

---

## 5. Testing vocabulary (why cost ≠ waste)

- **BVT** — Build Verification Test; mandatory gate (Cluster 02).
- **BIT** — Build Integration Test; mandatory gate (Cluster 07). *Note:* "BITs" is also used for a specific test workload that was migrated Jenkins → GitHub Actions — don't conflate the gate with the migration.
- **STEX** — system test execution suites; run as **Nightly** (01) and **On-Demand** (09).
- **E2E** — end-to-end suites; on-demand runs are *subsets* of these.
- **On-Demand** — dev-selected subset of E2E/STEX, not enforced.
- **Ad-hoc** — manual, tester-selected runs (12/15); some have physical-control access.
- **nailis / "naile"** — phonetic capture of the **nightly** regression run. Treat as "nightly."
- **ftecho / FTEcho** — Windows-based test/runtime instances; a major driver of AKS node consumption in non-prod.

---

## 6. Key people & ownership

| Person | Role in this context |
|---|---|
| **Rahul** | Program stakeholder; escalation point when merges stall (program impact) |
| **Tim Florenki** | Cluster owner; escalation for merge-blocking clusters (02 / 07) |
| **Andrea** | Test / Quality lead; owns nightly/STEX signal; confirmed testing spikes as normal end-of-PI behavior |
| **Juan Felipe Betancur** | Owns the AI-services forecast model (separate weighted-moving-average method); go-to for AI Services line validation |
| **Mark Fredette** | Cluster owner involved in cost-investigation comms |

---

## 7. FinOps program — the shape of the numbers

FTDS runs a FinOps program against a **20% cost-reduction stretch goal** for FY26 (~$1.5M). It is currently below target. The tension an analyst must hold is **gross vs. net**:

- **Gross savings** from initiatives are real and large (>$1.6M; some cuts put it near $2.0M).
- **Platform growth** (new infrastructure, new environments, AI-services utilization) adds roughly **$1.0–1.1M** of increments that *absorb* about half the gross savings.
- **Net** therefore lands well short of the stretch: roughly **−7% to −9% YoY** depending on scenario and cut, not −20%.

Headline figures, Jun 2026 board cut (round; scenario-dependent):

| Metric | Value |
|---|---|
| FY25 total cost | ~$7.6M |
| FY26 forecast (conservative baseline) | ~$6.9M (≈ −9.1% / −$690K YoY) |
| FY26 forecast (most-likely) | ~$6.9M (≈ −9.7% / −$740K YoY) |
| Production FY25 → FY26 | ~$2.45M → ~$2.44M (roughly flat) |
| Non-Production FY25 → FY26 | ~$5.17M → ~$4.61M (≈ −11%) |
| Platform growth (FY26 increments) | ~$1.0–1.1M |
| Scenario band vs 20% goal | Conservative ~11% · Most-likely ~16% · Best-case ~22% |

Reaching 20% is framed internally as *"a decision, not a forecast"* — it requires full, timely execution of the initiative backlog (tenant density, spot instances, SKU alignments, log-machine rightsizing, etc.).

---

## 8. Cost-band monitoring methodology (subscription 0301)

Per-cluster cost is monitored with **statistical control bands**, ceiling-only (no alert on *low* cost). The core finding: banding needs **two dimensions, not one** — volatility (**CV**) *and* **trend**.

- **Static band** (12-month mean ± σ) fits only **3 of 10** clusters (dev-004, 007, 010) — low, flat variability.
- The other **7 clusters trend ±25–90%**, so a fixed annual band would false-alarm on the way up and go blind on the way down. They use a **rolling 3–6-month window** recalculated monthly (growing: dev-009/001/qa-001; declining: dev-012/015; high-volatility wide bands: dev-002/008).
- **Thresholds:** 🟡 investigate at mean +1σ; 🔴 escalate (mandatory RCA) at mean +2σ. Escalate on a *sustained* breach, not a single spike.
- **One-off handling:** exclude confirmed point anomalies from the baseline (e.g. dev-004 March 2026 was a true one-off — March 2025 was normal). Do **not** exclude seasonal recurrence, level-shifts, or regime changes — those get re-baselined instead.

---

## 9. Cost hotspots & the biggest levers

- **Cluster 04 (CI On-Demand) ~ $24K/month (~$285K/yr) and climbing.** Driver is **overlapping on-demand subsets re-running the same tests**. The lever is *not* less testing — it's **de-duplicating subsets** (run each needed test once) and **parking idle CI clusters** (≈15 min to spin back up). Any AI-agent approach here must start from a diagnosis of test-execution frequency, not from "AI will optimize it."
- **Spot instances (non-prod):** ~60% compute discount on eligible node pools; multi-year net savings modeled in the hundreds of $K. Phased rollout starting with a Cluster-19 pilot.
- **DevBoxes (0102):** hibernation policies (~16% reduction); a proposed laptop-replacement swap for the Medellín campus.
- **Private Endpoints (PEPs):** per-tenant fixed charges in prod/demo; removal/service-endpoint replacement is a recurring lever and a governance flashpoint (cost impact of functional changes not assessed before rollout).
- **GitHub Actions / BITs migration:** Jenkins → GitHub Actions raised direct CI cost ~3.3× ($1.9K → $6.5K); it was a *re-platforming*, not an optimization — flagged for follow-up.

---

## 10. Analytical caveats — read before trusting any number

These are the traps that make FTDS data misleading if taken at face value:

1. **FY25 is a partial year (8 months, starts Nov 2024).** It is an artificially deflated baseline. Flag this prominently on *every* YoY comparison for a C-level audience.
2. **The "$670K → $1.77M increments jump" is a structural artifact,** not a real tripling — it comes from comparing 9 months of FY26 against a 12-month FY25 denominator. Actual Q4 monthly run-rate is only ~+5% above the June exit rate.
3. **Not every candidate anomaly is a clean exclusion.** Of four FY26 candidates, only **dev-004 Mar-26** is a true point anomaly; dev-007 Mar-26 is seasonal recurrence, dev-008 Jan-26 is a level shift (re-baseline), qa-001 Oct-25 is a sustained regime change.
4. **Gross ≠ net.** ~$1.6–2.0M gross savings is largely consumed by ~$1.0–1.1M platform growth. Report what FinOps *delivered* separately from what growth *absorbed*.
5. **Testing cost spikes are often justified cost-to-serve, not waste.** Classify with a five-hypothesis frame — more functionality/tests, infra-instability retries, flaky-test retries, longer runtimes, anomaly-reduction tests — before escalating. End-of-PI spikes are confirmed normal (per Andrea).
6. **PI-close seasonality is weak and inconsistent** across clusters (−11% to +25%; portfolio ≈ +9%). Treat it per cluster, not as a blanket portfolio driver.

---

## 11. Glossary (quick reference)

**FTDS** FactoryTalk Design Studio · **AKS** Azure Kubernetes Service · **Tenant** isolated customer/workspace instance on a cluster · **Cluster** AKS cluster hosting tenants · **PI** Program Increment (delivery cadence; source of end-of-cycle cost seasonality) · **PEP** Private Endpoint · **CTS** Cost-to-Serve (6-gate governance model tiering cloud spend by impact) · **HoL** Hands-on-Lab (demo events) · **Spot** discounted, evictable Azure compute · **DevBox** Microsoft Dev Box developer VM · **Rancher Desktop** local Kubernetes tool · **ran-disp** developer-provisioning repo · **EaaS** Environment-as-a-Service · **CV** coefficient of variation (σ/mean; the volatility measure behind the bands).

---

*Source: FTDS engineering working session (SDLC walkthrough), cross-checked vs. FinOps Board roll-out plan and Jun 2026 board cut. Prepared by Carlos Zapata. Figures are scenario- and cut-dependent — cite the cut. Phonetically-captured terms ("nailis", "BITs") are flagged in §5.*
