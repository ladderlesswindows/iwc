"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { NPCWidget } from "@/components/NPCWidget";
import { AppHeader } from "@/components/AppHeader";
import { SlotPicker } from "@/components/SlotPicker";
import { EstimateToggle } from "@/components/EstimateToggle";
import { WindowCounter } from "@/components/WindowCounter";
import { ReviewsSection } from "@/components/ReviewsSection";
import { MobileView } from "@/components/MobileView";
import { motion, AnimatePresence } from "framer-motion";
import { FALLBACK_DATE, FALLBACK_TIME, formatDate, formatTime } from "@/lib/availability";
import { DEFAULT_ZIP } from "@/lib/serviceAreas";
import type { Step } from "@/components/npc/types";

// MapPanel uses Mapbox GL — must not SSR
const MapPanel = dynamic(() => import("@/components/MapPanel"), { ssr: false });

export default function HomePage() {
  const router = useRouter();

  // ── Shared booking state ─────────────────────────────────────
  const [selectedDate, setSelectedDate] = useState(FALLBACK_DATE);
  const [selectedTime, setSelectedTime] = useState(FALLBACK_TIME);
  const [needsEstimate, setNeedsEstimate] = useState(false);
  const [estimateDeadline, setEstimateDeadline] = useState("");
  const [windowCount, setWindowCount] = useState(1);
  const [address, setAddress] = useState("Santa Cruz, CA 95060");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  // ── NPC state ─────────────────────────────────────────────────
  const [npcPaused, setNpcPaused] = useState(false);
  const [activeStep, setActiveStep] = useState<Step>("location");
  const [selectedZip, setSelectedZip] = useState(DEFAULT_ZIP);
  const [goTrigger, setGoTrigger] = useState(0);
  const [panelVisible, setPanelVisible] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);

  function handleGoToReview() {
    setPanelVisible(false);
    setReviewMode(true);
  }

  const pauseNPC = useCallback(() => {
    if (!npcPaused) setNpcPaused(true);
  }, [npcPaused]);

  // ── Booking navigation ────────────────────────────────────────
  function buildParams(extra: Record<string, string> = {}) {
    return new URLSearchParams({
      date: selectedDate, time: selectedTime,
      windows: String(windowCount),
      address, firstName, lastName, phone, email, notes,
      needsEstimate: String(needsEstimate),
      estimateDeadline,
      ...extra,
    });
  }

  function handleBook() {
    if (!selectedDate || !selectedTime || !address.trim()) return;
    router.push(`/summary?${buildParams().toString()}`);
  }

  const canBook = Boolean(selectedDate && selectedTime && address.trim());

  // ── Mobile form column ────────────────────────────────────────
  const formColumn = (
    <div
      className="flex flex-col"
      style={{ minHeight: "100dvh" }}
      onPointerDown={pauseNPC}
    >
      <AppHeader />

      <main className="flex-1 flex flex-col gap-3 px-4 pb-8" style={{ paddingTop: 72 }}>
        <SlotPicker
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onDateChange={setSelectedDate}
          onTimeChange={setSelectedTime}
        />

        <EstimateToggle
          needsEstimate={needsEstimate}
          estimateDeadline={estimateDeadline}
          onChange={setNeedsEstimate}
          onDeadlineChange={setEstimateDeadline}
        />

        <motion.div
          className="glass-card p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.16 }}
        >
          <WindowCounter count={windowCount} onChange={setWindowCount} />

          <div className="mb-3">
            <label className="field-label" htmlFor="address">Service Address *</label>
            <input id="address" className="field-input mt-1" type="text"
              placeholder="123 Main St, Santa Cruz, CA 95060"
              value={address} onChange={(e) => setAddress(e.target.value)}
              autoComplete="street-address" />
          </div>

          <div className="flex gap-2 mb-3">
            <div className="flex-1">
              <label className="field-label" htmlFor="firstName">First Name</label>
              <input id="firstName" className="field-input mt-1" type="text" placeholder="Sam"
                value={firstName} onChange={(e) => setFirstName(e.target.value)} autoComplete="given-name" />
            </div>
            <div className="flex-1">
              <label className="field-label" htmlFor="lastName">Last Name</label>
              <input id="lastName" className="field-input mt-1" type="text" placeholder="Taylor"
                value={lastName} onChange={(e) => setLastName(e.target.value)} autoComplete="family-name" />
            </div>
          </div>

          <div className="flex gap-2 mb-3">
            <div className="flex-1">
              <label className="field-label" htmlFor="phone">Phone</label>
              <input id="phone" className="field-input mt-1" type="tel" placeholder="(831) 555-0100"
                value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
            </div>
            <div className="flex-1">
              <label className="field-label" htmlFor="email">Email</label>
              <input id="email" className="field-input mt-1" type="email" placeholder="you@email.com"
                value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </div>
          </div>

          <div className="mb-4">
            <label className="field-label" htmlFor="notes">Notes</label>
            <textarea id="notes" className="field-input mt-1" rows={2}
              placeholder="Gate code, special instructions…"
              value={notes} onChange={(e) => setNotes(e.target.value)} style={{ resize: "none" }} />
          </div>

          <button className="book-btn w-full" onClick={handleBook} disabled={!canBook}
            style={{ opacity: canBook ? 1 : 0.45, cursor: canBook ? "pointer" : "not-allowed" }}>
            Review &amp; Book — ${windowCount * 22}
          </button>

          {!canBook && (
            <p style={{ color: "rgba(255,255,255,0.28)", fontSize: 10, textAlign: "center", marginTop: 6 }}>
              Select a slot and enter your address to continue
            </p>
          )}
        </motion.div>
      </main>

      <ReviewsSection />
    </div>
  );

  return (
    <>
      {/* ── Desktop: full-screen map + floating NPC panel ── */}
      <div className="hidden md:block" style={{ width: "100vw", height: "100vh" }}>
        {/* Map fills the entire viewport */}
        <MapPanel
          step={reviewMode ? "timeslot" : activeStep}
          selectedZip={selectedZip}
          date={selectedDate}
          time={selectedTime}
          windowCount={windowCount}
          needsEstimate={needsEstimate}
          onZipChange={setSelectedZip}
          onGo={() => { setPanelVisible(true); setGoTrigger(t => t + 1); }}
          address={address}
          onWindowCountChange={setWindowCount}
        />

        {/* Floating NPC panel — slides in on GO! */}
        <AnimatePresence>
          {panelVisible && (
            <motion.div
              initial={{ x: 390, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 390, opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              style={{
                position: "fixed",
                top: 16,
                right: 16,
                bottom: 16,
                width: 360,
                zIndex: 10,
                borderRadius: 16,
                background: "rgba(10, 6, 20, 0.80)",
                backdropFilter: "blur(18px)",
                WebkitBackdropFilter: "blur(18px)",
                border: "1px solid rgba(255,255,255,0.07)",
                boxShadow: "0 8px 40px rgba(0,0,0,0.45)",
                overflowY: "auto",
              }}
            >
              <NPCWidget
                date={selectedDate}
                time={selectedTime}
                windowCount={windowCount}
                needsEstimate={needsEstimate}
                estimateDeadline={estimateDeadline}
                onDateChange={setSelectedDate}
                onTimeChange={setSelectedTime}
                onWindowCountChange={setWindowCount}
                onNeedsEstimateChange={setNeedsEstimate}
                onEstimateDeadlineChange={setEstimateDeadline}
                address={address}
                firstName={firstName}
                lastName={lastName}
                phone={phone}
                email={email}
                notes={notes}
                onAddressChange={setAddress}
                onFirstNameChange={setFirstName}
                onLastNameChange={setLastName}
                onPhoneChange={setPhone}
                onEmailChange={setEmail}
                onNotesChange={setNotes}
                selectedZip={selectedZip}
                paused={npcPaused}
                onResume={() => setNpcPaused(false)}
                onGoToSummary={handleGoToReview}
                onStepChange={setActiveStep}
                onZipChange={setSelectedZip}
                goTrigger={goTrigger}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Review overlay — appears instead of routing directly to /summary ── */}
      <AnimatePresence>
        {reviewMode && (
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            style={{
              position: "fixed",
              bottom: 36,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 20,
              width: 500,
              maxWidth: "calc(100vw - 120px)",
            }}
          >
            <div style={{
              background: "rgba(5,5,8,0.90)",
              backdropFilter: "blur(28px)",
              WebkitBackdropFilter: "blur(28px)",
              border: "1px solid rgba(126,200,227,0.2)",
              borderRadius: 18,
              padding: "20px 24px 18px",
              boxShadow: "0 12px 56px rgba(0,0,0,0.65)",
            }}>
              <div style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: "rgba(126,200,227,0.45)", marginBottom: 14 }}>
                Booking Summary
              </div>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 8, marginBottom: 18 }}>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.82)" }}>
                  <span style={{ color: "rgba(126,200,227,0.5)", marginRight: 10 }}>📅</span>
                  {selectedDate ? formatDate(selectedDate) : "Date TBD"} · {selectedTime ? formatTime(selectedTime) : "Time TBD"}
                </div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.82)" }}>
                  <span style={{ color: "rgba(126,200,227,0.5)", marginRight: 10 }}>🪟</span>
                  {windowCount} window{windowCount !== 1 ? "s" : ""} ·{" "}
                  <span style={{ color: "rgba(126,200,227,0.85)", fontWeight: 700 }}>${windowCount * 22}</span>
                </div>
                {address.trim() && !/^Santa Cruz/.test(address) && (
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                    <span style={{ color: "rgba(126,200,227,0.5)", marginRight: 10 }}>📍</span>
                    {address}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => { setReviewMode(false); setPanelVisible(true); }}
                  style={{
                    background: "transparent", border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 10, color: "rgba(255,255,255,0.4)",
                    fontSize: 12, fontWeight: 600, padding: "10px 18px",
                    cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(126,200,227,0.3)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
                >← Edit</button>
                <button
                  onClick={() => router.push(`/summary?${buildParams().toString()}`)}
                  style={{
                    flex: 1, background: "rgba(126,200,227,0.16)",
                    border: "1px solid rgba(126,200,227,0.42)",
                    borderRadius: 10, color: "rgba(126,200,227,0.95)",
                    fontSize: 13, fontWeight: 700, padding: "10px 18px",
                    cursor: "pointer", fontFamily: "inherit",
                    letterSpacing: "0.04em", transition: "all 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(126,200,227,0.26)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(126,200,227,0.16)"}
                >Confirm &amp; Book →</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile: satellite map + bottom-sheet PowerConsole ── */}
      <div className="md:hidden">
        <MobileView
          date={selectedDate}
          time={selectedTime}
          windowCount={windowCount}
          needsEstimate={needsEstimate}
          estimateDeadline={estimateDeadline}
          address={address}
          firstName={firstName}
          lastName={lastName}
          phone={phone}
          email={email}
          notes={notes}
          onDateChange={setSelectedDate}
          onTimeChange={setSelectedTime}
          onWindowCountChange={setWindowCount}
          onNeedsEstimateChange={setNeedsEstimate}
          onEstimateDeadlineChange={setEstimateDeadline}
          onAddressChange={setAddress}
          onFirstNameChange={setFirstName}
          onLastNameChange={setLastName}
          onPhoneChange={setPhone}
          onEmailChange={setEmail}
          onNotesChange={setNotes}
          onGoToSummary={() => router.push(`/summary?${buildParams().toString()}`)}
        />
      </div>
    </>
  );
}
