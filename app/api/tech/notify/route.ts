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

  const parts: string[] = [];
  if (windows_added > 0) parts.push(`${windows_added} ext`);
  if (interiors_added > 0) parts.push(`${interiors_added} int`);
  if (screens_added > 0) parts.push(`${screens_added} screens`);
  const message = parts.length
    ? `${customer_name}: +${parts.join(", ")} added`
    : `${customer_name}: windows added`;

  const supabase = getServiceClient();
  const { error } = await supabase.from("tech_alerts").insert({
    booking_id, customer_name, address,
    windows_added, interiors_added, screens_added,
    technician_name,
    type: "windows_added",
    message,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
