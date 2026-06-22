import { NextRequest, NextResponse } from "next/server";
import { assertAdmin } from "@/lib/admin";
import { getServiceClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const denied = assertAdmin(req);
  if (denied) return denied;
  const db = getServiceClient();
  const { data, error } = await db
    .from("promo_codes")
    .select("code, notes, discount_type, discount_value, active, created_at")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ codes: data ?? [] });
}

export async function POST(req: NextRequest) {
  const denied = assertAdmin(req);
  if (denied) return denied;
  const { code, notes, discount_type, discount_value } = await req.json();
  const clean = code?.trim().toUpperCase();
  if (!clean) return NextResponse.json({ error: "Code required" }, { status: 400 });
  if (!discount_type || discount_value == null) return NextResponse.json({ error: "Discount type and value required" }, { status: 400 });

  const db = getServiceClient();
  const { error } = await db.from("promo_codes").insert({
    code: clean,
    notes: notes?.trim() || null,
    discount_type,
    discount_value: Number(discount_value),
    active: true,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  const denied = assertAdmin(req);
  if (denied) return denied;
  const { code, active } = await req.json();
  if (!code) return NextResponse.json({ error: "Code required" }, { status: 400 });
  const db = getServiceClient();
  const { error } = await db.from("promo_codes").update({ active }).eq("code", code);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const denied = assertAdmin(req);
  if (denied) return denied;
  const { code } = await req.json();
  if (!code) return NextResponse.json({ error: "Code required" }, { status: 400 });
  const db = getServiceClient();
  const { error } = await db.from("promo_codes").delete().eq("code", code);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
