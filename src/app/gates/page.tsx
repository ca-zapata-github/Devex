import { GatesPanel } from "@/components/gates/GatesPanel";
import { resolveDataAdapter } from "@/data/index";
import { hasEditAccess } from "@/lib/auth/edit-access";
import { formatShortDate, INITIATIVE_END, INITIATIVE_START } from "@/lib/initiative-dates";

export const dynamic = "force-dynamic";

export default async function GatesPage() {
  const { adapter, source } = await resolveDataAdapter();
  const [gates, tasks, canEdit] = await Promise.all([
    adapter.getGates(),
    adapter.getTasks(),
    hasEditAccess(),
  ]);

  const dependentTaskCountByGate = tasks.reduce<Record<string, number>>((acc, task) => {
    if (task.gateDep) {
      acc[task.gateDep] = (acc[task.gateDep] ?? 0) + 1;
    }
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-neutral-200 pb-6 dark:border-neutral-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            FTDS DevEx Command Center
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Gates panel · {formatShortDate(INITIATIVE_START)} –{" "}
            {formatShortDate(INITIATIVE_END)}
          </p>
        </div>
        <p className="text-xs text-neutral-400">
          Source: {source} · schema devex
        </p>
      </header>

      <GatesPanel
        gates={gates}
        dependentTaskCountByGate={dependentTaskCountByGate}
        canEdit={canEdit}
      />
    </div>
  );
}
