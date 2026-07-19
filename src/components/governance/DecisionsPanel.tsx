import type { Decision } from "@/types/governance";
import { formatShortDate } from "@/lib/initiative-dates";

interface DecisionsPanelProps {
  decisions: Decision[];
}

function sortDecisions(decisions: Decision[]): Decision[] {
  return [...decisions].sort((a, b) => {
    if (a.status !== b.status) return a.status === "open" ? -1 : 1;
    const aDec = a.code.startsWith("DEC");
    const bDec = b.code.startsWith("DEC");
    if (aDec !== bDec) return aDec ? -1 : 1;
    return a.code.localeCompare(b.code, undefined, { numeric: true });
  });
}

export function DecisionsPanel({ decisions }: DecisionsPanelProps) {
  const sorted = sortDecisions(decisions);
  const openCount = decisions.filter((d) => d.status === "open").length;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Decision log</h2>
        <p className="mt-1 text-sm text-neutral-500">
          DEC-1…DEC-4 (Phase A) + ratified D1–D11 · {openCount} open
        </p>
      </div>

      <div className="space-y-3">
        {sorted.map((d) => (
          <article
            key={d.id}
            className={`rounded-lg border p-4 ${
              d.status === "open" ?
                "border-amber-200 bg-amber-50/50"
              : d.locked ?
                "border-neutral-200 bg-neutral-50"
              : "border-neutral-200 bg-white dark:bg-neutral-950"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-neutral-600">{d.code}</span>
                {d.locked && d.status === "closed" ? (
                  <span title="Ratified — do not relitigate" aria-label="Locked decision">
                    🔒
                  </span>
                ) : null}
              </div>
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${
                  d.status === "open" ?
                    "border-amber-300 bg-amber-100 text-amber-900"
                  : "border-neutral-200 bg-neutral-100 text-neutral-600"
                }`}
              >
                {d.status}
              </span>
            </div>
            <p className="mt-2 text-sm font-medium leading-snug text-neutral-900 dark:text-neutral-100">
              {d.text}
            </p>
            {d.rationale ? (
              <p className="mt-2 text-xs leading-relaxed text-neutral-600">
                <span className="font-medium">Rationale: </span>
                {d.rationale}
              </p>
            ) : null}
            {d.status === "closed" && d.closedDate ? (
              <p className="mt-2 text-xs text-neutral-400">
                Closed {formatShortDate(d.closedDate)}
                {d.closedBy ? ` · ${d.closedBy}` : ""}
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
