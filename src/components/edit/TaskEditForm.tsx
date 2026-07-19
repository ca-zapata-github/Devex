"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { updateTaskAction } from "@/lib/actions/plan-actions";
import type { Task, TaskStatus } from "@/types/domain";
import { taskStatusLabel } from "@/lib/task-utils";

interface TaskEditFormProps {
  task: Task;
}

const STATUSES: TaskStatus[] = ["not_started", "in_progress", "blocked", "done"];

export function TaskEditForm({ task }: TaskEditFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [blockerNote, setBlockerNote] = useState(task.blockerNote ?? "");
  const [error, setError] = useState<string | null>(null);

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await updateTaskAction(task.id, {
        status,
        blockerNote: status === "blocked" ? blockerNote : null,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="mt-3 border-t border-neutral-200 pt-3 dark:border-neutral-800">
      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Update status</p>
      <div className="mt-2 space-y-2">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as TaskStatus)}
          disabled={pending}
          className="w-full rounded border border-neutral-200 bg-white px-2 py-1.5 text-xs dark:border-neutral-700 dark:bg-neutral-950"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {taskStatusLabel(s)}
            </option>
          ))}
        </select>

        {status === "blocked" ? (
          <textarea
            value={blockerNote}
            onChange={(e) => setBlockerNote(e.target.value)}
            disabled={pending}
            placeholder="Blocker note — who/what unblocks?"
            rows={2}
            className="w-full rounded border border-red-200 bg-red-50 px-2 py-1.5 text-xs text-red-900 placeholder:text-red-400"
          />
        ) : null}

        {error ? <p className="text-xs text-red-600">{error}</p> : null}

        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="rounded bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
        >
          {pending ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}
