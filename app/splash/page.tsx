"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Splash() {
  const [pw, setPw]       = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pw || loading) return;
    setLoading(true);
    setError(false);
    const res = await fetch("/api/splash", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    if (res.ok) {
      router.push("/");
    } else {
      setError(true);
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse at 35% 25%, #180a3a 0%, #06050f 45%, #080818 100%)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: "-apple-system, sans-serif",
      padding: 24,
    }}>
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <div style={{ fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 14, fontWeight: 600 }}>
          Simple Window Cleaning
        </div>
        <div style={{ fontSize: 38, fontWeight: 800, color: "white", letterSpacing: "-0.02em" }}>
          Site Preview
        </div>
        <div style={{ fontSize: 15, color: "rgba(255,255,255,0.3)", marginTop: 10 }}>
          Enter access code to continue
        </div>
      </div>

      <div style={{
        width: "100%", maxWidth: 400,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.09)",
        borderRadius: 24, padding: "40px 36px",
      }}>
        <form onSubmit={submit}>
          <input
            type="password"
            value={pw}
            onChange={e => { setPw(e.target.value); setError(false); }}
            placeholder="Access code"
            autoFocus
            style={{
              width: "100%", boxSizing: "border-box",
              background: "rgba(255,255,255,0.06)",
              border: `1.5px solid ${error ? "#f87171" : "rgba(255,255,255,0.1)"}`,
              borderRadius: 12, padding: "17px 20px",
              fontSize: 18, letterSpacing: "0.2em",
              color: "white", outline: "none",
              marginBottom: error ? 8 : 20,
              transition: "border-color 0.15s",
            }}
          />
          {error && (
            <div style={{ fontSize: 13, color: "#f87171", marginBottom: 16 }}>
              Incorrect — try again.
            </div>
          )}
          <button
            type="submit"
            disabled={!pw || loading}
            style={{
              width: "100%",
              background: !pw || loading ? "rgba(22,163,74,0.35)" : "#16a34a",
              border: "none", borderRadius: 14,
              padding: "18px", fontSize: 16, fontWeight: 700,
              color: "white", cursor: !pw || loading ? "default" : "pointer",
              transition: "background 0.2s",
            }}
          >
            {loading ? "Unlocking…" : "Enter"}
          </button>
        </form>
      </div>

      <div style={{ marginTop: 32, fontSize: 12, color: "rgba(255,255,255,0.1)" }}>
        Simple Window Cleaning · Santa Cruz, CA
      </div>
    </div>
  );
}
