import "server-only";

import { createServiceClient } from "@/lib/supabase/service";
import { getDataSource, hasSupabaseConfig } from "@/lib/env";
import {
  applyGatePatches,
  applyMilestonePatches,
  applyTaskPatches,
  patchGate,
  patchMilestone,
  patchTask,
} from "@/data/overlays/memory-overrides";
import { planSeed } from "@/data/seed/plan";
import type { Gate, Milestone, Task } from "@/types/domain";
import type {
  BulkImportInput,
  GateUpdateInput,
  MilestoneUpdateInput,
  TaskUpdateInput,
} from "@/lib/validation/plan-updates";
import {
  gateUpdateSchema,
  mergeGateUpdate,
  mergeMilestoneUpdate,
  mergeTaskUpdate,
  milestoneUpdateSchema,
  taskUpdateSchema,
} from "@/lib/validation/plan-updates";

function writesToSupabase(): boolean {
  return hasSupabaseConfig() && getDataSource() !== "memory";
}

async function fetchTask(id: string): Promise<Task | undefined> {
  if (writesToSupabase()) {
    const client = createServiceClient();
    const { data, error } = await client.from("tasks").select("*").eq("id", id).single();
    if (error || !data) return undefined;
    return mapTaskRow(data);
  }
  const base = planSeed.tasks.find((t) => t.id === id);
  if (!base) return undefined;
  return applyTaskPatches([base])[0];
}

async function fetchGate(id: string): Promise<Gate | undefined> {
  if (writesToSupabase()) {
    const client = createServiceClient();
    const { data, error } = await client.from("gates").select("*").eq("id", id).single();
    if (error || !data) return undefined;
    return mapGateRow(data);
  }
  const base = planSeed.gates.find((g) => g.id === id);
  if (!base) return undefined;
  return applyGatePatches([base])[0];
}

async function fetchMilestone(id: string): Promise<Milestone | undefined> {
  if (writesToSupabase()) {
    const client = createServiceClient();
    const { data, error } = await client.from("milestones").select("*").eq("id", id).single();
    if (error || !data) return undefined;
    return mapMilestoneRow(data);
  }
  const base = planSeed.milestones.find((m) => m.id === id);
  if (!base) return undefined;
  return applyMilestonePatches([base])[0];
}

function mapTaskRow(row: Record<string, unknown>): Task {
  return {
    id: row.id as string,
    epicId: row.epic_id as string,
    code: row.code as string,
    title: row.title as string,
    way: (row.way as Task["way"]) ?? undefined,
    owner: row.owner as Task["owner"],
    ownerIsAssumption: row.owner_is_assumption as boolean,
    startDay: row.start_day as number,
    endDay: row.end_day as number,
    status: row.status as Task["status"],
    doneWhen: row.done_when as string,
    blockerNote: (row.blocker_note as string | null) ?? undefined,
    gateDep: (row.gate_dep as string | null) ?? undefined,
  };
}

function mapGateRow(row: Record<string, unknown>): Gate {
  return {
    id: row.id as string,
    question: row.question as string,
    owner: row.owner as Gate["owner"],
    status: row.status as Gate["status"],
    answer: (row.answer as string | null) ?? undefined,
    gapPlan: (row.gap_plan as string | null) ?? undefined,
  };
}

function mapMilestoneRow(row: Record<string, unknown>): Milestone {
  return {
    id: row.id as string,
    name: row.name as string,
    date: row.milestone_date as string,
    day: row.day_number as number,
    status: row.status as Milestone["status"],
    exitCriteria: row.exit_criteria as string[],
    phaseId: row.phase_id as string,
  };
}

export async function updateTaskRecord(id: string, input: TaskUpdateInput): Promise<Task> {
  const parsed = taskUpdateSchema.parse(input);
  const existing = await fetchTask(id);
  if (!existing) throw new Error(`Task not found: ${id}`);

  const merged = mergeTaskUpdate(existing, parsed);

  if (merged.status === "blocked" && !merged.blockerNote?.trim()) {
    throw new Error("Blocker note is required when status is Blocked.");
  }

  if (writesToSupabase()) {
    const client = createServiceClient();
    const { error } = await client
      .from("tasks")
      .update({
        status: merged.status,
        blocker_note: merged.blockerNote ?? null,
      })
      .eq("id", id);
    if (error) throw error;
  } else {
    patchTask(id, { status: merged.status, blockerNote: merged.blockerNote });
  }

  return merged;
}

export async function updateMilestoneRecord(
  id: string,
  input: MilestoneUpdateInput,
): Promise<Milestone> {
  const parsed = milestoneUpdateSchema.parse(input);
  const existing = await fetchMilestone(id);
  if (!existing) throw new Error(`Milestone not found: ${id}`);

  const merged = mergeMilestoneUpdate(existing, parsed);

  if (writesToSupabase()) {
    const client = createServiceClient();
    const { error } = await client.from("milestones").update({ status: merged.status }).eq("id", id);
    if (error) throw error;
  } else {
    patchMilestone(id, { status: merged.status });
  }

  return merged;
}

export async function updateGateRecord(id: string, input: GateUpdateInput): Promise<Gate> {
  const parsed = gateUpdateSchema.parse(input);
  const existing = await fetchGate(id);
  if (!existing) throw new Error(`Gate not found: ${id}`);

  const merged = mergeGateUpdate(existing, parsed);

  if (merged.status === "answered" && !merged.answer?.trim()) {
    throw new Error("Answer is required when gate status is Answered.");
  }
  if (merged.status === "waived" && !merged.gapPlan?.trim()) {
    throw new Error("Gap plan is required when gate status is Waived.");
  }

  if (writesToSupabase()) {
    const client = createServiceClient();
    const { error } = await client
      .from("gates")
      .update({
        status: merged.status,
        answer: merged.answer ?? null,
        gap_plan: merged.gapPlan ?? null,
      })
      .eq("id", id);
    if (error) throw error;
  } else {
    patchGate(id, {
      status: merged.status,
      answer: merged.answer,
      gapPlan: merged.gapPlan,
    });
  }

  return merged;
}

export async function applyBulkImport(input: BulkImportInput): Promise<{
  tasks: number;
  milestones: number;
  gates: number;
}> {
  let tasks = 0;
  let milestones = 0;
  let gates = 0;

  for (const item of input.tasks ?? []) {
    await updateTaskRecord(item.id, {
      status: item.status,
      blockerNote: item.blockerNote,
    });
    tasks++;
  }

  for (const item of input.milestones ?? []) {
    await updateMilestoneRecord(item.id, { status: item.status });
    milestones++;
  }

  for (const item of input.gates ?? []) {
    if (!item.status) continue;
    await updateGateRecord(item.id, {
      status: item.status,
      answer: item.answer,
      gapPlan: item.gapPlan,
    });
    gates++;
  }

  return { tasks, milestones, gates };
}

export async function getSampleDataBannerVisible(): Promise<boolean> {
  if (!writesToSupabase()) return true;

  try {
    const client = createServiceClient();
    const { data, error } = await client
      .from("app_meta")
      .select("value")
      .eq("key", "sample_data_banner")
      .maybeSingle();

    if (error) return true;
    if (!data) return true;
    return data.value === true;
  } catch {
    return true;
  }
}

export async function dismissSampleDataBanner(): Promise<void> {
  if (!writesToSupabase()) return;

  const client = createServiceClient();
  const { error } = await client.from("app_meta").upsert({
    key: "sample_data_banner",
    value: false,
  });
  if (error) throw error;
}
