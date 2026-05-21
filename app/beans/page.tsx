"use client";

import AppShell from "@/components/AppShell";
import { useEffect, useState } from "react";

type Bean = {
  id: string;
  producer: string;
  name: string;
  region?: string | null;
  roastLevel: string;
  process?: string | null;
  tastingNotes: string[];
  imageUrl?: string | null;
  notes?: string | null;
};

const ROAST_LEVELS = ["light", "medium-light", "medium", "medium-dark", "dark"];
const PROCESSES = ["Washed", "Natural", "Honey", "Anaerobic Natural", "Anaerobic Washed", "Wet-Hulled", "Other"];
const BEAN_TASTING_NOTES = [
  "blueberry", "strawberry", "raspberry", "cherry", "stone fruit", "peach",
  "mango", "tropical", "passionfruit", "citrus", "lemon", "orange", "grapefruit",
  "jasmine", "rose", "floral", "lavender",
  "caramel", "brown sugar", "honey", "chocolate", "dark chocolate", "vanilla", "maple",
  "hazelnut", "almond", "nutty",
  "cinnamon", "cardamom",
  "bright", "clean", "complex", "juicy", "tea-like", "earthy", "smoky", "wine",
];

export default function BeansPage() {
  const [beans, setBeans] = useState<Bean[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // form state
  const [producerInput, setProducerInput] = useState("");
  const [useNewProducer, setUseNewProducer] = useState(false);
  const [newProducer, setNewProducer] = useState("");
  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const [roastLevel, setRoastLevel] = useState("medium-light");
  const [process, setProcess] = useState("");
  const [tastingNotes, setTastingNotes] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/beans").then((r) => r.json()).then(setBeans);
  }, []);

  const producers = Array.from(new Set(beans.map((b) => b.producer))).sort();
  const producer = useNewProducer ? newProducer : producerInput;

  function toggleNote(note: string) {
    setTastingNotes((prev) =>
      prev.includes(note) ? prev.filter((n) => n !== note) : [...prev, note]
    );
  }

  function resetForm() {
    setProducerInput(""); setUseNewProducer(false); setNewProducer("");
    setName(""); setRegion(""); setRoastLevel("medium-light"); setProcess("");
    setTastingNotes([]); setImageUrl(""); setNotes("");
  }

  function openEdit(bean: Bean) {
    setEditingId(bean.id);
    setProducerInput(bean.producer);
    setUseNewProducer(false);
    setNewProducer("");
    setName(bean.name);
    setRegion(bean.region ?? "");
    setRoastLevel(bean.roastLevel);
    setProcess(bean.process ?? "");
    setTastingNotes(bean.tastingNotes);
    setImageUrl(bean.imageUrl ?? "");
    setNotes(bean.notes ?? "");
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
    const payload = {
      producer,
      name,
      region: region || undefined,
      roastLevel,
      process: process || undefined,
      tastingNotes,
      imageUrl: imageUrl || undefined,
      notes: notes || undefined,
    };

    if (editingId) {
      const res = await fetch(`/api/beans/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const updated = await res.json();
      setBeans((prev) => prev.map((b) => b.id === editingId ? updated : b));
    } else {
      const res = await fetch("/api/beans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const bean = await res.json();
      setBeans((prev) => [...prev, bean]);
    }

    closeForm();
    setSaving(false);
  }

  const formVisible = showForm || editingId !== null;

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6 pt-2">
        <h1 className="text-xl font-bold text-stone-100">Beans</h1>
        <button
          onClick={() => { setEditingId(null); resetForm(); setShowForm(true); }}
          className="bg-amber-600 hover:bg-amber-500 text-white font-bold w-10 h-10 rounded-full flex items-center justify-center text-xl transition-colors"
        >
          +
        </button>
      </div>

      {formVisible && (
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 mb-5 space-y-4">
          <p className="text-stone-300 font-medium text-sm">{editingId ? "Edit Bean" : "Add Bean"}</p>

          <div>
            <label className="text-stone-500 text-xs mb-1 block">Producer *</label>
            {producers.length > 0 && !useNewProducer ? (
              <div className="space-y-2">
                <select
                  value={producerInput}
                  onChange={(e) => {
                    if (e.target.value === "__new__") {
                      setUseNewProducer(true);
                      setProducerInput("");
                    } else {
                      setProducerInput(e.target.value);
                    }
                  }}
                  className="input-field"
                >
                  <option value="">Select producer...</option>
                  {producers.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                  <option value="__new__">+ Add new producer</option>
                </select>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  placeholder="New producer name *"
                  value={newProducer}
                  onChange={(e) => setNewProducer(e.target.value)}
                  className="input-field flex-1"
                />
                {producers.length > 0 && (
                  <button
                    onClick={() => { setUseNewProducer(false); setNewProducer(""); }}
                    className="px-3 py-2 bg-stone-800 text-stone-400 rounded-lg text-xs"
                  >
                    Cancel
                  </button>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="text-stone-500 text-xs mb-1 block">Name / Blend *</label>
            <input placeholder="e.g. Yirgacheffe Natural" value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-stone-500 text-xs mb-1 block">Region</label>
              <input placeholder="e.g. Yirgacheffe" value={region} onChange={(e) => setRegion(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="text-stone-500 text-xs mb-1 block">Process</label>
              <select value={process} onChange={(e) => setProcess(e.target.value)} className="input-field">
                <option value="">Select...</option>
                {PROCESSES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-stone-500 text-xs mb-1 block">Roast Level</label>
            <select value={roastLevel} onChange={(e) => setRoastLevel(e.target.value)} className="input-field">
              {ROAST_LEVELS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div>
            <label className="text-stone-500 text-xs mb-2 block">Tasting Notes (from bag)</label>
            <div className="flex flex-wrap gap-1.5">
              {BEAN_TASTING_NOTES.map((note) => (
                <button
                  key={note}
                  type="button"
                  onClick={() => toggleNote(note)}
                  className={`px-2.5 py-1 rounded-full text-xs transition-colors ${
                    tastingNotes.includes(note)
                      ? "bg-amber-600 text-white"
                      : "bg-stone-800 text-stone-400 hover:bg-stone-700"
                  }`}
                >
                  {note}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-stone-500 text-xs mb-1 block">Label photo URL (optional)</label>
            <input
              placeholder="https://..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="input-field"
              type="url"
            />
          </div>

          <div>
            <label className="text-stone-500 text-xs mb-1 block">Notes (optional)</label>
            <textarea
              placeholder="Any other notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="input-field resize-none"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={closeForm}
              className="flex-1 py-2 bg-stone-800 text-stone-400 rounded-lg text-sm"
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={!producer || !name || saving}
              className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition-colors"
            >
              {saving ? "Saving..." : editingId ? "Update" : "Save"}
            </button>
          </div>
        </div>
      )}

      {beans.length === 0 && !formVisible ? (
        <div className="text-center py-16 text-stone-500">
          <p className="text-4xl mb-3">◉</p>
          <p className="font-medium">No beans yet</p>
          <button onClick={() => setShowForm(true)} className="text-amber-500 underline text-sm mt-2">
            Add your first bean →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {beans.map((bean) => (
            <div key={bean.id} className={`bg-stone-900 border rounded-xl overflow-hidden transition-colors ${editingId === bean.id ? "border-amber-600/60" : "border-stone-800"}`}>
              {bean.imageUrl && (
                <img
                  src={bean.imageUrl}
                  alt={`${bean.producer} ${bean.name} label`}
                  className="w-full h-40 object-cover"
                />
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-stone-100">{bean.producer}</p>
                    <p className="text-stone-400 text-sm">{bean.name}</p>
                  </div>
                  <button
                    onClick={() => openEdit(bean)}
                    className="shrink-0 p-1.5 text-stone-500 hover:text-stone-300 transition-colors"
                    aria-label="Edit bean"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                </div>
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  <span className="bg-stone-800 text-stone-400 text-xs px-2 py-0.5 rounded-full">{bean.roastLevel}</span>
                  {bean.region && (
                    <span className="bg-stone-800 text-stone-400 text-xs px-2 py-0.5 rounded-full">{bean.region}</span>
                  )}
                  {bean.process && (
                    <span className="bg-stone-800 text-amber-600/80 text-xs px-2 py-0.5 rounded-full">{bean.process}</span>
                  )}
                </div>
                {bean.tastingNotes && bean.tastingNotes.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {bean.tastingNotes.map((note) => (
                      <span key={note} className="bg-amber-900/30 text-amber-300 text-xs px-2 py-0.5 rounded-full">
                        {note}
                      </span>
                    ))}
                  </div>
                )}
                {bean.notes && <p className="text-stone-500 text-xs mt-2 italic">{bean.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
