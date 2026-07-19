export interface Distribution {
  median: number;
  spread: number;
  n: number;
}

export type ExperimentStatus = "planned" | "running" | "measured" | "inconclusive";

export interface Experiment {
  id: string;
  taskId: string;
  hypothesis: string;
  metric: string;
  stage: string;
  startTag: string;
  endTag?: string;
  status: ExperimentStatus;
  pre?: Distribution;
  post?: Distribution;
  confounds: string[];
}

export type BaselineStatus = "collecting" | "established";

export type MetricDirection = "up" | "down" | "flat" | "unknown";

export type MetricKey =
  | "value_vs_overhead"
  | "dx_speed"
  | "dx_effectiveness"
  | "dx_quality"
  | "dx_business_impact";

export interface MetricSnapshot {
  metricKey: MetricKey;
  date: string;
  headlineValue?: string;
  baselineStatus: BaselineStatus;
  direction: MetricDirection;
}

export const METRIC_LABELS: Record<MetricKey, string> = {
  value_vs_overhead: "Value vs Overhead",
  dx_speed: "Speed",
  dx_effectiveness: "Effectiveness",
  dx_quality: "Quality",
  dx_business_impact: "Business Impact",
};
