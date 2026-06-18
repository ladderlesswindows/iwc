"use client";

import { motion, AnimatePresence } from "framer-motion";
import { PRICE_PER_WINDOW, MIN_WINDOWS, MAX_WINDOWS } from "@/lib/constants";

interface Props {
  count: number;
  onChange: (n: number) => void;
}

export function WindowCounter({ count, onChange }: Props) {
  const price = count * PRICE_PER_WINDOW;

  return (
    <div className="flex items-center justify-between mb-5">
      {/* Left: label + price */}
      <div>
        <span className="field-label">Windows</span>
        <div className="flex items-baseline gap-1.5 mt-0.5">
          <span style={{ fontSize: 24, fontWeight: 800, color: "white", lineHeight: 1 }}>
            ${price}
          </span>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>
            total · ${PRICE_PER_WINDOW}/ea
          </span>
        </div>
      </div>

      {/* Right: counter */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => count > MIN_WINDOWS && onChange(count - 1)}
          disabled={count <= MIN_WINDOWS}
          className="flex items-center justify-center rounded-full transition-opacity"
          style={{
            width: 32,
            height: 32,
            background: "rgba(167,139,250,0.15)",
            border: "1px solid rgba(167,139,250,0.25)",
            color: count <= MIN_WINDOWS ? "rgba(255,255,255,0.2)" : "#a78bfa",
            fontSize: 18,
            fontWeight: 700,
            cursor: count <= MIN_WINDOWS ? "not-allowed" : "pointer",
          }}
          aria-label="Fewer windows"
        >
          −
        </button>

        <div style={{ minWidth: 24, textAlign: "center" }}>
          <AnimatePresence mode="wait">
            <motion.span
              key={count}
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 8, opacity: 0 }}
              transition={{ duration: 0.12 }}
              style={{ fontSize: 18, fontWeight: 700, color: "white", display: "block" }}
            >
              {count}
            </motion.span>
          </AnimatePresence>
        </div>

        <button
          onClick={() => count < MAX_WINDOWS && onChange(count + 1)}
          disabled={count >= MAX_WINDOWS}
          className="flex items-center justify-center rounded-full transition-opacity"
          style={{
            width: 32,
            height: 32,
            background: "rgba(167,139,250,0.15)",
            border: "1px solid rgba(167,139,250,0.25)",
            color: count >= MAX_WINDOWS ? "rgba(255,255,255,0.2)" : "#a78bfa",
            fontSize: 18,
            fontWeight: 700,
            cursor: count >= MAX_WINDOWS ? "not-allowed" : "pointer",
          }}
          aria-label="More windows"
        >
          +
        </button>
      </div>
    </div>
  );
}
