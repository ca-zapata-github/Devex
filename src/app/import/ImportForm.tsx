"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { importPlanJsonAction } from "@/lib/actions/plan-actions";

const EXAMPLE = `{
  "tasks": [
    { "id": "e1-1", "status": "in_progress" },
    { "id": "e2-3", "status": "blocked", "blockerNote": "Waiting on Gate-2 channel decision" }
  ],
  "milestones": [
    { "id": "m1", "status": "on_track" }
  ],
  "gates": [
    { "id": "gate-1", "status": "answered", "answer": "GitHub Actions is authoritative for deploy frequency." }
  ]
}`;

export function ImportForm() {
  const router = useRouter();
  const [raw, setRaw] = useState(EXAMPLE);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function importJson() {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await importPlanJsonAction(raw);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMessage(
        `Imported ${result.tasks} task(s), ${result.milestones} milestone(s), ${result.gates} gate(s).`,
      );
      router.refresh();
    });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Weekly JSON import</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Bulk-update statuses from a JSON file. Task IDs match seed slugs (e.g.{" "}
          <code className="text-xs">e1-1</code> for E1.1). Blocked tasks require{" "}
          <code className="text-xs">blockerNote</code>.
        </p>
      </header>

      <textarea
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        rows={18}
        className="w-full rounded-lg border border-neutral-200 bg-neutral-50 p-3 font-mono text-xs dark:border-neutral-700 dark:bg-neutral-900"
      />

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={importJson}
          disabled={pending}
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending ? "Importing…" : "Import JSON"}
        </button>
        <Link href="/backlog" className="text-sm text-neutral-500 hover:text-neutral-800">
          ← Back to backlog
        </Link>
      </div>

      {message ? <p className="mt-4 text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
