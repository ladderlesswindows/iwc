"use client";

import { useState } from "react";
import { formatDate, formatTime, getNextDays } from "@/lib/availability";
import { SERVICE_AREAS, DEFAULT_ZIP } from "@/lib/serviceAreas";
import type { ThemeMode, Skin } from "./types";

const DARK = {
  ACCENT:        "#a78bfa",
  ACCENT_DIM:    "rgba(167,139,250,0.15)",
  ACCENT_BORDER: "rgba(167,139,250,0.3)",
  CARD_BG:       "rgba(255,255,255,0.04)",
  CARD_BORDER:   "rgba(255,255,255,0.08)",
  TEXT:          "#ffffff",
  TEXT_DIM:      "rgba(255,255,255,0.45)",
  TEXT_FAINT:    "rgba(255,255,255,0.2)",
  GREEN:         "#4ade80",
  PANEL_BG:      "#080810",
  INPUT_BG:      "rgba(255,255,255,0.05)",
  INPUT_BORDER:  "rgba(255,255,255,0.1)",
  INPUT_TEXT:    "white",
  ROW_BG:        "rgba(0,0,0,0.25)",
};

const LIGHT = {
  ACCENT:        "#6d28d9",
  ACCENT_DIM:    "rgba(109,40,217,0.1)",
  ACCENT_BORDER: "rgba(109,40,217,0.22)",
  CARD_BG:       "rgba(0,0,0,0.028)",
  CARD_BORDER:   "rgba(0,0,0,0.1)",
  TEXT:          "#111827",
  TEXT_DIM:      "rgba(17,24,39,0.5)",
  TEXT_FAINT:    "rgba(17,24,39,0.28)",
  GREEN:         "#16a34a",
  PANEL_BG:      "#f4f4fa",
  INPUT_BG:      "rgba(0,0,0,0.04)",
  INPUT_BORDER:  "rgba(0,0,0,0.12)",
  INPUT_TEXT:    "#111827",
  ROW_BG:        "rgba(0,0,0,0.04)",
};

type Tokens = typeof DARK;

export interface PowerConsoleSkinProps {
  date: string; time: string; windowCount: number;
  needsEstimate: boolean; estimateDeadline: string;
  slotMap: Record<string, string[]>;
  selectedZip?: string;
  zipConfirmed?: boolean;
  onDateChange: (d: string) => void;
  onTimeChange: (t: string) => void;
  onWindowCountChange: (n: number) => void;
  onNeedsEstimateChange: (v: boolean) => void;
  onEstimateDeadlineChange: (d: string) => void;
  address: string;
  firstName: string; lastName: string; phone: string; email: string; notes: string;
  onAddressChange: (v: string) => void;
  onFirstNameChange: (v: string) => void;
  onLastNameChange: (v: string) => void;
  onPhoneChange: (v: string) => void;
  onEmailChange: (v: string) => void;
  onNotesChange: (v: string) => void;
  onGoToSummary: () => void;
  mode: ThemeMode;
  onSkinChange: (skin: Skin) => void;
}

export function PowerConsoleSkin({
  date, time, windowCount, slotMap, selectedZip, zipConfirmed,
  onDateChange, onTimeChange, onWindowCountChange,
  onAddressChange,
  onGoToSummary, mode, onSkinChange,
}: PowerConsoleSkinProps) {
  const T: Tokens = mode === "light" ? LIGHT : DARK;

  const zip        = selectedZip ?? DEFAULT_ZIP;
  const area       = SERVICE_AREAS[zip];
  const minWindows = area?.minWindows ?? 1;
  const total      = windowCount * 22;

  const [showSlots, setShowSlots] = useState(false);
  const [street, setStreet]       = useState("");
  const [apt, setApt]             = useState("");
  const [town, setTown]           = useState("");

  function pushAddress(s: string, a: string, t: string) {
    if (!s.trim() || !t.trim()) return;
    onAddressChange([s.trim(), a.trim()].filter(Boolean).join(" ") + `, ${t.trim()}, CA ${zip}`);
  }

  const canBook = Boolean(date && time && street.trim() && town.trim());
  const dates   = getNextDays();

  const inputStyle: React.CSSProperties = {
    background: T.INPUT_BG, border: `1px solid ${T.INPUT_BORDER}`,
    borderRadius: 8, color: T.INPUT_TEXT, fontSize: 12, fontWeight: 500,
    padding: "8px 10px", outline: "none", fontFamily: "inherit", width: "100%",
  };

  const sectionStyle: React.CSSProperties = {
    background: T.CARD_BG, border: `1px solid ${T.CARD_BORDER}`,
    borderRadius: 12, padding: "11px 12px", marginBottom: 8,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 9, fontWeight: 700, letterSpacing: "0.12em",
    textTransform: "uppercase" as const, color: T.ACCENT,
    display: "block", marginBottom: 6,
  };

  return (
    <div style={{
      padding: "14px 14px 20px", display: "flex", flexDirection: "column",
      height: "100%", overflowY: "auto", background: T.PANEL_BG,
    }}>

      {/* Header */}
      <div style={{ marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: T.TEXT_FAINT }}>
          Power Console
        </span>
        <button
          onClick={() => onSkinChange("clean")}
          style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", background: "transparent", border: `1px solid ${T.CARD_BORDER}`, borderRadius: 6, color: T.TEXT_DIM, padding: "4px 8px", cursor: "pointer", textTransform: "uppercase" as const, fontFamily: "inherit" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = T.ACCENT_BORDER; e.currentTarget.style.color = T.ACCENT; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = T.CARD_BORDER; e.currentTarget.style.color = T.TEXT_DIM; }}
        >← Guide</button>
      </div>

      {/* ── Top section: confirmed zip + counter, or bare counter if no zip yet ── */}
      <div style={{ ...sectionStyle, borderColor: zipConfirmed ? T.ACCENT_BORDER : T.CARD_BORDER }}>
        {zipConfirmed ? (
          <div style={labelStyle}>Confirmed</div>
        ) : (
          <div style={labelStyle}>Windows</div>
        )}

        {/* Service area row — only when zip is confirmed */}
        {zipConfirmed && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, paddingBottom: 10, borderBottom: `1px solid ${T.CARD_BORDER}` }}>
            <span style={{ fontSize: 12, color: T.GREEN }}>✓</span>
            <span style={{ fontSize: 12, color: T.TEXT, fontWeight: 500 }}>
              {zip}
              {area ? <span style={{ color: T.TEXT_DIM }}> · {area.name}</span> : null}
            </span>
          </div>
        )}

        {/* Window counter row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => onWindowCountChange(Math.max(minWindows, windowCount - 1))}
              style={{ width: 26, height: 26, borderRadius: "50%", background: T.ACCENT_DIM, border: `1px solid ${T.ACCENT_BORDER}`, color: T.ACCENT, fontSize: 15, fontWeight: 700, cursor: windowCount <= minWindows ? "not-allowed" : "pointer", opacity: windowCount <= minWindows ? 0.4 : 1, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
            <span style={{ fontSize: 18, fontWeight: 800, color: T.TEXT, minWidth: 22, textAlign: "center" as const }}>{windowCount}</span>
            <button onClick={() => onWindowCountChange(Math.min(20, windowCount + 1))}
              style={{ width: 26, height: 26, borderRadius: "50%", background: T.ACCENT_DIM, border: `1px solid ${T.ACCENT_BORDER}`, color: T.ACCENT, fontSize: 15, fontWeight: 700, cursor: windowCount >= 20 ? "not-allowed" : "pointer", opacity: windowCount >= 20 ? 0.4 : 1, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
            <span style={{ fontSize: 10, color: T.TEXT_DIM }}>windows</span>
          </div>
          <span style={{ fontSize: 13, color: T.ACCENT, fontWeight: 700 }}>${total}</span>
        </div>
        {zipConfirmed && windowCount <= minWindows && minWindows > 1 && (
          <div style={{ fontSize: 8.5, color: T.TEXT_FAINT, marginTop: 6 }}>
            {minWindows}-window minimum for this area
          </div>
        )}
      </div>

      {/* ── Date & Time ── */}
      <div style={sectionStyle}>
        <div style={labelStyle}>Date &amp; Time</div>
        <div style={{ fontSize: 13, color: T.TEXT, fontWeight: 500, marginBottom: 8 }}>
          {date ? `${formatDate(date)} · ${formatTime(time)}` : <span style={{ color: T.TEXT_DIM }}>No slot selected</span>}
        </div>
        <button
          onClick={() => setShowSlots(v => !v)}
          style={{ fontSize: 10, color: T.ACCENT, background: T.ACCENT_DIM, border: `1px solid ${T.ACCENT_BORDER}`, borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontFamily: "inherit" }}
        >{showSlots ? "Hide slots ↑" : "Change slot ↓"}</button>
        {showSlots && (
          <div style={{ maxHeight: 150, overflowY: "auto", marginTop: 8, background: T.ROW_BG, borderRadius: 8, padding: "6px 8px" }}>
            {dates.map(d => {
              const slots = slotMap[d] ?? [];
              if (!slots.length) return null;
              return (
                <div key={d} style={{ marginBottom: 6 }}>
                  <div style={{ fontSize: 9, fontWeight: 600, color: T.TEXT_DIM, marginBottom: 3, letterSpacing: "0.08em" }}>{formatDate(d)}</div>
                  <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 4 }}>
                    {slots.map(t => (
                      <button key={t}
                        onClick={() => { onDateChange(d); onTimeChange(t); setShowSlots(false); }}
                        style={{ padding: "3px 8px", borderRadius: 6, border: `1px solid ${d === date && t === time ? T.ACCENT : T.CARD_BORDER}`, background: d === date && t === time ? T.ACCENT_DIM : "transparent", color: d === date && t === time ? T.ACCENT : T.TEXT_DIM, fontSize: 10, cursor: "pointer", fontFamily: "inherit" }}
                      >{formatTime(t)}</button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Service Address ── */}
      <div style={sectionStyle}>
        <div style={labelStyle}>Service Address</div>
        <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
          <input type="text" placeholder="Street address" value={street} autoComplete="address-line1"
            onChange={e => { setStreet(e.target.value); pushAddress(e.target.value, apt, town); }}
            style={{ ...inputStyle, flex: 1 }}
          />
          <input type="text" placeholder="Apt" value={apt} autoComplete="address-line2"
            onChange={e => { setApt(e.target.value); pushAddress(street, e.target.value, town); }}
            style={{ ...inputStyle, width: 58, flex: "none" }}
          />
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input type="text" placeholder="City / Town" value={town} autoComplete="address-level2"
            onChange={e => { setTown(e.target.value); pushAddress(street, apt, e.target.value); }}
            style={{ ...inputStyle, flex: 1 }}
          />
          <div style={{ fontSize: 11, fontWeight: 600, color: T.TEXT_DIM, flexShrink: 0, whiteSpace: "nowrap" as const }}>
            CA&nbsp;&nbsp;{zip}
          </div>
        </div>
      </div>

      {/* ── Book button ── */}
      <button
        onClick={onGoToSummary}
        disabled={!canBook}
        style={{
          width: "100%", background: T.ACCENT, color: "#08080e", border: "none",
          borderRadius: 12, padding: "14px 16px", fontSize: 14, fontWeight: 800,
          cursor: canBook ? "pointer" : "not-allowed", opacity: canBook ? 1 : 0.4,
          transition: "opacity 0.15s", marginTop: 4,
        }}
        onMouseEnter={e => { if (canBook) e.currentTarget.style.opacity = "0.88"; }}
        onMouseLeave={e => { if (canBook) e.currentTarget.style.opacity = "1"; }}
      >Review &amp; Book — ${total}</button>
      {!canBook && (
        <p style={{ fontSize: 10, color: T.TEXT_DIM, textAlign: "center", marginTop: 6 }}>
          {!date || !time ? "Select a time slot to continue" : "Enter your street address to continue"}
        </p>
      )}
    </div>
  );
}
