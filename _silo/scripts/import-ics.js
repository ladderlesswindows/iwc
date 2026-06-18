// One-time script: import simplewindowcleaning@gmail.com.ics into Supabase
const fs = require("fs");
const path = require("path");

// Load .env.local
const envFile = fs.readFileSync(path.join(__dirname, "../.env.local"), "utf-8");
const env = Object.fromEntries(
  envFile.split("\n")
    .filter(l => l.includes("=") && !l.startsWith("#"))
    .map(l => [l.split("=")[0].trim(), l.slice(l.indexOf("=") + 1).trim()])
);

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY  = env.SUPABASE_SERVICE_ROLE_KEY;
const ICS_PATH     = "/Users/czilla/Downloads/simplewindowcleaning@gmail.com.ics";

const today = new Date();
today.setHours(0, 0, 0, 0);
const todayStr = today.toISOString().split("T")[0];

function parseICS(text) {
  // Unfold RFC 5545 continuation lines
  const unfolded = text.replace(/\r?\n[ \t]/g, "");
  const rows = [];
  const blocks = unfolded.split("BEGIN:VEVENT");
  blocks.shift();

  for (const block of blocks) {
    const get = (key) => {
      const m = block.match(new RegExp(`${key}[^:\\n]*:([^\\r\\n]+)`));
      return m ? m[1].trim() : "";
    };

    const dtstart = get("DTSTART");
    const summary = get("SUMMARY") || "Personal obligation";
    if (!dtstart) continue;

    // Extract the raw date/time value (after any TZID parameter)
    const rawVal = dtstart.includes(":") ? dtstart.split(":").pop() : dtstart;

    const isAllDay = /^\d{8}$/.test(rawVal);
    const dateStr = `${rawVal.slice(0,4)}-${rawVal.slice(4,6)}-${rawVal.slice(6,8)}`;

    if (dateStr < todayStr) continue; // skip past events

    let time_slot = null;
    if (!isAllDay && rawVal.length >= 13) {
      // HHMMSS
      const h = rawVal.slice(9, 11);
      const m = rawVal.slice(11, 13);
      time_slot = `${h}:${m}`;
    }

    rows.push({ date: dateStr, time_slot, is_blocked: true, reason: summary });
  }

  return rows;
}

async function main() {
  const text = fs.readFileSync(ICS_PATH, "utf-8");
  const rows = parseICS(text);
  console.log(`Found ${rows.length} future events to import.`);
  if (!rows.length) { console.log("Nothing to import."); return; }

  // Show first 5 as a preview
  console.log("\nFirst 5:");
  rows.slice(0, 5).forEach(r => console.log(`  ${r.date} ${r.time_slot ?? "(all-day)"} — ${r.reason}`));

  // Upsert in batches of 100
  const headers = {
    "apikey": SERVICE_KEY,
    "Authorization": `Bearer ${SERVICE_KEY}`,
    "Content-Type": "application/json",
    "Prefer": "resolution=merge-duplicates",
  };

  let imported = 0;
  for (let i = 0; i < rows.length; i += 100) {
    const batch = rows.slice(i, i + 100);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/availability`, {
      method: "POST",
      headers,
      body: JSON.stringify(batch),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error(`Batch ${i}-${i+batch.length} failed:`, err);
    } else {
      imported += batch.length;
      process.stdout.write(`\rImported ${imported}/${rows.length}...`);
    }
  }
  console.log(`\nDone! ${imported} events written to Supabase.`);
}

main().catch(console.error);
