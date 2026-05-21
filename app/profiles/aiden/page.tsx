"use client";

import AppShell from "@/components/AppShell";
import { useEffect, useState } from "react";

type Pour = { sequence: number; waterG: number; pauseS: number };
type AidenProfile = { id: string; name: string; coffeeG: number; waterG: number; tempF: number; bloomTimeS: number; bloomWaterG: number; pours: Pour[]; notes?: string | null };

export default function AidenProfilesPage() {
  const [profiles, setProfiles] = useState<AidenProfile[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [coffeeG, setCoffeeG] = useState("18");
  const [waterG, setWaterG] = useState("288");
  const [tempF, setTempF] = useState("205");
  const [bloomTimeS, setBloomTimeS] = useState("45");
  const [bloomWaterG, setBloomWaterG] = useState("36");
  const [pourCount, setPourCount] = useState("3");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetch("/api/profiles/aiden").then((r) => r.json()).then(setProfiles); }, []);

  async function save() {
    setSaving(true);
    const total = parseFloat(waterG) - parseFloat(bloomWaterG);
    const count = parseInt(pourCount);
    const perPour = Math.round(total / count);
    const pours: Pour[] = Array.from({ length: count }, (_, i) => ({
      sequence: i + 1,
      waterG: perPour,
      pauseS: 30,
    }));
    const res = await fetch("/api/profiles/aiden", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        coffeeG: parseFloat(coffeeG),
        waterG: parseFloat(waterG),
        tempF: parseInt(tempF),
        bloomTimeS: parseInt(bloomTimeS),
        bloomWaterG: parseFloat(bloomWaterG),
        pours,
        notes: notes || undefined,
      }),
    });
    const profile = await res.json();
    setProfiles((prev) => [...prev, profile]);
    setShowForm(false);
    setSaving(false);
  }

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6 pt-2">
        <h1 className="text-xl font-bold text-stone-100">Aiden Profiles</h1>
        <button onClick={() => setShowForm(true)} className="bg-amber-600 hover:bg-amber-500 text-white font-bold w-10 h-10 rounded-full flex items-center justify-center text-xl transition-colors">+</button>
      </div>

      {showForm && (
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 mb-5 space-y-3">
          <p className="text-stone-300 font-medium text-sm">Add Aiden Profile</p>
          <input placeholder="Profile name *" value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-stone-500 text-xs mb-0.5 block">Coffee (g)</label>
              <input type="number" value={coffeeG} onChange={(e) => setCoffeeG(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="text-stone-500 text-xs mb-0.5 block">Water (g)</label>
              <input type="number" value={waterG} onChange={(e) => setWaterG(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="text-stone-500 text-xs mb-0.5 block">Temp (°F)</label>
              <input type="number" value={tempF} onChange={(e) => setTempF(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="text-stone-500 text-xs mb-0.5 block">Bloom time (s)</label>
              <input type="number" value={bloomTimeS} onChange={(e) => setBloomTimeS(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="text-stone-500 text-xs mb-0.5 block">Bloom water (g)</label>
              <input type="number" value={bloomWaterG} onChange={(e) => setBloomWaterG(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="text-stone-500 text-xs mb-0.5 block">Pour count</label>
              <input type="number" min="1" max="5" value={pourCount} onChange={(e) => setPourCount(e.target.value)} className="input-field" />
            </div>
          </div>
          {coffeeG && waterG && (
            <p className="text-stone-500 text-xs">
              Ratio: {(parseFloat(waterG) / parseFloat(coffeeG)).toFixed(1)}:1
            </p>
          )}
          <textarea placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="input-field resize-none" />
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="flex-1 py-2 bg-stone-800 text-stone-400 rounded-lg text-sm">Cancel</button>
            <button onClick={save} disabled={!name || saving} className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition-colors">
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {profiles.map((p) => (
          <div key={p.id} className="bg-stone-900 border border-stone-800 rounded-xl p-4">
            <p className="font-semibold text-stone-100">{p.name}</p>
            <div className="grid grid-cols-3 gap-x-4 mt-2 text-sm">
              <span className="text-stone-500">Ratio</span>
              <span className="text-stone-500">Temp</span>
              <span className="text-stone-500">Bloom</span>
              <span className="text-stone-300 font-medium">{(p.waterG / p.coffeeG).toFixed(1)}:1</span>
              <span className="text-stone-300 font-medium">{p.tempF}°F</span>
              <span className="text-stone-300 font-medium">{p.bloomWaterG}g / {p.bloomTimeS}s</span>
            </div>
            <p className="text-stone-500 text-xs mt-1.5">{p.coffeeG}g coffee · {p.waterG}g water · {Array.isArray(p.pours) ? p.pours.length : "?"} pours</p>
            {p.notes && <p className="text-stone-500 text-xs mt-1 italic">{p.notes}</p>}
          </div>
        ))}
        {profiles.length === 0 && !showForm && (
          <div className="text-center py-12 text-stone-500">
            <p>No Aiden profiles yet</p>
            <button onClick={() => setShowForm(true)} className="text-amber-500 underline text-sm mt-1">Add first profile →</button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
