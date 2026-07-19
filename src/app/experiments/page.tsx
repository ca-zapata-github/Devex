import { ExperimentsPanel } from "@/components/metrics/ExperimentsPanel";
import { NorthStarStrip } from "@/components/metrics/NorthStarStrip";
import { resolveDataAdapter } from "@/data/index";

export const dynamic = "force-dynamic";

function scorecardUrl(): string | undefined {
  const url = process.env.NEXT_PUBLIC_SCORECARD_URL;
  return url && url.length > 0 ? url : undefined;
}

export default async function ExperimentsPage() {
  const { adapter, source } = await resolveDataAdapter();
  const [experiments, metrics, tasks] = await Promise.all([
    adapter.getExperiments(),
    adapter.getMetricSnapshots(),
    adapter.getTasks(),
  ]);

  const taskCodes = Object.fromEntries(tasks.map((t) => [t.id, t.code]));

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <header className="mb-8 border-b border-neutral-200 pb-6 dark:border-neutral-800">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          FTDS DevEx Command Center
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Experiments &amp; north-star · Source: {source}
        </p>
      </header>

      <div className="space-y-10">
        <NorthStarStrip metrics={metrics} scorecardUrl={scorecardUrl()} />
        <ExperimentsPanel experiments={experiments} taskCodes={taskCodes} />
      </div>
    </div>
  );
}
