"use client";

import { useState } from "react";
import { createAidenProfile } from "@/app/brew/actions";
import type { AidenProfile } from "@/lib/types";

export default function AddAidenForm({
  onCreated,
  onCancel,
}: {
  onCreated: (p: AidenProfile) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [coffeeG, setCoffeeG] = useState("");
  const [waterG, setWaterG] = useState("");
  const [tempF, setTempF] = useState("");
  const [bloomTimeS, setBloomTimeS] = useState("");
  const [bloomWaterG, setBloomWaterG] = useState("");
  const [pours, setPours] = useState<{ tempF: string; pauseS: string }[]>([
    { tempF: "", pauseS: "" },
    { tempF: "", pauseS: "" },
  ]);
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    const parsedName = name.trim();
    const pc = parseFloat(coffeeG);
    const pw = parseFloat(waterG);
    const pt = parseInt(tempF);
    const pb = parseInt(bloomTimeS);
    const pbw = parseFloat(bloomWaterG);
    if (!parsedName || isNaN(pc) || isNaN(pw) || isNaN(pt) || isNaN(pb) || isNaN(pbw)) return;

    const parsedPours = pours
      .filter((p) => p.tempF !== "")
      .map((p, i) => ({ sequence: i + 1, tempF: parseInt(p.tempF) || pt, pauseS: parseInt(p.pauseS) || 0 }));

    setSaving(true);
    try {
      const profile = await createAidenProfile({
        name: parsedName,
        coffeeG: pc,
        waterG: pw,
        tempF: pt,
        bloomTimeS: pb,
        bloomWaterG: pbw,
        pours: parsedPours,
      });
      onCreated(profile);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create Aiden profile");
    } finally {
      setSaving(false);
    }
  }

  const valid = name.trim() && coffeeG && waterG && tempF && bloomTimeS && bloomWaterG;

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 mb-4 space-y-3">
      <p className="text-stone-400 text-xs font-semibold uppercase tracking-wide">New Aiden profile</p>
      <div>
        <label className="text-stone-500 text-xs block mb-1">Profile name *</label>
        <input type="text" placeholder="e.g. Light Roast 1:16" value={name}
          onChange={(e) => setName(e.target.value)} className="input-field" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-stone-500 text-xs block mb-1">Coffee (g) *</label>
          <input type="number" min="0" step="0.1" placeholder="20" value={coffeeG}
            onChange={(e) => setCoffeeG(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="text-stone-500 text-xs block mb-1">Water (g) *</label>
          <input type="number" min="0" step="1" placeholder="320" value={waterG}
            onChange={(e) => setWaterG(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="text-stone-500 text-xs block mb-1">Temp (°F) *</label>
          <input type="number" min="150" max="215" step="1" placeholder="205" value={tempF}
            onChange={(e) => setTempF(e.target.value)} className="input-field" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-stone-500 text-xs block mb-1">Bloom water (g) *</label>
          <input type="number" min="0" step="1" placeholder="60" value={bloomWaterG}
            onChange={(e) => setBloomWaterG(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="text-stone-500 text-xs block mb-1">Bloom time (s) *</label>
          <input type="number" min="0" step="1" placeholder="45" value={bloomTimeS}
            onChange={(e) => setBloomTimeS(e.target.value)} className="input-field" />
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-stone-500 text-xs">Pulses (temp + pause after)</label>
          <button type="button"
            onClick={() => setPours((p) => [...p, { tempF, pauseS: "" }])}
            className="text-amber-500 hover:text-amber-400 text-xs">+ Add pulse</button>
        </div>
        <div className="space-y-2">
          {pours.map((pour, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-stone-600 text-xs w-12 shrink-0">Pulse {i + 1}</span>
              <input type="number" min="150" max="215" step="1" placeholder={tempF || "°F"}
                value={pour.tempF} onChange={(e) => setPours((p) => p.map((x, j) => j === i ? { ...x, tempF: e.target.value } : x))}
                className="input-field flex-1" />
              <span className="text-stone-600 text-xs shrink-0">°F +</span>
              <input type="number" min="0" step="1" placeholder="0s"
                value={pour.pauseS} onChange={(e) => setPours((p) => p.map((x, j) => j === i ? { ...x, pauseS: e.target.value } : x))}
                className="input-field w-16" />
              <span className="text-stone-600 text-xs shrink-0">s</span>
              {pours.length > 1 && (
                <button type="button" onClick={() => setPours((p) => p.filter((_, j) => j !== i))}
                  className="text-stone-700 hover:text-red-400 text-xs shrink-0">×</button>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 py-2.5 bg-stone-800 text-stone-400 rounded-xl text-sm">Cancel</button>
        <button onClick={handleSubmit} disabled={saving || !valid}
          className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white font-semibold rounded-xl transition-colors text-sm">
          {saving ? "Saving…" : "Create & select →"}
        </button>
      </div>
    </div>
  );
}
