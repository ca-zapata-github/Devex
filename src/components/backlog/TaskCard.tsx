import type { Gate, Task } from "@/types/domain";
import {
  formatTaskWindow,
  taskStatusClasses,
  taskStatusLabel,
  WAY_LABELS,
} from "@/lib/task-utils";

interface TaskCardProps {
  task: Task;
  gatesById: Map<string, Gate>;
}

export function TaskCard({ task, gatesById }: TaskCardProps) {
  const gate = task.gateDep ? gatesById.get(task.gateDep) : undefined;
  const blockedMissingNote = task.status === "blocked" && !task.blockerNote;

  return (
    <article
      className={`rounded-lg border bg-white p-3 shadow-sm dark:bg-neutral-950 ${
        task.status === "blocked" ? "border-red-300 dark:border-red-800" : "border-neutral-200 dark:border-neutral-800"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-xs font-semibold text-neutral-500">{task.code}</p>
          <h3 className="mt-0.5 text-sm font-medium leading-snug text-neutral-900 dark:text-neutral-100">
            {task.title}
          </h3>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${taskStatusClasses(task.status)}`}
        >
          {taskStatusLabel(task.status)}
        </span>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-neutral-600 dark:text-neutral-400">
        <div>
          <dt className="sr-only">Owner</dt>
          <dd>
            <span className="font-medium text-neutral-800 dark:text-neutral-200">{task.owner}</span>
            {task.ownerIsAssumption ? (
              <span className="ml-1 text-neutral-400" title="Owner is an assumption">
                *
              </span>
            ) : null}
          </dd>
        </div>
        <div>
          <dt className="sr-only">Window</dt>
          <dd className="font-mono tabular-nums">{formatTaskWindow(task)}</dd>
        </div>
        {task.way ? (
          <div className="col-span-2">
            <dt className="sr-only">Way</dt>
            <dd>
              <span className="inline-flex rounded border border-violet-200 bg-violet-50 px-1.5 py-0.5 text-[10px] font-semibold text-violet-800">
                {WAY_LABELS[task.way]}
              </span>
            </dd>
          </div>
        ) : null}
      </dl>

      <p className="mt-2 text-xs leading-relaxed text-neutral-500">
        <span className="font-medium text-neutral-600 dark:text-neutral-400">Done when: </span>
        {task.doneWhen}
      </p>

      {task.status === "blocked" ? (
        <div className="mt-2 rounded border border-red-200 bg-red-50 px-2 py-1.5 text-xs text-red-800">
          {blockedMissingNote ? (
            <p className="font-medium">Blocker note required</p>
          ) : (
            <>
              <p className="font-medium">Blocked</p>
              <p className="mt-0.5">{task.blockerNote}</p>
            </>
          )}
        </div>
      ) : null}

      {gate ? (
        <p
          className="mt-2 flex items-center gap-1 text-xs text-amber-800"
          title={gate.question}
        >
          <span aria-hidden>🔗</span>
          <span>
            Gate: <span className="font-medium">{task.gateDep}</span>
          </span>
        </p>
      ) : null}
    </article>
  );
}
