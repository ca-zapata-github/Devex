import { DecisionsPanel } from "@/components/governance/DecisionsPanel";
import { RisksPanel } from "@/components/governance/RisksPanel";
import { resolveDataAdapter } from "@/data/index";

export const dynamic = "force-dynamic";

export default async function RisksPage() {
  const { adapter, source } = await resolveDataAdapter();
  const [risks, decisions] = await Promise.all([
    adapter.getRisks(),
    adapter.getDecisions(),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <header className="mb-8 border-b border-neutral-200 pb-6 dark:border-neutral-800">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          FTDS DevEx Command Center
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Risks &amp; decisions · Source: {source}
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-2">
        <RisksPanel risks={risks} />
        <DecisionsPanel decisions={decisions} />
      </div>
    </div>
  );
}
