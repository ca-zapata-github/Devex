import type { DataAdapter } from "@/data/adapter";
import { createServiceClient } from "@/lib/supabase/service";
import type {
  Epic,
  Gate,
  Milestone,
  Phase,
  Task,
  TaskFilters,
  TaskStatus,
  WayTag,
} from "@/types/domain";
import type { InitiativeLeadCode } from "@/types/owners";
import type { Decision, Risk } from "@/types/governance";
import type { Experiment, ExperimentStatus, MetricSnapshot } from "@/types/metrics";
import { governanceSeed } from "@/data/seed/governance";
import { metricsSeed } from "@/data/seed/metrics";

type PhaseRow = {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
};

type MilestoneRow = {
  id: string;
  name: string;
  milestone_date: string;
  day_number: number;
  status: Milestone["status"];
  exit_criteria: string[];
  phase_id: string;
};

type EpicRow = {
  id: string;
  code: string;
  name: string;
  description: string | null;
};

type TaskRow = {
  id: string;
  epic_id: string;
  code: string;
  title: string;
  way: WayTag | null;
  owner: InitiativeLeadCode;
  owner_is_assumption: boolean;
  start_day: number;
  end_day: number;
  status: TaskStatus;
  done_when: string;
  blocker_note: string | null;
  gate_dep: string | null;
};

type GateRow = {
  id: string;
  question: string;
  owner: InitiativeLeadCode;
  status: Gate["status"];
  answer: string | null;
  gap_plan: string | null;
};

function mapPhase(row: PhaseRow): Phase {
  return {
    id: row.id,
    name: row.name,
    start: row.start_date,
    end: row.end_date,
  };
}

function mapMilestone(row: MilestoneRow): Milestone {
  return {
    id: row.id,
    name: row.name,
    date: row.milestone_date,
    day: row.day_number,
    status: row.status,
    exitCriteria: row.exit_criteria,
    phaseId: row.phase_id,
  };
}

function mapEpic(row: EpicRow): Epic {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description ?? undefined,
  };
}

function mapTask(row: TaskRow): Task {
  return {
    id: row.id,
    epicId: row.epic_id,
    code: row.code,
    title: row.title,
    way: row.way ?? undefined,
    owner: row.owner,
    ownerIsAssumption: row.owner_is_assumption,
    startDay: row.start_day,
    endDay: row.end_day,
    status: row.status,
    doneWhen: row.done_when,
    blockerNote: row.blocker_note ?? undefined,
    gateDep: row.gate_dep ?? undefined,
  };
}

function mapGate(row: GateRow): Gate {
  return {
    id: row.id,
    question: row.question,
    owner: row.owner,
    status: row.status,
    answer: row.answer ?? undefined,
    gapPlan: row.gap_plan ?? undefined,
  };
}

export class SupabaseAdapter implements DataAdapter {
  private client = createServiceClient();

  async getPhases() {
    const { data, error } = await this.client.from("phases").select("*").order("start_date");
    if (error) throw error;
    return (data as PhaseRow[]).map(mapPhase);
  }

  async getMilestones() {
    const { data, error } = await this.client
      .from("milestones")
      .select("*")
      .order("day_number");
    if (error) throw error;
    return (data as MilestoneRow[]).map(mapMilestone);
  }

  async getEpics() {
    const { data, error } = await this.client.from("epics").select("*").order("code");
    if (error) throw error;
    return (data as EpicRow[]).map(mapEpic);
  }

  async getTasks(filters?: TaskFilters) {
    let query = this.client.from("tasks").select("*").order("code");

    if (filters?.epicId) query = query.eq("epic_id", filters.epicId);
    if (filters?.way) query = query.eq("way", filters.way);
    if (filters?.owner) query = query.eq("owner", filters.owner);
    if (filters?.status) query = query.eq("status", filters.status);

    const { data, error } = await query;
    if (error) throw error;

    let tasks = (data as TaskRow[]).map(mapTask);

    if (filters?.phaseId) {
      const phases = await this.getPhases();
      const phase = phases.find((p) => p.id === filters.phaseId);
      if (phase) {
        const start = daysSinceInitiativeStart(phase.start);
        const end = daysSinceInitiativeStart(phase.end);
        tasks = tasks.filter((t) => t.startDay <= end && t.endDay >= start);
      } else {
        tasks = [];
      }
    }

    return tasks;
  }

  async getGates() {
    const { data, error } = await this.client.from("gates").select("*").order("id");
    if (error) throw error;
    return (data as GateRow[]).map(mapGate);
  }

  async getRisks() {
    const { data, error } = await this.client.from("risks").select("*").order("id");
    if (error?.code === "PGRST205") return governanceSeed.risks;
    if (error) throw error;
    return (data as RiskRow[]).map(mapRisk);
  }

  async getDecisions() {
    const { data, error } = await this.client.from("decisions").select("*").order("code");
    if (error?.code === "PGRST205") return governanceSeed.decisions;
    if (error) throw error;
    return (data as DecisionRow[]).map(mapDecision);
  }

  async getExperiments() {
    const { data, error } = await this.client.from("experiments").select("*").order("start_tag");
    if (error?.code === "PGRST205") return metricsSeed.experiments;
    if (error) throw error;
    return (data as ExperimentRow[]).map(mapExperiment);
  }

  async getMetricSnapshots() {
    const { data, error } = await this.client.from("metric_snapshots").select("*").order("metric_key");
    if (error?.code === "PGRST205") return metricsSeed.metricSnapshots;
    if (error) throw error;
    return (data as MetricSnapshotRow[]).map(mapMetricSnapshot);
  }
}

type RiskRow = {
  id: string;
  text: string;
  likelihood: string;
  impact: string | null;
  owner: InitiativeLeadCode;
  mitigation: string;
  status: Risk["status"];
  review_date: string | null;
};

type DecisionRow = {
  id: string;
  code: string;
  text: string;
  status: Decision["status"];
  closed_date: string | null;
  closed_by: InitiativeLeadCode | null;
  rationale: string | null;
  locked: boolean;
};

function mapRisk(row: RiskRow): Risk {
  return {
    id: row.id,
    text: row.text,
    likelihood: row.likelihood,
    impact: row.impact ?? undefined,
    owner: row.owner,
    mitigation: row.mitigation,
    status: row.status,
    reviewDate: row.review_date ?? undefined,
  };
}

function mapDecision(row: DecisionRow): Decision {
  return {
    id: row.id,
    code: row.code,
    text: row.text,
    status: row.status,
    closedDate: row.closed_date ?? undefined,
    closedBy: row.closed_by ?? undefined,
    rationale: row.rationale ?? undefined,
    locked: row.locked,
  };
}

type ExperimentRow = {
  id: string;
  task_id: string;
  hypothesis: string;
  metric: string;
  stage: string;
  start_tag: string;
  end_tag: string | null;
  status: ExperimentStatus;
  pre_median: number | null;
  pre_spread: number | null;
  pre_n: number | null;
  post_median: number | null;
  post_spread: number | null;
  post_n: number | null;
  confounds: string[];
};

type MetricSnapshotRow = {
  metric_key: MetricSnapshot["metricKey"];
  snapshot_date: string;
  headline_value: string | null;
  baseline_status: MetricSnapshot["baselineStatus"];
  direction: MetricSnapshot["direction"];
};

function mapExperiment(row: ExperimentRow): Experiment {
  return {
    id: row.id,
    taskId: row.task_id,
    hypothesis: row.hypothesis,
    metric: row.metric,
    stage: row.stage,
    startTag: row.start_tag,
    endTag: row.end_tag ?? undefined,
    status: row.status,
    pre:
      row.pre_median != null && row.pre_spread != null && row.pre_n != null
        ? { median: row.pre_median, spread: row.pre_spread, n: row.pre_n }
        : undefined,
    post:
      row.post_median != null && row.post_spread != null && row.post_n != null
        ? { median: row.post_median, spread: row.post_spread, n: row.post_n }
        : undefined,
    confounds: row.confounds ?? [],
  };
}

function mapMetricSnapshot(row: MetricSnapshotRow): MetricSnapshot {
  return {
    metricKey: row.metric_key,
    date: String(row.snapshot_date).slice(0, 10),
    headlineValue: row.headline_value ?? undefined,
    baselineStatus: row.baseline_status,
    direction: row.direction,
  };
}

function daysSinceInitiativeStart(isoDate: string): number {
  const start = Date.UTC(2026, 6, 20);
  const [y, m, d] = isoDate.split("-").map(Number);
  const target = Date.UTC(y, m - 1, d);
  return Math.round((target - start) / 86_400_000);
}
