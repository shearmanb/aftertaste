"use client";

import AppShell from "@/components/AppShell";
import Link from "next/link";
import { useEffect, useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { usePathname } from "next/navigation";

type Brew = {
  id: string;
  brewedAt: string;
  bagBrewIndex?: number | null;
  bean: { producer: { name: string }; name: string; roastLevel: string };
  grindProfile: { name: string; setting: number };
  aidenProfile: { name: string };
  tastingNote?: {
    overallScore: number;
    flavorTags: string[];
    wouldBrewAgain: boolean;
  } | null;
};

function formatScore(n: number): string {
  if (Number.isInteger(n)) return String(n);
  const oneDp = Math.round(n * 10) / 10;
  if (Math.abs(oneDp - n) < 1e-9) return oneDp.toFixed(1);
  return n.toFixed(2);
}

function scoreColor(score: number): string {
  if (score >= 8) return "var(--accent-bright)";
  if (score >= 7) return "var(--text-1)";
  return "var(--text-2)";
}

export default function BrewsPage() {
  const [brews, setBrews] = useState<Brew[]>([]);
  const [loading, setLoading] = useState(true);
  const [unratedOnly, setUnratedOnly] = useState(false);
  const path = usePathname();

  useEffect(() => {
    fetch("/api/brews?limit=500").then((r) => r.ok ? r.json() : []).then((data) => { setBrews(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = unratedOnly ? brews.filter((b) => !b.tastingNote) : brews;

  async function deleteBrew(id: string) {
    if (!confirm("Delete this brew? This cannot be undone.")) return;
    const snapshot = brews;
    setBrews((prev) => prev.filter((b) => b.id !== id));
    const res = await fetch(`/api/brews/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setBrews(snapshot);
      alert("Failed to delete brew. Please try again.");
    }
  }

  return (
    <AppShell>
      <header className="flex items-end justify-between pt-3 pb-1">
        <div>
          <h1 className="text-[30px] font-extrabold leading-none" style={{ letterSpacing: "-0.025em" }}>Brews</h1>
          <p className="font-mono-plex text-[11.5px] mt-2" style={{ color: "var(--text-3)" }}>
            {brews.length} logged
          </p>
        </div>
        <Link href="/brew/new" aria-label="Log new brew" className="at-add-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
        </Link>
      </header>

      <div className="flex gap-2 mt-5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        <Link href="/brews" className={`at-chip ${path === "/brews" ? "active" : ""}`}>Home Brews</Link>
        <Link href="/outside-cups" className={`at-chip ${path === "/outside-cups" ? "active" : ""}`}>Café Visits</Link>
        <button onClick={() => setUnratedOnly((v) => !v)} className={`at-chip ${unratedOnly ? "active" : ""}`}>
          {unratedOnly ? `Unrated · ${filtered.length}` : "Unrated only"}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 font-mono-plex text-sm" style={{ color: "var(--text-3)" }}>Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16" style={{ color: "var(--text-3)" }}>
          {unratedOnly ? (
            <p className="font-medium" style={{ color: "var(--text-2)" }}>All brews are rated</p>
          ) : (
            <>
              <p className="text-4xl mb-3">☕</p>
              <p className="font-medium" style={{ color: "var(--text-2)" }}>No brews logged yet</p>
              <Link href="/brew/new" className="at-link mt-2 inline-block">Log your first brew →</Link>
            </>
          )}
        </div>
      ) : (
        <div className="mt-5">
          {filtered.map((brew) => {
            const title = `${brew.bean.producer.name} — ${brew.bean.name}`;
            const score = brew.tastingNote?.overallScore;
            const tag = brew.tastingNote?.flavorTags?.[0];
            return (
              <div key={brew.id} className="at-card mb-[11px] px-[18px] py-4">
                <div className="flex items-stretch justify-between gap-3">
                  <Link href={`/brew/${brew.id}`} className="min-w-0 flex-1 flex flex-col gap-[7px]">
                    <div className="flex items-center gap-2 min-w-0">
                      <p className="text-[16px] font-bold leading-tight truncate" style={{ letterSpacing: "-0.01em", color: "var(--text-1)" }}>
                        {title}
                      </p>
                      {brew.bagBrewIndex != null && (
                        <span className="at-tag shrink-0">#{brew.bagBrewIndex}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-[9px] flex-wrap">
                      <span className="font-mono-plex text-[11.5px]" style={{ color: "var(--text-3)", letterSpacing: "0.02em" }}>
                        {format(new Date(brew.brewedAt), "MMM d · h:mm a")}
                      </span>
                      <span className="font-mono-plex text-[11px]" style={{ color: "var(--text-3)" }}>
                        · {formatDistanceToNow(new Date(brew.brewedAt), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="at-tag neutral">{brew.grindProfile.name} · {brew.grindProfile.setting}</span>
                      <span className="at-tag neutral">{brew.aidenProfile.name}</span>
                      {tag && <span className="at-tag">{tag}</span>}
                    </div>
                  </Link>

                  <div className="shrink-0 flex flex-col items-end justify-between gap-2">
                    {typeof score === "number" ? (
                      <>
                        <div className="flex items-baseline gap-1">
                          <span className="font-mono-plex text-[26px] font-semibold leading-none" style={{ color: scoreColor(score) }}>
                            {formatScore(score)}
                          </span>
                          <span className="font-mono-plex text-[12px]" style={{ color: "var(--text-3)" }}>/10</span>
                        </div>
                        <div className="at-score-meter"><span style={{ width: `${Math.min(100, (score / 10) * 100)}%` }} /></div>
                        {brew.tastingNote?.wouldBrewAgain && (
                          <span className="font-mono-plex text-[10px]" style={{ color: "var(--good)" }}>brew again ✓</span>
                        )}
                      </>
                    ) : (
                      <Link href={`/brew/${brew.id}/taste`} className="at-tag">Rate →</Link>
                    )}
                    <div className="flex gap-3 font-mono-plex text-[10px]" style={{ color: "var(--text-3)" }}>
                      <Link href={`/brew/${brew.id}/edit`} className="hover:opacity-100" style={{ color: "var(--text-3)" }}>edit</Link>
                      <button onClick={() => deleteBrew(brew.id)} className="hover:opacity-100" style={{ color: "var(--text-3)" }}>delete</button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
