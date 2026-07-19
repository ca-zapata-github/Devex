import type { Experiment, MetricSnapshot } from "@/types/metrics";

/** E6/E7 experiments from EXECUTION_PLAN.md — pre/post are sample placeholders until real drops (G5). */
export const experiments: Experiment[] = [
  {
    id: "exp-flaky-quarantine",
    taskId: "e6-1",
    hypothesis: "Flaky-test quarantine + dedup cuts re-run rate and CI wait time (FinOps co-win)",
    metric: "CI re-run rate (team median + spread)",
    stage: "Build / verify",
    startTag: "2026-08-10",
    status: "running",
    pre: { median: 18, spread: 6, n: 12 },
    confounds: [],
  },
  {
    id: "exp-stex-cutover",
    taskId: "e6-2",
    hypothesis: "STEX→GitHub Actions cutover tagged so baseline pre/post stays separable (DEC-2)",
    metric: "Deploy frequency (merge-to-main)",
    stage: "Release",
    startTag: "2026-08-03",
    endTag: "2026-09-15",
    status: "running",
    confounds: ["STEX cutover window TBD — tag before/after in confound log"],
  },
  {
    id: "exp-rancher-spinup",
    taskId: "e6-3",
    hypothesis: "Image caching or pre-provisioned envs reduce Rancher spin-up median after E3.4 localizes pain",
    metric: "Time-to-ready-env (minutes, median + spread)",
    stage: "Environment ready",
    startTag: "2026-08-24",
    status: "planned",
    confounds: [],
  },
  {
    id: "exp-review-slo",
    taskId: "e6-4",
    hypothesis: "Reviewer-rotation SLO on 2 opt-in teams reduces PR cycle time without individual metrics",
    metric: "PR cycle time (team-level, pilot teams)",
    stage: "Review / merge",
    startTag: "2026-08-24",
    status: "planned",
    confounds: [],
  },
  {
    id: "exp-ai-triage",
    taskId: "e7-3",
    hypothesis: "AI triage of flaky-test failures reduces developer wait on CI feedback loop",
    metric: "Time in blocked-on-CI state (self-report pulse + telemetry)",
    stage: "Build / verify",
    startTag: "2026-09-01",
    status: "planned",
    confounds: [],
  },
];

export const metricSnapshots: MetricSnapshot[] = [
  {
    metricKey: "value_vs_overhead",
    date: "2026-07-20",
    headlineValue: "Not recorded",
    baselineStatus: "collecting",
    direction: "unknown",
  },
  {
    metricKey: "dx_speed",
    date: "2026-07-20",
    baselineStatus: "collecting",
    direction: "flat",
  },
  {
    metricKey: "dx_effectiveness",
    date: "2026-07-20",
    baselineStatus: "collecting",
    direction: "flat",
  },
  {
    metricKey: "dx_quality",
    date: "2026-07-20",
    baselineStatus: "collecting",
    direction: "flat",
  },
  {
    metricKey: "dx_business_impact",
    date: "2026-07-20",
    baselineStatus: "collecting",
    direction: "unknown",
  },
];

export const metricsSeed = { experiments, metricSnapshots };
