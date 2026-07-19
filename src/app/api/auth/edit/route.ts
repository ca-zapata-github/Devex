import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { EDIT_SESSION_COOKIE, getEditToken } from "@/lib/auth/edit-access";

export async function POST(request: Request) {
  const expected = getEditToken();
  if (!expected) {
    return NextResponse.json(
      { error: "Edit access is not configured on this deployment." },
      { status: 503 },
    );
  }

  let body: { token?: string };
  try {
    body = (await request.json()) as { token?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (body.token !== expected) {
    return NextResponse.json({ error: "Invalid edit token." }, { status: 401 });
  }

  const jar = await cookies();
  jar.set(EDIT_SESSION_COOKIE, expected, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const jar = await cookies();
  jar.delete(EDIT_SESSION_COOKIE);
  return NextResponse.json({ ok: true });
}
