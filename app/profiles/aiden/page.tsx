"use client";

import AppShell from "@/components/AppShell";
import { useEffect, useState } from "react";

type Pour = { sequence: number; waterG: number };
type AidenProfile = {
  id: string; name: string; coffeeG: number; waterG: number; tempF: number;
  bloomTimeS: number; bloomWaterG: number; pours: Pour[]; notes?: string | null;
};

function AidenSettingsCard({ p, onEdit }: { p: AidenProfile; onEdit: (p: AidenProfile) => void }) {
  const ratio = (p.waterG / p.coffeeG).toFixed(1);
  const bloomRatio = (p.bloomWaterG / p.coffeeG).toFixed(1);
  const pours = Array.isArray(p.pours) ? p.pours : [];

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden">
      <div className="px-4 pt-4 pb-3 border-b border-stone-800 flex items-center justify-between">
        <p className="font-semibold text-stone-100">{p.name}</p>
        <button
          onClick={() => onEdit(p)}
          className="p-1.5 text-stone-500 hover:text-stone-300 transition-colors"
          aria-label="Edit Aiden profile"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
      </div>
      <div className="grid grid-cols-3 divide-x divide-stone-800 border-b border-stone-800">
        <div className="p-3 text-center">
          <p className="text-stone-500 text-xs mb-1">Coffee</p>
          <p className="text-amber-400 font-bold text-lg">{p.coffeeG}g</p>
          <p className="text-stone-600 text-xs">ratio 1:{ratio}</p>
        </div>
        <div className="p-3 text-center">
          <p className="text-stone-500 text-xs mb-1">Water</p>
          <p className="text-amber-400 font-bold text-lg">{p.waterG}g</p>
          <p className="text-stone-600 text-xs">{pours.length} pulses</p>
        </div>
        <div className="p-3 text-center">
          <p className="text-stone-500 text-xs mb-1">Temp</p>
          <p className="text-amber-400 font-bold text-lg">{p.tempF}°</p>
          <p className="text-stone-600 text-xs">Fahrenheit</p>
        </div>
      </div>
      <div className="p-4">
        <p className="text-stone-500 text-xs font-semibold uppercase tracking-wide mb-3">Brew Sequence</p>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-16 shrink-0">
              <span className="text-xs text-stone-500 font-medium">Bloom</span>
              <span className="text-xs text-stone-600 block">{bloomRatio}× coffee</span>
            </div>
            <div className="flex-1 bg-stone-800 rounded-full h-5 overflow-hidden">
              <div className="h-full bg-teal-700 rounded-full flex items-center justify-end pr-2"
                style={{ width: `${Math.min(100, (p.bloomWaterG / p.waterG) * 100)}%` }}>
                <span className="text-white text-xs font-medium">{p.bloomWaterG}g</span>
              </div>
            </div>
            <div className="w-12 shrink-0 text-right">
              <span className="text-stone-400 text-xs">{p.bloomTimeS}s</span>
            </div>
          </div>
          {pours.map((pour) => (
            <div key={pour.sequence} className="flex items-center gap-3">
              <div className="w-16 shrink-0">
                <span className="text-xs text-stone-500 font-medium">Pulse {pour.sequence}</span>
              </div>
              <div className="flex-1 bg-stone-800 rounded-full h-5 overflow-hidden">
                <div className="h-full bg-amber-700 rounded-full flex items-center justify-end pr-2"
                  style={{ width: `${Math.min(100, (pour.waterG / p.waterG) * 100)}%` }}>
                  <span className="text-white text-xs font-medium">{pour.waterG}g</span>
                </div>
              </div>
              <div className="w-12 shrink-0 text-right">
                <span className="text-stone-600 text-xs">—</span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-3 pt-3 border-t border-stone-800 text-xs text-stone-500">
          <span>Total: {p.waterG}g water</span>
          <span>{p.coffeeG}g coffee</span>
        </div>
      </div>
      {p.notes && <p className="px-4 pb-4 text-stone-500 text-xs italic">{p.notes}</p>}
    </div>
  );
}

export default function AidenProfilesPage() {
  const [profiles, setProfiles] = useState<AidenProfile[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [coffeeG, setCoffeeG] = useState("18");
  const [ratio, setRatio] = useState("16");
  const [bloomRatio, setBloomRatio] = useState("2");
  const [bloomTimeS, setBloomTimeS] = useState("45");
  const [tempF, setTempF] = useState("205");
  const [pulsePauseS, setPulsePauseS] = useState("30");
  const [pulses, setPulses] = useState(["", "", ""]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/profiles/aiden").then((r) => r.json()).then(setProfiles);
  }, []);

  const coffee = parseFloat(coffeeG) || 0;
  const totalWater = Math.round(coffee * (parseFloat(ratio) || 0));
  const bloomWater = Math.round(coffee * (parseFloat(bloomRatio) || 0));
  const pulseTotal = pulses.reduce((s, p) => s + (parseFloat(p) || 0), 0);
  const remaining = totalWater - bloomWater - pulseTotal;

  function updatePulse(i: number, val: string) {
    setPulses((prev) => prev.map((p, idx) => idx === i ? val : p));
  }
  function addPulse() {
    setPulses((prev) => [...prev, prev[prev.length - 1] ?? ""]);
  }
  function removePulse(i: number) {
    if (pulses.length <= 1) return;
    setPulses((prev) => prev.filter((_, idx) => idx !== i));
  }

  function resetForm() {
    setName(""); setCoffeeG("18"); setRatio("16"); setBloomRatio("2");
    setBloomTimeS("45"); setTempF("205"); setPulsePauseS("30");
    setPulses(["", "", ""]); setNotes("");
  }

  function openEdit(p: AidenProfile) {
    const pours = Array.isArray(p.pours) ? p.pours : [];
    setEditingId(p.id);
    setName(p.name);
    setCoffeeG(String(p.coffeeG));
    setRatio((p.waterG / p.coffeeG).toFixed(1));
    setBloomRatio((p.bloomWaterG / p.coffeeG).toFixed(1));
    setBloomTimeS(String(p.bloomTimeS));
    setTempF(String(p.tempF));
    setPulsePauseS("30");
    setPulses(pours.length > 0 ? pours.map((pour) => String(pour.waterG)) : [""]);
    setNotes(p.notes ?? "");
    setShowForm(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    resetForm();
  }

  async function save() {
    setSaving(true);
    const pours = pulses.map((p, i) => ({ sequence: i + 1, waterG: parseFloat(p) || 0 }));
    const payload = {
      name,
      coffeeG: coffee,
      waterG: totalWater,
      tempF: parseInt(tempF),
      bloomTimeS: parseInt(bloomTimeS),
      bloomWaterG: bloomWater,
      pours,
      notes: notes || undefined,
    };

    if (editingId) {
      const res = await fetch(`/api/profiles/aiden/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const updated = await res.json();
      setProfiles((prev) => prev.map((p) => p.id === editingId ? updated : p));
    } else {
      const res = await fetch("/api/profiles/aiden", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const profile = await res.json();
      setProfiles((prev) => [...prev, profile]);
    }

    closeForm();
    setSaving(false);
  }

  const formVisible = showForm || editingId !== null;

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6 pt-2">
        <h1 className="text-xl font-bold text-stone-100">Aiden Profiles</h1>
        <button onClick={() => { setEditingId(null); resetForm(); setShowForm(true); }} className="bg-amber-600 hover:bg-amber-500 text-white font-bold w-10 h-10 rounded-full flex items-center justify-center text-xl transition-colors">+</button>
      </div>

      {formVisible && (
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 mb-5 space-y-5">
          <p className="text-stone-300 font-medium text-sm">{editingId ? "Edit Aiden Profile" : "Add Aiden Profile"}</p>

          <input placeholder="Name *" value={name} onChange={(e) => setName(e.target.value)} className="input-field" />

          {/* Coffee + Ratio */}
          <div>
            <p className="text-stone-500 text-xs font-semibold uppercase tracking-wide mb-2">Coffee</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-stone-500 text-xs mb-1 block">Coffee (g)</label>
                <input type="number" value={coffeeG} onChange={(e) => setCoffeeG(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="text-stone-500 text-xs mb-1 block">Ratio (1 : X)</label>
                <input type="number" step="0.5" value={ratio} onChange={(e) => setRatio(e.target.value)} className="input-field" />
              </div>
            </div>
            {totalWater > 0 && (
              <p className="text-stone-500 text-xs mt-1.5">Total water: <span className="text-amber-400 font-medium">{totalWater}g</span></p>
            )}
          </div>

          {/* Bloom */}
          <div>
            <p className="text-stone-500 text-xs font-semibold uppercase tracking-wide mb-2">Bloom</p>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-stone-500 text-xs mb-1 block">Ratio (X : 1)</label>
                <input type="number" step="0.5" value={bloomRatio} onChange={(e) => setBloomRatio(e.target.value)} className="input-field" />
                {bloomWater > 0 && <p className="text-stone-600 text-xs mt-0.5">{bloomWater}g</p>}
              </div>
              <div>
                <label className="text-stone-500 text-xs mb-1 block">Time (s)</label>
                <input type="number" value={bloomTimeS} onChange={(e) => setBloomTimeS(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="text-stone-500 text-xs mb-1 block">Temp (°F)</label>
                <input type="number" value={tempF} onChange={(e) => setTempF(e.target.value)} className="input-field" />
              </div>
            </div>
          </div>

          {/* Pulses */}
          <div>
            <p className="text-stone-500 text-xs font-semibold uppercase tracking-wide mb-2">Pulses</p>
            <div className="mb-3">
              <label className="text-stone-500 text-xs mb-1 block">Pause between pulses (s)</label>
              <input type="number" value={pulsePauseS} onChange={(e) => setPulsePauseS(e.target.value)} className="input-field" />
            </div>
            <div className="space-y-2">
              {pulses.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <label className="text-stone-500 text-xs w-14 shrink-0">Pulse {i + 1}</label>
                  <input
                    type="number"
                    placeholder="g"
                    value={p}
                    onChange={(e) => updatePulse(i, e.target.value)}
                    className="input-field flex-1"
                  />
                  {pulses.length > 1 && (
                    <button onClick={() => removePulse(i)} className="text-stone-600 hover:text-red-400 text-lg leading-none px-1">×</button>
                  )}
                </div>
              ))}
            </div>
            <button onClick={addPulse} className="mt-2 text-amber-500 text-sm hover:text-amber-400">+ Add pulse</button>
            <p className={`text-xs mt-2 ${Math.abs(remaining) < 2 ? "text-green-500" : "text-stone-500"}`}>
              Remaining: <span className="font-medium">{remaining}g</span>
              {Math.abs(remaining) < 2 && " ✓"}
            </p>
          </div>

          <div>
            <label className="text-stone-500 text-xs mb-1 block">Notes (optional)</label>
            <textarea placeholder="Any additional notes..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="input-field resize-none" />
          </div>

          <div className="flex gap-2">
            <button onClick={closeForm} className="flex-1 py-2 bg-stone-800 text-stone-400 rounded-lg text-sm">Cancel</button>
            <button onClick={save} disabled={!name || saving} className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition-colors">
              {saving ? "Saving..." : editingId ? "Update" : "Save"}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {profiles.map((p) => (
          <div key={p.id} className={`rounded-xl transition-colors ${editingId === p.id ? "ring-1 ring-amber-600/60" : ""}`}>
            <AidenSettingsCard p={p} onEdit={openEdit} />
          </div>
        ))}
        {profiles.length === 0 && !formVisible && (
          <div className="text-center py-12 text-stone-500">
            <p>No Aiden profiles yet</p>
            <button onClick={() => setShowForm(true)} className="text-amber-500 underline text-sm mt-1">Add first profile →</button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
