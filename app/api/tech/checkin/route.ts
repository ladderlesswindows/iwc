import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { assertAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

// Tech app: create check-in request
export async function POST(req: NextRequest) {
  const deny = assertAdmin(req);
  if (deny) return deny;

  const { booking_id, tech_name } = await req.json();
  const supabase = getServiceClient();

  // Expire any old pending requests for this booking
  await supabase
    .from("checkin_requests")
    .update({ status: "expired" })
    .eq("booking_id", booking_id)
    .eq("status", "pending");

  const { data, error } = await supabase
    .from("checkin_requests")
    .insert({ booking_id, tech_name, status: "pending" })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id });
}

// Both apps: poll status
export async function GET(req: NextRequest) {
  const deny = assertAdmin(req);
  if (deny) return deny;

  const bookingId = req.nextUrl.searchParams.get("booking_id");
  if (!bookingId) return NextResponse.json({ error: "booking_id required" }, { status: 400 });

  const supabase = getServiceClient();
  const { data } = await supabase
    .from("checkin_requests")
    .select("id, status, confirmed_at, tech_name, created_at")
    .eq("booking_id", bookingId)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Also fetch latest confirmed
  const { data: confirmed } = await supabase
    .from("checkin_requests")
    .select("id, status, confirmed_at")
    .eq("booking_id", bookingId)
    .eq("status", "confirmed")
    .order("confirmed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return NextResponse.json({ pending: data ?? null, confirmed: confirmed ?? null });
}

// iPad app: confirm
export async function PATCH(req: NextRequest) {
  const deny = assertAdmin(req);
  if (deny) return deny;

  const { id } = await req.json();
  const supabase = getServiceClient();
  const { error } = await supabase
    .from("checkin_requests")
    .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
