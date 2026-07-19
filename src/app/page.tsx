import { RoadmapTimeline } from "@/components/roadmap/RoadmapTimeline";
import { NorthStarStrip } from "@/components/metrics/NorthStarStrip";
import { RagBadge } from "@/components/ui/RagBadge";
import { resolveDataAdapter } from "@/data/index";
import { hasEditAccess } from "@/lib/auth/edit-access";
import {
  daysRemaining,
  formatShortDate,
  INITIATIVE_END,
  INITIATIVE_START,
  todayIso,
} from "@/lib/initiative-dates";
import { deriveInitiativeRag } from "@/lib/rag";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { adapter, source } = await resolveDataAdapter();
  const [phases, milestones, gates, metrics, canEdit] = await Promise.all([
    adapter.getPhases(),
    adapter.getMilestones(),
    adapter.getGates(),
    adapter.getMetricSnapshots(),
    hasEditAccess(),
  ]);

  const scorecardUrl = process.env.NEXT_PUBLIC_SCORECARD_URL || undefined;

  const today = todayIso();
  const remaining = daysRemaining(today);
  const overallRag = deriveInitiativeRag(milestones, gates, today);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-neutral-200 pb-6 dark:border-neutral-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            FTDS DevEx Command Center
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Roadmap &amp; milestones · {formatShortDate(INITIATIVE_START)} –{" "}
            {formatShortDate(INITIATIVE_END)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 text-right">
          <RagBadge level={overallRag} />
          <p className="text-sm font-medium tabular-nums text-neutral-700 dark:text-neutral-300">
            {remaining} days remaining
          </p>
          <p className="text-xs text-neutral-400">
            Source: {source} · schema devex
          </p>
        </div>
      </header>

      <div className="mb-8">
        <NorthStarStrip metrics={metrics} scorecardUrl={scorecardUrl} compact />
      </div>

      <RoadmapTimeline
        phases={phases}
        milestones={milestones}
        gates={gates}
        canEdit={canEdit}
      />
    </div>
  );
}
