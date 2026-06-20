import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { name, phone, summary, transcript } = await req.json();

  const db = getServiceClient();
  const { error } = await db.from("chat_escalations").insert({
    name,
    phone,
    summary: summary ?? null,
    transcript: transcript ?? null,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const db = getServiceClient();
  const { data, error } = await db
    .from("chat_escalations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
