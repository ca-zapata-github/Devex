import type {
  Epic,
  Gate,
  Milestone,
  Phase,
  Task,
  TaskFilters,
} from "@/types/domain";

export interface DataAdapter {
  getPhases(): Promise<Phase[]>;
  getMilestones(): Promise<Milestone[]>;
  getEpics(): Promise<Epic[]>;
  getTasks(filters?: TaskFilters): Promise<Task[]>;
  getGates(): Promise<Gate[]>;
}
