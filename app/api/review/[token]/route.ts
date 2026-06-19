import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export async function GET(
  _req: NextRequest,
  { params }: { params: { token: string } }
) {
  const db = getServiceClient();
  const { data, error } = await db
    .from("gig_completions")
    .select(`
      worker_notes, customer_review_text, customer_stars,
      review_status, review_submitted_at,
      bookings ( first_name, service_date )
    `)
    .eq("review_token", params.token)
    .single();

  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  const { customer_review_text, customer_stars } = await req.json();
  if (!customer_review_text?.trim() || !customer_stars) {
    return NextResponse.json({ error: "Text and stars required" }, { status: 400 });
  }

  const db = getServiceClient();
  const { error } = await db
    .from("gig_completions")
    .update({
      customer_review_text: customer_review_text.trim(),
      customer_stars,
      review_submitted_at: new Date().toISOString(),
    })
    .eq("review_token", params.token);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
