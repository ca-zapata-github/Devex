import type { DataAdapter } from "@/data/adapter";
import { InMemoryAdapter } from "@/data/adapters/memory";
import { hasPostgresConfig, PostgresAdapter } from "@/data/adapters/postgres";
import { SupabaseAdapter } from "@/data/adapters/supabase";
import { getDataSource } from "@/lib/env";

export type DataSourceKind = "supabase" | "postgres" | "memory";

async function probe(adapter: DataAdapter): Promise<void> {
  await adapter.getPhases();
}

/** Resolves the best available adapter: PostgREST → direct Postgres → in-memory. */
export async function resolveDataAdapter(): Promise<{
  adapter: DataAdapter;
  source: DataSourceKind;
  note?: string;
}> {
  if (getDataSource() === "memory") {
    return { adapter: new InMemoryAdapter(), source: "memory" };
  }

  try {
    const supabase = new SupabaseAdapter();
    await probe(supabase);
    return { adapter: supabase, source: "supabase" };
  } catch (supabaseErr) {
    const message = supabaseErr instanceof Error ? supabaseErr.message : String(supabaseErr);

    if (hasPostgresConfig()) {
      try {
        const postgres = new PostgresAdapter();
        await probe(postgres);
        return {
          adapter: postgres,
          source: "postgres",
          note:
            message.includes("Invalid schema") ?
              "PostgREST has not reloaded devex yet — using direct Postgres. Click Save on Data API → Exposed schemas, wait ~60s, then refresh."
            : message,
        };
      } catch (pgErr) {
        const pgMessage = pgErr instanceof Error ? pgErr.message : String(pgErr);
        return {
          adapter: new InMemoryAdapter(),
          source: "memory",
          note: `${message} Direct Postgres also unavailable (${pgMessage}). In Supabase Dashboard → Data API → Settings: confirm devex is checked and click Save, then wait ~60s and run npm run db:test:devex.`,
        };
      }
    }

    return {
      adapter: new InMemoryAdapter(),
      source: "memory",
      note: message.includes("Invalid schema") ?
        `${message} Dashboard may show devex selected, but PostgREST still serves only public/flowboard until you click Save and it reloads (~60s). Run: npm run db:test:devex`
      : message,
    };
  }
}

export { planSeed } from "@/data/seed/plan";
