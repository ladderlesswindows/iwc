"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

function VideoModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col"
      style={{ background: "rgba(0,0,0,0.95)" }}
    >
        <button
          onClick={onClose}
          className="absolute top-12 right-5 z-10 text-white p-2"
          aria-label="Close video"
        >
          <X size={28} />
        </button>
        <div className="flex-1 flex items-center justify-center p-4">
          <video
            src="/videos/how-it-works.mp4"
            autoPlay
            loop
            playsInline
            controls
            className="w-full max-w-md rounded-2xl"
            style={{ maxHeight: "80vh" }}
          >
            Your browser doesn&apos;t support video.
          </video>
        </div>
      </motion.div>
  );
}

const NAV_ITEMS = [
  { label: "About", href: "/about" },
  { label: "▶  How it works", action: "video" as const },
];

export function HamburgerMenu({ isOpen, onClose }: Props) {
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              style={{ background: "rgba(0,0,0,0.6)" }}
              onClick={onClose}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 z-50 flex flex-col"
              style={{ width: 240, background: "#0c0c18", borderRight: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div
                className="flex items-center justify-between px-5 pt-14 pb-4 border-b"
                style={{ borderColor: "rgba(255,255,255,0.06)" }}
              >
                <span style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, fontWeight: 600 }}>Menu</span>
                <button onClick={onClose} style={{ color: "rgba(255,255,255,0.4)" }}>
                  <X size={18} />
                </button>
              </div>

              <nav className="flex flex-col">
                {NAV_ITEMS.map((item) => (
                  <div key={item.label}>
                    {"href" in item ? (
                      <a
                        href={item.href}
                        className="block px-5 py-4 border-b transition-colors hover:bg-white/5"
                        style={{ borderColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.65)", fontSize: 13, fontWeight: 500, textDecoration: "none" }}
                        onClick={onClose}
                      >
                        {item.label}
                      </a>
                    ) : (
                      <button
                        className="block w-full text-left"
                        style={{
                          color: "#08080e", fontSize: 13, fontWeight: 700,
                          background: "#a78bfa",
                          margin: "8px 16px", borderRadius: 8,
                          border: "none", width: "calc(100% - 32px)",
                          padding: "10px 16px", cursor: "pointer",
                        }}
                        onClick={() => { onClose(); setShowVideo(true); }}
                      >
                        {item.label}
                      </button>
                    )}
                  </div>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showVideo && <VideoModal key="video-modal" onClose={() => setShowVideo(false)} />}
      </AnimatePresence>
    </>
  );
}
