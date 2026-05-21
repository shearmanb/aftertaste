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
      <div className="pt-2 mb-6">
        <h1 className="text-xl font-bold text-stone-100">AI Insights</h1>
        <p className="text-stone-500 text-sm mt-1">Pattern analysis across your brew history</p>
      </div>

      <button
        onClick={analyze}
        disabled={loading}
        className="w-full py-4 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors mb-6 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="animate-spin">◌</span>
            Analyzing brews...
          </>
        ) : (
          <>✦ Analyze my brews</>
        )}
      </button>

      {error && (
        <div className="bg-red-900/30 border border-red-700/40 rounded-xl p-4 text-red-300 text-sm">{error}</div>
      )}

      {insights && (
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-5">
          <p className="text-stone-400 text-xs font-semibold uppercase tracking-wide mb-4">Analysis</p>
          <div className="text-stone-300 text-sm leading-relaxed whitespace-pre-wrap">{insights}</div>
        </div>
      )}

      {!insights && !loading && !error && (
        <div className="text-center py-12 text-stone-600">
          <p className="text-4xl mb-3">✦</p>
          <p className="text-sm">Tap analyze to get AI-powered insights about your brewing patterns. Works best with 5+ logged brews.</p>
        </div>
      )}
    </AppShell>
  );
}
