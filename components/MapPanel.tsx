"use client";

import { useEffect, useRef, useState } from "react";
import type mapboxgl from "mapbox-gl";
import { AnimatePresence, motion } from "framer-motion";
import {
  SERVICE_AREAS, INITIAL_CAMERA, ZOOMED_CAMERA, DEFAULT_ZIP,
  CLOCK_TOWER_95060, CLOCK_TOWER_CAMERA,
} from "@/lib/serviceAreas";
import type { CoverageAlert } from "@/lib/serviceAreas";
import type { Step } from "@/components/npc/types";
import { STEP_ORDER } from "@/components/npc/types";
import { formatTime, formatDateFull, FALLBACK_DATE } from "@/lib/availability";
import { PRICE_PER_WINDOW, MAX_WINDOWS } from "@/lib/constants";

interface Props {
  step: Step;
  selectedZip: string;
  date: string;
  time: string;
  windowCount: number;
  needsEstimate: boolean;
  slotMap: Record<string, string[]>;
  onZipChange?: (zip: string) => void;
  onGo?: () => void;
  onOpen?: () => void;
  address?: string;
  onWindowCountChange?: (n: number) => void;
  onDateChange?: (d: string) => void;
  onTimeChange?: (t: string) => void;
}

export default function MapPanel({ step, selectedZip, date, time, windowCount, needsEstimate, slotMap, onZipChange, onGo, onOpen, address, onWindowCountChange, onDateChange, onTimeChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded]         = useState(false);
  const [hasFlown, setHasFlown]           = useState(false);
  const [overlaysVisible, setOverlaysVisible] = useState(false);
  const onZipChangeRef = useRef(onZipChange);
  const onGoRef = useRef(onGo);
  const onOpenRef = useRef(onOpen);
  const geocodeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initializedForZipRef = useRef<string | null>(null);
  const stepIdxRef = useRef(0);
  useEffect(() => { onZipChangeRef.current = onZipChange; }, [onZipChange]);
  useEffect(() => { onGoRef.current = onGo; }, [onGo]);
  useEffect(() => { onOpenRef.current = onOpen; }, [onOpen]);

  // ── Geocode address → flyTo ─────────────────────────────────────────
  useEffect(() => {
    if (!address || !mapLoaded || !mapRef.current) return;
    if (!/^\d/.test(address.trim())) return; // only fire if it starts with a street number
    if (geocodeTimerRef.current) clearTimeout(geocodeTimerRef.current);
    geocodeTimerRef.current = setTimeout(async () => {
      try {
        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${token}&limit=1&proximity=-122.03,36.97`;
        const res = await fetch(url);
        const data = await res.json();
        const coords = data.features?.[0]?.center;
        if (coords && mapRef.current) {
          mapRef.current.flyTo({
            center: coords,
            zoom: 18.5,
            pitch: 62,
            bearing: 22,
            duration: 3500,
            curve: 1.3,
            essential: true,
          });
        }
      } catch {}
    }, 900);
  }, [address, mapLoaded]);

  const zip = selectedZip || DEFAULT_ZIP;
  const stepIdx = STEP_ORDER.indexOf(step);
  useEffect(() => { stepIdxRef.current = stepIdx; }, [stepIdx]);

  // ── Auto-set window count to zip minimum when entering timeslot step ──
  useEffect(() => {
    if (stepIdx < 1) return;
    if (initializedForZipRef.current === zip) return;
    const min = SERVICE_AREAS[zip]?.minWindows ?? 1;
    onWindowCountChange?.(min);
    initializedForZipRef.current = zip;
  }, [stepIdx, zip]);

  // ── Init map ────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let cancelled = false;

    import("mapbox-gl").then(({ default: mapboxgl }) => {
      if (cancelled || !containerRef.current) return;

      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

      const map = new mapboxgl.Map({
        container: containerRef.current!,
        style: "mapbox://styles/mapbox/satellite-v9",
        // Start at Monterey Bay Aquarium — mirrors the commercial page exit
        center: [-121.9018, 36.6182],
        zoom: 17.5,
        pitch: 65,
        bearing: -28,
        interactive: false,
        attributionControl: false,
      });

      map.on("load", () => {
        if (cancelled) return;

        // Pulsing service area markers — hidden until intro lands
        Object.values(SERVICE_AREAS).forEach((area) => {
          const el = document.createElement("div");
          el.style.cssText = [
            "width:10px;height:10px;border-radius:50%;",
            "background:rgba(126,200,227,0.75);",
            "box-shadow:0 0 0 0 rgba(126,200,227,0.45);",
            "animation:mapPulse 2.4s ease-out infinite;",
            "cursor:pointer;",
            "display:none;",
          ].join("");
          el.addEventListener("click", () => {
            onZipChangeRef.current?.(area.zip);
            onGoRef.current?.();
          });
          const marker = new mapboxgl.Marker({ element: el })
            .setLngLat(area.center)
            .addTo(map);
          markersRef.current.push(marker);
        });

        // Intro fly: Aquarium → Santa Cruz county overview
        map.flyTo({
          center:   INITIAL_CAMERA.center,
          zoom:     INITIAL_CAMERA.zoom,
          pitch:    0,
          bearing:  0,
          duration: 9000,
          curve:    1.7,
          essential: true,
        });

        // Unlock step-change logic and overlays after intro lands
        setTimeout(() => {
          if (cancelled) return;
          setMapLoaded(true);
          setOverlaysVisible(true);
          markersRef.current.forEach(m => { m.getElement().style.display = "block"; });
          // Clicking the map background (not the dots) opens the panel
          map.on("click", () => {
            if (stepIdxRef.current === 0) onOpenRef.current?.();
          });
        }, 9300);
      });

      mapRef.current = map;
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // ── React to step changes ───────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    if (stepIdx === 0) {
      // Zoom back out to service area overview
      map.flyTo({
        center: INITIAL_CAMERA.center,
        zoom: INITIAL_CAMERA.zoom,
        pitch: 0,
        bearing: 0,
        duration: 2200,
      });
      markersRef.current.forEach((m) => {
        m.getElement().style.display = "block";
      });
      setHasFlown(false);
    } else if (!hasFlown) {
      // First time advancing past location — fly to confirmed ZIP
      const area = SERVICE_AREAS[zip];
      if (area) {
        // 95060: dramatic zoom to the clock tower at Water St & Pacific Ave
        const isClockTower = zip === "95060";
        map.flyTo({
          center: isClockTower ? CLOCK_TOWER_95060 : area.center,
          zoom:     isClockTower ? CLOCK_TOWER_CAMERA.zoom     : ZOOMED_CAMERA.zoom,
          pitch:    isClockTower ? CLOCK_TOWER_CAMERA.pitch    : ZOOMED_CAMERA.pitch,
          bearing:  isClockTower ? CLOCK_TOWER_CAMERA.bearing  : ZOOMED_CAMERA.bearing,
          duration: isClockTower ? CLOCK_TOWER_CAMERA.duration : ZOOMED_CAMERA.duration,
          curve:    isClockTower ? CLOCK_TOWER_CAMERA.curve    : ZOOMED_CAMERA.curve,
          essential: true,
        });
        setTimeout(() => {
          markersRef.current.forEach((m) => {
            m.getElement().style.display = "none";
          });
        }, 600);
        setHasFlown(true);
      }
    }
  }, [step, zip, mapLoaded, hasFlown, stepIdx]);

  const area = SERVICE_AREAS[zip];

  // Determine which overlay to show
  type Overlay = "none" | "calendar" | "photos" | "summary";
  let overlay: Overlay = "none";
  if (stepIdx === 1) overlay = "calendar";
  else if (stepIdx === 2) overlay = "photos";
  else if (stepIdx >= 3) overlay = "summary";

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", background: "#050508" }}>
      {/* Pulse keyframe */}
      <style>{`
        @keyframes mapPulse {
          0%   { box-shadow: 0 0 0 0 rgba(126,200,227,0.55); }
          70%  { box-shadow: 0 0 0 12px rgba(126,200,227,0); }
          100% { box-shadow: 0 0 0 0 rgba(126,200,227,0); }
        }
      `}</style>

      {/* Mapbox canvas */}
      <div ref={containerRef} style={{ position: "absolute", inset: 0 }} />

      {/* Subtle vignette */}
      <div
        style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background:
            "linear-gradient(to bottom, rgba(5,5,8,0.45) 0%, transparent 25%, transparent 75%, rgba(5,5,8,0.55) 100%)",
        }}
      />

      {/* Step progress bar at bottom */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: "rgba(255,255,255,0.04)", pointerEvents: "none" }}>
        <motion.div
          style={{ height: "100%", background: "rgba(126,200,227,0.5)", transformOrigin: "left" }}
          animate={{ scaleX: Math.max(0.04, stepIdx / (STEP_ORDER.length - 1)) }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      </div>

      {/* Confirmed location badge */}
      <AnimatePresence>
        {stepIdx > 0 && area && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            style={{
              position: "absolute", top: 14, left: 16,
              background: "rgba(5,5,8,0.78)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              border: "1px solid rgba(126,200,227,0.16)",
              borderRadius: 8, padding: "5px 12px",
              color: "rgba(126,200,227,0.8)",
              fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
              textTransform: "uppercase", pointerEvents: "none",
            }}
          >
            ▲ {area.name} · {zip}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Coverage alert — top-left below badge, appears after fly animation */}
      <AnimatePresence>
        {stepIdx > 0 && area?.alert && (
          <CoverageAlertCard key={zip} alert={area.alert} />
        )}
      </AnimatePresence>

      {/* Logo banner — visible on the home/location step, after intro lands */}
      <AnimatePresence>
        {stepIdx === 0 && overlaysVisible && <LogoBanner />}
      </AnimatePresence>

      {/* Zip selector — lower-left, after intro lands */}
      <AnimatePresence>
        {stepIdx === 0 && overlaysVisible && (
          <ZipSelector selectedZip={selectedZip} onZipChange={onZipChange} onGo={onGo} />
        )}
      </AnimatePresence>

      {/* Window counter — lower-left, visible from timeslot step onward */}
      <AnimatePresence>
        {stepIdx >= 1 && (
          <MapWindowCounter
            key="win-counter"
            count={windowCount}
            minWindows={SERVICE_AREAS[zip]?.minWindows ?? 1}
            onChange={n => onWindowCountChange?.(n)}
          />
        )}
      </AnimatePresence>

      {/* Dynamic overlay */}
      <AnimatePresence mode="wait">
        {overlay === "calendar" && (
          <CalendarOverlay key="cal" date={date} time={time} slotMap={slotMap} onDateChange={onDateChange} onTimeChange={onTimeChange} />
        )}
        {overlay === "photos" && (
          <PhotosOverlay key="photos" windowCount={windowCount} />
        )}
        {overlay === "summary" && (
          <SummaryOverlay
            key="summary"
            date={date} time={time}
            windowCount={windowCount} needsEstimate={needsEstimate}
            zip={zip} step={step}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Calendar Overlay ──────────────────────────────────────────────────

function calAddDays(iso: string, n: number): string {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

function getMonday(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  const dow = d.getDay();
  d.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1));
  return d.toISOString().split("T")[0];
}

function CalendarOverlay({
  date, time, slotMap, onDateChange, onTimeChange,
}: {
  date: string; time: string;
  slotMap: Record<string, string[]>;
  onDateChange?: (d: string) => void;
  onTimeChange?: (t: string) => void;
}) {
  const today = new Date().toISOString().split("T")[0];
  const baseDate = date || today;

  const [view, setView]           = useState<"week" | "month">("week");
  const [weekStart, setWeekStart] = useState(() => getMonday(baseDate));
  const [monthKey, setMonthKey]   = useState(() => baseDate.slice(0, 7));
  const didAutoSelect             = useRef(false);

  useEffect(() => {
    if (date) {
      setWeekStart(getMonday(date));
      setMonthKey(date.slice(0, 7));
    }
  }, [date]);

  // Auto-select the real nearest available slot on first slotMap load
  useEffect(() => {
    if (didAutoSelect.current) return;
    const keys = Object.keys(slotMap);
    if (!keys.length) return;
    if (date && date !== FALLBACK_DATE) return; // user already chose
    const firstAvail = keys.sort().find(d => d >= today && (slotMap[d] ?? []).length > 0);
    if (firstAvail) {
      didAutoSelect.current = true;
      onDateChange?.(firstAvail);
      const firstSlot = slotMap[firstAvail]?.[0];
      if (firstSlot) onTimeChange?.(firstSlot);
    }
  }, [slotMap]);

  function selectDay(d: string) {
    onDateChange?.(d);
    const slots = slotMap[d] ?? [];
    if (slots.length > 0 && !slots.includes(time)) onTimeChange?.(slots[0]);
  }

  const weekDays = Array.from({ length: 7 }, (_, i) => calAddDays(weekStart, i));

  const [mYear, mMonthNum] = monthKey.split("-").map(Number);
  const firstDow  = new Date(mYear, mMonthNum - 1, 1).getDay();
  const totalDays = new Date(mYear, mMonthNum, 0).getDate();
  const monthName = new Date(mYear, mMonthNum - 1, 1).toLocaleString("en-US", { month: "long" });

  function prevPeriod() {
    if (view === "week") { setWeekStart(calAddDays(weekStart, -7)); return; }
    const p = new Date(mYear, mMonthNum - 2, 1);
    setMonthKey(`${p.getFullYear()}-${String(p.getMonth() + 1).padStart(2, "0")}`);
  }
  function nextPeriod() {
    if (view === "week") { setWeekStart(calAddDays(weekStart, 7)); return; }
    const n = new Date(mYear, mMonthNum, 1);
    setMonthKey(`${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}`);
  }

  const weekLabel = (() => {
    const d0 = new Date(weekStart + "T12:00:00");
    const d6 = new Date(calAddDays(weekStart, 6) + "T12:00:00");
    const fmt = (d: Date) => d.toLocaleString("en-US", { month: "short", day: "numeric" });
    return `${fmt(d0)} – ${fmt(d6)}`;
  })();

  const TEAL = "rgba(126,200,227,";
  const navBtn: React.CSSProperties = {
    background: "transparent", border: `1px solid ${TEAL}0.14)`,
    borderRadius: 6, color: `${TEAL}0.5)`, fontSize: 14, lineHeight: 1,
    padding: "2px 10px", cursor: "pointer", fontFamily: "inherit",
    transition: "all 0.12s",
  };

  const timeSlots = date ? (slotMap[date] ?? []) : [];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.93, y: 14 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.93 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div style={{
        background: "rgba(5,5,8,0.88)",
        backdropFilter: "blur(22px)",
        WebkitBackdropFilter: "blur(22px)",
        border: `1px solid ${TEAL}0.14)`,
        borderRadius: 18, padding: "16px 18px 14px",
        boxShadow: "0 10px 48px rgba(0,0,0,0.6)",
        width: 292, pointerEvents: "auto",
      }}>

        {/* ── Header: nav + title + view toggle ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <button style={navBtn} onClick={prevPeriod}>‹</button>
          <div style={{ textAlign: "center" as const }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.78)" }}>
              {view === "week" ? weekLabel : `${monthName} ${mYear}`}
            </div>
          </div>
          <button style={navBtn} onClick={nextPeriod}>›</button>
        </div>

        {/* View toggle */}
        <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 12 }}>
          {(["week", "month"] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              style={{
                fontSize: 8.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const,
                padding: "3px 10px", borderRadius: 5, cursor: "pointer", fontFamily: "inherit",
                background: view === v ? `${TEAL}0.16)` : "transparent",
                color: view === v ? `${TEAL}0.9)` : "rgba(255,255,255,0.28)",
                border: `1px solid ${view === v ? `${TEAL}0.32)` : "rgba(255,255,255,0.06)"}`,
                transition: "all 0.12s",
              }}
            >{v}</button>
          ))}
        </div>

        {/* ── Week view ── */}
        {view === "week" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
            {weekDays.map(d => {
              const slots   = slotMap[d] ?? [];
              const hasSlots = slots.length > 0 && d >= today;
              const selected = d === date;
              const dayObj   = new Date(d + "T12:00:00");
              const dow      = ["Su","Mo","Tu","We","Th","Fr","Sa"][dayObj.getDay()];
              const dayNum   = dayObj.getDate();
              const past     = d < today;
              return (
                <button key={d}
                  onClick={() => { if (hasSlots) selectDay(d); }}
                  style={{
                    display: "flex", flexDirection: "column" as const,
                    alignItems: "center", padding: "8px 2px", borderRadius: 9, gap: 3,
                    background: selected ? `${TEAL}0.88)` : hasSlots ? `${TEAL}0.07)` : "transparent",
                    border: `1px solid ${selected ? `${TEAL}0.6)` : hasSlots ? `${TEAL}0.15)` : "transparent"}`,
                    cursor: hasSlots ? "pointer" : "default",
                    opacity: past || (!hasSlots && !past) ? 0.2 : 1,
                    fontFamily: "inherit",
                  }}
                >
                  <span style={{ fontSize: 7.5, fontWeight: 700, color: selected ? "#050508" : "rgba(255,255,255,0.4)", letterSpacing: "0.04em" }}>{dow}</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: selected ? "#050508" : "rgba(255,255,255,0.85)", lineHeight: 1 }}>{dayNum}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* ── Month view ── */}
        {view === "month" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, marginBottom: 4 }}>
              {["Su","Mo","Tu","We","Th","Fr","Sa"].map(l => (
                <div key={l} style={{ textAlign: "center" as const, fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.2)" }}>{l}</div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
              {Array.from({ length: firstDow }, (_, i) => <div key={`e${i}`} />)}
              {Array.from({ length: totalDays }, (_, i) => {
                const dayNum  = i + 1;
                const iso     = `${mYear}-${String(mMonthNum).padStart(2,"0")}-${String(dayNum).padStart(2,"0")}`;
                const slots   = slotMap[iso] ?? [];
                const hasSlots = slots.length > 0 && iso >= today;
                const selected = iso === date;
                const past    = iso < today;
                return (
                  <div key={dayNum}
                    onClick={() => { if (hasSlots) selectDay(iso); }}
                    style={{
                      aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center",
                      borderRadius: 6, fontSize: 10, fontWeight: selected ? 700 : 400,
                      color: past ? "rgba(255,255,255,0.1)" : selected ? "#050508" : hasSlots ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.2)",
                      background: selected ? `${TEAL}0.88)` : hasSlots ? `${TEAL}0.07)` : "transparent",
                      cursor: hasSlots ? "pointer" : "default",
                    }}
                  >{dayNum}</div>
                );
              })}
            </div>
          </>
        )}

        {/* ── Time slot pills ── */}
        {timeSlots.length > 0 && (
          <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${TEAL}0.1)`, display: "flex", flexWrap: "wrap" as const, gap: 5 }}>
            {timeSlots.map(t => (
              <button key={t} onClick={() => onTimeChange?.(t)}
                style={{
                  padding: "4px 10px", borderRadius: 6,
                  background: t === time ? `${TEAL}0.88)` : `${TEAL}0.08)`,
                  border: `1px solid ${t === time ? `${TEAL}0.6)` : `${TEAL}0.16)`}`,
                  color: t === time ? "#050508" : `${TEAL}0.82)`,
                  fontSize: 10, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                }}
              >{formatTime(t)}</button>
            ))}
          </div>
        )}

        {/* Fallback: just show the selected time if no slot list yet */}
        {timeSlots.length === 0 && time && (
          <div style={{ marginTop: 12, textAlign: "center" as const, fontSize: 13, fontWeight: 700, color: `${TEAL}0.78)`, letterSpacing: "0.06em" }}>
            ⊙ {formatTime(time)}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Photos Overlay ────────────────────────────────────────────────────

const PHOTO_CARDS = [
  { label: "Crystal clear results",   grad: "rgba(126,200,227,0.18)", icon: "✦" },
  { label: "Streak-free guarantee",   grad: "rgba(167,139,250,0.18)", icon: "◈" },
  { label: "Inside & outside",        grad: "rgba(200,210,130,0.14)", icon: "⬡" },
  { label: "Any height, ladderless",  grad: "rgba(130,200,190,0.16)", icon: "▲" },
];

function PhotosOverlay({ windowCount }: { windowCount: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "28px 20px", gap: 14, pointerEvents: "none",
      }}
    >
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", marginBottom: 2 }}>
        What we deliver
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, width: "100%", maxWidth: 380 }}>
        {PHOTO_CARDS.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.08 }}
            style={{
              background: card.grad,
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 14, padding: "20px 14px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 8, opacity: 0.65 }}>{card.icon}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.68)", lineHeight: 1.35 }}>
              {card.label}
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ fontSize: 16, fontWeight: 700, color: "rgba(126,200,227,0.85)", marginTop: 4 }}>
        {windowCount} window{windowCount !== 1 ? "s" : ""} · ${windowCount * PRICE_PER_WINDOW}
      </div>
    </motion.div>
  );
}

// ── Summary Overlay ───────────────────────────────────────────────────

function SummaryOverlay({ date, time, windowCount, needsEstimate, zip, step }: {
  date: string; time: string; windowCount: number;
  needsEstimate: boolean; zip: string; step: Step;
}) {
  const area = SERVICE_AREAS[zip];
  const rows = [
    { label: "Location", value: area ? `${area.name}, CA ${zip}` : zip },
    { label: "Date",     value: date ? formatDateFull(date) : "July 4, 2026" },
    { label: "Time",     value: time ? formatTime(time)    : "2:50 PM" },
    { label: "Windows",  value: `${windowCount} — $${windowCount * PRICE_PER_WINDOW}` },
    ...(step === "complete"
      ? [{ label: "Service", value: needsEstimate ? "Full estimate" : "Windows only" }]
      : []),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)",
        pointerEvents: "none",
      }}
    >
      <div style={{
        background: "rgba(5,5,8,0.84)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 14, padding: "16px 22px",
        minWidth: 230,
      }}>
        {step === "complete" && (
          <div style={{ textAlign: "center", marginBottom: 12, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(126,200,227,0.7)", textTransform: "uppercase" }}>
            ✦ All Set
          </div>
        )}
        {rows.map(({ label, value }) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 20, marginBottom: 6 }}>
            <span style={{ fontSize: 9.5, color: "rgba(255,255,255,0.28)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {label}
            </span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.72)", fontWeight: 500 }}>
              {value}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ── Coverage Alert Overlay ────────────────────────────────────────────

function CoverageAlertCard({ alert }: { alert: CoverageAlert }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -14 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -14 }}
      transition={{ duration: 0.45, delay: 1.8, ease: "easeOut" }}
      style={{
        position: "absolute", top: 54, left: 16,
        pointerEvents: "none", maxWidth: 230,
      }}
    >
      <div style={{
        background: "rgba(5,5,8,0.82)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(251,191,36,0.25)",
        borderRadius: 10,
        padding: "10px 13px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 6, marginBottom: 8,
        }}>
          <span style={{ fontSize: 11, lineHeight: 1 }}>⚠</span>
          <span style={{
            fontSize: 8.5, fontWeight: 700, letterSpacing: "0.12em",
            textTransform: "uppercase", color: "rgba(251,191,36,0.85)",
          }}>{alert.headline}</span>
        </div>
        {alert.notes.map((note, i) => (
          <div key={i} style={{
            display: "flex", gap: 6, marginBottom: i < alert.notes.length - 1 ? 5 : 0,
          }}>
            <span style={{ fontSize: 9, color: "rgba(251,191,36,0.5)", flexShrink: 0, marginTop: 1 }}>·</span>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", lineHeight: 1.45 }}>{note}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ── Zip Selector ─────────────────────────────────────────────────────

function ZipSelector({ selectedZip, onZipChange, onGo }: { selectedZip: string; onZipChange?: (zip: string) => void; onGo?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.45, ease: "easeOut", delay: 0.15 }}
      style={{
        position: "absolute",
        bottom: "14%",
        left: "10%",
        pointerEvents: "auto",
      }}
    >
      <div style={{
        background: "rgba(5,5,8,0.78)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(126,200,227,0.12)",
        borderRadius: 12,
        padding: "11px 16px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
      }}>
        <span style={{
          fontSize: 9.5, fontWeight: 600, letterSpacing: "0.14em",
          textTransform: "uppercase", color: "rgba(255,255,255,0.3)",
          flexShrink: 0,
        }}>
          Service needed in
        </span>
        <select
          value={selectedZip}
          onChange={e => onZipChange?.(e.target.value)}
          style={{
            background: "transparent",
            border: "none",
            color: "rgba(126,200,227,0.88)",
            fontSize: 13,
            fontWeight: 700,
            outline: "none",
            cursor: "pointer",
            fontFamily: "inherit",
            letterSpacing: "0.04em",
          }}
        >
          {Object.values(SERVICE_AREAS).map(area => (
            <option key={area.zip} value={area.zip} style={{ background: "#080810", color: "white" }}>
              {area.zip} — {area.name}
            </option>
          ))}
        </select>

        <button
          onClick={onGo}
          style={{
            background: "rgba(126,200,227,0.15)",
            border: "1px solid rgba(126,200,227,0.35)",
            borderRadius: 8,
            color: "rgba(126,200,227,0.95)",
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.1em",
            padding: "5px 12px",
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "background 0.15s, border-color 0.15s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(126,200,227,0.28)";
            e.currentTarget.style.borderColor = "rgba(126,200,227,0.6)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "rgba(126,200,227,0.15)";
            e.currentTarget.style.borderColor = "rgba(126,200,227,0.35)";
          }}
        >
          GO!
        </button>
      </div>
    </motion.div>
  );
}

// ── Logo Banner ───────────────────────────────────────────────────────

function LogoBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      style={{
        position: "absolute",
        top: "50%",
        left: "10%",
        transform: "translateY(-50%)",
        pointerEvents: "none",
      }}
    >
      <div style={{
        background: "rgba(5,5,8,0.78)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(126,200,227,0.14)",
        borderRadius: 16,
        padding: "22px 30px 20px",
        boxShadow: "0 8px 40px rgba(0,0,0,0.45)",
      }}>
        <div style={{
          fontSize: 9, fontWeight: 700, letterSpacing: "0.22em",
          textTransform: "uppercase", color: "rgba(126,200,227,0.6)",
          marginBottom: 8,
        }}>
          ✦ Santa Cruz County
        </div>
        <div style={{
          fontSize: 28, fontWeight: 800, color: "rgba(255,255,255,0.92)",
          letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 6,
        }}>
          Ladderless<br />Windows
        </div>
        <div style={{
          fontSize: 10, fontWeight: 600, letterSpacing: "0.16em",
          textTransform: "uppercase", color: "rgba(126,200,227,0.55)",
        }}>
          Instant Window Cleaning
        </div>
      </div>
    </motion.div>
  );
}

// ── Map Window Counter ────────────────────────────────────────────────

function MapWindowCounter({ count, minWindows, onChange }: {
  count: number; minWindows: number; onChange: (n: number) => void;
}) {
  const atMin = count <= minWindows;
  const atMax = count >= MAX_WINDOWS;
  const btnBase: React.CSSProperties = {
    width: 30, height: 30, borderRadius: "50%",
    background: "rgba(126,200,227,0.1)",
    border: "1px solid rgba(126,200,227,0.25)",
    color: "rgba(126,200,227,0.85)",
    fontSize: 18, fontWeight: 700, lineHeight: 1,
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "all 0.15s", flexShrink: 0,
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.38, ease: "easeOut" }}
      style={{ position: "absolute", bottom: "14%", left: "10%", pointerEvents: "auto" }}
    >
      <div style={{
        background: "rgba(5,5,8,0.84)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(126,200,227,0.16)",
        borderRadius: 14, padding: "13px 18px 11px",
        boxShadow: "0 6px 32px rgba(0,0,0,0.45)",
      }}>
        <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase" as const, color: "rgba(126,200,227,0.5)", marginBottom: 10 }}>
          Windows
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={() => onChange(Math.max(minWindows, count - 1))}
            style={{ ...btnBase, cursor: atMin ? "not-allowed" : "pointer", opacity: atMin ? 0.3 : 1 }}>−</button>
          <div style={{ textAlign: "center" as const, minWidth: 28 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "rgba(255,255,255,0.92)", lineHeight: 1 }}>{count}</div>
          </div>
          <button onClick={() => onChange(Math.min(MAX_WINDOWS, count + 1))}
            style={{ ...btnBase, cursor: atMax ? "not-allowed" : "pointer", opacity: atMax ? 0.3 : 1 }}>+</button>
        </div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.32)", marginTop: 8 }}>
          ${count * PRICE_PER_WINDOW} total
        </div>
        {atMin && minWindows > 1 && (
          <div style={{ fontSize: 8.5, color: "rgba(126,200,227,0.4)", marginTop: 4, letterSpacing: "0.03em" }}>
            {minWindows}-window min for this area
          </div>
        )}
      </div>
    </motion.div>
  );
}

