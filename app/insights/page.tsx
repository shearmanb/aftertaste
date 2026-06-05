"use client";

import AppShell from "@/components/AppShell";
import { useState } from "react";

export default function InsightsPage() {
  const [insights, setInsights] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function analyze() {
    setLoading(true);
    setError("");
    setInsights(null);
    try {
      const res = await fetch("/api/insights", { method: "POST" });
      if (!res.ok) throw new Error("Analysis failed");
      const data = await res.json();
      setInsights(data.insights);
    } catch {
      setError("Could not generate insights. Check your Anthropic API key.");
    }
    setLoading(false);
  }

  return (
    <AppShell>
      <header className="pt-3 pb-1">
        <h1 className="text-[30px] font-extrabold leading-none" style={{ letterSpacing: "-0.025em" }}>Insights</h1>
        <p className="font-mono-plex text-[11.5px] mt-2" style={{ color: "var(--text-3)" }}>
          Pattern analysis across your brew history
        </p>
      </header>

      <div className="mt-6">
        <button onClick={analyze} disabled={loading} className="at-cta">
          {loading ? "Analyzing brews…" : "✦ Analyze my brews"}
        </button>
      </div>

      {error && (
        <div
          className="mt-5 rounded-[14px] px-4 py-3 text-sm"
          style={{
            color: "oklch(0.78 0.13 25)",
            background: "oklch(0.55 0.18 25 / 0.12)",
            border: "1px solid oklch(0.55 0.18 25 / 0.30)",
          }}
        >
          {error}
        </div>
      )}

      {insights && (
        <div className="at-card mt-5 p-5">
          <p className="at-eyebrow mb-4">Analysis</p>
          <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--text-2)" }}>
            {insights}
          </div>
        </div>
      )}

      {!insights && !loading && !error && (
        <div className="text-center py-12 mt-2" style={{ color: "var(--text-3)" }}>
          <p className="text-4xl mb-3" style={{ color: "var(--accent-bright)" }}>✦</p>
          <p className="text-sm" style={{ color: "var(--text-2)" }}>
            Tap analyze to get AI-powered insights about your brewing patterns. Works best with 5+ logged brews.
          </p>
        </div>
      )}
    </AppShell>
  );
}
