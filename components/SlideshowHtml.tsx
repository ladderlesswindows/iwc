"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";

const DURATION = 5000;
const FAST_DURATION = 600;

const SVG_STYLE: React.CSSProperties = { width: "100%", borderRadius: 10 };
const NAV_BTN_STYLE: React.CSSProperties = {
  fontSize: 12, padding: "4px 10px", borderRadius: 7,
  border: "1px solid #ddd", background: "white", color: "#555", cursor: "pointer",
};

const SLIDES: { svg: React.ReactNode; caption: string }[] = [
  {
    caption: "✅ Your worker will show up on time — or you'll get a window free.",
    svg: (
      <svg viewBox="0 0 520 280" xmlns="http://www.w3.org/2000/svg" style={SVG_STYLE}>
        <rect width="520" height="280" fill="#E8F4FD" rx="12"/>
        <rect y="220" width="520" height="60" fill="#C8DEB0"/>
        <rect y="230" width="520" height="30" fill="#9BB8A0"/>
        <rect x="40" y="243" width="40" height="4" fill="#E8F4FD" rx="2"/>
        <rect x="140" y="243" width="40" height="4" fill="#E8F4FD" rx="2"/>
        <rect x="240" y="243" width="40" height="4" fill="#E8F4FD" rx="2"/>
        <rect x="340" y="243" width="40" height="4" fill="#E8F4FD" rx="2"/>
        <rect x="440" y="243" width="40" height="4" fill="#E8F4FD" rx="2"/>
        <rect x="340" y="120" width="140" height="110" fill="#F5EDD8" rx="4"/>
        <polygon points="330,120 490,120 410,65" fill="#D4856A"/>
        <rect x="370" y="170" width="30" height="60" fill="#8B7355"/>
        <rect x="430" y="160" width="35" height="35" fill="#B8D4E8" rx="2"/>
        <rect x="60" y="165" width="200" height="65" fill="#4A90D9" rx="8"/>
        <rect x="220" y="175" width="70" height="55" fill="#357ABD" rx="6"/>
        <rect x="228" y="182" width="50" height="28" fill="#B8D4E8" rx="3"/>
        <rect x="80" y="172" width="50" height="35" fill="#B8D4E8" rx="3"/>
        <rect x="145" y="172" width="50" height="35" fill="#B8D4E8" rx="3"/>
        <text x="155" y="214" textAnchor="middle" fontSize="9" fontWeight="500" fill="white" fontFamily="sans-serif">WINDOW PRO</text>
        <circle cx="110" cy="232" r="18" fill="#333"/><circle cx="110" cy="232" r="9" fill="#888"/>
        <circle cx="240" cy="232" r="18" fill="#333"/><circle cx="240" cy="232" r="9" fill="#888"/>
        <circle cx="245" cy="188" r="8" fill="#F5C5A3"/>
        <line x1="245" y1="196" x2="245" y2="205" stroke="#555" strokeWidth="2"/>
        <line x1="20" y1="190" x2="50" y2="190" stroke="#357ABD" strokeWidth="2" strokeDasharray="4,3" opacity="0.5"/>
        <line x1="15" y1="200" x2="48" y2="200" stroke="#357ABD" strokeWidth="2" strokeDasharray="4,3" opacity="0.5"/>
        <line x1="22" y1="210" x2="52" y2="210" stroke="#357ABD" strokeWidth="2" strokeDasharray="4,3" opacity="0.5"/>
        <circle cx="60" cy="50" r="22" fill="#FAC775"/>
        <line x1="60" y1="18" x2="60" y2="10" stroke="#FAC775" strokeWidth="2"/>
        <line x1="85" y1="30" x2="91" y2="24" stroke="#FAC775" strokeWidth="2"/>
        <line x1="92" y1="50" x2="100" y2="50" stroke="#FAC775" strokeWidth="2"/>
        <line x1="28" y1="50" x2="20" y2="50" stroke="#FAC775" strokeWidth="2"/>
        <line x1="35" y1="30" x2="29" y2="24" stroke="#FAC775" strokeWidth="2"/>
      </svg>
    ),
  },
  {
    caption: "🪣 Specialized equipment agitates the dirt and rinses it away with purified water — leaving zero spots.",
    svg: (
      <svg viewBox="0 0 520 280" xmlns="http://www.w3.org/2000/svg" style={SVG_STYLE}>
        <rect width="520" height="280" fill="#E8F4FD" rx="12"/>
        <rect x="80" y="20" width="360" height="260" fill="#F5EDD8"/>
        <rect x="110" y="180" width="70" height="70" fill="#B8D4E8" rx="3"/>
        <rect x="340" y="180" width="70" height="70" fill="#B8D4E8" rx="3"/>
        <rect x="210" y="60" width="100" height="90" fill="#D4EBFA" rx="3"/>
        <line x1="260" y1="60" x2="260" y2="150" stroke="#9BB8C8" strokeWidth="1.5"/>
        <line x1="210" y1="105" x2="310" y2="105" stroke="#9BB8C8" strokeWidth="1.5"/>
        <rect x="253" y="148" width="14" height="120" fill="#888" rx="3"/>
        <circle cx="248" cy="162" r="2.5" fill="#4A90D9" opacity="0.7"/>
        <circle cx="270" cy="158" r="2" fill="#4A90D9" opacity="0.7"/>
        <circle cx="258" cy="170" r="2" fill="#4A90D9" opacity="0.7"/>
        <circle cx="242" cy="175" r="2.5" fill="#4A90D9" opacity="0.6"/>
        <circle cx="275" cy="168" r="2" fill="#4A90D9" opacity="0.6"/>
        <rect x="232" y="140" width="56" height="18" fill="#D4856A" rx="4"/>
        <rect x="238" y="155" width="6" height="10" fill="#D4856A"/>
        <rect x="250" y="155" width="6" height="10" fill="#D4856A"/>
        <rect x="262" y="155" width="6" height="10" fill="#D4856A"/>
        <rect x="274" y="155" width="6" height="10" fill="#D4856A"/>
        <circle cx="260" cy="222" r="12" fill="#F5C5A3"/>
        <line x1="260" y1="234" x2="260" y2="262" stroke="#555" strokeWidth="2.5"/>
        <line x1="260" y1="240" x2="246" y2="252" stroke="#555" strokeWidth="2.5"/>
        <line x1="260" y1="240" x2="260" y2="252" stroke="#555" strokeWidth="2.5"/>
        <line x1="260" y1="262" x2="248" y2="275" stroke="#555" strokeWidth="2.5"/>
        <line x1="260" y1="262" x2="272" y2="275" stroke="#555" strokeWidth="2.5"/>
        <rect x="248" y="234" width="24" height="18" fill="#4A90D9" rx="2"/>
      </svg>
    ),
  },
  {
    caption: "🪟 Screen cleaning is free — and they'll remove and reinstall them for a small fee.",
    svg: (
      <svg viewBox="0 0 520 280" xmlns="http://www.w3.org/2000/svg" style={SVG_STYLE}>
        <rect width="520" height="280" fill="#F0F7F0" rx="12"/>
        <rect x="0" y="180" width="520" height="100" fill="#C8DEB0"/>
        <rect x="60" y="80" width="400" height="200" fill="#F5EDD8"/>
        <circle cx="260" cy="110" r="22" fill="#F5C5A3"/>
        <rect x="238" y="132" width="44" height="50" fill="#4A90D9" rx="4"/>
        <rect x="242" y="180" width="16" height="50" fill="#555" rx="3"/>
        <rect x="262" y="180" width="16" height="50" fill="#555" rx="3"/>
        <line x1="238" y1="145" x2="185" y2="150" stroke="#F5C5A3" strokeWidth="10" strokeLinecap="round"/>
        <rect x="120" y="115" width="70" height="80" fill="none" stroke="#888" strokeWidth="3" rx="2"/>
        <line x1="135" y1="115" x2="135" y2="195" stroke="#888" strokeWidth="0.8" opacity="0.5"/>
        <line x1="150" y1="115" x2="150" y2="195" stroke="#888" strokeWidth="0.8" opacity="0.5"/>
        <line x1="165" y1="115" x2="165" y2="195" stroke="#888" strokeWidth="0.8" opacity="0.5"/>
        <line x1="180" y1="115" x2="180" y2="195" stroke="#888" strokeWidth="0.8" opacity="0.5"/>
        <line x1="120" y1="135" x2="190" y2="135" stroke="#888" strokeWidth="0.8" opacity="0.5"/>
        <line x1="120" y1="155" x2="190" y2="155" stroke="#888" strokeWidth="0.8" opacity="0.5"/>
        <line x1="120" y1="175" x2="190" y2="175" stroke="#888" strokeWidth="0.8" opacity="0.5"/>
        <line x1="220" y1="145" x2="335" y2="150" stroke="#F5C5A3" strokeWidth="10" strokeLinecap="round"/>
        <rect x="330" y="138" width="60" height="22" fill="#D4856A" rx="4"/>
        <rect x="334" y="158" width="7" height="14" fill="#D4856A"/>
        <rect x="346" y="158" width="7" height="14" fill="#D4856A"/>
        <rect x="358" y="158" width="7" height="14" fill="#D4856A"/>
        <rect x="370" y="158" width="7" height="14" fill="#D4856A"/>
        <text x="105" y="108" fontSize="18" textAnchor="middle">✨</text>
        <text x="200" y="108" fontSize="14" textAnchor="middle">✨</text>
      </svg>
    ),
  },
  {
    caption: "💧 He'll wait for you to see that the water droplets dry completely spot-free before leaving.",
    svg: (
      <svg viewBox="0 0 520 280" xmlns="http://www.w3.org/2000/svg" style={SVG_STYLE}>
        <rect width="520" height="280" fill="#FEF9EC" rx="12"/>
        <rect x="0" y="210" width="520" height="70" fill="#C8DEB0"/>
        <rect x="195" y="80" width="130" height="200" fill="#E8D5B5"/>
        <rect x="210" y="90" width="100" height="170" fill="#C8A87A" rx="4"/>
        <rect x="215" y="95" width="42" height="75" fill="#B8D4E8" rx="2" opacity="0.6"/>
        <rect x="263" y="95" width="42" height="75" fill="#B8D4E8" rx="2" opacity="0.6"/>
        <circle cx="256" cy="180" r="5" fill="#FFD700"/>
        <circle cx="150" cy="145" r="18" fill="#F5C5A3"/>
        <rect x="132" y="163" width="36" height="42" fill="#4A90D9" rx="3"/>
        <line x1="132" y1="172" x2="108" y2="185" stroke="#F5C5A3" strokeWidth="8" strokeLinecap="round"/>
        <line x1="168" y1="172" x2="185" y2="178" stroke="#F5C5A3" strokeWidth="8" strokeLinecap="round"/>
        <line x1="140" y1="205" x2="130" y2="240" stroke="#555" strokeWidth="8" strokeLinecap="round"/>
        <line x1="158" y1="205" x2="168" y2="240" stroke="#555" strokeWidth="8" strokeLinecap="round"/>
        <circle cx="370" cy="145" r="18" fill="#FDDBB4"/>
        <path d="M354,138 Q370,118 386,138" fill="#8B4513"/>
        <rect x="352" y="163" width="36" height="42" fill="#E8A0B4" rx="3"/>
        <line x1="352" y1="172" x2="335" y2="178" stroke="#FDDBB4" strokeWidth="8" strokeLinecap="round"/>
        <line x1="388" y1="172" x2="412" y2="185" stroke="#FDDBB4" strokeWidth="8" strokeLinecap="round"/>
        <line x1="360" y1="205" x2="350" y2="240" stroke="#555" strokeWidth="8" strokeLinecap="round"/>
        <line x1="378" y1="205" x2="388" y2="240" stroke="#555" strokeWidth="8" strokeLinecap="round"/>
        <rect x="90" y="100" width="80" height="30" fill="white" rx="8" stroke="#ccc" strokeWidth="0.5"/>
        <polygon points="130,130 122,142 140,130" fill="white" stroke="#ccc" strokeWidth="0.5"/>
        <text x="130" y="120" textAnchor="middle" fontSize="10" fill="#444" fontFamily="sans-serif">All done! 👍</text>
        <rect x="350" y="100" width="90" height="30" fill="white" rx="8" stroke="#ccc" strokeWidth="0.5"/>
        <polygon points="390,130 382,142 400,130" fill="white" stroke="#ccc" strokeWidth="0.5"/>
        <text x="395" y="120" textAnchor="middle" fontSize="10" fill="#444" fontFamily="sans-serif">They look great!</text>
      </svg>
    ),
  },
  {
    caption: "📋 Need a full estimate? Your worker will gladly provide one — completely free.",
    svg: (
      <svg viewBox="0 0 520 280" xmlns="http://www.w3.org/2000/svg" style={SVG_STYLE}>
        <rect width="520" height="280" fill="#F0F4FF" rx="12"/>
        <rect x="0" y="210" width="520" height="70" fill="#C8DEB0"/>
        <circle cx="200" cy="120" r="20" fill="#F5C5A3"/>
        <rect x="180" y="140" width="40" height="48" fill="#4A90D9" rx="3"/>
        <line x1="180" y1="150" x2="155" y2="162" stroke="#F5C5A3" strokeWidth="8" strokeLinecap="round"/>
        <line x1="220" y1="150" x2="258" y2="148" stroke="#F5C5A3" strokeWidth="8" strokeLinecap="round"/>
        <line x1="188" y1="188" x2="178" y2="225" stroke="#555" strokeWidth="8" strokeLinecap="round"/>
        <line x1="208" y1="188" x2="218" y2="225" stroke="#555" strokeWidth="8" strokeLinecap="round"/>
        <rect x="255" y="120" width="90" height="115" fill="white" rx="4" stroke="#ccc" strokeWidth="1"/>
        <rect x="270" y="112" width="60" height="18" fill="#888" rx="3"/>
        <circle cx="300" cy="121" r="5" fill="#555"/>
        <line x1="268" y1="148" x2="334" y2="148" stroke="#ddd" strokeWidth="1.5"/>
        <line x1="268" y1="160" x2="334" y2="160" stroke="#ddd" strokeWidth="1.5"/>
        <line x1="268" y1="172" x2="310" y2="172" stroke="#ddd" strokeWidth="1.5"/>
        <line x1="268" y1="184" x2="334" y2="184" stroke="#ddd" strokeWidth="1.5"/>
        <line x1="268" y1="196" x2="320" y2="196" stroke="#ddd" strokeWidth="1.5"/>
        <text x="268" y="225" fontSize="10" fill="#4A90D9" fontWeight="500" fontFamily="sans-serif">FREE ESTIMATE</text>
        <rect x="340" y="140" width="8" height="50" fill="#FAC775" rx="2" transform="rotate(-20,344,165)"/>
        <polygon points="336,186 344,186 340,198" fill="#F5C5A3" transform="rotate(-20,340,192)"/>
      </svg>
    ),
  },
  {
    caption: "📱 Your worker signs out digitally — and you'll receive a review form plus a discount on your next visit.",
    svg: (
      <svg viewBox="0 0 520 280" xmlns="http://www.w3.org/2000/svg" style={SVG_STYLE}>
        <rect width="520" height="280" fill="#E8F4FD" rx="12"/>
        <rect y="220" width="520" height="60" fill="#C8DEB0"/>
        <rect y="230" width="520" height="30" fill="#9BB8A0"/>
        <rect x="40" y="243" width="40" height="4" fill="#E8F4FD" rx="2"/>
        <rect x="140" y="243" width="40" height="4" fill="#E8F4FD" rx="2"/>
        <rect x="240" y="243" width="40" height="4" fill="#E8F4FD" rx="2"/>
        <rect x="340" y="243" width="40" height="4" fill="#E8F4FD" rx="2"/>
        <rect x="440" y="243" width="40" height="4" fill="#E8F4FD" rx="2"/>
        <rect x="30" y="110" width="150" height="120" fill="#F5EDD8" rx="3"/>
        <polygon points="20,110 190,110 105,60" fill="#D4856A"/>
        <rect x="60" y="160" width="30" height="70" fill="#8B7355"/>
        <rect x="110" y="130" width="45" height="40" fill="#D4EBFA" rx="2"/>
        <text x="133" y="156" fontSize="14" textAnchor="middle">✨</text>
        <rect x="290" y="178" width="160" height="52" fill="#4A90D9" rx="6"/>
        <rect x="410" y="185" width="55" height="45" fill="#357ABD" rx="5"/>
        <rect x="416" y="191" width="40" height="22" fill="#B8D4E8" rx="2"/>
        <rect x="308" y="183" width="40" height="28" fill="#B8D4E8" rx="2"/>
        <rect x="358" y="183" width="40" height="28" fill="#B8D4E8" rx="2"/>
        <text x="370" y="222" textAnchor="middle" fontSize="7" fontWeight="500" fill="white" fontFamily="sans-serif">WINDOW PRO</text>
        <circle cx="325" cy="232" r="14" fill="#333"/><circle cx="325" cy="232" r="7" fill="#888"/>
        <circle cx="430" cy="232" r="14" fill="#333"/><circle cx="430" cy="232" r="7" fill="#888"/>
        <circle cx="278" cy="210" r="8" fill="#ddd" opacity="0.6"/>
        <circle cx="264" cy="205" r="6" fill="#ddd" opacity="0.4"/>
        <circle cx="252" cy="200" r="4" fill="#ddd" opacity="0.2"/>
        <rect x="170" y="80" width="100" height="70" fill="white" rx="8" stroke="#ccc" strokeWidth="0.5"/>
        <rect x="178" y="88" width="84" height="10" fill="#4A90D9" rx="2"/>
        <text x="220" y="116" textAnchor="middle" fontSize="8" fill="#555" fontFamily="sans-serif">⭐ Review + Discount</text>
        <text x="220" y="128" textAnchor="middle" fontSize="8" fill="#555" fontFamily="sans-serif">sent to your phone!</text>
        <polygon points="215,150 225,150 220,160" fill="white" stroke="#ccc" strokeWidth="0.5"/>
      </svg>
    ),
  },
];

export default function SlideshowHtml({ onClose }: { onClose?: () => void }) {
  const [current, setCurrent]   = useState(0);
  const [progress, setProgress] = useState(0);
  const [fast, setFast]         = useState(false);

  const startRef   = useRef<number>(0);
  const rafRef     = useRef<number>(0);
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fastRef    = useRef(false);
  const currentRef = useRef(0);

  const goTo = useCallback((n: number) => {
    const next = ((n % SLIDES.length) + SLIDES.length) % SLIDES.length;
    currentRef.current = next;
    setCurrent(next);
    setFast(false);
    fastRef.current = false;
    setProgress(0);
  }, []);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    cancelAnimationFrame(rafRef.current);
    startRef.current = performance.now();

    const tick = () => {
      const dur = fastRef.current ? FAST_DURATION : DURATION;
      const elapsed = performance.now() - startRef.current;
      const pct = Math.min((elapsed / dur) * 100, 100);
      setProgress(pct);
      if (pct < 100) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);

    const schedule = () => {
      const dur = fastRef.current ? FAST_DURATION : DURATION;
      const elapsed = performance.now() - startRef.current;
      const remaining = Math.max(0, dur - elapsed);
      timerRef.current = setTimeout(() => {
        goTo(currentRef.current + 1);
      }, remaining);
    };
    schedule();
  }, [goTo]);

  // Restart timer when slide changes
  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      cancelAnimationFrame(rafRef.current);
    };
  }, [current, startTimer]);

  function handleNext() {
    if (!fastRef.current) {
      // Speed up: collapse current slide to FAST_DURATION then auto-advance
      fastRef.current = true;
      setFast(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      startRef.current = performance.now() - (DURATION - FAST_DURATION);
      timerRef.current = setTimeout(() => {
        goTo(currentRef.current + 1);
      }, FAST_DURATION);
    } else {
      goTo(currentRef.current + 1);
    }
  }

  function handlePrev() {
    goTo(currentRef.current - 1);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.96 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{ width: "100%" }}
    >
      <div style={{
        background: "white",
        borderRadius: 14,
        overflow: "hidden",
        border: "1px solid rgba(126,200,227,0.22)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.28), 0 2px 8px rgba(0,0,0,0.18)",
        position: "relative",
      }}>
        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            style={{
              position: "absolute", top: 7, right: 8, zIndex: 2,
              background: "rgba(0,0,0,0.12)", border: "none", borderRadius: "50%",
              width: 22, height: 22, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, color: "#555", lineHeight: 1,
            }}
          >✕</button>
        )}
        {/* SVG scene */}
        <div style={{ padding: "10px 10px 0" }}>
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.32, ease: "easeOut" }}
          >
            {SLIDES[current].svg}
          </motion.div>
        </div>

        {/* Caption */}
        <div style={{ padding: "10px 14px 6px" }}>
          <motion.p
            key={`cap-${current}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.08 }}
            style={{ fontSize: 13, lineHeight: 1.55, color: "#222", margin: 0, textAlign: "center" }}
          >
            {SLIDES[current].caption}
          </motion.p>
        </div>

        {/* Progress bar */}
        <div style={{ margin: "8px 14px 0", height: 2, background: "#e8e8e8", borderRadius: 2, overflow: "hidden" }}>
          <div style={{
            height: "100%", background: "#4A90D9", borderRadius: 2,
            width: `${progress}%`, transition: fast ? "none" : undefined,
          }} />
        </div>

        {/* Dots + nav */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 14px 12px" }}>
          <button onClick={handlePrev} style={NAV_BTN_STYLE}>← Prev</button>

          <div style={{ display: "flex", gap: 6 }}>
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                style={{
                  width: 7, height: 7, borderRadius: "50%", border: "none", padding: 0, cursor: "pointer",
                  background: i === current ? "#4A90D9" : "#ddd",
                  transition: "background 0.2s",
                }}
              />
            ))}
          </div>

          <button onClick={handleNext} style={NAV_BTN_STYLE}>Next →</button>
        </div>
      </div>
    </motion.div>
  );
}
