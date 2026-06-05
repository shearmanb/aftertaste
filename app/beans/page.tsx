"use client";

import AppShell from "@/components/AppShell";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

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

function BeanThumb({ name }: { name: string }) {
  const hue = (name.charCodeAt(0) * 7) % 60 + 30;
  return (
    <div
      className="w-[46px] h-[46px] rounded-[13px] grid place-items-center shrink-0"
      style={{
        background: `linear-gradient(150deg, oklch(0.45 0.10 ${hue}), oklch(0.30 0.08 ${hue}))`,
      }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ color: `oklch(0.85 0.15 ${hue})` }}>
        <path d="M7 4c5 0 10 3 10 9s-5 7-10 7-4-5-4-8 0-8 4-8Z" />
        <path d="M9 6c2 2 2 10-2 12" />
      </svg>
    </div>
  );
}

export default function BeansPage() {
  const router = useRouter();
  const [beans, setBeans] = useState<Bean[]>([]);
  const [producers, setProducers] = useState<Producer[]>([]);
  const [roastLevels, setRoastLevels] = useState<string[]>([]);
  const [processes, setProcesses] = useState<string[]>([]);
  const [beanTastingNotes, setBeanTastingNotes] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [producerId, setProducerId] = useState("");
  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const [roastLevel, setRoastLevel] = useState("");
  const [process, setProcess] = useState("");
  const [tastingNotes, setTastingNotes] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [productUrl, setProductUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/beans").then((r) => r.ok ? r.json() : []),
      fetch("/api/producers").then((r) => r.ok ? r.json() : []),
      fetch("/api/options?category=roastLevel").then((r) => r.ok ? r.json() : []),
      fetch("/api/options?category=process").then((r) => r.ok ? r.json() : []),
      fetch("/api/options?category=beanTastingNote").then((r) => r.ok ? r.json() : []),
    ]).then(([beansData, producersData, roastData, processData, noteData]) => {
      setBeans(Array.isArray(beansData) ? beansData : []);
      setProducers(Array.isArray(producersData) ? producersData : []);
      const roasts = Array.isArray(roastData) ? roastData.map((o: { value: string }) => o.value) : [];
      setRoastLevels(roasts);
      if (roasts.length > 0) setRoastLevel(roasts[0]);
      setProcesses(Array.isArray(processData) ? processData.map((o: { value: string }) => o.value) : []);
      setBeanTastingNotes(Array.isArray(noteData) ? noteData.map((o: { value: string }) => o.value) : []);
    }).catch(() => {});
  }, []);

  function toggleNote(note: string) {
    setTastingNotes((prev) => prev.includes(note) ? prev.filter((n) => n !== note) : [...prev, note]);
  }

  function resetForm() {
    setProducerId(""); setName(""); setRegion("");
    setRoastLevel(roastLevels[0] ?? "");
    setProcess(""); setTastingNotes([]); setImageUrl(""); setImagePreview(null); setProductUrl(""); setNotes("");
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
    try {
      const payload = {
        producerId, name,
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
        if (!res.ok) {
          const json = await res.json().catch(() => null);
          throw new Error(json?.error ?? `HTTP ${res.status}`);
        }
        const updated = await res.json();
        setBeans((prev) => prev.map((b) => b.id === editingId ? updated : b));
      } else {
        const res = await fetch("/api/beans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const json = await res.json().catch(() => null);
          throw new Error(json?.error ?? `HTTP ${res.status}`);
        }
        const bean = await res.json();
        setBeans((prev) => [...prev, bean]);
      }
      closeForm();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? `Save failed: ${err.message}` : "Save failed — check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  const formVisible = showForm || editingId !== null;

  return (
    <AppShell>
      <header className="flex items-end justify-between pt-3 pb-1">
        <div>
          <h1 className="text-[30px] font-extrabold leading-none" style={{ letterSpacing: "-0.025em" }}>Beans</h1>
          <p className="font-mono-plex text-[11.5px] mt-2" style={{ color: "var(--text-3)" }}>
            {beans.length} in library
          </p>
        </div>
        <button
          onClick={() => { setEditingId(null); resetForm(); setShowForm(true); }}
          aria-label="Add bean"
          className="at-add-btn"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
        </button>
      </header>

      {formVisible && (
        <div className="at-card p-5 mt-5 space-y-4">
          <p className="at-eyebrow">{editingId ? "Edit Bean" : "Add Bean"}</p>

          <div>
            <label className="at-field-label">Producer *</label>
            {producers.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--text-3)" }}>
                No producers yet.{" "}
                <Link href="/producers" className="at-link">Add a producer first →</Link>
              </p>
            ) : (
              <select value={producerId} onChange={(e) => setProducerId(e.target.value)} className="at-input">
                <option value="">Select producer...</option>
                {producers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            )}
            <Link href="/producers" className="at-link mt-2 inline-block">Manage producers →</Link>
          </div>

          <div>
            <label className="at-field-label">Name / Blend *</label>
            <input placeholder="e.g. Yirgacheffe Natural" value={name} onChange={(e) => setName(e.target.value)} className="at-input" />
          </div>

          <div className="flex gap-[11px]">
            <div className="flex-1">
              <label className="at-field-label">Region</label>
              <input placeholder="e.g. Yirgacheffe" value={region} onChange={(e) => setRegion(e.target.value)} className="at-input" />
            </div>
            <div className="flex-1">
              <label className="at-field-label">Process</label>
              <select value={process} onChange={(e) => setProcess(e.target.value)} className="at-input">
                <option value="">Select...</option>
                {processes.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="at-field-label">Roast Level</label>
            <select value={roastLevel} onChange={(e) => setRoastLevel(e.target.value)} className="at-input">
              {roastLevels.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="at-field-label" style={{ marginBottom: 0 }}>Tasting Notes (from bag)</label>
              <Link href="/admin" className="at-link">edit list →</Link>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {beanTastingNotes.map((note) => (
                <button
                  key={note}
                  type="button"
                  onClick={() => toggleNote(note)}
                  className={`at-tag ${tastingNotes.includes(note) ? "" : "neutral"}`}
                  style={{ cursor: "pointer" }}
                >
                  {note}
                </button>
              ))}
              {beanTastingNotes.length === 0 && (
                <p className="text-xs italic" style={{ color: "var(--text-3)" }}>
                  No tags yet — <Link href="/admin" className="at-link">add in Control Panel</Link>
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="at-field-label">Product page URL (optional)</label>
            <input placeholder="https://roaster.com/product/..." value={productUrl} onChange={(e) => setProductUrl(e.target.value)} className="at-input" type="url" />
          </div>

          <div>
            <label className="at-field-label">Bean photo (optional)</label>
            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
            <div className="flex gap-2">
              <button type="button" onClick={() => fileInputRef.current?.click()} className="at-chip" style={{ cursor: "pointer" }}>
                📷 Take / upload
              </button>
              <input
                placeholder="or paste image URL..."
                value={imagePreview?.startsWith("data:") ? "" : imageUrl}
                onChange={(e) => { setImageUrl(e.target.value); setImagePreview(e.target.value || null); }}
                className="at-input flex-1 text-xs"
                type="url"
              />
            </div>
            {imagePreview && (
              <div className="relative mt-2">
                <img src={imagePreview} alt="Preview" className="w-full h-36 object-cover rounded-[14px]" />
                <button
                  onClick={() => { setImageUrl(""); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full grid place-items-center text-sm"
                  style={{ background: "oklch(0 0 0 / 0.7)", color: "var(--text-2)" }}
                >×</button>
              </div>
            )}
          </div>

          <div>
            <label className="at-field-label">Notes (optional)</label>
            <textarea placeholder="Any other notes..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="at-input resize-none" />
          </div>

          <div className="flex gap-3 pt-1">
            <button onClick={closeForm} className="at-cta-ghost">Cancel</button>
            <button onClick={save} disabled={!producerId || !name || saving} className="at-cta">
              {saving ? "Saving…" : editingId ? "Update" : "Save"}
            </button>
          </div>
        </div>
      )}

      {beans.length === 0 && !formVisible ? (
        <div className="text-center py-16 mt-4" style={{ color: "var(--text-3)" }}>
          <p className="text-4xl mb-3">◉</p>
          <p className="font-medium" style={{ color: "var(--text-2)" }}>No beans yet</p>
          <button onClick={() => setShowForm(true)} className="at-link mt-2">Add your first bean →</button>
        </div>
      ) : (
        <div className="mt-5">
          {beans.map((bean) => (
            <div
              key={bean.id}
              className="at-card mb-[11px] overflow-hidden"
              style={editingId === bean.id ? { borderColor: "var(--accent-line)" } : undefined}
            >
              {bean.imageUrl && (
                <button onClick={() => router.push(`/beans/${bean.id}`)} className="block w-full">
                  <img src={bean.imageUrl} alt={`${bean.producer.name} ${bean.name}`} className="w-full h-40 object-cover" />
                </button>
              )}
              <div className="px-4 py-3.5 flex items-center gap-3.5">
                <BeanThumb name={bean.name} />
                <button onClick={() => router.push(`/beans/${bean.id}`)} className="min-w-0 text-left flex-1">
                  <p className="text-[15px] font-bold truncate" style={{ color: "var(--text-1)" }}>{bean.producer.name}</p>
                  <p className="font-mono-plex text-[11px] mt-0.5 truncate" style={{ color: "var(--text-3)" }}>
                    {bean.name}
                    {bean.region && ` · ${bean.region}`}
                    {` · ${bean.roastLevel}`}
                  </p>
                </button>
                <div className="flex items-center gap-1 shrink-0" style={{ color: "var(--text-3)" }}>
                  {bean.productUrl && (
                    <a href={bean.productUrl} target="_blank" rel="noopener noreferrer" className="p-2" aria-label="Product page">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </a>
                  )}
                  <button onClick={() => openEdit(bean)} className="p-2" aria-label="Edit bean">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                </div>
              </div>
              {(bean.process || (bean.tastingNotes && bean.tastingNotes.length > 0) || bean.notes) && (
                <div className="px-4 pb-4 -mt-1">
                  <div className="flex flex-wrap gap-1.5">
                    {bean.process && <span className="at-tag">{bean.process}</span>}
                    {bean.tastingNotes && bean.tastingNotes.map((n) => (
                      <span key={n} className="at-tag neutral">{n}</span>
                    ))}
                  </div>
                  {bean.notes && (
                    <p className="text-xs italic mt-2" style={{ color: "var(--text-3)" }}>{bean.notes}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
