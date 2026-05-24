"use client";

import AppShell from "@/components/AppShell";
import Link from "next/link";
import { useEffect, useState } from "react";
import { format, formatDistanceToNow } from "date-fns";

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

export default function BrewsPage() {
  const [brews, setBrews] = useState<Brew[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/brews").then((r) => r.ok ? r.json() : []).then((data) => { setBrews(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  async function deleteBrew(id: string) {
    if (!confirm("Delete this brew? This cannot be undone.")) return;
    setDeletingId(id);
    const res = await fetch(`/api/brews/${id}`, { method: "DELETE" });
    if (res.ok) {
      setBrews((prev) => prev.filter((b) => b.id !== id));
    } else {
      alert("Failed to delete brew. Please try again.");
    }
    setDeletingId(null);
  }

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6 pt-2">
        <h1 className="text-xl font-bold text-stone-100">All Brews</h1>
        <Link href="/brew/new" className="bg-amber-600 hover:bg-amber-500 text-white font-bold w-10 h-10 rounded-full flex items-center justify-center text-xl transition-colors">+</Link>
      </div>

      {loading ? (
        <div className="text-center py-16 text-stone-600 text-sm">Loading...</div>
      ) : brews.length === 0 ? (
        <div className="text-center py-16 text-stone-500">
          <p className="text-4xl mb-3">☕</p>
          <p className="font-medium">No brews logged yet</p>
          <Link href="/brew/new" className="text-amber-500 underline text-sm mt-2 block">Log your first brew →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {brews.map((brew) => (
            <div key={brew.id} className="bg-stone-900 border border-stone-800 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <Link href={`/brew/${brew.id}`} className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <p className="font-semibold text-stone-100 truncate">
                      {brew.bean.producer.name} — {brew.bean.name}
                    </p>
                    {brew.bagBrewIndex != null && (
                      <span className="shrink-0 bg-amber-900/40 text-amber-500 text-[10px] px-1.5 py-0.5 rounded-full border border-amber-800/40">
                        #{brew.bagBrewIndex}
                      </span>
                    )}
                  </div>
                  <p className="text-stone-500 text-xs mt-0.5">
                    {format(new Date(brew.brewedAt), "MMM d, yyyy · h:mm a")}
                    <span className="text-stone-600"> · {formatDistanceToNow(new Date(brew.brewedAt), { addSuffix: true })}</span>
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="bg-stone-800 text-stone-400 text-xs px-2 py-0.5 rounded-full">
                      Grind: {brew.grindProfile.name} ({brew.grindProfile.setting})
                    </span>
                    <span className="bg-stone-800 text-stone-400 text-xs px-2 py-0.5 rounded-full">
                      {brew.aidenProfile.name}
                    </span>
                  </div>
                  {brew.tastingNote?.flavorTags && brew.tastingNote.flavorTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {brew.tastingNote.flavorTags.slice(0, 3).map((tag) => (
                        <span key={tag} className="bg-amber-900/30 text-amber-400 text-xs px-2 py-0.5 rounded-full">{tag}</span>
                      ))}
                    </div>
                  )}
                </Link>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  {brew.tastingNote ? (
                    <div className="text-right">
                      <span className="text-amber-400 font-bold text-xl">{brew.tastingNote.overallScore}</span>
                      <span className="text-stone-600 text-xs">/10</span>
                      {brew.tastingNote.wouldBrewAgain && (
                        <p className="text-green-500 text-xs">brew again ✓</p>
                      )}
                    </div>
                  ) : (
                    <Link href={`/brew/${brew.id}/taste`} className="text-amber-500 text-xs border border-amber-700/50 rounded-lg px-2 py-1">
                      Rate →
                    </Link>
                  )}
                  <div className="flex gap-2">
                    <Link href={`/brew/${brew.id}/edit`} className="text-stone-600 hover:text-stone-400 text-xs">Edit</Link>
                    <button
                      onClick={() => deleteBrew(brew.id)}
                      disabled={deletingId === brew.id}
                      className="text-stone-600 hover:text-red-400 text-xs transition-colors"
                    >
                      {deletingId === brew.id ? "..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
