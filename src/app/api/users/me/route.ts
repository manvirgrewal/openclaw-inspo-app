import { NextRequest, NextResponse } from "next/server";

/**
 * Demo-mode /api/users/me
 * In demo mode this is a passthrough — the actual storage happens client-side.
 * The route exists so onboarding's fetch call doesn't 404, and for future Supabase migration.
 */

export async function GET() {
  // Client reads from localStorage directly in demo mode
  return NextResponse.json({ ok: true, demo: true });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  // In demo mode we just echo back — client handles localStorage persistence
  return NextResponse.json({ ok: true, demo: true, data: body });
}
