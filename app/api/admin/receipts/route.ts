import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { assertAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

async function ensureBucket() {
  const supabase = getServiceClient();
  const { error } = await supabase.storage.createBucket("receipts", { public: true });
  // Ignore "already exists" — that's the happy path after first run
  if (error && !error.message.includes("already exists")) {
    console.error("bucket create error:", error.message);
  }
}

export async function GET(req: NextRequest) {
  const deny = assertAdmin(req);
  if (deny) return deny;

  const supabase = getServiceClient();
  const tech = req.nextUrl.searchParams.get("tech_name");
  let query = supabase
    .from("receipts")
    .select("id, created_at, tech_name, category, amount, photo_url, notes")
    .order("created_at", { ascending: false })
    .limit(50);

  if (tech) query = query.eq("tech_name", tech);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ receipts: data ?? [] });
}

export async function POST(req: NextRequest) {
  const deny = assertAdmin(req);
  if (deny) return deny;

  const body = await req.json();
  const { tech_name, category, amount, notes, photo_base64, photo_mime } = body;

  if (!category || amount == null) {
    return NextResponse.json({ error: "category and amount required" }, { status: 400 });
  }

  await ensureBucket();
  const supabase = getServiceClient();

  let photo_url: string | null = null;

  if (photo_base64) {
    const bytes = Buffer.from(photo_base64, "base64");
    const ext  = (photo_mime ?? "image/jpeg") === "image/png" ? "png" : "jpg";
    const path = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("receipts")
      .upload(path, bytes, { contentType: photo_mime ?? "image/jpeg", upsert: false });

    if (upErr) {
      return NextResponse.json({ error: upErr.message }, { status: 500 });
    }
    const { data: urlData } = supabase.storage.from("receipts").getPublicUrl(path);
    photo_url = urlData.publicUrl;
  }

  const { data, error } = await supabase
    .from("receipts")
    .insert({ tech_name: tech_name ?? null, category, amount, notes: notes ?? null, photo_url })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id, photo_url });
}
