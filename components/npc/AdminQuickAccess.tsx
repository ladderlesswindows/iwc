"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminHeader } from "@/lib/admin";

const SESSION_KEY = "iwc_admin";
const PW_KEY      = "iwc_admin_pw";

export function AdminQuickAccess() {
  const router   = useRouter();
  const [open, setOpen]       = useState(false);
  const [pw, setPw]           = useState("");
  const [error, setError]     = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = pw.trim();
    if (!trimmed || loading) return;
    setLoading(true);
    setError(false);

    if (trimmed.toLowerCase() === "staff") {
      sessionStorage.setItem(SESSION_KEY, "staff");
      router.push("/admin");
      return;
    }

    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: adminHeader(trimmed),
    });

    if (res.ok) {
      sessionStorage.setItem(SESSION_KEY, "owner");
      sessionStorage.setItem(PW_KEY, trimmed);
      router.push("/admin");
    } else {
      setError(true);
      setPw("");
      setLoading(false);
    }
  }

  return (
    <div style={{ marginTop: 18, paddingTop: 10, textAlign: "center" }}>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
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
      ) : (
        <form
          onSubmit={handleSubmit}
          style={{ display: "inline-flex", gap: 5, alignItems: "center" }}
        >
          <input
            autoFocus
            type="password"
            value={pw}
            onChange={e => { setPw(e.target.value); setError(false); }}
            placeholder="password"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${error ? "rgba(251,113,133,0.5)" : "rgba(255,255,255,0.1)"}`,
              borderRadius: 5, color: "rgba(255,255,255,0.65)",
              fontSize: 10, padding: "3px 8px", outline: "none",
              fontFamily: "inherit", width: 100,
              transition: "border-color 0.15s",
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              background: "none",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 5, color: "rgba(255,255,255,0.35)",
              fontSize: 10, padding: "3px 7px",
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "inherit",
            }}
          >
            {loading ? "…" : "→"}
          </button>
          <button
            type="button"
            onClick={() => { setOpen(false); setPw(""); setError(false); }}
            style={{
              background: "none", border: "none",
              color: "rgba(255,255,255,0.18)", fontSize: 10,
              cursor: "pointer", fontFamily: "inherit", padding: 2,
            }}
          >
            ✕
          </button>
        </form>
      )}
    </div>
  );
}
