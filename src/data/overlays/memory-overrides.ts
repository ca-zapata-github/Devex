import type { Gate, Milestone, Task } from "@/types/domain";

const taskPatches = new Map<string, Partial<Pick<Task, "status" | "blockerNote">>>();
const milestonePatches = new Map<string, Pick<Milestone, "status">>();
const gatePatches = new Map<
  string,
  Partial<Pick<Gate, "status" | "answer" | "gapPlan">>
>();

export function patchTask(id: string, patch: Partial<Pick<Task, "status" | "blockerNote">>) {
  taskPatches.set(id, { ...taskPatches.get(id), ...patch });
}

export function patchMilestone(id: string, patch: Pick<Milestone, "status">) {
  milestonePatches.set(id, patch);
}

export function patchGate(
  id: string,
  patch: Partial<Pick<Gate, "status" | "answer" | "gapPlan">>,
) {
  gatePatches.set(id, { ...gatePatches.get(id), ...patch });
}

export function applyTaskPatches(tasks: Task[]): Task[] {
  return tasks.map((task) => {
    const patch = taskPatches.get(task.id);
    if (!patch) return task;
    return {
      ...task,
      ...patch,
      blockerNote:
        (patch.status ?? task.status) === "blocked" ?
          patch.blockerNote ?? task.blockerNote
        : patch.blockerNote === undefined ? task.blockerNote
        : patch.blockerNote,
    };
  });
}

export function applyMilestonePatches(milestones: Milestone[]): Milestone[] {
  return milestones.map((m) => {
    const patch = milestonePatches.get(m.id);
    return patch ? { ...m, ...patch } : m;
  });
}

export function applyGatePatches(gates: Gate[]): Gate[] {
  return gates.map((gate) => {
    const patch = gatePatches.get(gate.id);
    if (!patch) return gate;
    const status = patch.status ?? gate.status;
    return {
      ...gate,
      status,
      answer: status === "answered" ? patch.answer ?? gate.answer : undefined,
      gapPlan: status === "waived" ? patch.gapPlan ?? gate.gapPlan : undefined,
    };
  });
}

export function clearMemoryOverrides() {
  taskPatches.clear();
  milestonePatches.clear();
  gatePatches.clear();
}
