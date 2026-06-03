"use client";

import { useState } from "react";
import { createGrindProfile } from "@/app/brew/actions";
import type { GrindProfile } from "@/lib/types";
import OdeDial from "@/components/OdeDial";

export default function AddGrindForm({
  onCreated,
  onCancel,
}: {
  onCreated: (p: GrindProfile) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [setting, setSetting] = useState("");
  const [saving, setSaving] = useState(false);

  const parsedSetting = setting && !isNaN(parseFloat(setting)) ? parseFloat(setting) : null;

  async function handleSubmit() {
    if (!name.trim() || parsedSetting === null) return;
    setSaving(true);
    try {
      const profile = await createGrindProfile({ name: name.trim(), setting: parsedSetting });
      onCreated(profile);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create grind profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 mb-4 space-y-3">
      <p className="text-stone-400 text-xs font-semibold uppercase tracking-wide">New grind profile</p>
      <div>
        <label className="text-stone-500 text-xs block mb-1">Profile name *</label>
        <input type="text" placeholder="e.g. Pourovers Light" value={name}
          onChange={(e) => setName(e.target.value)} className="input-field" />
      </div>
      <div>
        <label className="text-stone-500 text-xs block mb-1">Setting (Ode Gen 2) *</label>
        <input type="number" min="0" max="11" step="0.5" placeholder="e.g. 3.5" value={setting}
          onChange={(e) => setSetting(e.target.value)} className="input-field" />
      </div>
      {parsedSetting !== null && (
        <div className="bg-stone-900 border border-stone-700 rounded-xl p-3">
          <OdeDial setting={parsedSetting} />
          <p className="text-stone-400 text-xs text-center mt-2">Setting <span className="text-amber-400 font-bold">{setting}</span></p>
        </div>
      )}
      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 py-2.5 bg-stone-800 text-stone-400 rounded-xl text-sm">Cancel</button>
        <button onClick={handleSubmit} disabled={saving || !name.trim() || parsedSetting === null}
          className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white font-semibold rounded-xl transition-colors text-sm">
          {saving ? "Saving…" : "Create & select →"}
        </button>
      </div>
    </div>
  );
}
