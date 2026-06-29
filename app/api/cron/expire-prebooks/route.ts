import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function shiftDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export async function GET(req: NextRequest) {
  // Vercel cron sends the CRON_SECRET as a Bearer token
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getServiceClient();
  const today = new Date().toISOString().split("T")[0];
  const cutoff = shiftDate(today, 14);

  // Find unconfirmed prebooks arriving within 14 days
  const { data: expiring, error } = await supabase
    .from("bookings")
    .select("id, service_date, address")
    .eq("status", "prebooked")
    .gte("service_date", today)
    .lte("service_date", cutoff);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!expiring?.length) return NextResponse.json({ cancelled: 0 });

  // Cancel the prebooks
  const prebookIds = expiring.map((b) => b.id);
  await supabase.from("bookings").update({ status: "cancelled" }).in("id", prebookIds);

  // Cancel sibling HOLDs: same address, status=hold, date within ±1 of each prebook
  const holdDates: string[] = [];
  for (const b of expiring) {
    holdDates.push(shiftDate(b.service_date, -1));
    holdDates.push(shiftDate(b.service_date, 1));
  }

  // Match by address + hold status + those dates
  const addresses = [...new Set(expiring.map((b) => b.address))];
  await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("status", "hold")
    .in("service_date", holdDates)
    .in("address", addresses);

  return NextResponse.json({ cancelled: expiring.length, releasedDates: expiring.map((b) => b.service_date) });
}
