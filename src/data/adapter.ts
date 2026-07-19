import type {
  Epic,
  Gate,
  Milestone,
  Phase,
  Task,
  TaskFilters,
} from "@/types/domain";
import type { Decision, Risk } from "@/types/governance";
import type { Experiment, MetricSnapshot } from "@/types/metrics";

export interface DataAdapter {
  getPhases(): Promise<Phase[]>;
  getMilestones(): Promise<Milestone[]>;
  getEpics(): Promise<Epic[]>;
  getTasks(filters?: TaskFilters): Promise<Task[]>;
  getGates(): Promise<Gate[]>;
  getRisks(): Promise<Risk[]>;
  getDecisions(): Promise<Decision[]>;
  getExperiments(): Promise<Experiment[]>;
  getMetricSnapshots(): Promise<MetricSnapshot[]>;
}
