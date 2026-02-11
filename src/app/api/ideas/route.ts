import { NextRequest, NextResponse } from "next/server";
import { getSupabaseOrError } from "@/lib/supabase/guard";
import { feedParamsSchema, ideaCreateSchema } from "@/modules/ideas/ideas.validation";
import { FEED_PAGE_SIZE } from "@/config/constants";

export async function GET(request: NextRequest) {
  try {
    const params = Object.fromEntries(request.nextUrl.searchParams);
    const parsed = feedParamsSchema.safeParse(params);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } },
        { status: 400 },
      );
    }

    const { cursor, limit, category, complexity, skills, sort } = parsed.data;
    const { supabase, error: dbError } = await getSupabaseOrError();
    if (dbError) return dbError;

    let query = supabase
      .from("ideas")
      .select("*, author:profiles!author_id(id, username, display_name, avatar_url)")
      .eq("status", "published")
      .limit(limit ?? FEED_PAGE_SIZE);

    if (category) query = query.eq("category", category);
    if (complexity) query = query.eq("complexity", complexity);
    if (skills) {
      const skillList = skills.split(",").map((s) => s.trim());
      query = query.overlaps("skills", skillList);
    }

    switch (sort) {
      case "newest":
        query = query.order("published_at", { ascending: false });
        break;
      case "most_saved":
        query = query.order("save_count", { ascending: false });
        break;
      case "most_built":
        query = query.order("built_count", { ascending: false });
        break;
      case "trending":
      default:
        query = query.order("save_count", { ascending: false }).order("created_at", { ascending: false });
        break;
    }

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

    const hasMore = data.length === (limit ?? FEED_PAGE_SIZE);
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

export async function POST(request: NextRequest) {
  try {
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
    const parsed = ideaCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } },
        { status: 400 },
      );
    }

    const slug = parsed.data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80) + "-" + Date.now().toString(36);

    const { data, error } = await supabase
      .from("ideas")
      .insert({
        ...parsed.data,
        author_id: user.id,
        slug,
        status: "published",
        published_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: { code: "DB_ERROR", message: error.message } },
        { status: 500 },
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Something went wrong" } },
      { status: 500 },
    );
  }
}
