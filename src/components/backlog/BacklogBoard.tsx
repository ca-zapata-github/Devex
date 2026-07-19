"use client";

import { useMemo, useState } from "react";
import type { Epic, Gate, Phase, Task, WayTag } from "@/types/domain";
import type { InitiativeLeadCode } from "@/types/owners";
import { INITIATIVE_LEAD_CODES } from "@/types/owners";
import type { BacklogGroup, BacklogViewMode } from "@/lib/task-utils";
import { WAY_LABELS, phasesForTask } from "@/lib/task-utils";
import { TaskCard } from "@/components/backlog/TaskCard";

interface BacklogBoardProps {
  epics: Epic[];
  phases: Phase[];
  tasks: Task[];
  gates: Gate[];
}

const VIEW_MODES: { id: BacklogViewMode; label: string; hint?: string }[] = [
  { id: "epic", label: "By epic" },
  { id: "phase", label: "By phase" },
  { id: "way", label: "By Way", hint: "Flow / Feedback / Learning balance" },
  {
    id: "owner",
    label: "By owner",
    hint: "Capacity planning only — no completion-rate stats",
  },
];

function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => a.startDay - b.startDay || a.code.localeCompare(b.code));
}

function buildGroups(
  view: BacklogViewMode,
  filtered: Task[],
  epics: Epic[],
  phases: Phase[],
): BacklogGroup[] {
  const sorted = sortTasks(filtered);

  switch (view) {
    case "epic": {
      const epicMap = new Map(epics.map((e) => [e.id, e]));
      const byEpic = new Map<string, Task[]>();
      for (const task of sorted) {
        const list = byEpic.get(task.epicId) ?? [];
        list.push(task);
        byEpic.set(task.epicId, list);
      }
      return epics
        .filter((e) => byEpic.has(e.id))
        .map((epic) => ({
          id: epic.id,
          label: `${epic.code} · ${epic.name}`,
          subtitle: epic.description,
          tasks: byEpic.get(epic.id)!,
        }));
    }
    case "phase": {
      const byPhase = new Map<string, Task[]>();
      for (const phase of phases) {
        const phaseTasks = sorted.filter((t) => phasesForTask(t, phases).some((p) => p.id === phase.id));
        if (phaseTasks.length) byPhase.set(phase.id, phaseTasks);
      }
      return phases
        .filter((p) => byPhase.has(p.id))
        .map((phase) => ({
          id: phase.id,
          label: phase.name,
          subtitle: `${phase.start} – ${phase.end}`,
          tasks: byPhase.get(phase.id)!,
        }));
    }
    case "way": {
      const order: (WayTag | "none")[] = ["1W", "2W", "3W", "none"];
      const byWay = new Map<WayTag | "none", Task[]>();
      for (const task of sorted) {
        const key = task.way ?? "none";
        const list = byWay.get(key) ?? [];
        list.push(task);
        byWay.set(key, list);
      }
      return order
        .filter((k) => byWay.has(k))
        .map((key) => ({
          id: key,
          label: key === "none" ? "No Way tag" : WAY_LABELS[key],
          tasks: byWay.get(key)!,
        }));
    }
    case "owner": {
      const owners = [...new Set(sorted.map((t) => t.owner))].sort();
      return owners.map((owner) => ({
        id: owner,
        label: owner,
        subtitle: `${sorted.filter((t) => t.owner === owner).length} tasks`,
        tasks: sorted.filter((t) => t.owner === owner),
      }));
    }
  }
}

export function BacklogBoard({ epics, phases, tasks, gates }: BacklogBoardProps) {
  const [view, setView] = useState<BacklogViewMode>("epic");
  const [epicFilter, setEpicFilter] = useState("");
  const [phaseFilter, setPhaseFilter] = useState("");
  const [wayFilter, setWayFilter] = useState<WayTag | "">("");
  const [ownerFilter, setOwnerFilter] = useState<InitiativeLeadCode | "">("");

  const gatesById = useMemo(() => new Map(gates.map((g) => [g.id, g])), [gates]);

  const filtered = useMemo(() => {
    return tasks.filter((task) => {
      if (epicFilter && task.epicId !== epicFilter) return false;
      if (wayFilter && task.way !== wayFilter) return false;
      if (ownerFilter && task.owner !== ownerFilter) return false;
      if (phaseFilter) {
        const phase = phases.find((p) => p.id === phaseFilter);
        if (!phase || !phasesForTask(task, phases).some((p) => p.id === phase.id)) return false;
      }
      return true;
    });
  }, [tasks, epicFilter, phaseFilter, wayFilter, ownerFilter, phases]);

  const groups = useMemo(
    () => buildGroups(view, filtered, epics, phases),
    [view, filtered, epics, phases],
  );

  const wayCounts = useMemo(() => {
    const counts = { "1W": 0, "2W": 0, "3W": 0, none: 0 };
    for (const task of filtered) {
      if (task.way) counts[task.way]++;
      else counts.none++;
    }
    return counts;
  }, [filtered]);

  const activeView = VIEW_MODES.find((v) => v.id === view)!;

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Backlog board</h2>
          <p className="mt-1 text-sm text-neutral-500">
            {filtered.length} of {tasks.length} tasks · Epics E1–E10
          </p>
        </div>
        {view === "way" ? (
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-violet-200 bg-violet-50 px-2 py-1 font-medium text-violet-800">
              1W: {wayCounts["1W"]}
            </span>
            <span className="rounded-full border border-violet-200 bg-violet-50 px-2 py-1 font-medium text-violet-800">
              2W: {wayCounts["2W"]}
            </span>
            <span className="rounded-full border border-violet-200 bg-violet-50 px-2 py-1 font-medium text-violet-800">
              3W: {wayCounts["3W"]}
            </span>
            {wayCounts.none > 0 ? (
              <span className="rounded-full border border-neutral-200 bg-neutral-50 px-2 py-1 text-neutral-600">
                Untagged: {wayCounts.none}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        {VIEW_MODES.map((mode) => (
          <button
            key={mode.id}
            type="button"
            onClick={() => setView(mode.id)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              view === mode.id
                ? "border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900"
                : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-400"
            }`}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {activeView.hint ? (
        <p className="text-xs text-neutral-500">{activeView.hint}</p>
      ) : null}

      <div className="flex flex-wrap gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-900/40">
        <label className="flex flex-col gap-1 text-xs">
          <span className="font-medium text-neutral-600 dark:text-neutral-400">Epic</span>
          <select
            value={epicFilter}
            onChange={(e) => setEpicFilter(e.target.value)}
            className="rounded border border-neutral-200 bg-white px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-950"
          >
            <option value="">All epics</option>
            {epics.map((e) => (
              <option key={e.id} value={e.id}>
                {e.code}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span className="font-medium text-neutral-600 dark:text-neutral-400">Phase</span>
          <select
            value={phaseFilter}
            onChange={(e) => setPhaseFilter(e.target.value)}
            className="rounded border border-neutral-200 bg-white px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-950"
          >
            <option value="">All phases</option>
            {phases.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span className="font-medium text-neutral-600 dark:text-neutral-400">Way</span>
          <select
            value={wayFilter}
            onChange={(e) => setWayFilter(e.target.value as WayTag | "")}
            className="rounded border border-neutral-200 bg-white px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-950"
          >
            <option value="">All</option>
            <option value="1W">1W · Flow</option>
            <option value="2W">2W · Feedback</option>
            <option value="3W">3W · Learning</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span className="font-medium text-neutral-600 dark:text-neutral-400">Owner</span>
          <select
            value={ownerFilter}
            onChange={(e) => setOwnerFilter(e.target.value as InitiativeLeadCode | "")}
            className="rounded border border-neutral-200 bg-white px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-950"
          >
            <option value="">All owners</option>
            {INITIATIVE_LEAD_CODES.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="space-y-8">
        {groups.map((group) => (
          <div key={group.id}>
            <header className="mb-3 border-b border-neutral-200 pb-2 dark:border-neutral-800">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {group.label}
              </h3>
              {group.subtitle ? (
                <p className="mt-0.5 text-xs text-neutral-500">{group.subtitle}</p>
              ) : null}
              <p className="mt-1 text-xs text-neutral-400">{group.tasks.length} tasks</p>
            </header>
            <div className="grid gap-3 sm:grid-cols-2">
              {group.tasks.map((task) => (
                <TaskCard key={task.id} task={task} gatesById={gatesById} />
              ))}
            </div>
          </div>
        ))}
        {groups.length === 0 ? (
          <p className="rounded-lg border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500">
            No tasks match the current filters.
          </p>
        ) : null}
      </div>
    </section>
  );
}
