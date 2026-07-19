import type { Experiment } from "@/types/metrics";
import { ExperimentCard } from "@/components/metrics/ExperimentCard";

interface ExperimentsPanelProps {
  experiments: Experiment[];
  taskCodes?: Record<string, string>;
}

export function ExperimentsPanel({ experiments, taskCodes = {} }: ExperimentsPanelProps) {
  const running = experiments.filter((e) => e.status === "running").length;
  const measured = experiments.filter((e) => e.status === "measured").length;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Experiment cards</h2>
        <p className="mt-1 text-sm text-neutral-500">
          E6/E7 improvement wave · {running} running · {measured} measured · distributions only (G2)
        </p>
      </div>

      <div className="space-y-3">
        {experiments.map((exp) => (
          <ExperimentCard key={exp.id} experiment={exp} taskCode={taskCodes[exp.taskId]} />
        ))}
      </div>
    </section>
  );
}
