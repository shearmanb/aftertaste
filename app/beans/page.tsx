"use client";

import AppShell from "@/components/AppShell";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Producer = { id: string; name: string };
type Bean = {
  id: string;
  producer: Producer;
  producerId: string;
  name: string;
  region?: string | null;
  roastLevel: string;
  process?: string | null;
  tastingNotes: string[];
  imageUrl?: string | null;
  productUrl?: string | null;
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

function compressImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 900;
        let { width, height } = img;
        if (width > height && width > MAX) { height = Math.round((height * MAX) / width); width = MAX; }
        else if (height > MAX) { width = Math.round((width * MAX) / height); height = MAX; }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.75));
      };
      img.src = e.target!.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function BeansPage() {
  const [beans, setBeans] = useState<Bean[]>([]);
  const [producers, setProducers] = useState<Producer[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [producerId, setProducerId] = useState("");
  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const [roastLevel, setRoastLevel] = useState("medium-light");
  const [process, setProcess] = useState("");
  const [tastingNotes, setTastingNotes] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [productUrl, setProductUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/beans").then((r) => r.json()),
      fetch("/api/producers").then((r) => r.json()),
    ]).then(([beansData, producersData]) => {
      setBeans(beansData);
      setProducers(producersData);
    });
  }, []);

  function toggleNote(note: string) {
    setTastingNotes((prev) =>
      prev.includes(note) ? prev.filter((n) => n !== note) : [...prev, note]
    );
  }

  function resetForm() {
    setProducerId(""); setName(""); setRegion(""); setRoastLevel("medium-light"); setProcess("");
    setTastingNotes([]); setImageUrl(""); setImagePreview(null); setProductUrl(""); setNotes("");
  }

  function openEdit(bean: Bean) {
    setEditingId(bean.id);
    setProducerId(bean.producerId);
    setName(bean.name);
    setRegion(bean.region ?? "");
    setRoastLevel(bean.roastLevel);
    setProcess(bean.process ?? "");
    setTastingNotes(bean.tastingNotes);
    setImageUrl(bean.imageUrl ?? "");
    setImagePreview(bean.imageUrl ?? null);
    setProductUrl(bean.productUrl ?? "");
    setNotes(bean.notes ?? "");
    setShowForm(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeForm() {
    setShowForm(false); setEditingId(null); resetForm();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file);
    setImageUrl(compressed);
    setImagePreview(compressed);
  }

  async function save() {
    setSaving(true);
    const payload = {
      producerId,
      name,
      region: region || undefined,
      roastLevel,
      process: process || undefined,
      tastingNotes,
      imageUrl: imageUrl || undefined,
      productUrl: productUrl || undefined,
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
            {producers.length === 0 ? (
              <p className="text-stone-500 text-sm">
                No producers yet.{" "}
                <Link href="/producers" className="text-amber-500 underline">Add a producer first →</Link>
              </p>
            ) : (
              <select value={producerId} onChange={(e) => setProducerId(e.target.value)} className="input-field">
                <option value="">Select producer...</option>
                {producers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            )}
            <Link href="/producers" className="text-stone-600 text-xs mt-1 block hover:text-amber-500">
              Manage producers →
            </Link>
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
                <button key={note} type="button" onClick={() => toggleNote(note)}
                  className={`px-2.5 py-1 rounded-full text-xs transition-colors ${tastingNotes.includes(note) ? "bg-amber-600 text-white" : "bg-stone-800 text-stone-400 hover:bg-stone-700"}`}>
                  {note}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-stone-500 text-xs mb-1 block">Product page URL (optional)</label>
            <input placeholder="https://roaster.com/product/..." value={productUrl} onChange={(e) => setProductUrl(e.target.value)} className="input-field" type="url" />
          </div>

          <div>
            <label className="text-stone-500 text-xs mb-2 block">Bean photo (optional)</label>
            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
            <div className="flex gap-2">
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="shrink-0 px-3 py-2 bg-stone-800 text-stone-300 rounded-lg text-xs hover:bg-stone-700 transition-colors">
                📷 Take / upload
              </button>
              <input
                placeholder="or paste image URL..."
                value={imagePreview?.startsWith("data:") ? "" : imageUrl}
                onChange={(e) => { setImageUrl(e.target.value); setImagePreview(e.target.value || null); }}
                className="input-field flex-1 text-xs"
                type="url"
              />
            </div>
            {imagePreview && (
              <div className="relative mt-2">
                <img src={imagePreview} alt="Preview" className="w-full h-36 object-cover rounded-lg" />
                <button
                  onClick={() => { setImageUrl(""); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                  className="absolute top-1.5 right-1.5 bg-stone-900/80 text-stone-400 hover:text-red-400 rounded-full w-6 h-6 flex items-center justify-center text-sm"
                >×</button>
              </div>
            )}
          </div>

          <div>
            <label className="text-stone-500 text-xs mb-1 block">Notes (optional)</label>
            <textarea placeholder="Any other notes..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="input-field resize-none" />
          </div>

          <div className="flex gap-2">
            <button onClick={closeForm} className="flex-1 py-2 bg-stone-800 text-stone-400 rounded-lg text-sm">Cancel</button>
            <button onClick={save} disabled={!producerId || !name || saving}
              className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition-colors">
              {saving ? "Saving..." : editingId ? "Update" : "Save"}
            </button>
          </div>
        </div>
      )}

      {beans.length === 0 && !formVisible ? (
        <div className="text-center py-16 text-stone-500">
          <p className="text-4xl mb-3">◉</p>
          <p className="font-medium">No beans yet</p>
          <button onClick={() => setShowForm(true)} className="text-amber-500 underline text-sm mt-2">Add your first bean →</button>
        </div>
      ) : (
        <div className="space-y-3">
          {beans.map((bean) => (
            <div key={bean.id} className={`bg-stone-900 border rounded-xl overflow-hidden transition-colors ${editingId === bean.id ? "border-amber-600/60" : "border-stone-800"}`}>
              {bean.imageUrl && (
                <img src={bean.imageUrl} alt={`${bean.producer.name} ${bean.name}`} className="w-full h-40 object-cover" />
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-stone-100">{bean.producer.name}</p>
                    <p className="text-stone-400 text-sm">{bean.name}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {bean.productUrl && (
                      <a href={bean.productUrl} target="_blank" rel="noopener noreferrer"
                        className="p-1.5 text-stone-500 hover:text-amber-400 transition-colors" aria-label="Product page">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                          <polyline points="15 3 21 3 21 9"/>
                          <line x1="10" y1="14" x2="21" y2="3"/>
                        </svg>
                      </a>
                    )}
                    <button onClick={() => openEdit(bean)} className="p-1.5 text-stone-500 hover:text-stone-300 transition-colors" aria-label="Edit bean">
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  <span className="bg-stone-800 text-stone-400 text-xs px-2 py-0.5 rounded-full">{bean.roastLevel}</span>
                  {bean.region && <span className="bg-stone-800 text-stone-400 text-xs px-2 py-0.5 rounded-full">{bean.region}</span>}
                  {bean.process && <span className="bg-stone-800 text-amber-600/80 text-xs px-2 py-0.5 rounded-full">{bean.process}</span>}
                </div>
                {bean.tastingNotes && bean.tastingNotes.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {bean.tastingNotes.map((note) => (
                      <span key={note} className="bg-amber-900/30 text-amber-300 text-xs px-2 py-0.5 rounded-full">{note}</span>
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
