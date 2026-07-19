import Link from "next/link";

import { ReadoutView } from "@/components/readout/ReadoutView";
import { RagBadge } from "@/components/ui/RagBadge";
import { resolveDataAdapter } from "@/data/index";
import { hasEditAccess } from "@/lib/auth/edit-access";
import { buildReadoutSnapshot } from "@/lib/readout/build-readout";
import { listStatusUpdates } from "@/lib/mutations/status-updates";
import { formatShortDate, todayIso } from "@/lib/initiative-dates";

export const dynamic = "force-dynamic";

export default async function ReadoutPage() {
  const { adapter } = await resolveDataAdapter();
  const [milestones, gates, tasks, canEdit, recentUpdates, risks, decisions, metrics, experiments] =
    await Promise.all([
    adapter.getMilestones(),
    adapter.getGates(),
    adapter.getTasks(),
    hasEditAccess(),
    listStatusUpdates(),
    adapter.getRisks(),
    adapter.getDecisions(),
    adapter.getMetricSnapshots(),
    adapter.getExperiments(),
  ]);

  const taskCodeById = Object.fromEntries(tasks.map((t) => [t.id, t.code]));

  const snapshot = buildReadoutSnapshot(
    milestones,
    gates,
    tasks,
    todayIso(),
    risks,
    decisions,
    metrics,
    experiments,
    taskCodeById,
  );

  return (
    <div className="mx-auto px-4 py-8 sm:px-6 print:py-4">
      <ReadoutView snapshot={snapshot} canEdit={canEdit} />

      {recentUpdates.length > 0 ? (
        <section className="mx-auto mt-12 max-w-3xl border-t border-neutral-200 pt-8 print:hidden">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-sm font-semibold text-neutral-800">Recent snapshots</h2>
            <Link href="/readout/history" className="text-xs font-medium text-neutral-500 hover:text-neutral-800">
              View all
            </Link>
          </div>
          <ul className="mt-3 space-y-2">
            {recentUpdates.slice(0, 3).map((u) => (
              <li key={u.id}>
                <Link
                  href={`/readout/history/${u.id}`}
                  className="flex items-center justify-between gap-3 rounded border border-neutral-200 px-3 py-2 text-sm hover:border-neutral-400"
                >
                  <span>{u.label ?? formatShortDate(u.snapshotDate)}</span>
                  <RagBadge level={u.overallRag} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
