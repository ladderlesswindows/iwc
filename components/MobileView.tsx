"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type mapboxgl from "mapbox-gl";
import { PowerConsoleSkin } from "@/components/npc/PowerConsoleSkin";

interface Props {
  date: string; time: string; windowCount: number;
  needsEstimate: boolean; estimateDeadline: string;
  address: string; firstName: string; lastName: string;
  phone: string; email: string; notes: string;
  slotMap: Record<string, string[]>;
  onDateChange: (v: string) => void;
  onTimeChange: (v: string) => void;
  onWindowCountChange: (v: number) => void;
  onNeedsEstimateChange: (v: boolean) => void;
  onEstimateDeadlineChange: (v: string) => void;
  onAddressChange: (v: string) => void;
  onFirstNameChange: (v: string) => void;
  onLastNameChange: (v: string) => void;
  onPhoneChange: (v: string) => void;
  onEmailChange: (v: string) => void;
  onNotesChange: (v: string) => void;
  onGoToSummary: () => void;
}

const SHEET_H    = "74dvh";
const PEEK_PX    = 68; // visible height when collapsed

export function MobileView(props: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [open, setOpen] = useState(false);

  // ── Satellite map intro ────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let cancelled = false;

    import("mapbox-gl").then(({ default: mapboxgl }) => {
      if (cancelled || !containerRef.current) return;
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

      const map = new mapboxgl.Map({
        container: containerRef.current!,
        style: "mapbox://styles/mapbox/satellite-v9",
        // Still overhead — matches desktop intent
        center: [-121.9900, 37.0050],
        zoom: 10.5,
        pitch: 0,
        bearing: 0,
        interactive: false,
        attributionControl: false,
      });

      // SAVED — Aquarium close-up intro + flyTo — restore if desired:
      // center: [-121.9018, 36.6182], zoom: 17.5, pitch: 65, bearing: -28
      // map.flyTo({ center: [-121.9900, 37.0050], zoom: 10.5, pitch: 48,
      //   bearing: -8, duration: 9000, curve: 1.7, essential: true });

      map.on("load", () => {
        if (cancelled) return;
      });

      mapRef.current = map;
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div style={{
      width: "100vw", height: "100dvh",
      position: "relative", overflow: "hidden", zIndex: 1,
    }}>
      {/* Satellite map */}
      <div ref={containerRef} style={{ position: "absolute", inset: 0 }} />

      {/* Vignette — heavy at bottom to frame the sheet */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: [
          "linear-gradient(to bottom,",
          "  rgba(5,5,8,0.52) 0%,",
          "  transparent 25%,",
          "  transparent 55%,",
          "  rgba(5,5,8,0.88) 100%)",
        ].join(""),
      }} />

      {/* Logo — compact for mobile */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.5 }}
        style={{ position: "absolute", top: 20, left: 18, pointerEvents: "none" }}
      >
        <div style={{
          background: "rgba(5,5,8,0.78)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(126,200,227,0.14)",
          borderRadius: 12,
          padding: "11px 16px 9px",
        }}>
          <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(126,200,227,0.6)", marginBottom: 4 }}>
            ✦ Santa Cruz County
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "rgba(255,255,255,0.92)", letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 4 }}>
            Ladderless Windows
          </div>
          <div style={{ fontSize: 7.5, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(126,200,227,0.55)" }}>
            Instant Window Cleaning
          </div>
        </div>
      </motion.div>

      {/* Bottom sheet */}
      <motion.div
        animate={{ y: open ? 0 : `calc(${SHEET_H} - ${PEEK_PX}px)` }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        style={{
          position: "fixed",
          bottom: 0, left: 0, right: 0,
          height: SHEET_H,
          background: "rgba(8,8,16,0.92)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderTop: "1px solid rgba(126,200,227,0.14)",
          borderRadius: "18px 18px 0 0",
          zIndex: 20,
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.5)",
        }}
      >
        {/* Handle + label row */}
        <div
          onClick={() => setOpen(o => !o)}
          style={{
            padding: "12px 20px 10px",
            cursor: "pointer",
            flexShrink: 0,
            userSelect: "none",
          }}
        >
          {/* Drag pill */}
          <div style={{ width: 36, height: 3, borderRadius: 2, background: "rgba(126,200,227,0.28)", margin: "0 auto 10px" }} />

          {/* Label row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{
              fontSize: 9.5, fontWeight: 700, letterSpacing: "0.16em",
              textTransform: "uppercase", color: "rgba(126,200,227,0.65)",
            }}>
              {open ? "Power Console" : "⌂  Book Instantly"}
            </span>
            <span style={{ fontSize: 14, color: "rgba(126,200,227,0.4)", lineHeight: 1 }}>
              {open ? "↓" : "↑"}
            </span>
          </div>
        </div>

        {/* PowerConsole — scrollable */}
        <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
          <PowerConsoleSkin
            date={props.date}
            time={props.time}
            windowCount={props.windowCount}
            needsEstimate={props.needsEstimate}
            estimateDeadline={props.estimateDeadline}
            slotMap={props.slotMap}
            onDateChange={props.onDateChange}
            onTimeChange={props.onTimeChange}
            onWindowCountChange={props.onWindowCountChange}
            onNeedsEstimateChange={props.onNeedsEstimateChange}
            onEstimateDeadlineChange={props.onEstimateDeadlineChange}
            address={props.address}
            firstName={props.firstName}
            lastName={props.lastName}
            phone={props.phone}
            email={props.email}
            notes={props.notes}
            onAddressChange={props.onAddressChange}
            onFirstNameChange={props.onFirstNameChange}
            onLastNameChange={props.onLastNameChange}
            onPhoneChange={props.onPhoneChange}
            onEmailChange={props.onEmailChange}
            onNotesChange={props.onNotesChange}
            onGoToSummary={props.onGoToSummary}
            mode="dark"
            onSkinChange={() => {}}
          />
        </div>
      </motion.div>
    </div>
  );
}
