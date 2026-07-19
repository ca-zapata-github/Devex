import { z } from "zod";

import type { Gate, Milestone, Task } from "@/types/domain";

const taskStatusSchema = z.enum(["not_started", "in_progress", "blocked", "done"]);
const milestoneStatusSchema = z.enum(["on_track", "at_risk", "late", "done"]);
const gateStatusSchema = z.enum(["open", "answered", "waived"]);

export const taskUpdateSchema = z.object({
  status: taskStatusSchema.optional(),
  blockerNote: z.string().nullable().optional(),
});

export const milestoneUpdateSchema = z.object({
  status: milestoneStatusSchema,
});

export const gateUpdateSchema = z.object({
  status: gateStatusSchema.optional(),
  answer: z.string().nullable().optional(),
  gapPlan: z.string().nullable().optional(),
});

export const bulkImportSchema = z.object({
  tasks: z
    .array(
      z.object({
        id: z.string().min(1),
        status: taskStatusSchema.optional(),
        blockerNote: z.string().nullable().optional(),
      }),
    )
    .optional(),
  milestones: z
    .array(
      z.object({
        id: z.string().min(1),
        status: milestoneStatusSchema,
      }),
    )
    .optional(),
  gates: z
    .array(
      z.object({
        id: z.string().min(1),
        status: gateStatusSchema.optional(),
        answer: z.string().nullable().optional(),
        gapPlan: z.string().nullable().optional(),
      }),
    )
    .optional(),
});

export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>;
export type MilestoneUpdateInput = z.infer<typeof milestoneUpdateSchema>;
export type GateUpdateInput = z.infer<typeof gateUpdateSchema>;
export type BulkImportInput = z.infer<typeof bulkImportSchema>;

export function mergeTaskUpdate(task: Task, input: TaskUpdateInput): Task {
  const status = input.status ?? task.status;
  const blockerNote =
    status === "blocked" ?
      (input.blockerNote ?? task.blockerNote ?? "").trim() || undefined
    : input.blockerNote === null ? undefined
    : input.blockerNote ?? task.blockerNote;

  return { ...task, status, blockerNote };
}

export function mergeGateUpdate(gate: Gate, input: GateUpdateInput): Gate {
  const status = input.status ?? gate.status;
  return {
    ...gate,
    status,
    answer:
      status === "answered" ?
        (input.answer ?? gate.answer)?.trim() || undefined
      : status === "open" ? undefined
      : gate.answer,
    gapPlan:
      status === "waived" ?
        (input.gapPlan ?? gate.gapPlan)?.trim() || undefined
      : status === "open" ? undefined
      : gate.gapPlan,
  };
}

export function mergeMilestoneUpdate(
  milestone: Milestone,
  input: MilestoneUpdateInput,
): Milestone {
  return { ...milestone, status: input.status };
}
