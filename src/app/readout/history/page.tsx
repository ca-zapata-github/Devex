import Link from "next/link";

import { RagBadge } from "@/components/ui/RagBadge";
import { listStatusUpdates } from "@/lib/mutations/status-updates";
import { formatShortDate } from "@/lib/initiative-dates";

export const dynamic = "force-dynamic";

export default async function ReadoutHistoryPage() {
  const updates = await listStatusUpdates();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <header className="mb-8 border-b border-neutral-200 pb-6">
        <Link href="/readout" className="text-xs font-medium text-neutral-500 hover:text-neutral-800">
          ← Live readout
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Status history</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Frozen snapshots from each biweekly send — auditable, read-only.
        </p>
      </header>

      {updates.length === 0 ? (
        <p className="rounded-lg border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500">
          No snapshots saved yet. Open the live readout and use &quot;Save snapshot&quot; after sign-in.
        </p>
      ) : (
        <ul className="space-y-3">
          {updates.map((u) => (
            <li key={u.id}>
              <Link
                href={`/readout/history/${u.id}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-white p-4 transition-colors hover:border-neutral-400 dark:bg-neutral-950"
              >
                <div>
                  <p className="font-medium text-neutral-900 dark:text-neutral-100">
                    {u.label ?? `Snapshot · ${formatShortDate(u.snapshotDate)}`}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    Saved {new Date(u.generatedAt).toLocaleString()}
                  </p>
                </div>
                <RagBadge level={u.overallRag} label={u.overallRagLabel} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
