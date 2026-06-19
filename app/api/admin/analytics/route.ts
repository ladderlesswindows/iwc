import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { assertAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

interface BookingRow {
  created_at: string;
  service_date: string | null;
  window_count: number;
  total_price: number;
  address: string | null;
}

export async function GET(req: NextRequest) {
  const deny = assertAdmin(req);
  if (deny) return deny;

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("created_at, service_date, window_count, total_price, address")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const now = new Date();
  const days30ago = new Date(now); days30ago.setDate(now.getDate() - 30);
  const days7ago  = new Date(now); days7ago.setDate(now.getDate() - 7);

  const all    = (data ?? []) as BookingRow[];
  const last30 = all.filter(b => new Date(b.created_at) >= days30ago);
  const last7  = all.filter(b => new Date(b.created_at) >= days7ago);

  const totalRevenue = all.reduce((s, b) => s + Number(b.total_price), 0);
  const rev30        = last30.reduce((s, b) => s + Number(b.total_price), 0);
  const rev7         = last7.reduce((s, b) => s + Number(b.total_price), 0);
  const avgTicket    = all.length ? totalRevenue / all.length : 0;
  const avgWindows   = all.length ? all.reduce((s, b) => s + b.window_count, 0) / all.length : 0;

  // ZIP breakdown — extract from address
  const zipCounts: Record<string, number>  = {};
  const zipRevenue: Record<string, number> = {};
  for (const b of all) {
    const m = b.address?.match(/\b(\d{5})\b/);
    if (m) {
      zipCounts[m[1]]  = (zipCounts[m[1]]  ?? 0) + 1;
      zipRevenue[m[1]] = (zipRevenue[m[1]] ?? 0) + Number(b.total_price);
    }
  }
  const byZip = Object.entries(zipCounts)
    .map(([zip, count]) => ({ zip, count, revenue: zipRevenue[zip] ?? 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Bookings per day for last 30 days
  const byDay: Record<string, number> = {};
  for (const b of last30) {
    const d = b.service_date ?? b.created_at.slice(0, 10);
    byDay[d] = (byDay[d] ?? 0) + 1;
  }
  const dailyTrend = Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));

  // Window count distribution
  const windowDist: Record<number, number> = {};
  for (const b of all) {
    windowDist[b.window_count] = (windowDist[b.window_count] ?? 0) + 1;
  }
  const byWindowCount = Object.entries(windowDist)
    .map(([w, count]) => ({ windows: Number(w), count }))
    .sort((a, b) => a.windows - b.windows);

  return NextResponse.json({
    summary: {
      totalBookings: all.length,
      bookings30d:   last30.length,
      bookings7d:    last7.length,
      totalRevenue:  Math.round(totalRevenue * 100) / 100,
      revenue30d:    Math.round(rev30 * 100) / 100,
      revenue7d:     Math.round(rev7 * 100) / 100,
      avgTicket:     Math.round(avgTicket * 100) / 100,
      avgWindows:    Math.round(avgWindows * 10) / 10,
    },
    byZip,
    dailyTrend,
    byWindowCount,
  });
}
