/**
 * Generates supabase/seed/devex_plan.sql from src/data/seed/plan.ts.
 * Run: npm run db:seed:generate
 */
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { planSeed } from "../src/data/seed/plan.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, "../supabase/seed/devex_plan.sql");

function esc(value) {
  return value.replace(/'/g, "''");
}

function jsonArr(values) {
  return `'${esc(JSON.stringify(values))}'::jsonb`;
}

const lines = [
  "-- devex_plan.sql — seed from Docs/EXECUTION_PLAN.md (generated; do not edit by hand)",
  "-- Regenerate: npm run db:seed:generate",
  "",
];

for (const p of planSeed.phases) {
  lines.push(
    `insert into devex.phases (id, name, start_date, end_date) values ('${esc(p.id)}', '${esc(p.name)}', '${p.start}', '${p.end}') on conflict (id) do nothing;`,
  );
}
lines.push("");

for (const m of planSeed.milestones) {
  lines.push(
    `insert into devex.milestones (id, name, milestone_date, day_number, status, exit_criteria, phase_id) values ('${esc(m.id)}', '${esc(m.name)}', '${m.date}', ${m.day}, '${m.status}', ${jsonArr(m.exitCriteria)}, '${esc(m.phaseId)}') on conflict (id) do nothing;`,
  );
}
lines.push("");

for (const e of planSeed.epics) {
  const desc = e.description ? `'${esc(e.description)}'` : "null";
  lines.push(
    `insert into devex.epics (id, code, name, description) values ('${esc(e.id)}', '${esc(e.code)}', '${esc(e.name)}', ${desc}) on conflict (id) do nothing;`,
  );
}
lines.push("");

for (const g of planSeed.gates) {
  lines.push(
    `insert into devex.gates (id, question, owner, status) values ('${esc(g.id)}', '${esc(g.question)}', '${g.owner}', '${g.status}') on conflict (id) do nothing;`,
  );
}
lines.push("");

for (const t of planSeed.tasks) {
  const way = t.way ? `'${t.way}'` : "null";
  const gateDep = t.gateDep ? `'${esc(t.gateDep)}'` : "null";
  lines.push(
    `insert into devex.tasks (id, epic_id, code, title, way, owner, owner_is_assumption, start_day, end_day, status, done_when, gate_dep) values ('${esc(t.id)}', '${esc(t.epicId)}', '${esc(t.code)}', '${esc(t.title)}', ${way}, '${t.owner}', ${t.ownerIsAssumption}, ${t.startDay}, ${t.endDay}, '${t.status}', '${esc(t.doneWhen)}', ${gateDep}) on conflict (id) do nothing;`,
  );
}

writeFileSync(outPath, lines.join("\n") + "\n", "utf8");
console.log(`Wrote ${outPath} (${planSeed.tasks.length} tasks)`);
