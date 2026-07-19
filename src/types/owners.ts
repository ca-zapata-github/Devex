/**
 * G1 guardrail: initiative-lead codes only — never individual developer identity.
 * Closed union of every owner literal in Docs/EXECUTION_PLAN.md §5.
 */
export const INITIATIVE_LEAD_CODES = [
  "CZ",
  "BS",
  "PL",
  "PLe",
  "TL",
  "Team",
  "Ravi",
  "BS+CZ",
  "CZ+BS",
  "CZ+Ravi",
  "Ravi+CZ",
  "PL+BS",
] as const;

export type InitiativeLeadCode = (typeof INITIATIVE_LEAD_CODES)[number];

export function isInitiativeLeadCode(value: string): value is InitiativeLeadCode {
  return (INITIATIVE_LEAD_CODES as readonly string[]).includes(value);
}

/** Normalize plan notation (e.g. Ravi-star/CZ, PL-star+BS) to a typed lead code. */
export function parseOwner(raw: string): {
  owner: InitiativeLeadCode;
  ownerIsAssumption: boolean;
} {
  const ownerIsAssumption = raw.includes("*");
  const normalized = raw
    .replace(/\*/g, "")
    .replace(/\//g, "+")
    .replace(/\s+/g, "");

  if (!isInitiativeLeadCode(normalized)) {
    throw new Error(`Invalid initiative lead owner: "${raw}" → "${normalized}"`);
  }

  return { owner: normalized, ownerIsAssumption };
}
