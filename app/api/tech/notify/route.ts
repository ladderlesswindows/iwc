import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    booking_id, customer_name, address,
    windows_added = 0, interiors_added = 0, screens_added = 0,
    technician_name,
  } = body;

  const supabase = getServiceClient();
  const { error } = await supabase.from("tech_alerts").insert({
    booking_id, customer_name, address,
    windows_added, interiors_added, screens_added,
    technician_name,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
