export interface ICSRow {
  date: string;
  time_slot: string | null;
  is_blocked: boolean;
  reason: string;
}

export function parseICS(text: string): ICSRow[] {
  // Unfold continuation lines (RFC 5545: lines starting with space/tab)
  const unfolded = text.replace(/\r?\n[ \t]/g, "");
  const rows: ICSRow[] = [];
  const blocks = unfolded.split("BEGIN:VEVENT");
  blocks.shift();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const block of blocks) {
    const get = (key: string) => {
      const m = block.match(new RegExp(`${key}[^:\n]*:([^\r\n]+)`));
      return m ? m[1].trim() : "";
    };

    const dtstart = get("DTSTART");
    const summary = get("SUMMARY") || "Personal";

    if (!dtstart) continue;

    // All-day: DTSTART;VALUE=DATE:YYYYMMDD
    const isAllDay = /^\d{8}$/.test(dtstart.split(":").pop() ?? "");
    const rawDate = dtstart.replace(/.*:/, "").slice(0, 8);
    const dateStr = `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`;

    // Skip past events
    if (dateStr < today.toISOString().split("T")[0]) continue;

    let time_slot: string | null = null;
    if (!isAllDay && dtstart.includes("T")) {
      const timePart = dtstart.replace(/.*T/, "").replace(/Z$/, "").slice(0, 4);
      time_slot = `${timePart.slice(0, 2)}:${timePart.slice(2, 4)}`;
    }

    rows.push({ date: dateStr, time_slot, is_blocked: true, reason: summary });
  }

  return rows;
}
