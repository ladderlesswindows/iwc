import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code")?.trim().toUpperCase();
  if (!code) return NextResponse.json({ error: "Code required" }, { status: 400 });

  const db = getServiceClient();
  const { data, error } = await db
    .from("promo_codes")
    .select("code, discount_type, discount_value, notes")
    .eq("code", code)
    .eq("active", true)
    .single();

  if (error || !data) return NextResponse.json({ error: "Invalid or inactive code" }, { status: 404 });
  return NextResponse.json({ code: data.code, discount_type: data.discount_type, discount_value: data.discount_value, notes: data.notes });
}
