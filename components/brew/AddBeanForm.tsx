"use client";

import { useState } from "react";
import { createProducer, createBean } from "@/app/brew/actions";
import type { Bean, Producer } from "@/lib/types";

export default function AddBeanForm({
  initialProducers,
  roastLevels,
  processes,
  onCreated,
  onCancel,
}: {
  initialProducers: Producer[];
  roastLevels: string[];
  processes: string[];
  onCreated: (bean: Bean) => void;
  onCancel: () => void;
}) {
  const [producers, setProducers] = useState<Producer[]>(initialProducers);
  const [producerId, setProducerId] = useState("");
  const [producerName, setProducerName] = useState("");
  const [beanName, setBeanName] = useState("");
  const [roastLevel, setRoastLevel] = useState(roastLevels[0] ?? "");
  const [region, setRegion] = useState("");
  const [process, setProcess] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!beanName.trim() || !roastLevel) return;
    if (!producerId && !producerName.trim()) return;
    setSaving(true);
    try {
      let resolvedProducerId = producerId;
      if (!resolvedProducerId) {
        const newProd = await createProducer({ name: producerName.trim() });
        setProducers((p) => [...p, newProd]);
        resolvedProducerId = newProd.id;
      }
      const bean = await createBean({
        producerId: resolvedProducerId,
        name: beanName.trim(),
        roastLevel,
        region: region.trim() || undefined,
        process: process || undefined,
      });
      onCreated(bean);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 mb-4 space-y-3">
      <p className="text-stone-400 text-xs font-semibold uppercase tracking-wide">Quick add bean</p>

      <div>
        <label className="text-stone-500 text-xs block mb-1">Producer</label>
        <select value={producerId} onChange={(e) => { setProducerId(e.target.value); setProducerName(""); }}
          className="input-field">
          <option value="">+ New producer…</option>
          {producers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        {!producerId && (
          <input type="text" placeholder="Producer name" value={producerName}
            onChange={(e) => setProducerName(e.target.value)}
            className="input-field mt-2" />
        )}
      </div>

      <div>
        <label className="text-stone-500 text-xs block mb-1">Name / blend</label>
        <input type="text" placeholder="e.g. Yirgacheffe Natural" value={beanName}
          onChange={(e) => setBeanName(e.target.value)} className="input-field" />
      </div>

      <div>
        <label className="text-stone-500 text-xs block mb-1">Roast level</label>
        <select value={roastLevel} onChange={(e) => setRoastLevel(e.target.value)} className="input-field">
          {roastLevels.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <div>
        <label className="text-stone-500 text-xs block mb-1">Region <span className="text-stone-700">(optional)</span></label>
        <input type="text" placeholder="e.g. Yirgacheffe" value={region}
          onChange={(e) => setRegion(e.target.value)} className="input-field" />
      </div>

      <div>
        <label className="text-stone-500 text-xs block mb-1">Process <span className="text-stone-700">(optional)</span></label>
        <select value={process} onChange={(e) => setProcess(e.target.value)} className="input-field">
          <option value="">—</option>
          {processes.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 py-2.5 bg-stone-800 text-stone-400 rounded-xl text-sm">Cancel</button>
        <button onClick={handleSubmit}
          disabled={saving || !beanName.trim() || !roastLevel || (!producerId && !producerName.trim())}
          className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white font-semibold rounded-xl transition-colors text-sm">
          {saving ? "Saving…" : "Add & select →"}
        </button>
      </div>
    </div>
  );
}
