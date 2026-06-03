"use client";

import { useState } from "react";
import { createFilterProfile } from "@/app/brew/actions";
import type { FilterProfile } from "@/lib/types";

export default function AddFilterForm({
  onCreated,
  onCancel,
}: {
  onCreated: (p: FilterProfile) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const profile = await createFilterProfile({ name: name.trim() });
      onCreated(profile);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create filter profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 mb-4 space-y-3">
      <p className="text-stone-400 text-xs font-semibold uppercase tracking-wide">New filter profile</p>
      <div>
        <label className="text-stone-500 text-xs block mb-1">Filter name *</label>
        <input type="text" placeholder="e.g. Sibarist Flat" value={name}
          onChange={(e) => setName(e.target.value)} className="input-field" />
      </div>
      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 py-2.5 bg-stone-800 text-stone-400 rounded-xl text-sm">Cancel</button>
        <button onClick={handleSubmit} disabled={saving || !name.trim()}
          className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white font-semibold rounded-xl transition-colors text-sm">
          {saving ? "Saving…" : "Create & select →"}
        </button>
      </div>
    </div>
  );
}
