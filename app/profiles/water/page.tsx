"use client";

import AppShell from "@/components/AppShell";
import { useEffect, useState } from "react";

type WaterProfile = { id: string; brand: string; additives?: string | null; notes?: string | null };

export default function WaterProfilesPage() {
  const [profiles, setProfiles] = useState<WaterProfile[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [brand, setBrand] = useState("");
  const [additives, setAdditives] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/profiles/water").then((r) => r.json()).then(setProfiles);
  }, []);

  function openEdit(p: WaterProfile) {
    setEditingId(p.id);
    setBrand(p.brand);
    setAdditives(p.additives ?? "");
    setNotes(p.notes ?? "");
    setShowForm(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setBrand(""); setAdditives(""); setNotes("");
  }

  async function save() {
    setSaving(true);
    const payload = { brand, additives: additives || undefined, notes: notes || undefined };

    if (editingId) {
      const res = await fetch(`/api/profiles/water/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const updated = await res.json();
      setProfiles((prev) => prev.map((p) => p.id === editingId ? updated : p).sort((a, b) => a.brand.localeCompare(b.brand)));
    } else {
      const res = await fetch("/api/profiles/water", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const profile = await res.json();
      setProfiles((prev) => [...prev, profile].sort((a, b) => a.brand.localeCompare(b.brand)));
    }

    closeForm();
    setSaving(false);
  }

  const formVisible = showForm || editingId !== null;

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6 pt-2">
        <h1 className="text-xl font-bold text-stone-100">Water</h1>
        <button
          onClick={() => { setEditingId(null); setBrand(""); setAdditives(""); setNotes(""); setShowForm(true); }}
          className="bg-amber-600 hover:bg-amber-500 text-white font-bold w-10 h-10 rounded-full flex items-center justify-center text-xl transition-colors"
        >
          +
        </button>
      </div>

      {formVisible && (
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 mb-5 space-y-3">
          <p className="text-stone-300 font-medium text-sm">{editingId ? "Edit Water Profile" : "Add Water Profile"}</p>
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
              onClick={closeForm}
              className="flex-1 py-2 bg-stone-800 text-stone-400 rounded-lg text-sm"
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={!brand || saving}
              className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition-colors"
            >
              {saving ? "Saving..." : editingId ? "Update" : "Save"}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {profiles.map((p) => (
          <div key={p.id} className={`bg-stone-900 border rounded-xl p-4 transition-colors ${editingId === p.id ? "border-amber-600/60" : "border-stone-800"}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-stone-100">{p.brand}</p>
                {p.additives && (
                  <p className="text-stone-400 text-sm mt-0.5">{p.additives}</p>
                )}
                {p.notes && <p className="text-stone-500 text-xs mt-1.5 italic">{p.notes}</p>}
              </div>
              <button
                onClick={() => openEdit(p)}
                className="shrink-0 p-1.5 text-stone-500 hover:text-stone-300 transition-colors"
                aria-label="Edit water profile"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
            </div>
          </div>
        ))}
        {profiles.length === 0 && !formVisible && (
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
