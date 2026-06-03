"use client";

import { useState } from "react";
import { createBeanBag } from "@/app/brew/actions";
import type { BeanBag } from "@/lib/types";

export default function AddBagForm({
  beanId,
  onCreated,
  onCancel,
}: {
  beanId: string;
  onCreated: (bag: BeanBag) => void;
  onCancel: () => void;
}) {
  const [roastedOn, setRoastedOn] = useState("");
  const [openedOn, setOpenedOn] = useState("");
  const [weightG, setWeightG] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    setSaving(true);
    try {
      const bag = await createBeanBag({
        beanId,
        roastedOn: roastedOn || undefined,
        openedOn: openedOn || undefined,
        weightG: weightG ? parseFloat(weightG) : undefined,
        notes: notes || undefined,
      });
      onCreated(bag);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create bag");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 mb-3 space-y-3">
      <p className="text-stone-400 text-xs font-semibold uppercase tracking-wide">New bag</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-stone-500 text-xs block mb-1">Roasted on</label>
          <input type="date" value={roastedOn} onChange={(e) => setRoastedOn(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="text-stone-500 text-xs block mb-1">Opened</label>
          <input type="date" value={openedOn} onChange={(e) => setOpenedOn(e.target.value)} className="input-field" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-stone-500 text-xs block mb-1">Bag size <span className="text-stone-700">(g, optional)</span></label>
          <input type="number" min="0" step="1" value={weightG} onChange={(e) => setWeightG(e.target.value)} placeholder="e.g. 250" className="input-field" />
        </div>
        <div>
          <label className="text-stone-500 text-xs block mb-1">Notes <span className="text-stone-700">(optional)</span></label>
          <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} className="input-field" />
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 py-2 bg-stone-800 text-stone-400 rounded-xl text-sm">Cancel</button>
        <button onClick={handleSubmit} disabled={saving}
          className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white font-semibold rounded-xl transition-colors text-sm">
          {saving ? "Saving…" : "Create bag & select →"}
        </button>
      </div>
    </div>
  );
}
