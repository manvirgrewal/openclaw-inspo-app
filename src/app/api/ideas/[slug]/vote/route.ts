import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseOrError } from "@/lib/supabase/guard";

const voteSchema = z.object({
  value: z.union([z.literal(1), z.literal(-1)]),
});

export async function POST(
  request: NextRequest,
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

    const body = await request.json();
    const parsed = voteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "value must be 1 or -1" } },
        { status: 400 },
      );
    }

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

    // Upsert vote
    const { error } = await supabase
      .from("votes")
      .upsert(
        { user_id: user.id, target_type: "idea", target_id: idea.id, value: parsed.data.value },
        { onConflict: "user_id,target_type,target_id" },
      );

    if (error) {
      return NextResponse.json(
        { error: { code: "DB_ERROR", message: error.message } },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: { voted: parsed.data.value } });
  } catch {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Something went wrong" } },
      { status: 500 },
    );
  }
}
