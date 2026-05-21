"use client";

import AppShell from "@/components/AppShell";
import { useEffect, useState } from "react";

type WaterProfile = { id: string; brand: string; additives?: string | null; notes?: string | null };

export default function WaterProfilesPage() {
  const [profiles, setProfiles] = useState<WaterProfile[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [brand, setBrand] = useState("");
  const [additives, setAdditives] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/profiles/water").then((r) => r.json()).then(setProfiles);
  }, []);

  async function save() {
    setSaving(true);
    const res = await fetch("/api/profiles/water", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brand, additives: additives || undefined, notes: notes || undefined }),
    });
    const profile = await res.json();
    setProfiles((prev) => [...prev, profile].sort((a, b) => a.brand.localeCompare(b.brand)));
    setShowForm(false);
    setBrand(""); setAdditives(""); setNotes("");
    setSaving(false);
  }

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6 pt-2">
        <h1 className="text-xl font-bold text-stone-100">Water</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-amber-600 hover:bg-amber-500 text-white font-bold w-10 h-10 rounded-full flex items-center justify-center text-xl transition-colors"
        >
          +
        </button>
      </div>

      {showForm && (
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 mb-5 space-y-3">
          <p className="text-stone-300 font-medium text-sm">Add Water Profile</p>
          <div>
            <label className="text-stone-500 text-xs mb-1 block">Brand *</label>
            <input
              placeholder="e.g. Evian, Third Wave Water, Filtered Tap"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="text-stone-500 text-xs mb-1 block">Additives (optional)</label>
            <input
              placeholder="e.g. Third Wave Light Roast packet, none"
              value={additives}
              onChange={(e) => setAdditives(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="text-stone-500 text-xs mb-1 block">Notes (optional)</label>
            <textarea
              placeholder="Any additional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="input-field resize-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 py-2 bg-stone-800 text-stone-400 rounded-lg text-sm"
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={!brand || saving}
              className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition-colors"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {profiles.map((p) => (
          <div key={p.id} className="bg-stone-900 border border-stone-800 rounded-xl p-4">
            <p className="font-semibold text-stone-100">{p.brand}</p>
            {p.additives && (
              <p className="text-stone-400 text-sm mt-0.5">{p.additives}</p>
            )}
            {p.notes && <p className="text-stone-500 text-xs mt-1.5 italic">{p.notes}</p>}
          </div>
        ))}
        {profiles.length === 0 && !showForm && (
          <div className="text-center py-12 text-stone-500">
            <p className="text-4xl mb-3">≋</p>
            <p className="font-medium">No water profiles yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="text-amber-500 underline text-sm mt-2"
            >
              Add your first water profile →
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
