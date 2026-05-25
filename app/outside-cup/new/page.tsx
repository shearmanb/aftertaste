"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Bean = { id: string; name: string; producer: { name: string } };

export default function NewOutsideCupPage() {
  const router = useRouter();

  const [methods, setMethods] = useState<string[]>([]);
  const [beans, setBeans] = useState<Bean[]>([]);

  const [location, setLocation] = useState("");
  const [locationNote, setLocationNote] = useState("");
  const [method, setMethod] = useState("");
  const [beanId, setBeanId] = useState("");
  const [overallScore, setOverallScore] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [visitedAt, setVisitedAt] = useState(() => new Date().toISOString().slice(0, 16));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/options?category=outsideCupMethod")
      .then((r) => r.json())
      .then((data) => {
        const vals = Array.isArray(data) ? data.map((o: { value: string }) => o.value) : [];
        setMethods(vals);
        if (vals.length > 0) setMethod(vals[0]);
      });
    fetch("/api/beans")
      .then((r) => r.json())
      .then((data) => setBeans(Array.isArray(data) ? data : []));
  }, []);

  async function submit() {
    if (!location.trim() || !method) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/outside-cups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: location.trim(),
          locationNote: locationNote.trim() || undefined,
          method,
          beanId: beanId || undefined,
          overallScore: overallScore ?? undefined,
          notes: notes.trim() || undefined,
          visitedAt: new Date(visitedAt).toISOString(),
        }),
      });
      const cup = await res.json();
      router.push(`/outside-cup/${cup.id}`);
    } finally {
      setSubmitting(false);
    }
  }

  const scoreDisplay = overallScore == null ? "—" : (overallScore % 1 === 0 ? String(overallScore) : overallScore.toFixed(2));

  return (
    <div className="min-h-screen bg-stone-950 px-4 pt-6 pb-10 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-stone-400 hover:text-stone-200 text-2xl">‹</button>
        <h1 className="text-xl font-bold text-stone-100">Log outside cup</h1>
      </div>

      <div className="space-y-4">
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 space-y-4">
          <p className="text-stone-400 text-xs font-semibold uppercase tracking-wide">Where</p>

          <div>
            <label className="text-stone-400 text-sm block mb-1">Location <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="Café or shop name"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500 text-sm"
            />
          </div>

          <div>
            <label className="text-stone-400 text-sm block mb-1">City / address <span className="text-stone-600 font-normal">(optional)</span></label>
            <input
              type="text"
              placeholder="e.g. Portland, OR"
              value={locationNote}
              onChange={(e) => setLocationNote(e.target.value)}
              className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500 text-sm"
            />
          </div>

          <div>
            <label className="text-stone-400 text-sm block mb-1">Date & time</label>
            <input
              type="datetime-local"
              value={visitedAt}
              onChange={(e) => setVisitedAt(e.target.value)}
              className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500 text-sm"
            />
          </div>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 space-y-4">
          <p className="text-stone-400 text-xs font-semibold uppercase tracking-wide">The Cup</p>

          <div>
            <label className="text-stone-400 text-sm block mb-2">Method <span className="text-red-500">*</span></label>
            <div className="flex flex-wrap gap-2">
              {methods.map((m) => (
                <button
                  key={m}
                  onClick={() => setMethod(m)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    method === m
                      ? "bg-amber-600 text-white"
                      : "bg-stone-800 text-stone-400 hover:bg-stone-700"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-stone-400 text-sm block mb-1">Bean <span className="text-stone-600 font-normal">(optional — if you know)</span></label>
            <select
              value={beanId}
              onChange={(e) => setBeanId(e.target.value)}
              className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500 text-sm"
            >
              <option value="">Unknown / not sure</option>
              {beans.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.producer.name} — {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 space-y-4">
          <p className="text-stone-400 text-xs font-semibold uppercase tracking-wide">Rating <span className="text-stone-600 normal-case font-normal">(optional)</span></p>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-stone-400 text-sm">Overall score</label>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-amber-400">{scoreDisplay}</span>
                {overallScore != null && <span className="text-stone-500 text-sm">/10</span>}
              </div>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              step={0.25}
              value={overallScore ?? 7}
              onChange={(e) => setOverallScore(parseFloat(e.target.value))}
              onMouseDown={() => { if (overallScore == null) setOverallScore(7); }}
              onTouchStart={() => { if (overallScore == null) setOverallScore(7); }}
              className="w-full accent-amber-500 h-3"
            />
            <div className="flex justify-between mt-1">
              {overallScore == null ? (
                <button onClick={() => setOverallScore(7)} className="text-xs text-amber-600 hover:text-amber-500">
                  Tap to rate
                </button>
              ) : (
                <button onClick={() => setOverallScore(null)} className="text-xs text-stone-600 hover:text-stone-400">
                  Clear rating
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="text-stone-400 text-sm block mb-1">Notes</label>
            <textarea
              placeholder="Anything notable about the cup..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500 resize-none text-sm"
            />
          </div>
        </div>

        <button
          onClick={submit}
          disabled={submitting || !location.trim() || !method}
          className="w-full py-4 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold rounded-xl transition-colors text-lg"
        >
          {submitting ? "Saving..." : "Save cup"}
        </button>
      </div>
    </div>
  );
}
