"use client";

import AppShell from "@/components/AppShell";
import OdeDial from "@/components/OdeDial";
import { useEffect, useState } from "react";

type GrindProfile = { id: string; name: string; grinder: string; setting: number; notes?: string | null };

export default function GrindProfilesPage() {
  const [profiles, setProfiles] = useState<GrindProfile[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [setting, setSetting] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetch("/api/profiles/grind").then((r) => r.json()).then(setProfiles); }, []);

  function openEdit(p: GrindProfile) {
    setEditingId(p.id);
    setName(p.name);
    setSetting(String(p.setting));
    setNotes(p.notes ?? "");
    setShowForm(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setName(""); setSetting(""); setNotes("");
  }

  async function save() {
    setSaving(true);
    const payload = { name, setting: parseFloat(setting), notes: notes || undefined };

    if (editingId) {
      const res = await fetch(`/api/profiles/grind/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const updated = await res.json();
      setProfiles((prev) => prev.map((p) => p.id === editingId ? updated : p).sort((a, b) => a.setting - b.setting));
    } else {
      const res = await fetch("/api/profiles/grind", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const profile = await res.json();
      setProfiles((prev) => [...prev, profile].sort((a, b) => a.setting - b.setting));
    }

    closeForm();
    setSaving(false);
  }

  const formVisible = showForm || editingId !== null;

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6 pt-2">
        <h1 className="text-xl font-bold text-stone-100">Grind Profiles</h1>
        <button onClick={() => { setEditingId(null); setName(""); setSetting(""); setNotes(""); setShowForm(true); }} className="bg-amber-600 hover:bg-amber-500 text-white font-bold w-10 h-10 rounded-full flex items-center justify-center text-xl transition-colors">+</button>
      </div>

      {formVisible && (
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 mb-5 space-y-3">
          <p className="text-stone-300 font-medium text-sm">{editingId ? "Edit Grind Profile" : "Add Grind Profile"}</p>
          <input placeholder="Name (e.g. Light roast medium)" value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
          <div>
            <label className="text-stone-500 text-xs mb-1 block">Dial setting (1–11)</label>
            <input type="number" step="0.5" min="1" max="11" placeholder="e.g. 4.5" value={setting} onChange={(e) => setSetting(e.target.value)} className="input-field" />
          </div>
          {setting && !isNaN(parseFloat(setting)) && (
            <div className="py-2">
              <OdeDial setting={parseFloat(setting)} />
            </div>
          )}
          <textarea placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="input-field resize-none" />
          <div className="flex gap-2">
            <button onClick={closeForm} className="flex-1 py-2 bg-stone-800 text-stone-400 rounded-lg text-sm">Cancel</button>
            <button onClick={save} disabled={!name || !setting || saving} className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition-colors">
              {saving ? "Saving..." : editingId ? "Update" : "Save"}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {profiles.map((p) => (
          <div key={p.id} className={`bg-stone-900 border rounded-xl p-4 transition-colors ${editingId === p.id ? "border-amber-600/60" : "border-stone-800"}`}>
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-stone-100">{p.name}</p>
                    <p className="text-stone-500 text-xs mt-0.5">{p.grinder}</p>
                    {p.notes && <p className="text-stone-500 text-xs mt-2 italic">{p.notes}</p>}
                  </div>
                  <button
                    onClick={() => openEdit(p)}
                    className="shrink-0 p-1.5 text-stone-500 hover:text-stone-300 transition-colors"
                    aria-label="Edit grind profile"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div className="shrink-0">
                <OdeDial setting={p.setting} />
              </div>
            </div>
          </div>
        ))}
        {profiles.length === 0 && !formVisible && (
          <div className="text-center py-12 text-stone-500">
            <p>No grind profiles yet</p>
            <button onClick={() => setShowForm(true)} className="text-amber-500 underline text-sm mt-1">Add first profile →</button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
