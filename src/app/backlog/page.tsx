import { BacklogBoard } from "@/components/backlog/BacklogBoard";
import { resolveDataAdapter } from "@/data/index";
import { hasEditAccess } from "@/lib/auth/edit-access";
import { formatShortDate, INITIATIVE_END, INITIATIVE_START } from "@/lib/initiative-dates";

export const dynamic = "force-dynamic";

export default async function BacklogPage() {
  const { adapter, source } = await resolveDataAdapter();
  const [epics, phases, tasks, gates, canEdit] = await Promise.all([
    adapter.getEpics(),
    adapter.getPhases(),
    adapter.getTasks(),
    adapter.getGates(),
    hasEditAccess(),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-neutral-200 pb-6 dark:border-neutral-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            FTDS DevEx Command Center
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Backlog board · {formatShortDate(INITIATIVE_START)} –{" "}
            {formatShortDate(INITIATIVE_END)}
          </p>
        </div>
        <p className="text-xs text-neutral-400">
          Source: {source} · schema devex
        </p>
      </header>

      <BacklogBoard
        epics={epics}
        phases={phases}
        tasks={tasks}
        gates={gates}
        canEdit={canEdit}
      />
    </div>
  );
}
