import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { assertAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const deny = assertAdmin(req);
  if (deny) return deny;
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("staff_profiles")
    .select("*")
    .order("provider_number");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ staff: data });
}

export async function POST(req: NextRequest) {
  const deny = assertAdmin(req);
  if (deny) return deny;
  const body = await req.json();
  const supabase = getServiceClient();

  if (body.id) {
    const { id, ...fields } = body;
    const { error } = await supabase.from("staff_profiles").update(fields).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  const { error } = await supabase.from("staff_profiles").insert(body);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const deny = assertAdmin(req);
  if (deny) return deny;
  const { id } = await req.json();
  const supabase = getServiceClient();
  const { error } = await supabase.from("staff_profiles").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
