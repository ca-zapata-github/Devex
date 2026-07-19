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
}

function daysSinceInitiativeStart(isoDate: string): number {
  const start = Date.UTC(2026, 6, 20);
  const [y, m, d] = isoDate.split("-").map(Number);
  const target = Date.UTC(y, m - 1, d);
  return Math.round((target - start) / 86_400_000);
}
