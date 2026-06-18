import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { assertAdmin } from "@/lib/admin";
import { parseICS } from "@/lib/ics";

export async function POST(req: NextRequest) {
  const denied = assertAdmin(req);
  if (denied) return denied;

  const body = await req.json();
  const rows = parseICS(body.ics as string);
  if (!rows.length) return NextResponse.json({ count: 0 });

  const db = getServiceClient();
  const { error } = await db.from("availability").upsert(rows, { onConflict: "date,time_slot" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ count: rows.length });
}
