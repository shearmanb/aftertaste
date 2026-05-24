"use client";

import { useState } from "react";
import { format } from "date-fns";

type Bag = {
  id: string;
  beanId: string;
  roastedOn: string | null;
  purchasedOn: string | null;
  openedOn: string | null;
  exhaustedOn: string | null;
  weightG: number | null;
  notes: string | null;
  brewCount: number;
  gramsUsed: number;
};

export default function BeanBagManager({ beanId, initialBags }: { beanId: string; initialBags: Bag[] }) {
  const [bags, setBags] = useState<Bag[]>(initialBags);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [roastedOn, setRoastedOn] = useState("");
  const [purchasedOn, setPurchasedOn] = useState("");
  const [openedOn, setOpenedOn] = useState("");
  const [exhaustedOn, setExhaustedOn] = useState("");
  const [weightG, setWeightG] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  function resetForm() {
    setRoastedOn(""); setPurchasedOn(""); setOpenedOn("");
    setExhaustedOn(""); setWeightG(""); setNotes("");
  }

  function openEdit(bag: Bag) {
    setEditingId(bag.id);
    setRoastedOn(bag.roastedOn ? bag.roastedOn.split("T")[0] : "");
    setPurchasedOn(bag.purchasedOn ? bag.purchasedOn.split("T")[0] : "");
    setOpenedOn(bag.openedOn ? bag.openedOn.split("T")[0] : "");
    setExhaustedOn(bag.exhaustedOn ? bag.exhaustedOn.split("T")[0] : "");
    setWeightG(bag.weightG != null ? String(bag.weightG) : "");
    setNotes(bag.notes ?? "");
    setShowForm(false);
  }

  function closeForm() {
    setShowForm(false); setEditingId(null); resetForm();
  }

  async function save() {
    setSaving(true);
    try {
      const payload = {
        roastedOn: roastedOn || null,
        purchasedOn: purchasedOn || null,
        openedOn: openedOn || null,
        exhaustedOn: exhaustedOn || null,
        weightG: weightG ? parseFloat(weightG) : null,
        notes: notes || null,
      };

      if (editingId) {
        const res = await fetch(`/api/bean-bags/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const updated = await res.json();
        setBags((prev) => prev.map((b) => b.id === editingId ? {
          ...updated,
          roastedOn: updated.roastedOn ?? null,
          openedOn: updated.openedOn ?? null,
          purchasedOn: updated.purchasedOn ?? null,
          exhaustedOn: updated.exhaustedOn ?? null,
          brewCount: b.brewCount,
          gramsUsed: b.gramsUsed,
        } : b));
      } else {
        const res = await fetch("/api/bean-bags", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ beanId, ...payload }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const bag = await res.json();
        setBags((prev) => [{ ...bag, roastedOn: bag.roastedOn ?? null, openedOn: bag.openedOn ?? null, purchasedOn: bag.purchasedOn ?? null, exhaustedOn: bag.exhaustedOn ?? null, brewCount: 0, gramsUsed: 0 }, ...prev]);
      }
      closeForm();
    } catch (err) {
      alert(err instanceof Error ? `Save failed: ${err.message}` : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function markExhausted(bag: Bag) {
    const today = new Date().toISOString().split("T")[0];
    const res = await fetch(`/api/bean-bags/${bag.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exhaustedOn: today }),
    });
    if (!res.ok) { alert("Failed to update"); return; }
    setBags((prev) => prev.map((b) => b.id === bag.id ? { ...b, exhaustedOn: today } : b));
  }

  async function deleteBag(id: string) {
    if (!confirm("Delete this bag? This will not delete associated brews, but they will lose their bag link.")) return;
    const res = await fetch(`/api/bean-bags/${id}`, { method: "DELETE" });
    if (!res.ok) { alert("Failed to delete"); return; }
    setBags((prev) => prev.filter((b) => b.id !== id));
  }

  const formVisible = showForm || editingId !== null;

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-stone-400 text-xs font-semibold uppercase tracking-wide">
          Bags <span className="text-stone-600 font-normal normal-case">({bags.length})</span>
        </p>
        <button
          onClick={() => { setEditingId(null); resetForm(); setShowForm(true); }}
          className="text-amber-500 hover:text-amber-400 text-xs font-medium"
        >
          + Add bag
        </button>
      </div>

      {formVisible && (
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 mb-3 space-y-3">
          <p className="text-stone-300 text-xs font-semibold">{editingId ? "Edit Bag" : "New Bag"}</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-stone-500 text-xs block mb-1">Roasted on</label>
              <input type="date" value={roastedOn} onChange={(e) => setRoastedOn(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="text-stone-500 text-xs block mb-1">Purchased</label>
              <input type="date" value={purchasedOn} onChange={(e) => setPurchasedOn(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="text-stone-500 text-xs block mb-1">Opened</label>
              <input type="date" value={openedOn} onChange={(e) => setOpenedOn(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="text-stone-500 text-xs block mb-1">Exhausted</label>
              <input type="date" value={exhaustedOn} onChange={(e) => setExhaustedOn(e.target.value)} className="input-field" />
            </div>
          </div>
          <div>
            <label className="text-stone-500 text-xs block mb-1">Bag size (g, optional)</label>
            <input type="number" min="0" step="1" value={weightG} onChange={(e) => setWeightG(e.target.value)} placeholder="e.g. 250" className="input-field" />
          </div>
          <div>
            <label className="text-stone-500 text-xs block mb-1">Notes (optional)</label>
            <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} className="input-field" />
          </div>
          <div className="flex gap-2">
            <button onClick={closeForm} className="flex-1 py-2 bg-stone-800 text-stone-400 rounded-lg text-sm">Cancel</button>
            <button onClick={save} disabled={saving}
              className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition-colors">
              {saving ? "Saving…" : editingId ? "Update" : "Save"}
            </button>
          </div>
        </div>
      )}

      {bags.length === 0 && !formVisible ? (
        <div className="text-center py-6 text-stone-600 text-xs">
          No bags recorded — add one to start tracking freshness.
        </div>
      ) : (
        <div className="space-y-2">
          {bags.map((bag) => {
            const isActive = !bag.exhaustedOn;
            const gramsRemaining = bag.weightG != null ? bag.weightG - bag.gramsUsed : null;
            return (
              <div key={bag.id} className={`bg-stone-900 border rounded-xl p-4 ${isActive ? "border-stone-700" : "border-stone-800 opacity-70"}`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? "bg-green-900/40 text-green-400 border border-green-800/40" : "bg-stone-800 text-stone-500"}`}>
                        {isActive ? "Active" : "Exhausted"}
                      </span>
                      <span className="text-stone-500 text-xs">{bag.brewCount} brew{bag.brewCount !== 1 ? "s" : ""}</span>
                      {bag.weightG != null && (
                        <span className="text-stone-600 text-xs">
                          {bag.gramsUsed.toFixed(0)}g used
                          {gramsRemaining != null && isActive && ` · ~${Math.max(0, gramsRemaining).toFixed(0)}g left`}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {isActive && (
                      <button onClick={() => markExhausted(bag)} className="text-stone-600 hover:text-stone-400 text-xs">
                        Exhausted
                      </button>
                    )}
                    <button onClick={() => openEdit(bag)} className="text-stone-600 hover:text-stone-300 text-xs">Edit</button>
                    <button onClick={() => deleteBag(bag.id)} className="text-stone-600 hover:text-red-400 text-xs">Delete</button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  {bag.roastedOn && (
                    <div><span className="text-stone-600">Roasted</span> <span className="text-stone-400">{format(new Date(bag.roastedOn), "MMM d, yyyy")}</span></div>
                  )}
                  {bag.purchasedOn && (
                    <div><span className="text-stone-600">Purchased</span> <span className="text-stone-400">{format(new Date(bag.purchasedOn), "MMM d, yyyy")}</span></div>
                  )}
                  {bag.openedOn && (
                    <div><span className="text-stone-600">Opened</span> <span className="text-stone-400">{format(new Date(bag.openedOn), "MMM d, yyyy")}</span></div>
                  )}
                  {bag.exhaustedOn && (
                    <div><span className="text-stone-600">Exhausted</span> <span className="text-stone-400">{format(new Date(bag.exhaustedOn), "MMM d, yyyy")}</span></div>
                  )}
                </div>
                {bag.notes && <p className="text-stone-600 text-xs mt-2 italic">{bag.notes}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
