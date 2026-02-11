import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "./server";

/**
 * Get a Supabase client for API routes, returning a 503 response if not configured.
 */
export async function getSupabaseOrError() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return {
      supabase: null as never,
      error: NextResponse.json(
        { error: { code: "SERVICE_UNAVAILABLE", message: "Database not configured" } },
        { status: 503 },
      ),
    };
  }
  return { supabase, error: null };
}
