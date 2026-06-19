import { NextRequest, NextResponse } from "next/server";
import { assertAdmin } from "@/lib/admin";
import { getServiceClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const guard = assertAdmin(req);
  if (guard) return guard;

  const { booking_id, worker_notes } = await req.json();
  if (!booking_id || !worker_notes?.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const db = getServiceClient();

  const { data: booking } = await db
    .from("bookings")
    .select("phone, first_name, service_date")
    .eq("id", booking_id)
    .single();

  const review_token = crypto.randomUUID().replace(/-/g, "").slice(0, 20);
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ladderlesswindows.com";
  const review_url = `${site}/review/${review_token}`;

  const { error } = await db.from("gig_completions").insert({
    booking_id,
    worker_notes: worker_notes.trim(),
    review_token,
    customer_phone: booking?.phone ?? null,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await db.from("bookings").update({ status: "completed" }).eq("id", booking_id);

  // Twilio stub — replace with real SMS when TWILIO_* env vars are live
  console.log(
    `[TWILIO STUB] → ${booking?.phone ?? "no phone"}: ` +
    `"Hi ${booking?.first_name ?? "there"}! Your windows look great. ` +
    `Leave us a quick review: ${review_url}"`
  );

  return NextResponse.json({ review_token, review_url });
}
