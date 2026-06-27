import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { assertAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const deny = assertAdmin(req);
  if (deny) return deny;

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("tech_alerts")
    .select("*")
    .gte("created_at", since)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ alerts: data ?? [] });
}

export async function PATCH(req: NextRequest) {
  const deny = assertAdmin(req);
  if (deny) return deny;

  const { id } = await req.json();
  const supabase = getServiceClient();
  const { error } = await supabase
    .from("tech_alerts")
    .update({ acknowledged: true })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
