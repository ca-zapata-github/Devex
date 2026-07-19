"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { updateMilestoneAction } from "@/lib/actions/plan-actions";
import type { Milestone, MilestoneStatus } from "@/types/domain";

interface MilestoneEditFormProps {
  milestone: Milestone;
}

const STATUSES: { value: MilestoneStatus; label: string }[] = [
  { value: "on_track", label: "On track" },
  { value: "at_risk", label: "At risk" },
  { value: "late", label: "Late" },
  { value: "done", label: "Done" },
];

export function MilestoneEditForm({ milestone }: MilestoneEditFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState(milestone.status);
  const [error, setError] = useState<string | null>(null);

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await updateMilestoneAction(milestone.id, { status });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="mt-3 border-t border-neutral-200 pt-3 dark:border-neutral-700">
      <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Set status</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as MilestoneStatus)}
          disabled={pending}
          className="flex-1 rounded border border-neutral-200 bg-white px-2 py-1 text-xs dark:border-neutral-600 dark:bg-neutral-800"
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="rounded bg-neutral-900 px-2 py-1 text-xs font-medium text-white disabled:opacity-50"
        >
          {pending ? "…" : "Save"}
        </button>
      </div>
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
