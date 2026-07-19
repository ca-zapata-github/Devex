import type { RagLevel } from "@/lib/rag";
import { ragClasses, ragLabel } from "@/lib/rag";

interface RagBadgeProps {
  level: RagLevel;
  label?: string;
}

export function RagBadge({ level, label }: RagBadgeProps) {
  const styles = ragClasses(level);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles.badge}`}
    >
      <span className={`h-2 w-2 rounded-full ${styles.dot}`} aria-hidden />
      {label ?? ragLabel(level)}
    </span>
  );
}
