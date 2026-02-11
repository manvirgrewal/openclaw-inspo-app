import { NextRequest, NextResponse } from "next/server";
import { getSupabaseOrError } from "@/lib/supabase/guard";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const { supabase, error: dbError } = await getSupabaseOrError();
    if (dbError) return dbError;

    const { data, error } = await supabase
      .from("ideas")
      .select("*, author:profiles!author_id(id, username, display_name, avatar_url)")
      .eq("slug", slug)
      .eq("status", "published")
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Idea not found" } },
        { status: 404 },
      );
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Something went wrong" } },
      { status: 500 },
    );
  }
}
