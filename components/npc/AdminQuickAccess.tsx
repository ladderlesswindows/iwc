"use client";

import { useRouter } from "next/navigation";

export function AdminQuickAccess() {
  const router = useRouter();

  return (
    <div style={{ marginTop: 18, paddingTop: 10, textAlign: "center" }}>
      <button
        onClick={() => router.push("/admin")}
        style={{
          background: "none", border: "none",
          fontSize: 8, color: "rgba(255,255,255,0.35)",
          cursor: "pointer", letterSpacing: "0.16em",
          textTransform: "uppercase", fontFamily: "inherit",
          padding: "2px 6px", transition: "color 0.25s",
        }}
        onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.65)"}
        onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.35)"}
      >
        admin
      </button>
    </div>
  );
}
