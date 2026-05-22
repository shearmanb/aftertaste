"use client";

import AppShell from "@/components/AppShell";
import { useEffect, useState } from "react";

type Producer = {
  id: string;
  name: string;
  quality?: string | null;
  beanNotes?: string | null;
  variance?: string | null;
  website?: string | null;
  _count?: { beans: number };
};

function ProducerCard({ p, onEdit }: { p: Producer; onEdit: (p: Producer) => void }) {
  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden">
      <div className="px-4 pt-4 pb-3 border-b border-stone-800 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-stone-100">{p.name}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {p.quality && (
              <span className="bg-amber-900/40 text-amber-400 text-xs px-2 py-0.5 rounded-full">{p.quality}</span>
            )}
            {p._count && (
              <span className="text-stone-600 text-xs">{p._count.beans} bean{p._count.beans !== 1 ? "s" : ""}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {p.website && (
            <a href={p.website} target="_blank" rel="noopener noreferrer"
              className="p-1.5 text-stone-500 hover:text-amber-400 transition-colors" aria-label="Website">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </a>
          )}
          <button onClick={() => onEdit(p)} className="p-1.5 text-stone-500 hover:text-stone-300 transition-colors" aria-label="Edit producer">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
        </div>
      </div>
      {(p.beanNotes || p.variance) && (
        <div className="p-4 space-y-2">
          {p.beanNotes && (
            <div>
              <p className="text-stone-500 text-xs font-semibold uppercase tracking-wide mb-1">Bean Notes</p>
              <p className="text-stone-300 text-sm">{p.beanNotes}</p>
            </div>
          )}
          {p.variance && (
            <div>
              <p className="text-stone-500 text-xs font-semibold uppercase tracking-wide mb-1">Variance</p>
              <p className="text-stone-300 text-sm">{p.variance}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ProducersPage() {
  const [producers, setProducers] = useState<Producer[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [quality, setQuality] = useState("");
  const [beanNotes, setBeanNotes] = useState("");
  const [variance, setVariance] = useState("");
  const [website, setWebsite] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/producers").then((r) => r.json()).then(setProducers);
  }, []);

  function resetForm() {
    setName(""); setQuality(""); setBeanNotes(""); setVariance(""); setWebsite("");
  }

  function openEdit(p: Producer) {
    setEditingId(p.id);
    setName(p.name);
    setQuality(p.quality ?? "");
    setBeanNotes(p.beanNotes ?? "");
    setVariance(p.variance ?? "");
    setWebsite(p.website ?? "");
    setShowForm(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeForm() {
    setShowForm(false); setEditingId(null); resetForm();
  }

  async function save() {
    setSaving(true);
    const payload = {
      name,
      quality: quality || undefined,
      beanNotes: beanNotes || undefined,
      variance: variance || undefined,
      website: website || undefined,
    };

    if (editingId) {
      const res = await fetch(`/api/producers/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const updated = await res.json();
      setProducers((prev) => prev.map((p) => p.id === editingId ? { ...updated, _count: p._count } : p));
    } else {
      const res = await fetch("/api/producers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const producer = await res.json();
      setProducers((prev) => [...prev, { ...producer, _count: { beans: 0 } }]);
    }

    closeForm();
    setSaving(false);
  }

  const formVisible = showForm || editingId !== null;

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6 pt-2">
        <h1 className="text-xl font-bold text-stone-100">Producers</h1>
        <button
          onClick={() => { setEditingId(null); resetForm(); setShowForm(true); }}
          className="bg-amber-600 hover:bg-amber-500 text-white font-bold w-10 h-10 rounded-full flex items-center justify-center text-xl transition-colors"
        >
          +
        </button>
      </div>

      {formVisible && (
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 mb-5 space-y-4">
          <p className="text-stone-300 font-medium text-sm">{editingId ? "Edit Producer" : "Add Producer"}</p>

          <div>
            <label className="text-stone-500 text-xs mb-1 block">Name *</label>
            <input placeholder="e.g. Onyx Coffee Lab" value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
          </div>

          <div>
            <label className="text-stone-500 text-xs mb-1 block">Quality</label>
            <input placeholder="e.g. Excellent, Consistent, Improving..." value={quality} onChange={(e) => setQuality(e.target.value)} className="input-field" />
          </div>

          <div>
            <label className="text-stone-500 text-xs mb-1 block">Website</label>
            <input type="url" placeholder="https://..." value={website} onChange={(e) => setWebsite(e.target.value)} className="input-field" />
          </div>

          <div>
            <label className="text-stone-500 text-xs mb-1 block">Bean Notes</label>
            <textarea placeholder="General notes about this producer's beans..." value={beanNotes} onChange={(e) => setBeanNotes(e.target.value)} rows={2} className="input-field resize-none" />
          </div>

          <div>
            <label className="text-stone-500 text-xs mb-1 block">Variance</label>
            <textarea placeholder="Notes on batch-to-batch consistency..." value={variance} onChange={(e) => setVariance(e.target.value)} rows={2} className="input-field resize-none" />
          </div>

          <div className="flex gap-2">
            <button onClick={closeForm} className="flex-1 py-2 bg-stone-800 text-stone-400 rounded-lg text-sm">Cancel</button>
            <button onClick={save} disabled={!name || saving}
              className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition-colors">
              {saving ? "Saving..." : editingId ? "Update" : "Save"}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {producers.map((p) => (
          <div key={p.id} className={`rounded-xl transition-colors ${editingId === p.id ? "ring-1 ring-amber-600/60" : ""}`}>
            <ProducerCard p={p} onEdit={openEdit} />
          </div>
        ))}
        {producers.length === 0 && !formVisible && (
          <div className="text-center py-16 text-stone-500">
            <p className="text-4xl mb-3">◈</p>
            <p className="font-medium">No producers yet</p>
            <button onClick={() => setShowForm(true)} className="text-amber-500 underline text-sm mt-2">Add your first producer →</button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
