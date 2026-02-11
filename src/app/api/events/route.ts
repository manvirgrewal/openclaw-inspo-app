import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseOrError } from "@/lib/supabase/guard";

const eventSchema = z.object({
  event_type: z.string().min(1).max(50),
  idea_id: z.string().uuid().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

const eventsPayloadSchema = z.union([
  eventSchema,
  z.array(eventSchema).max(50),
]);

export async function POST(request: NextRequest) {
  try {
    const { supabase, error: dbError } = await getSupabaseOrError();
    if (dbError) return dbError;
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // Silently accept for sendBeacon — don't error for anonymous
      return new NextResponse(null, { status: 204 });
    }

    const body = await request.json();
    const parsed = eventsPayloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } },
        { status: 400 },
      );
    }

    const events = Array.isArray(parsed.data) ? parsed.data : [parsed.data];
    const rows = events.map((e) => ({
      user_id: user.id,
      event_type: e.event_type,
      idea_id: e.idea_id ?? null,
      metadata: e.metadata ?? {},
    }));

    await supabase.from("user_events").insert(rows);

    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}
