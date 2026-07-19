import type { InitiativeLeadCode } from "@/types/owners";

export type RiskStatus = "open" | "monitoring" | "closed";

export interface Risk {
  id: string;
  text: string;
  likelihood: string;
  impact?: string;
  owner: InitiativeLeadCode;
  mitigation: string;
  status: RiskStatus;
  /** ISO date — next review */
  reviewDate?: string;
}

export type DecisionStatus = "open" | "closed";

export interface Decision {
  id: string;
  code: string;
  text: string;
  status: DecisionStatus;
  closedDate?: string;
  closedBy?: InitiativeLeadCode;
  rationale?: string;
  /** G6 — closed ratified decisions (D1–D11) cannot be reopened in UI */
  locked: boolean;
}
