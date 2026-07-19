import "server-only";

import { cookies } from "next/headers";

export const EDIT_SESSION_COOKIE = "devex_edit_session";

export function getEditToken(): string | undefined {
  return process.env.DEVEX_EDIT_TOKEN;
}

export function isEditAuthConfigured(): boolean {
  return Boolean(getEditToken());
}

export async function hasEditAccess(): Promise<boolean> {
  const expected = getEditToken();
  if (!expected) return false;
  const jar = await cookies();
  return jar.get(EDIT_SESSION_COOKIE)?.value === expected;
}

export async function requireEditAccess(): Promise<void> {
  if (!(await hasEditAccess())) {
    throw new Error("Unauthorized — lead edit access required.");
  }
}
