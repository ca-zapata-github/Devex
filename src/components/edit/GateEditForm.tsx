"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { updateGateAction } from "@/lib/actions/plan-actions";
import type { Gate, GateStatus } from "@/types/domain";

interface GateEditFormProps {
  gate: Gate;
}

const STATUSES: { value: GateStatus; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "answered", label: "Answered" },
  { value: "waived", label: "Waived (gap plan)" },
];

export function GateEditForm({ gate }: GateEditFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState(gate.status);
  const [answer, setAnswer] = useState(gate.answer ?? "");
  const [gapPlan, setGapPlan] = useState(gate.gapPlan ?? "");
  const [error, setError] = useState<string | null>(null);

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await updateGateAction(gate.id, {
        status,
        answer: status === "answered" ? answer : null,
        gapPlan: status === "waived" ? gapPlan : null,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="mt-4 border-t border-neutral-200 pt-4 dark:border-neutral-700">
      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Update gate</p>
      <div className="mt-2 space-y-2">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as GateStatus)}
          disabled={pending}
          className="w-full rounded border border-neutral-200 bg-white px-2 py-1.5 text-xs dark:border-neutral-700 dark:bg-neutral-950"
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        {status === "answered" ? (
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={pending}
            placeholder="Answer — source of truth decision, channel confirmed, etc."
            rows={3}
            className="w-full rounded border border-neutral-200 px-2 py-1.5 text-xs dark:border-neutral-700 dark:bg-neutral-950"
          />
        ) : null}

        {status === "waived" ? (
          <textarea
            value={gapPlan}
            onChange={(e) => setGapPlan(e.target.value)}
            disabled={pending}
            placeholder="Gap plan — how we'll close this later"
            rows={3}
            className="w-full rounded border border-amber-200 bg-amber-50 px-2 py-1.5 text-xs text-amber-900"
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
