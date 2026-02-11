import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseOrError } from "@/lib/supabase/guard";

const searchSchema = z.object({
  q: z.string().min(1).max(200),
  limit: z.coerce.number().min(1).max(50).default(20),
  cursor: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const raw = Object.fromEntries(request.nextUrl.searchParams);
    const parsed = searchSchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } },
        { status: 400 },
      );
    }

    const { q, limit, cursor } = parsed.data;
    const { supabase, error: dbError } = await getSupabaseOrError();
    if (dbError) return dbError;

    let query = supabase
      .from("ideas")
      .select("*, author:profiles!author_id(id, username, display_name, avatar_url)")
      .eq("status", "published")
      .textSearch("title", q, { type: "websearch" })
      .limit(limit);

    if (cursor) {
      query = query.lt("created_at", cursor);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: { code: "DB_ERROR", message: error.message } },
        { status: 500 },
      );
    }

    const hasMore = data.length === limit;
    const nextCursor = hasMore && data.length > 0 ? data[data.length - 1].created_at : null;

    return NextResponse.json({
      data,
      meta: { cursor: nextCursor, hasMore },
    });
  } catch {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Something went wrong" } },
      { status: 500 },
    );
  }
}
