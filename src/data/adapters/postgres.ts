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
