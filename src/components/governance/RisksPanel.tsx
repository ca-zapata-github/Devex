import type { Risk } from "@/types/governance";
import { formatShortDate } from "@/lib/initiative-dates";

interface RisksPanelProps {
  risks: Risk[];
}

const STATUS_STYLES: Record<Risk["status"], string> = {
  open: "border-red-200 bg-red-50 text-red-800",
  monitoring: "border-amber-200 bg-amber-50 text-amber-900",
  closed: "border-neutral-200 bg-neutral-100 text-neutral-600",
};

export function RisksPanel({ risks }: RisksPanelProps) {
  const openCount = risks.filter((r) => r.status === "open").length;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Risk register</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Top risks from the execution plan · {openCount} open
        </p>
      </div>

      <div className="space-y-3">
        {risks.map((r) => (
          <article key={r.id} className="rounded-lg border border-neutral-200 bg-white p-4 dark:bg-neutral-950">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="text-sm font-medium leading-snug text-neutral-900 dark:text-neutral-100">
                {r.text}
              </p>
              <span
                className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${STATUS_STYLES[r.status]}`}
              >
                {r.status}
              </span>
            </div>
            <dl className="mt-3 grid gap-2 text-xs text-neutral-600 sm:grid-cols-2">
              <div>
                <dt className="font-medium text-neutral-500">Likelihood</dt>
                <dd>{r.likelihood}</dd>
              </div>
              <div>
                <dt className="font-medium text-neutral-500">Owner</dt>
                <dd>{r.owner}</dd>
              </div>
              {r.reviewDate ? (
                <div>
                  <dt className="font-medium text-neutral-500">Review</dt>
                  <dd>{formatShortDate(r.reviewDate)}</dd>
                </div>
              ) : null}
            </dl>
            <p className="mt-2 text-xs leading-relaxed text-neutral-600">
              <span className="font-medium">Mitigation: </span>
              {r.mitigation}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
