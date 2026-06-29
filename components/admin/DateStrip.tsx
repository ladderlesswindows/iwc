"use client";

import type { Booking } from "@/app/admin/types";

const TOWN_COLORS: Record<string, string> = {
  "Santa Cruz":    "#0ea5e9",
  "Felton":        "#22c55e",
  "Ben Lomond":    "#84cc16",
  "Scotts Valley": "#f59e0b",
  "Boulder Creek": "#4ade80",
  "Aptos":         "#34d399",
  "Capitola":      "#fbbf24",
  "Soquel":        "#e879f9",
  "Watsonville":   "#f43f5e",
  "Los Gatos":     "#a78bfa",
  "Saratoga":      "#ec4899",
  "Campbell":      "#f97316",
  "San Jose":      "#06b6d4",
  "Los Altos":     "#818cf8",
  "Sunnyvale":     "#fb923c",
  "Mountain View": "#2dd4bf",
  "Cupertino":     "#c084fc",
  "Santa Clara":   "#38bdf8",
  "Palo Alto":     "#a3e635",
  "Monterey":      "#e2e8f0",
};

const OVERFLOW_PALETTE = ["#60a5fa","#f472b6","#4ade80","#fb923c","#e879f9","#2dd4bf","#818cf8","#fbbf24"];

function getTownColor(town: string): string {
  if (TOWN_COLORS[town]) return TOWN_COLORS[town];
  let hash = 0;
  for (const c of town) hash = ((hash << 5) - hash) + c.charCodeAt(0);
  return OVERFLOW_PALETTE[Math.abs(hash) % OVERFLOW_PALETTE.length];
}

function extractTown(address: string | null | undefined): string | null {
  if (!address) return null;
  const parts = address.split(",").map(s => s.trim());
  for (let i = 0; i < parts.length; i++) {
    if (/^CA(\s+\d{5})?$/.test(parts[i]) || /^\d{5}$/.test(parts[i])) {
      return i > 0 ? parts[i - 1] : null;
    }
  }
  return parts.length >= 2 ? parts[parts.length - 2] : null;
}

function toLocalDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

interface Props {
  bookings: Booking[];
}

export function DateStrip({ bookings }: Props) {
  // Build date → town map (skip cancelled)
  const bookingByDate: Record<string, string> = {};
  for (const b of bookings) {
    if (b.service_date && b.status !== "cancelled") {
      const town = extractTown(b.address);
      if (town) bookingByDate[b.service_date] = town;
    }
  }

  // 2 years of dates from today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const rows: { date: Date; monthHeader: boolean }[] = [];
  let cur = new Date(today);
  const end = new Date(today);
  end.setFullYear(today.getFullYear() + 2);
  let lastMonth = -1;
  while (cur <= end) {
    const monthHeader = cur.getMonth() !== lastMonth;
    if (monthHeader) lastMonth = cur.getMonth();
    rows.push({ date: new Date(cur), monthHeader });
    cur.setDate(cur.getDate() + 1);
  }

  return (
    <div style={{
      width: 128,
      flexShrink: 0,
      borderLeft: "1px solid rgba(255,255,255,0.06)",
      background: "rgba(0,0,0,0.18)",
    }}>
      {rows.map(({ date, monthHeader }) => {
        const dateStr = toLocalDateStr(date);
        const town = bookingByDate[dateStr];
        const color = town ? getTownColor(town) : null;
        const isToday = dateStr === toLocalDateStr(today);

        return (
          <div key={dateStr}>
            {monthHeader && (
              <div style={{
                padding: "6px 8px 4px",
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.25)",
                borderTop: "1px solid rgba(255,255,255,0.07)",
                background: "rgba(255,255,255,0.02)",
              }}>
                {MONTH_NAMES[date.getMonth()]} {date.getFullYear()}
              </div>
            )}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "0 8px",
              height: 22,
              background: color
                ? `${color}22`
                : isToday
                ? "rgba(255,255,255,0.06)"
                : undefined,
              borderLeft: isToday ? "2px solid rgba(255,255,255,0.35)" : color ? `2px solid ${color}88` : "2px solid transparent",
              transition: "background 0.15s",
            }}>
              <span style={{
                fontSize: 11,
                fontWeight: isToday ? 800 : town ? 700 : 400,
                color: color ?? (isToday ? "white" : "rgba(255,255,255,0.25)"),
                minWidth: 18,
                textAlign: "right",
                fontVariantNumeric: "tabular-nums",
              }}>
                {date.getDate()}
              </span>
              {town && (
                <span style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  lineHeight: 1,
                }}>
                  {town}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
