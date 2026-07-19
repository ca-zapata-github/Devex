import type { EnpsResult } from "@/types/survey";

interface EnpsCardProps {
  code: string;
  label: string;
  result: EnpsResult;
  compact?: boolean;
}

export function EnpsCard({ code, label, result, compact = false }: EnpsCardProps) {
  if (compact) {
    return (
      <div className="text-center">
        <p className="text-3xl font-bold tabular-nums text-neutral-900">
          {result.score ?? "—"}
        </p>
        <p className="mt-1 text-[10px] text-neutral-500">eNPS · n={result.n}</p>
      </div>
    );
  }

  return (
    <article className="rounded-lg border border-neutral-100 bg-white p-4">
      <p className="text-sm leading-snug text-neutral-800">
        <span className="font-mono text-xs font-semibold text-neutral-400">{code}</span> {label}
      </p>
      <div className="mt-4 flex items-end gap-6">
        <div>
          <p className="text-4xl font-bold tabular-nums text-neutral-900">
            {result.score ?? "—"}
          </p>
          <p className="mt-1 text-xs text-neutral-500">Tooling eNPS</p>
        </div>
        <dl className="grid grid-cols-3 gap-3 text-xs">
          <div>
            <dt className="text-neutral-400">Promoters</dt>
            <dd className="font-semibold tabular-nums">{result.promoters}</dd>
          </div>
          <div>
            <dt className="text-neutral-400">Passives</dt>
            <dd className="font-semibold tabular-nums">{result.passives}</dd>
          </div>
          <div>
            <dt className="text-neutral-400">Detractors</dt>
            <dd className="font-semibold tabular-nums">{result.detractors}</dd>
          </div>
        </dl>
      </div>
      <p className="mt-2 text-[10px] text-neutral-400">n={result.n}</p>
    </article>
  );
}
