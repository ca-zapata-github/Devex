import "server-only";

import type { DataAdapter } from "@/data/adapter";
import type {
  Epic,
  Gate,
  Milestone,
  Phase,
  Task,
  TaskFilters,
  TaskStatus,
  WayTag,
} from "@/types/domain";
import type { Decision, Risk } from "@/types/governance";
import type { Experiment, ExperimentStatus, MetricSnapshot } from "@/types/metrics";
import { governanceSeed } from "@/data/seed/governance";
import { metricsSeed } from "@/data/seed/metrics";
import type { InitiativeLeadCode } from "@/types/owners";
import { devexSchema } from "@/lib/env";

type PgClient = {
  query<T = Record<string, unknown>>(
    text: string,
    values?: unknown[],
  ): Promise<{ rows: T[] }>;
  end(): Promise<void>;
};

async function createPgClient(): Promise<PgClient> {
  const password = process.env.SUPABASE_DB_PASSWORD;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!password || !url) {
    throw new Error("SUPABASE_DB_PASSWORD and NEXT_PUBLIC_SUPABASE_URL required for Postgres adapter");
  }
  const ref = url.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  if (!ref) throw new Error("Invalid NEXT_PUBLIC_SUPABASE_URL");

  const pg = await import("pg");
  const client = new pg.default.Client({
    connectionString: `postgresql://postgres:${encodeURIComponent(password)}@db.${ref}.supabase.co:5432/postgres`,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  return client;
}

function mapPhase(row: Record<string, unknown>): Phase {
  return {
    id: row.id as string,
    name: row.name as string,
    start: String(row.start_date).slice(0, 10),
    end: String(row.end_date).slice(0, 10),
  };
}

function mapMilestone(row: Record<string, unknown>): Milestone {
  return {
    id: row.id as string,
    name: row.name as string,
    date: String(row.milestone_date).slice(0, 10),
    day: row.day_number as number,
    status: row.status as Milestone["status"],
    exitCriteria: row.exit_criteria as string[],
    phaseId: row.phase_id as string,
  };
}

function mapEpic(row: Record<string, unknown>): Epic {
  return {
    id: row.id as string,
    code: row.code as string,
    name: row.name as string,
    description: (row.description as string | null) ?? undefined,
  };
}

function mapTask(row: Record<string, unknown>): Task {
  return {
    id: row.id as string,
    epicId: row.epic_id as string,
    code: row.code as string,
    title: row.title as string,
    way: (row.way as WayTag | null) ?? undefined,
    owner: row.owner as InitiativeLeadCode,
    ownerIsAssumption: row.owner_is_assumption as boolean,
    startDay: row.start_day as number,
    endDay: row.end_day as number,
    status: row.status as TaskStatus,
    doneWhen: row.done_when as string,
    blockerNote: (row.blocker_note as string | null) ?? undefined,
    gateDep: (row.gate_dep as string | null) ?? undefined,
  };
}

function mapGate(row: Record<string, unknown>): Gate {
  return {
    id: row.id as string,
    question: row.question as string,
    owner: row.owner as InitiativeLeadCode,
    status: row.status as Gate["status"],
    answer: (row.answer as string | null) ?? undefined,
    gapPlan: (row.gap_plan as string | null) ?? undefined,
  };
}

/** Direct Postgres reads — bypasses PostgREST when devex schema is not yet exposed on the Data API. */
export class PostgresAdapter implements DataAdapter {
  private clientPromise = createPgClient();

  private async db() {
    return this.clientPromise;
  }

  async getPhases() {
    const client = await this.db();
    const { rows } = await client.query(
      `select id, name, start_date, end_date from ${devexSchema}.phases order by start_date`,
    );
    return rows.map(mapPhase);
  }

  async getMilestones() {
    const client = await this.db();
    const { rows } = await client.query(
      `select id, name, milestone_date, day_number, status, exit_criteria, phase_id from ${devexSchema}.milestones order by day_number`,
    );
    return rows.map(mapMilestone);
  }

  async getEpics() {
    const client = await this.db();
    const { rows } = await client.query(
      `select id, code, name, description from ${devexSchema}.epics order by code`,
    );
    return rows.map(mapEpic);
  }

  async getTasks(filters?: TaskFilters) {
    const client = await this.db();
    const clauses: string[] = [];
    const values: unknown[] = [];

    if (filters?.epicId) {
      values.push(filters.epicId);
      clauses.push(`epic_id = $${values.length}`);
    }
    if (filters?.way) {
      values.push(filters.way);
      clauses.push(`way = $${values.length}`);
    }
    if (filters?.owner) {
      values.push(filters.owner);
      clauses.push(`owner = $${values.length}`);
    }
    if (filters?.status) {
      values.push(filters.status);
      clauses.push(`status = $${values.length}`);
    }

    const where = clauses.length ? `where ${clauses.join(" and ")}` : "";
    const { rows } = await client.query(
      `select id, epic_id, code, title, way, owner, owner_is_assumption, start_day, end_day, status, done_when, blocker_note, gate_dep from ${devexSchema}.tasks ${where} order by code`,
      values,
    );
    let tasks = rows.map(mapTask);

    if (filters?.phaseId) {
      const phases = await this.getPhases();
      const phase = phases.find((p) => p.id === filters.phaseId);
      if (phase) {
        const start = daysSinceInitiativeStart(phase.start);
        const end = daysSinceInitiativeStart(phase.end);
        tasks = tasks.filter((t) => t.startDay <= end && t.endDay >= start);
      } else {
        tasks = [];
      }
    }

    return tasks;
  }

  async getGates() {
    const client = await this.db();
    const { rows } = await client.query(
      `select id, question, owner, status, answer, gap_plan from ${devexSchema}.gates order by id`,
    );
    return rows.map(mapGate);
  }

  async getRisks() {
    try {
      const client = await this.db();
      const { rows } = await client.query(
        `select id, text, likelihood, impact, owner, mitigation, status, review_date from ${devexSchema}.risks order by id`,
      );
      return rows.map(mapRisk);
    } catch {
      return governanceSeed.risks;
    }
  }

  async getDecisions() {
    try {
      const client = await this.db();
      const { rows } = await client.query(
        `select id, code, text, status, closed_date, closed_by, rationale, locked from ${devexSchema}.decisions order by code`,
      );
      return rows.map(mapDecision);
    } catch {
      return governanceSeed.decisions;
    }
  }

  async getExperiments() {
    try {
      const client = await this.db();
      const { rows } = await client.query(
        `select id, task_id, hypothesis, metric, stage, start_tag, end_tag, status,
                pre_median, pre_spread, pre_n, post_median, post_spread, post_n, confounds
         from ${devexSchema}.experiments order by start_tag`,
      );
      return rows.map(mapExperiment);
    } catch {
      return metricsSeed.experiments;
    }
  }

  async getMetricSnapshots() {
    try {
      const client = await this.db();
      const { rows } = await client.query(
        `select metric_key, snapshot_date, headline_value, baseline_status, direction
         from ${devexSchema}.metric_snapshots order by metric_key`,
      );
      return rows.map(mapMetricSnapshot);
    } catch {
      return metricsSeed.metricSnapshots;
    }
  }
}

function mapRisk(row: Record<string, unknown>): Risk {
  return {
    id: row.id as string,
    text: row.text as string,
    likelihood: row.likelihood as string,
    impact: (row.impact as string | null) ?? undefined,
    owner: row.owner as Risk["owner"],
    mitigation: row.mitigation as string,
    status: row.status as Risk["status"],
    reviewDate: row.review_date ? String(row.review_date).slice(0, 10) : undefined,
  };
}

function mapDecision(row: Record<string, unknown>): Decision {
  return {
    id: row.id as string,
    code: row.code as string,
    text: row.text as string,
    status: row.status as Decision["status"],
    closedDate: row.closed_date ? String(row.closed_date).slice(0, 10) : undefined,
    closedBy: (row.closed_by as Decision["closedBy"]) ?? undefined,
    rationale: (row.rationale as string | null) ?? undefined,
    locked: row.locked as boolean,
  };
}

function mapExperiment(row: Record<string, unknown>): Experiment {
  const preMedian = row.pre_median as number | null;
  const preSpread = row.pre_spread as number | null;
  const preN = row.pre_n as number | null;
  const postMedian = row.post_median as number | null;
  const postSpread = row.post_spread as number | null;
  const postN = row.post_n as number | null;

  return {
    id: row.id as string,
    taskId: row.task_id as string,
    hypothesis: row.hypothesis as string,
    metric: row.metric as string,
    stage: row.stage as string,
    startTag: String(row.start_tag).slice(0, 10),
    endTag: row.end_tag ? String(row.end_tag).slice(0, 10) : undefined,
    status: row.status as ExperimentStatus,
    pre:
      preMedian != null && preSpread != null && preN != null
        ? { median: preMedian, spread: preSpread, n: preN }
        : undefined,
    post:
      postMedian != null && postSpread != null && postN != null
        ? { median: postMedian, spread: postSpread, n: postN }
        : undefined,
    confounds: (row.confounds as string[]) ?? [],
  };
}

function mapMetricSnapshot(row: Record<string, unknown>): MetricSnapshot {
  return {
    metricKey: row.metric_key as MetricSnapshot["metricKey"],
    date: String(row.snapshot_date).slice(0, 10),
    headlineValue: (row.headline_value as string | null) ?? undefined,
    baselineStatus: row.baseline_status as MetricSnapshot["baselineStatus"],
    direction: row.direction as MetricSnapshot["direction"],
  };
}

function daysSinceInitiativeStart(isoDate: string): number {
  const start = Date.UTC(2026, 6, 20);
  const [y, m, d] = isoDate.split("-").map(Number);
  const target = Date.UTC(y, m - 1, d);
  return Math.round((target - start) / 86_400_000);
}

export function hasPostgresConfig(): boolean {
  return Boolean(process.env.SUPABASE_DB_PASSWORD && process.env.NEXT_PUBLIC_SUPABASE_URL);
}
