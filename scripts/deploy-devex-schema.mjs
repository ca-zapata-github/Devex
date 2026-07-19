/**
 * Deploy DevEx schema + seed to the shared Supabase project (AgileRadar).
 *
 * Runs ONLY devex migrations — never touches AgileRadar's public schema.
 *
 * Credentials (one of) in .env.local:
 *   SUPABASE_ACCESS_TOKEN  — Management API (recommended)
 *   SUPABASE_DB_PASSWORD   — direct Postgres fallback
 *
 * After first deploy, add `devex` to exposed schemas:
 *   Supabase Dashboard → Project Settings → API → Exposed schemas → add devex
 *
 * Usage: npm run db:deploy:devex
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const SQL_FILES = [
  "supabase/migrations/0001_devex_schema.sql",
  "supabase/seed/devex_plan.sql",
];

function loadEnvLocal() {
  const path = join(root, ".env.local");
  if (!existsSync(path)) return {};
  const env = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return env;
}

function projectRefFromUrl(url) {
  const m = url.match(/https:\/\/([^.]+)\.supabase\.co/);
  if (!m) throw new Error(`Invalid NEXT_PUBLIC_SUPABASE_URL: ${url}`);
  return m[1];
}

async function deployViaManagementApi(ref, token) {
  console.log(`Deploying devex schema via Management API to project ${ref}...`);
  console.log("(AgileRadar public schema will NOT be modified.)\n");

  for (const rel of SQL_FILES) {
    const sql = readFileSync(join(root, rel), "utf8");
    console.log(`▶ Running ${rel}...`);

    const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sql }),
    });

    const body = await res.text();
    if (!res.ok) {
      throw new Error(`${rel} failed (${res.status}): ${body.slice(0, 500)}`);
    }
    console.log(`  ✓ ${rel}`);
  }
}

async function deployViaPostgres(ref, password, databaseUrl) {
  const connectionString =
    databaseUrl ??
    `postgresql://postgres:${encodeURIComponent(password)}@db.${ref}.supabase.co:5432/postgres`;

  console.log(`Deploying devex schema via Postgres to project ${ref}...`);
  console.log("(AgileRadar public schema will NOT be modified.)\n");

  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  try {
    for (const rel of SQL_FILES) {
      const sql = readFileSync(join(root, rel), "utf8");
      console.log(`▶ Running ${rel}...`);
      await client.query(sql);
      console.log(`  ✓ ${rel}`);
    }
  } finally {
    await client.end();
  }
}

async function exposeDevexSchema(ref, token) {
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  console.log("\n▶ Exposing `devex` on the Data API...");
  const getRes = await fetch(`https://api.supabase.com/v1/projects/${ref}/postgrest`, { headers });
  const getBody = await getRes.text();
  if (!getRes.ok) {
    console.warn(`⚠️  Could not read PostgREST config (${getRes.status}). Expose manually in dashboard.`);
    return;
  }

  const current = JSON.parse(getBody);
  const schemas = (current.db_schema ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (schemas.includes("devex")) {
    console.log("   ✓ devex already exposed");
    return;
  }

  const patchRes = await fetch(`https://api.supabase.com/v1/projects/${ref}/postgrest`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ db_schema: [...schemas, "devex"].join(",") }),
  });

  if (!patchRes.ok) {
    const body = await patchRes.text();
    console.warn(`⚠️  Could not expose devex (${patchRes.status}): ${body.slice(0, 200)}`);
    console.warn("   Manual step: Dashboard → Data API → Exposed schemas → add devex");
    return;
  }

  console.log("   ✓ devex exposed (PostgREST reloads in ~30s)");
}

async function main() {
  const env = { ...process.env, ...loadEnvLocal() };
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const accessToken = env.SUPABASE_ACCESS_TOKEN;
  const password = env.SUPABASE_DB_PASSWORD;

  if (!url) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL in .env.local");
    process.exit(1);
  }

  const ref = projectRefFromUrl(url);

  if (accessToken) {
    await deployViaManagementApi(ref, accessToken);
    await exposeDevexSchema(ref, accessToken);
  } else if (password || env.DATABASE_URL) {
    await deployViaPostgres(ref, password, env.DATABASE_URL);
    console.log("\n⚠️  Add SUPABASE_ACCESS_TOKEN to auto-expose devex, or expose manually:");
    console.log("   Dashboard → Data API → Exposed schemas → add `devex`");
  } else {
    console.error(
      "Missing credentials. Add ONE of these to .env.local:\n\n" +
        "  SUPABASE_ACCESS_TOKEN=...  (https://supabase.com/dashboard/account/tokens)\n" +
        "  SUPABASE_DB_PASSWORD=...    (Dashboard → Project Settings → Database)\n",
    );
    process.exit(1);
  }

  console.log("\n✅ DevEx schema deploy complete.");
  console.log("   Verify: npm run db:test:devex");
}

main().catch((err) => {
  console.error("\n❌ Deploy failed:", err.message);
  process.exit(1);
});
