import { NextRequest, NextResponse } from "next/server";
import { getSupabaseOrError } from "@/lib/supabase/guard";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const { supabase, error: dbError } = await getSupabaseOrError();
    if (dbError) return dbError;
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 },
      );
    }

    // Get idea by slug
    const { data: idea } = await supabase
      .from("ideas")
      .select("id")
      .eq("slug", slug)
      .single();

    if (!idea) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Idea not found" } },
        { status: 404 },
      );
    }

    // Check existing save
    const { data: existing } = await supabase
      .from("saves")
      .select("user_id")
      .eq("user_id", user.id)
      .eq("idea_id", idea.id)
      .single();

    if (existing) {
      // Unsave
      await supabase.from("saves").delete().eq("user_id", user.id).eq("idea_id", idea.id);
      return NextResponse.json({ data: { saved: false } });
    } else {
      // Save
      await supabase.from("saves").insert({ user_id: user.id, idea_id: idea.id });
      return NextResponse.json({ data: { saved: true } });
    }
  } catch {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Something went wrong" } },
      { status: 500 },
    );
  }
}
