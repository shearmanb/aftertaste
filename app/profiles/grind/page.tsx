"use client";

import AppShell from "@/components/AppShell";
import { useEffect, useState } from "react";

type GrindProfile = { id: string; name: string; grinder: string; setting: number; notes?: string | null };

export default function GrindProfilesPage() {
  const [profiles, setProfiles] = useState<GrindProfile[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [setting, setSetting] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetch("/api/profiles/grind").then((r) => r.json()).then(setProfiles); }, []);

  async function save() {
    setSaving(true);
    const res = await fetch("/api/profiles/grind", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, setting: parseFloat(setting), notes: notes || undefined }),
    });
    const profile = await res.json();
    setProfiles((prev) => [...prev, profile].sort((a, b) => a.setting - b.setting));
    setShowForm(false); setName(""); setSetting(""); setNotes("");
    setSaving(false);
  }

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6 pt-2">
        <h1 className="text-xl font-bold text-stone-100">Grind Profiles</h1>
        <button onClick={() => setShowForm(true)} className="bg-amber-600 hover:bg-amber-500 text-white font-bold w-10 h-10 rounded-full flex items-center justify-center text-xl transition-colors">+</button>
      </div>
      <p className="text-stone-500 text-sm mb-4">Fellow Ode Gen 2 dial positions</p>

      {showForm && (
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 mb-5 space-y-3">
          <p className="text-stone-300 font-medium text-sm">Add Grind Profile</p>
          <input placeholder="Name (e.g. Light roast medium)" value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
          <input type="number" step="0.5" placeholder="Dial setting (e.g. 4.5)" value={setting} onChange={(e) => setSetting(e.target.value)} className="input-field" />
          <textarea placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="input-field resize-none" />
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="flex-1 py-2 bg-stone-800 text-stone-400 rounded-lg text-sm">Cancel</button>
            <button onClick={save} disabled={!name || !setting || saving} className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition-colors">
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {profiles.map((p) => (
          <div key={p.id} className="bg-stone-900 border border-stone-800 rounded-xl p-4">
            <div className="flex justify-between items-baseline">
              <p className="font-semibold text-stone-100">{p.name}</p>
              <span className="text-amber-400 font-bold text-lg">{p.setting}</span>
            </div>
            <p className="text-stone-500 text-xs mt-0.5">{p.grinder}</p>
            {p.notes && <p className="text-stone-500 text-xs mt-1 italic">{p.notes}</p>}
          </div>
        ))}
        {profiles.length === 0 && !showForm && (
          <div className="text-center py-12 text-stone-500">
            <p>No grind profiles yet</p>
            <button onClick={() => setShowForm(true)} className="text-amber-500 underline text-sm mt-1">Add first profile →</button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
