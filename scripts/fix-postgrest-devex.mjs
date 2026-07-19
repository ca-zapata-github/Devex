/**
 * Fix PGRST106 — authenticator role stuck on old schema list.
 * Runs 0002_expose_devex_postgrest.sql via Management API, then verifies devex.
 *
 * Usage: npm run db:fix:postgrest
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

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

async function runSql(ref, token, sql, label) {
  console.log(`▶ ${label}...`);
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`${label} failed (${res.status}): ${body.slice(0, 500)}`);
  console.log(`  ✓ ${label}`);
}

async function probe(url, anonKey) {
  const res = await fetch(`${url}/rest/v1/phases?select=id&limit=1`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      "Accept-Profile": "devex",
    },
  });
  return { ok: res.ok, status: res.status, body: await res.text() };
}

async function main() {
  const env = { ...process.env, ...loadEnvLocal() };
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const token = env.SUPABASE_ACCESS_TOKEN;
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !token || !anonKey) {
    console.error("Need NEXT_PUBLIC_SUPABASE_URL, SUPABASE_ACCESS_TOKEN, NEXT_PUBLIC_SUPABASE_ANON_KEY");
    process.exit(1);
  }

  const ref = projectRefFromUrl(url);
  const before = await probe(url, anonKey);
  if (before.ok) {
    console.log("✅ devex already live on Data API — no fix needed.");
    return;
  }

  const hint = before.body.match(/Only the following schemas are exposed: ([^"]+)/);
  console.log(`Before: runtime schemas = ${hint?.[1] ?? "unknown"}`);

  const sql = readFileSync(
    join(root, "supabase/migrations/0002_expose_devex_postgrest.sql"),
    "utf8",
  );
  await runSql(ref, token, sql, "Sync authenticator pgrst.db_schemas + reload PostgREST");

  console.log("Waiting for PostgREST reload...");
  for (let i = 0; i < 8; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    const after = await probe(url, anonKey);
    if (after.ok) {
      console.log("\n✅ devex is now live. Run: npm run db:test:devex");
      return;
    }
    process.stdout.write(".");
  }

  console.log("\n\nStill failing. Response:", before.body.slice(0, 200));
  process.exit(1);
}

main().catch((err) => {
  console.error("\n❌ Fix failed:", err.message);
  process.exit(1);
});
