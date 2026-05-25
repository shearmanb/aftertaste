"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";

type Bean = { id: string; name: string; producer: { name: string } };
type Cup = {
  id: string;
  visitedAt: string;
  location: string;
  locationNote: string | null;
  method: string;
  beanId: string | null;
  bean: Bean | null;
  overallScore: number | null;
  notes: string | null;
};

export default function OutsideCupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [cup, setCup] = useState<Cup | null>(null);
  const [editing, setEditing] = useState(false);
  const [methods, setMethods] = useState<string[]>([]);
  const [beans, setBeans] = useState<Bean[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit state
  const [location, setLocation] = useState("");
  const [locationNote, setLocationNote] = useState("");
  const [method, setMethod] = useState("");
  const [beanId, setBeanId] = useState("");
  const [overallScore, setOverallScore] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [visitedAt, setVisitedAt] = useState("");

  useEffect(() => {
    fetch(`/api/outside-cups/${id}`)
      .then((r) => r.json())
      .then((data: Cup) => {
        setCup(data);
        setLocation(data.location);
        setLocationNote(data.locationNote ?? "");
        setMethod(data.method);
        setBeanId(data.beanId ?? "");
        setOverallScore(data.overallScore);
        setNotes(data.notes ?? "");
        setVisitedAt(new Date(data.visitedAt).toISOString().slice(0, 16));
      });
    fetch("/api/options?category=outsideCupMethod")
      .then((r) => r.json())
      .then((data) => setMethods(Array.isArray(data) ? data.map((o: { value: string }) => o.value) : []));
    fetch("/api/beans")
      .then((r) => r.json())
      .then((data) => setBeans(Array.isArray(data) ? data : []));
  }, [id]);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/outside-cups/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: location.trim(),
          locationNote: locationNote.trim() || null,
          method,
          beanId: beanId || null,
          overallScore,
          notes: notes.trim() || null,
          visitedAt: new Date(visitedAt).toISOString(),
        }),
      });
      const updated = await res.json();
      setCup(updated);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function deleteCup() {
    if (!confirm("Delete this outside cup?")) return;
    setDeleting(true);
    await fetch(`/api/outside-cups/${id}`, { method: "DELETE" });
    router.push("/outside-cups");
  }

  if (!cup) {
    return <div className="min-h-screen bg-stone-950 flex items-center justify-center text-stone-500">Loading...</div>;
  }

  const scoreDisplay = cup.overallScore == null ? null
    : (cup.overallScore % 1 === 0 ? String(cup.overallScore) : cup.overallScore.toFixed(1));

  if (editing) {
    return (
      <div className="min-h-screen bg-stone-950 px-4 pt-6 pb-10 max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setEditing(false)} className="text-stone-400 hover:text-stone-200 text-2xl">‹</button>
          <h1 className="text-xl font-bold text-stone-100">Edit cup</h1>
        </div>

        <div className="space-y-4">
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 space-y-4">
            <div>
              <label className="text-stone-400 text-sm block mb-1">Location</label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500 text-sm" />
            </div>
            <div>
              <label className="text-stone-400 text-sm block mb-1">City / address</label>
              <input type="text" value={locationNote} onChange={(e) => setLocationNote(e.target.value)}
                className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500 text-sm" />
            </div>
            <div>
              <label className="text-stone-400 text-sm block mb-1">Date &amp; time</label>
              <input type="datetime-local" value={visitedAt} onChange={(e) => setVisitedAt(e.target.value)}
                className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500 text-sm" />
            </div>
          </div>

          <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 space-y-4">
            <div>
              <label className="text-stone-400 text-sm block mb-2">Method</label>
              <div className="flex flex-wrap gap-2">
                {methods.map((m) => (
                  <button key={m} onClick={() => setMethod(m)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${method === m ? "bg-amber-600 text-white" : "bg-stone-800 text-stone-400 hover:bg-stone-700"}`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-stone-400 text-sm block mb-1">Bean</label>
              <select value={beanId} onChange={(e) => setBeanId(e.target.value)}
                className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500 text-sm">
                <option value="">Unknown / not sure</option>
                {beans.map((b) => (
                  <option key={b.id} value={b.id}>{b.producer.name} — {b.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-stone-400 text-sm">Score</label>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-amber-400">{overallScore ?? "—"}</span>
                  {overallScore != null && <span className="text-stone-500 text-sm">/10</span>}
                </div>
              </div>
              <input type="range" min={1} max={10} step={0.25}
                value={overallScore ?? 7}
                onChange={(e) => setOverallScore(parseFloat(e.target.value))}
                onMouseDown={() => { if (overallScore == null) setOverallScore(7); }}
                onTouchStart={() => { if (overallScore == null) setOverallScore(7); }}
                className="w-full accent-amber-500 h-3" />
              {overallScore != null && (
                <button onClick={() => setOverallScore(null)} className="text-xs text-stone-600 hover:text-stone-400 mt-1">
                  Clear rating
                </button>
              )}
            </div>
            <div>
              <label className="text-stone-400 text-sm block mb-1">Notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
                className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500 resize-none text-sm" />
            </div>
          </div>

          <button onClick={save} disabled={saving || !location.trim() || !method}
            className="w-full py-4 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold rounded-xl transition-colors">
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 px-4 pt-6 pb-10 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push("/outside-cups")} className="text-stone-400 hover:text-stone-200 text-2xl">‹</button>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-stone-100 truncate">{cup.location}</h1>
          {cup.locationNote && <p className="text-stone-500 text-sm truncate">{cup.locationNote}</p>}
        </div>
        <button onClick={() => setEditing(true)} className="text-stone-400 hover:text-stone-200 text-sm shrink-0">
          Edit
        </button>
      </div>

      <div className="space-y-4">
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 space-y-2">
          <p className="text-stone-400 text-xs font-semibold uppercase tracking-wide mb-3">Details</p>
          <Row label="Date" value={format(new Date(cup.visitedAt), "MMM d, yyyy · h:mm a")} />
          <Row label="Method" value={cup.method} />
          {cup.bean ? (
            <Row label="Bean" value={`${cup.bean.producer.name} — ${cup.bean.name}`} />
          ) : (
            <Row label="Bean" value="Unknown" />
          )}
        </div>

        {(scoreDisplay != null || cup.notes) && (
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-4">
            <p className="text-stone-400 text-xs font-semibold uppercase tracking-wide mb-3">Notes</p>
            {scoreDisplay != null && (
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-5xl font-bold text-amber-400">{scoreDisplay}</span>
                <span className="text-stone-500">/10</span>
              </div>
            )}
            {cup.notes && <p className="text-stone-300 text-sm italic">"{cup.notes}"</p>}
          </div>
        )}

        <button
          onClick={deleteCup}
          disabled={deleting}
          className="w-full py-3 bg-stone-900 border border-red-900/50 hover:border-red-700 text-red-400 hover:text-red-300 font-medium rounded-xl transition-colors text-sm"
        >
          {deleting ? "Deleting..." : "Delete this cup"}
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-baseline text-sm">
      <span className="text-stone-500">{label}</span>
      <span className="text-stone-300">{value}</span>
    </div>
  );
}
