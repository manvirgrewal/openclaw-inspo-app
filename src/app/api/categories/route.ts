import { NextResponse } from "next/server";
import { CATEGORIES } from "@/config/categories";

export async function GET() {
  return NextResponse.json({ data: CATEGORIES });
}
