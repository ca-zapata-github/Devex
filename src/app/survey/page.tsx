import Link from "next/link";

import { SurveyAdminPanel } from "@/components/survey/SurveyAdminPanel";
import { resolveDataAdapter } from "@/data/index";
import { getSurveyFormOptionsAction } from "@/lib/actions/survey-actions";
import { hasEditAccess } from "@/lib/auth/edit-access";
import { formatShortDate } from "@/lib/initiative-dates";
import { getSurveyRunSummaries } from "@/lib/survey/queries";

export const dynamic = "force-dynamic";

export default async function SurveyPage() {
  const { source } = await resolveDataAdapter();
  const [runs, canEdit, formOptions] = await Promise.all([
    getSurveyRunSummaries(),
    hasEditAccess(),
    getSurveyFormOptionsAction(),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <header className="mb-8 border-b border-neutral-200 pb-6 dark:border-neutral-800">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          FTDS DevEx Command Center
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Survey module · Baseline &amp; Progress Pulse · Source: {source}
        </p>
        <p className="mt-2 text-xs text-neutral-400">
          Initiative-owned instruments only — independent of Bill&apos;s monthly survey (PRD §3.7).
        </p>
      </header>

      {canEdit ? <SurveyAdminPanel runs={runs} formOptions={formOptions} /> : null}

      <section className={`space-y-4 ${canEdit ? "mt-10" : ""}`}>
        <h2 className="text-lg font-semibold tracking-tight">Survey runs</h2>
        <div className="space-y-3">
          {runs.map((run) => (
            <article
              key={run.id}
              className="rounded-lg border border-neutral-200 bg-white p-4 dark:bg-neutral-950"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{run.label ?? run.formTitle}</p>
                  <p className="mt-1 text-xs text-neutral-500">
                    {run.formTitle} v{run.formType} · {formatShortDate(run.openDate)} –{" "}
                    {formatShortDate(run.closeDate)} ·{" "}
                    <span className="uppercase font-semibold">{run.status}</span>
                  </p>
                  <p className="mt-1 text-xs text-neutral-400">
                    {run.totalResponses} total responses
                    {Object.keys(run.responsesByTeam).length
                      ? ` · ${Object.entries(run.responsesByTeam)
                          .map(([team, n]) => `${team.replace("team-", "")}: ${n}`)
                          .join(", ")}`
                      : ""}
                  </p>
                </div>
                <div className="flex gap-2 text-xs">
                  <Link
                    href={`/survey/respond/${run.id}`}
                    className="rounded-lg border border-neutral-200 px-3 py-1.5 font-medium hover:border-neutral-400"
                  >
                    Take survey
                  </Link>
                  <Link
                    href={`/survey/results/${run.id}`}
                    className="rounded-lg border border-neutral-200 px-3 py-1.5 font-medium hover:border-neutral-400"
                  >
                    View results
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
