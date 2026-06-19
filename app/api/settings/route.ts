import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getServiceClient();
  const { data } = await supabase
    .from("site_settings")
    .select("key, value");

  const settings: Record<string, boolean | string> = {};
  for (const row of data ?? []) {
    settings[row.key] = row.value === "true" ? true : row.value === "false" ? false : row.value;
  }

  return NextResponse.json(settings);
}
