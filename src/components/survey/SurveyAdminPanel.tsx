"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  createSurveyRunAction,
  updateSurveyRunStatusAction,
} from "@/lib/actions/survey-actions";
import { formatShortDate } from "@/lib/initiative-dates";
import type { SurveyRunSummary } from "@/types/survey";

interface SurveyAdminPanelProps {
  runs: SurveyRunSummary[];
  formOptions: { id: string; title: string; type: string }[];
}

export function SurveyAdminPanel({ runs, formOptions }: SurveyAdminPanelProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [formId, setFormId] = useState(formOptions[0]?.id ?? "");
  const [label, setLabel] = useState("");
  const [openDate, setOpenDate] = useState("");
  const [closeDate, setCloseDate] = useState("");

  function createRun() {
    setError(null);
    startTransition(async () => {
      const result = await createSurveyRunAction({ formId, label: label || undefined, openDate, closeDate });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
      setLabel("");
    });
  }

  function setStatus(runId: string, status: "open" | "closed") {
    startTransition(async () => {
      const result = await updateSurveyRunStatusAction({ runId, status });
      if (!result.ok) setError(result.error);
      else router.refresh();
    });
  }

  return (
    <section className="space-y-6 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
      <div>
        <h2 className="text-sm font-semibold text-neutral-900">Lead admin</h2>
        <p className="mt-1 text-xs text-neutral-500">
          Launch runs, set dates, watch response counts — identities never stored.
        </p>
      </div>

      <div className="space-y-3 border-t border-neutral-200 pt-4">
        <p className="text-xs font-semibold text-neutral-700">Create run</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <select
            value={formId}
            onChange={(e) => setFormId(e.target.value)}
            className="rounded border border-neutral-200 bg-white px-2 py-1.5 text-xs"
          >
            {formOptions.map((f) => (
              <option key={f.id} value={f.id}>
                {f.title} ({f.type})
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Label (optional)"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="rounded border border-neutral-200 bg-white px-2 py-1.5 text-xs"
          />
          <input
            type="date"
            value={openDate}
            onChange={(e) => setOpenDate(e.target.value)}
            className="rounded border border-neutral-200 bg-white px-2 py-1.5 text-xs"
          />
          <input
            type="date"
            value={closeDate}
            onChange={(e) => setCloseDate(e.target.value)}
            className="rounded border border-neutral-200 bg-white px-2 py-1.5 text-xs"
          />
        </div>
        <button
          type="button"
          onClick={createRun}
          disabled={pending || !openDate || !closeDate}
          className="rounded bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
        >
          Create draft run
        </button>
      </div>

      {error ? <p className="text-xs text-red-600">{error}</p> : null}

      <ul className="space-y-2 border-t border-neutral-200 pt-4">
        {runs.map((run) => (
          <li
            key={run.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded border border-neutral-200 bg-white px-3 py-2 text-xs"
          >
            <div>
              <p className="font-medium">{run.label ?? run.formTitle}</p>
              <p className="text-neutral-500">
                {formatShortDate(run.openDate)} – {formatShortDate(run.closeDate)} ·{" "}
                <span className="uppercase">{run.status}</span> · {run.totalResponses} responses
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/survey/respond/${run.id}`}
                className="rounded border border-neutral-200 px-2 py-1 hover:bg-neutral-50"
              >
                Respond
              </Link>
              <Link
                href={`/survey/results/${run.id}`}
                className="rounded border border-neutral-200 px-2 py-1 hover:bg-neutral-50"
              >
                Results
              </Link>
              {run.status === "draft" ? (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => setStatus(run.id, "open")}
                  className="rounded bg-emerald-700 px-2 py-1 text-white disabled:opacity-50"
                >
                  Open
                </button>
              ) : null}
              {run.status === "open" ? (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => setStatus(run.id, "closed")}
                  className="rounded bg-neutral-600 px-2 py-1 text-white disabled:opacity-50"
                >
                  Close
                </button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
