import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { assertAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

// Run this once in the Supabase SQL editor:
//
// CREATE TABLE upsell_sessions (
//   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
//   created_at timestamptz DEFAULT now(),
//   booking_id uuid REFERENCES bookings(id),
//   technician_name text,
//   base_windows int NOT NULL,
//   base_total numeric NOT NULL,
//   onsite_windows_added int DEFAULT 0,
//   free_windows_given int DEFAULT 0,
//   total_windows int NOT NULL,
//   total_charged numeric NOT NULL,
//   avg_per_window numeric NOT NULL,
//   recurring_accepted bool,
//   deposit_collected bool DEFAULT false,
//   interior_decision text CHECK (interior_decision IN ('today','scheduled','declined')),
//   interior_windows int,
//   interior_total numeric,
//   completed_at timestamptz DEFAULT now()
// );
//
// If the table already exists: ALTER TABLE upsell_sessions ADD COLUMN IF NOT EXISTS technician_name text;

export async function POST(req: NextRequest) {
  const deny = assertAdmin(req);
  if (deny) return deny;

  const body = await req.json();
  const supabase = getServiceClient();

  const { error } = await supabase.from("upsell_sessions").insert({
    booking_id:            body.booking_id,
    technician_name:       body.technician_name ?? null,
    base_windows:          body.base_windows,
    base_total:            body.base_total,
    onsite_windows_added:  body.onsite_windows_added,
    free_windows_given:    body.free_windows_given,
    total_windows:         body.total_windows,
    total_charged:         body.total_charged,
    avg_per_window:        body.avg_per_window,
    recurring_accepted:    body.recurring_accepted,
    deposit_collected:     body.deposit_collected,
    interior_decision:     body.interior_decision,
    interior_windows:      body.interior_windows ?? null,
    interior_total:        body.interior_total ?? null,
    completed_at:          new Date().toISOString(),
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  const deny = assertAdmin(req);
  if (deny) return deny;

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("upsell_sessions")
    .select("*, bookings(first_name, last_name, address)")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ sessions: data });
}
