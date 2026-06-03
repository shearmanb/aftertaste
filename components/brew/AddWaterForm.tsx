"use client";

import { useState } from "react";
import { createWaterProfile } from "@/app/brew/actions";
import type { WaterProfile } from "@/lib/types";

export default function AddWaterForm({
  onCreated,
  onCancel,
}: {
  onCreated: (p: WaterProfile) => void;
  onCancel: () => void;
}) {
  const [brand, setBrand] = useState("");
  const [additives, setAdditives] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!brand.trim()) return;
    setSaving(true);
    try {
      const profile = await createWaterProfile({ brand: brand.trim(), additives: additives.trim() || undefined });
      onCreated(profile);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create water profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 mb-4 space-y-3">
      <p className="text-stone-400 text-xs font-semibold uppercase tracking-wide">New water profile</p>
      <div>
        <label className="text-stone-500 text-xs block mb-1">Brand / source *</label>
        <input type="text" placeholder="e.g. Third Wave Water" value={brand}
          onChange={(e) => setBrand(e.target.value)} className="input-field" />
      </div>
      <div>
        <label className="text-stone-500 text-xs block mb-1">Additives <span className="text-stone-700">(optional)</span></label>
        <input type="text" placeholder="e.g. Classic Light Roast mineral packet" value={additives}
          onChange={(e) => setAdditives(e.target.value)} className="input-field" />
      </div>
      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 py-2.5 bg-stone-800 text-stone-400 rounded-xl text-sm">Cancel</button>
        <button onClick={handleSubmit} disabled={saving || !brand.trim()}
          className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white font-semibold rounded-xl transition-colors text-sm">
          {saving ? "Saving…" : "Create & select →"}
        </button>
      </div>
    </div>
  );
}
