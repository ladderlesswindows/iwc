import { NextRequest, NextResponse } from "next/server";
import { assertAdmin } from "@/lib/admin";
import { getServiceClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const denied = assertAdmin(req);
  if (denied) return denied;

  const supabase = getServiceClient();
  const { data } = await supabase.from("site_settings").select("key, value");

  const settings: Record<string, string> = {};
  for (const row of data ?? []) settings[row.key] = row.value;
  return NextResponse.json(settings);
}

export async function PATCH(req: NextRequest) {
  const denied = assertAdmin(req);
  if (denied) return denied;

  const body = await req.json() as Record<string, string>;
  const supabase = getServiceClient();

  const rows = Object.entries(body).map(([key, value]) => ({ key, value: String(value) }));
  const { error } = await supabase.from("site_settings").upsert(rows, { onConflict: "key" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
