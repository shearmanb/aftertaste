"use client";

import AppShell from "@/components/AppShell";
import { useEffect, useState } from "react";

type Bean = { id: string; producer: string; name: string; country?: string | null; roastLevel: string; notes?: string | null };

const ROAST_LEVELS = ["light", "medium-light", "medium", "medium-dark", "dark"];

export default function BeansPage() {
  const [beans, setBeans] = useState<Bean[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [producer, setProducer] = useState("");
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [roastLevel, setRoastLevel] = useState("medium-light");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetch("/api/beans").then((r) => r.json()).then(setBeans); }, []);

  async function save() {
    setSaving(true);
    const res = await fetch("/api/beans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ producer, name, country: country || undefined, roastLevel, notes: notes || undefined }),
    });
    const bean = await res.json();
    setBeans((prev) => [...prev, bean]);
    setShowForm(false);
    setProducer(""); setName(""); setCountry(""); setRoastLevel("medium-light"); setNotes("");
    setSaving(false);
  }

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6 pt-2">
        <h1 className="text-xl font-bold text-stone-100">Beans</h1>
        <button onClick={() => setShowForm(true)} className="bg-amber-600 hover:bg-amber-500 text-white font-bold w-10 h-10 rounded-full flex items-center justify-center text-xl transition-colors">+</button>
      </div>

      {showForm && (
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 mb-5 space-y-3">
          <p className="text-stone-300 font-medium text-sm">Add Bean</p>
          <input placeholder="Producer *" value={producer} onChange={(e) => setProducer(e.target.value)} className="input-field" />
          <input placeholder="Name / Blend *" value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
          <input placeholder="Country of origin" value={country} onChange={(e) => setCountry(e.target.value)} className="input-field" />
          <select value={roastLevel} onChange={(e) => setRoastLevel(e.target.value)} className="input-field">
            {ROAST_LEVELS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <textarea placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="input-field resize-none" />
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="flex-1 py-2 bg-stone-800 text-stone-400 rounded-lg text-sm">Cancel</button>
            <button onClick={save} disabled={!producer || !name || saving} className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition-colors">
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}

      {beans.length === 0 && !showForm ? (
        <div className="text-center py-16 text-stone-500">
          <p className="text-4xl mb-3">◉</p>
          <p className="font-medium">No beans yet</p>
          <button onClick={() => setShowForm(true)} className="text-amber-500 underline text-sm mt-2">Add your first bean →</button>
        </div>
      ) : (
        <div className="space-y-3">
          {beans.map((bean) => (
            <div key={bean.id} className="bg-stone-900 border border-stone-800 rounded-xl p-4">
              <p className="font-semibold text-stone-100">{bean.producer}</p>
              <p className="text-stone-400 text-sm">{bean.name}</p>
              <div className="flex gap-2 mt-2 flex-wrap">
                <span className="bg-stone-800 text-stone-400 text-xs px-2 py-0.5 rounded-full">{bean.roastLevel}</span>
                {bean.country && <span className="bg-stone-800 text-stone-400 text-xs px-2 py-0.5 rounded-full">{bean.country}</span>}
              </div>
              {bean.notes && <p className="text-stone-500 text-xs mt-2 italic">{bean.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
