import type { Gate, Milestone, Phase } from "@/types/domain";
import { MilestoneEditForm } from "@/components/edit/MilestoneEditForm";
import {
  BASELINE_WINDOW,
  formatShortDate,
  INITIATIVE_END,
  INITIATIVE_START,
  timelinePercent,
  todayIso,
} from "@/lib/initiative-dates";
import {
  deriveInitiativeRag,
  effectiveMilestoneStatus,
  hasOpenGatesPastDeadline,
  milestoneToRag,
  ragClasses,
} from "@/lib/rag";
import { RagBadge } from "@/components/ui/RagBadge";

interface RoadmapTimelineProps {
  phases: Phase[];
  milestones: Milestone[];
  gates: Gate[];
  canEdit?: boolean;
}

const PHASE_COLORS = [
  "bg-sky-100 border-sky-200 text-sky-900",
  "bg-violet-100 border-violet-200 text-violet-900",
  "bg-teal-100 border-teal-200 text-teal-900",
];

export function RoadmapTimeline({ phases, milestones, gates, canEdit = false }: RoadmapTimelineProps) {
  const today = todayIso();
  const overallRag = deriveInitiativeRag(milestones, gates, today);
  const todayPct = timelinePercent(today);
  const showToday = today >= INITIATIVE_START && today <= INITIATIVE_END;
  const baselineStartPct = timelinePercent(BASELINE_WINDOW.start);
  const baselineEndPct = timelinePercent(BASELINE_WINDOW.end);
  const gateRisk = hasOpenGatesPastDeadline(gates, today);

  const sortedMilestones = [...milestones].sort((a, b) => a.day - b.day);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">90-day roadmap</h2>
          <p className="mt-1 text-sm text-neutral-500">
            {formatShortDate(INITIATIVE_START)} – {formatShortDate(INITIATIVE_END)}
          </p>
        </div>
        <RagBadge level={overallRag} label={`Initiative · ${overallRag === "green" ? "On track" : overallRag === "amber" ? "At risk" : "Needs attention"}`} />
      </div>

      {gateRisk ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          Risk: instrumentation gate(s) still open past {formatShortDate("2026-08-07")} (M2 deadline).
        </p>
      ) : null}

      {/* Phase swim-bands */}
      <div className="relative h-14 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
        {phases.map((phase, i) => {
          const left = timelinePercent(phase.start);
          const right = 100 - timelinePercent(phase.end);
          return (
            <div
              key={phase.id}
              className={`absolute inset-y-0 border-r px-2 py-1 text-[10px] font-medium leading-tight sm:text-xs ${PHASE_COLORS[i % PHASE_COLORS.length]}`}
              style={{ left: `${left}%`, right: `${right}%` }}
              title={`${phase.name}: ${phase.start} – ${phase.end}`}
            >
              <span className="line-clamp-2">{phase.name}</span>
            </div>
          );
        })}
        {showToday ? (
          <div
            className="pointer-events-none absolute inset-y-0 z-10 w-0.5 bg-neutral-900"
            style={{ left: `${todayPct}%` }}
            aria-hidden
          />
        ) : null}
      </div>

      {/* Baseline window track */}
      <div>
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-500">
          Baseline window
        </p>
        <div className="relative h-6 overflow-hidden rounded-md border border-neutral-200 bg-neutral-100">
          <div
            className="absolute inset-y-0 rounded-sm bg-indigo-200/80 border border-indigo-300"
            style={{
              left: `${baselineStartPct}%`,
              width: `${baselineEndPct - baselineStartPct}%`,
            }}
            title={`Baseline collection ${BASELINE_WINDOW.start} – ${BASELINE_WINDOW.end}`}
          />
          <span
            className="absolute inset-y-0 flex items-center text-[10px] font-medium text-indigo-900"
            style={{ left: `${baselineStartPct + 1}%` }}
          >
            Aug 3 – Sep 27
          </span>
        </div>
      </div>

      {/* Milestones track */}
      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-neutral-500">
          Milestones M1–M6
        </p>
        <div className="relative border-t border-neutral-300 pt-8 pb-4">
          <div className="absolute left-0 right-0 top-0 h-px bg-neutral-300" aria-hidden />
          {showToday ? (
            <div
              className="absolute top-0 z-10 -translate-x-1/2"
              style={{ left: `${todayPct}%` }}
            >
              <div className="h-full w-0.5 bg-neutral-900" style={{ height: "120px" }} />
              <span className="mt-1 block whitespace-nowrap text-[10px] font-semibold text-neutral-700">
                Today
              </span>
            </div>
          ) : null}

          {sortedMilestones.map((m) => {
            const effective = effectiveMilestoneStatus(m, today);
            const rag = milestoneToRag(effective);
            const styles = ragClasses(rag);
            const pct = timelinePercent(m.date);
            const code = `M${m.id.slice(1)}`;

            return (
              <details
                key={m.id}
                className="group absolute top-0 -translate-x-1/2"
                style={{ left: `${pct}%` }}
              >
                <summary className="flex cursor-pointer list-none flex-col items-center [&::-webkit-details-marker]:hidden">
                  <span
                    className={`block h-4 w-4 rotate-45 border-2 ${styles.border} ${styles.dot}`}
                    title={`${code}: ${m.name}`}
                  />
                  <span className="mt-2 text-[10px] font-bold sm:text-xs">{code}</span>
                  <span className="mt-0.5 max-w-[4.5rem] text-center text-[9px] leading-tight text-neutral-500 sm:max-w-none sm:text-[10px]">
                    {formatShortDate(m.date)}
                  </span>
                </summary>
                <div className="absolute left-1/2 top-full z-20 mt-2 w-64 -translate-x-1/2 rounded-lg border border-neutral-200 bg-white p-3 text-sm shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
                  <p className="font-semibold">{m.name}</p>
                  <p className="mt-1 text-xs text-neutral-500">
                    Day {m.day} · {formatShortDate(m.date)}
                  </p>
                  <div className="mt-2">
                    <RagBadge level={rag} />
                  </div>
                  <p className="mt-3 text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    Exit criteria
                  </p>
                  <ul className="mt-1 list-inside list-disc space-y-0.5 text-xs text-neutral-600 dark:text-neutral-400">
                    {m.exitCriteria.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                  {canEdit ? <MilestoneEditForm milestone={m} /> : null}
                </div>
              </details>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between text-[10px] text-neutral-400 sm:text-xs">
        <span>{formatShortDate(INITIATIVE_START)}</span>
        <span>{formatShortDate(INITIATIVE_END)}</span>
      </div>
    </section>
  );
}
