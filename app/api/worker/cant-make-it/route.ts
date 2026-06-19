import { NextRequest, NextResponse } from "next/server";
import { assertAdmin } from "@/lib/admin";
import { getServiceClient } from "@/lib/supabase";

export async function PATCH(req: NextRequest) {
  const guard = assertAdmin(req);
  if (guard) return guard;

  const { booking_id } = await req.json();
  if (!booking_id) return NextResponse.json({ error: "Missing booking_id" }, { status: 400 });

  const db = getServiceClient();
  const { error } = await db
    .from("bookings")
    .update({ status: "cant_make_it" })
    .eq("id", booking_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
