import type { Gate } from "@/types/domain";
import { GateEditForm } from "@/components/edit/GateEditForm";
import { formatShortDate, GATE_DEADLINE, todayIso } from "@/lib/initiative-dates";
import { ragClasses } from "@/lib/rag";

interface GatesPanelProps {
  gates: Gate[];
  dependentTaskCountByGate: Record<string, number>;
  canEdit?: boolean;
}

function gateStatusLabel(status: Gate["status"]): string {
  switch (status) {
    case "open":
      return "Open";
    case "answered":
      return "Answered";
    case "waived":
      return "Waived (gap plan)";
  }
}

function gateTileRag(gate: Gate, today: string): "green" | "amber" | "red" {
  if (gate.status === "answered") return "green";
  if (gate.status === "waived") return "amber";
  if (today > GATE_DEADLINE) return "red";
  return "amber";
}

export function GatesPanel({ gates, dependentTaskCountByGate, canEdit = false }: GatesPanelProps) {
  const today = todayIso();
  const pastDeadline = today > GATE_DEADLINE;
  const openPastDeadline = gates.filter((g) => g.status === "open" && pastDeadline);

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Instrumentation gates</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Phase 0 gates · must be answered by {formatShortDate(GATE_DEADLINE)} (M2)
        </p>
      </div>

      {openPastDeadline.length > 0 ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {openPastDeadline.length} gate(s) still open past the M2 deadline — surfaced as roadmap
          risk.
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        {gates.map((gate) => {
          const rag = gateTileRag(gate, today);
          const styles = ragClasses(rag);
          const dependents = dependentTaskCountByGate[gate.id] ?? 0;

          return (
            <article
              key={gate.id}
              className={`rounded-xl border-2 p-5 ${styles.border} bg-white dark:bg-neutral-950`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="font-mono text-xs font-bold uppercase tracking-wide text-neutral-500">
                  {gate.id}
                </p>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles.badge}`}
                >
                  {gateStatusLabel(gate.status)}
                </span>
              </div>

              <p className="mt-3 text-sm font-medium leading-relaxed text-neutral-900 dark:text-neutral-100">
                {gate.question}
              </p>

              <dl className="mt-4 space-y-2 text-xs">
                <div className="flex gap-2">
                  <dt className="font-medium text-neutral-500">Owner</dt>
                  <dd className="text-neutral-800 dark:text-neutral-200">{gate.owner}</dd>
                </div>
                {gate.status === "answered" && gate.answer ? (
                  <div>
                    <dt className="font-medium text-neutral-500">Answer</dt>
                    <dd className="mt-0.5 text-sm text-neutral-700 dark:text-neutral-300">
                      {gate.answer}
                    </dd>
                  </div>
                ) : null}
                {gate.status === "waived" && gate.gapPlan ? (
                  <div>
                    <dt className="font-medium text-neutral-500">Gap plan</dt>
                    <dd className="mt-0.5 text-sm text-neutral-700 dark:text-neutral-300">
                      {gate.gapPlan}
                    </dd>
                  </div>
                ) : null}
                {dependents > 0 ? (
                  <div className="flex items-center gap-1 text-amber-800">
                    <span aria-hidden>🔗</span>
                    <dd>{dependents} downstream task{dependents === 1 ? "" : "s"} depend on this gate</dd>
                  </div>
                ) : null}
              </dl>

              {gate.status === "open" && pastDeadline ? (
                <p className="mt-3 text-xs font-semibold text-red-700">
                  Overdue — open past {formatShortDate(GATE_DEADLINE)}
                </p>
              ) : null}

              {canEdit ? <GateEditForm gate={gate} /> : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
