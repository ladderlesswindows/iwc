import { supabase } from "./supabase";

export const FALLBACK_DATE = "2026-07-04";
export const FALLBACK_TIME = "14:00";

export const SLOT_TIMES = ["08:00", "10:00", "12:00", "14:00", "16:00"];

export function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
}

export function getNextDays(n = 30): string[] {
  const days: string[] = [];
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  for (let i = 0; i <= n; i++) {
    const next = new Date(d);
    next.setDate(d.getDate() + i);
    days.push(next.toISOString().split("T")[0]);
  }
  // Always include fallback date if not already present
  if (!days.includes(FALLBACK_DATE)) days.push(FALLBACK_DATE);
  return days;
}

export async function fetchAvailability(dates: string[]) {
  try {
    const { data, error } = await supabase
      .from("availability")
      .select("date, time_slot, is_blocked")
      .in("date", dates);

    if (error) throw error;
    return data ?? [];
  } catch (err) {
    console.error("fetchAvailability failed:", err);
    return [];
  }
}

export function buildSlotMap(
  dates: string[],
  dbRows: { date: string; time_slot: string | null; is_blocked: boolean }[]
) {
  const map: Record<string, string[]> = {};

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  for (const date of dates) {
    const blocked = new Set(
      dbRows
        .filter((r) => r.date === date && r.is_blocked)
        .map((r) => (r.time_slot ?? "").slice(0, 5))
    );
    let slots = SLOT_TIMES.filter((t) => !blocked.has(t));

    if (date === todayStr) {
      slots = slots.filter((t) => {
        const [h, m] = t.split(":").map(Number);
        return h * 60 + m >= nowMinutes - 30;
      });
    }

    map[date] = slots;
  }
  return map;
}

export function formatDateFull(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatPhone(p: string): string {
  const d = p.replace(/\D/g, "");
  if (d.length === 10) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  return p;
}

export async function getAvailableSlots() {
  const dates = getNextDays();
  const rows = await fetchAvailability(dates);
  return buildSlotMap(dates, rows);
}
