import Link from "next/link";
import { notFound } from "next/navigation";

import { ReadoutView } from "@/components/readout/ReadoutView";
import { getStatusUpdate } from "@/lib/mutations/status-updates";
import { formatShortDate } from "@/lib/initiative-dates";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ReadoutHistoryDetailPage({ params }: PageProps) {
  const { id } = await params;
  const record = await getStatusUpdate(id);

  if (!record) notFound();

  const title =
    record.label ??
    `FTDS DevEx — ${formatShortDate(record.snapshotDate)}`;

  return (
    <div className="mx-auto px-4 py-8 sm:px-6 print:py-4">
      <p className="mx-auto mb-4 max-w-3xl print:hidden">
        <Link href="/readout/history" className="text-xs font-medium text-neutral-500 hover:text-neutral-800">
          ← Status history
        </Link>
      </p>
      <ReadoutView snapshot={record.snapshot} frozen title={title} />
    </div>
  );
}
