import type { Experiment } from "@/types/metrics";
import { DistributionCompare } from "@/components/metrics/DistributionBar";
import { formatShortDate } from "@/lib/initiative-dates";

interface ExperimentCardProps {
  experiment: Experiment;
  taskCode?: string;
}

const STATUS_STYLES: Record<Experiment["status"], string> = {
  planned: "border-neutral-200 bg-neutral-50 text-neutral-600",
  running: "border-sky-200 bg-sky-50 text-sky-800",
  measured: "border-emerald-200 bg-emerald-50 text-emerald-800",
  inconclusive: "border-amber-200 bg-amber-50 text-amber-900",
};

export function ExperimentCard({ experiment, taskCode }: ExperimentCardProps) {
  const code = taskCode ?? experiment.taskId.replace(/^e(\d)-(\d)$/, "E$1.$2");

  return (
    <article className="rounded-lg border border-neutral-200 bg-white p-4 dark:bg-neutral-950">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-mono text-xs font-bold text-neutral-500">{code}</p>
          <p className="mt-1 text-sm font-medium leading-snug text-neutral-900 dark:text-neutral-100">
            {experiment.hypothesis}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${STATUS_STYLES[experiment.status]}`}
        >
          {experiment.status}
        </span>
      </div>

      <dl className="mt-3 grid gap-2 text-xs text-neutral-600 sm:grid-cols-2">
        <div>
          <dt className="font-medium text-neutral-500">Metric</dt>
          <dd>{experiment.metric}</dd>
        </div>
        <div>
          <dt className="font-medium text-neutral-500">Journey stage</dt>
          <dd>{experiment.stage}</dd>
        </div>
        <div>
          <dt className="font-medium text-neutral-500">Start tag</dt>
          <dd>{formatShortDate(experiment.startTag)}</dd>
        </div>
        {experiment.endTag ? (
          <div>
            <dt className="font-medium text-neutral-500">End tag</dt>
            <dd>{formatShortDate(experiment.endTag)}</dd>
          </div>
        ) : null}
      </dl>

      {experiment.pre || experiment.post ? (
        <div className="mt-4 rounded-md border border-neutral-100 bg-neutral-50 p-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
            Pre / post distribution
          </p>
          {experiment.pre ? (
            <DistributionCompare pre={experiment.pre} post={experiment.post} unit="%" />
          ) : (
            <p className="text-xs text-neutral-400 italic">Pre baseline not recorded yet</p>
          )}
        </div>
      ) : null}

      {experiment.confounds.length > 0 ? (
        <div className="mt-3 rounded border border-amber-100 bg-amber-50/50 px-2 py-1.5">
          <p className="text-[10px] font-semibold uppercase text-amber-800">Confound log</p>
          <ul className="mt-1 list-inside list-disc text-xs text-amber-900">
            {experiment.confounds.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );
}
