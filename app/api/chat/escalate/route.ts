import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import twilio from "twilio";

export const dynamic = "force-dynamic";

async function sendSMS(name: string, phone: string, summary: string) {
  const sid   = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from  = process.env.TWILIO_FROM;
  const to    = process.env.OWNER_PHONE;
  if (!sid || !token || !from || !to) return;

  const client = twilio(sid, token);
  const body = `Simple Windows Chat — ${name} (${phone}) wants to talk.\n"${summary}"`;
  await client.messages.create({ body, from, to });
}

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

  try {
    await sendSMS(name ?? "Unknown", phone ?? "no phone", summary ?? "");
  } catch (err) {
    console.error("Twilio error:", err);
  }

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
