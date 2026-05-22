"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

type WaterProfile = { id: string; brand: string; additives?: string | null };
type FilterProfile = { id: string; name: string };
type Bean = { id: string; producer: { name: string }; name: string; roastLevel: string; region?: string | null };
type GrindProfile = { id: string; name: string; setting: number };
type AidenProfile = { id: string; name: string; coffeeG: number; waterG: number; tempF: number };

export default function EditBrewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [waterProfiles, setWaterProfiles] = useState<WaterProfile[]>([]);
  const [filterProfiles, setFilterProfiles] = useState<FilterProfile[]>([]);
  const [beans, setBeans] = useState<Bean[]>([]);
  const [grindProfiles, setGrindProfiles] = useState<GrindProfile[]>([]);
  const [aidenProfiles, setAidenProfiles] = useState<AidenProfile[]>([]);

  const [waterProfileId, setWaterProfileId] = useState<string>("");
  const [filterProfileId, setFilterProfileId] = useState<string>("");
  const [beanId, setBeanId] = useState<string>("");
  const [grindProfileId, setGrindProfileId] = useState<string>("");
  const [aidenProfileId, setAidenProfileId] = useState<string>("");
  const [roastedOn, setRoastedOn] = useState("");
  const [openedOn, setOpenedOn] = useState("");
  const [brewIssues, setBrewIssues] = useState<string[]>([]);
  const [issueOptions, setIssueOptions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/options?category=brewIssue").then((r) => r.json()).then((data) => {
      if (Array.isArray(data)) setIssueOptions(data.map((o: { value: string }) => o.value));
    });
    Promise.all([
      fetch(`/api/brews/${id}`).then((r) => r.json()),
      fetch("/api/profiles/water").then((r) => r.json()),
      fetch("/api/profiles/filter").then((r) => r.json()),
      fetch("/api/beans").then((r) => r.json()),
      fetch("/api/profiles/grind").then((r) => r.json()),
      fetch("/api/profiles/aiden").then((r) => r.json()),
    ]).then(([brew, water, filter, beansData, grind, aiden]) => {
      setWaterProfileId(brew.waterProfileId ?? "");
      setFilterProfileId(brew.filterProfileId ?? "");
      setBeanId(brew.beanId);
      setGrindProfileId(brew.grindProfileId);
      setAidenProfileId(brew.aidenProfileId);
      if (brew.roastedOn) setRoastedOn(brew.roastedOn.split("T")[0]);
      if (brew.openedOn) setOpenedOn(brew.openedOn.split("T")[0]);
      if (Array.isArray(brew.brewIssues)) setBrewIssues(brew.brewIssues);
      setWaterProfiles(Array.isArray(water) ? water : []);
      setFilterProfiles(Array.isArray(filter) ? filter : []);
      setBeans(Array.isArray(beansData) ? beansData : []);
      setGrindProfiles(Array.isArray(grind) ? grind : []);
      setAidenProfiles(Array.isArray(aiden) ? aiden : []);
      setLoading(false);
    });
  }, [id]);

  async function save() {
    setSaving(true);
    await fetch(`/api/brews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        beanId,
        waterProfileId: waterProfileId || undefined,
        filterProfileId: filterProfileId || undefined,
        grindProfileId,
        aidenProfileId,
        roastedOn: roastedOn || null,
        openedOn: openedOn || null,
        brewIssues,
      }),
    });
    router.push(`/brew/${id}`);
  }

  if (loading) return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center text-stone-500">Loading...</div>
  );

  return (
    <div className="min-h-screen bg-stone-950 px-4 pt-6 pb-10 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-stone-400 hover:text-stone-200 text-2xl leading-none">‹</button>
        <h1 className="text-xl font-bold text-stone-100">Edit Brew</h1>
      </div>

      <div className="space-y-5">
        {/* Water */}
        <div>
          <label className="text-stone-400 text-xs font-semibold uppercase tracking-wide mb-2 block">Water</label>
          <div className="space-y-2">
            {waterProfiles.map((w) => (
              <button key={w.id} onClick={() => setWaterProfileId(w.id)}
                className={`w-full text-left rounded-xl p-3 border transition-colors ${waterProfileId === w.id ? "border-amber-500 bg-stone-900" : "border-stone-800 bg-stone-900 hover:border-stone-600"}`}>
                <p className="text-stone-100 text-sm font-medium">{w.brand}</p>
                {w.additives && <p className="text-stone-500 text-xs">{w.additives}</p>}
              </button>
            ))}
          </div>
        </div>

        {/* Filter */}
        {filterProfiles.length > 0 && (
          <div>
            <label className="text-stone-400 text-xs font-semibold uppercase tracking-wide mb-2 block">
              Filter <span className="text-stone-600 normal-case font-normal">(optional)</span>
            </label>
            <div className="space-y-2">
              {filterProfiles.map((f) => (
                <button key={f.id} onClick={() => setFilterProfileId(filterProfileId === f.id ? "" : f.id)}
                  className={`w-full text-left rounded-xl p-3 border transition-colors ${filterProfileId === f.id ? "border-amber-500 bg-stone-900" : "border-stone-800 bg-stone-900 hover:border-stone-600"}`}>
                  <p className="text-stone-100 text-sm font-medium">{f.name}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Beans */}
        <div>
          <label className="text-stone-400 text-xs font-semibold uppercase tracking-wide mb-2 block">Beans</label>
          <div className="space-y-2">
            {beans.map((b) => (
              <button key={b.id} onClick={() => setBeanId(b.id)}
                className={`w-full text-left rounded-xl p-3 border transition-colors ${beanId === b.id ? "border-amber-500 bg-stone-900" : "border-stone-800 bg-stone-900 hover:border-stone-600"}`}>
                <p className="text-stone-100 text-sm font-medium">{b.producer?.name}</p>
                <p className="text-stone-500 text-xs">{b.name} · {b.roastLevel}{b.region ? ` · ${b.region}` : ""}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Grind */}
        <div>
          <label className="text-stone-400 text-xs font-semibold uppercase tracking-wide mb-2 block">Grind Profile</label>
          <div className="space-y-2">
            {grindProfiles.map((g) => (
              <button key={g.id} onClick={() => setGrindProfileId(g.id)}
                className={`w-full text-left rounded-xl p-3 border transition-colors ${grindProfileId === g.id ? "border-amber-500 bg-stone-900" : "border-stone-800 bg-stone-900 hover:border-stone-600"}`}>
                <p className="text-stone-100 text-sm font-medium">{g.name}</p>
                <p className="text-stone-500 text-xs">Setting {g.setting}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Aiden */}
        <div>
          <label className="text-stone-400 text-xs font-semibold uppercase tracking-wide mb-2 block">Aiden Profile</label>
          <div className="space-y-2">
            {aidenProfiles.map((a) => (
              <button key={a.id} onClick={() => setAidenProfileId(a.id)}
                className={`w-full text-left rounded-xl p-3 border transition-colors ${aidenProfileId === a.id ? "border-amber-500 bg-stone-900" : "border-stone-800 bg-stone-900 hover:border-stone-600"}`}>
                <p className="text-stone-100 text-sm font-medium">{a.name}</p>
                <p className="text-stone-500 text-xs">{a.coffeeG}g / {a.waterG}g · {a.tempF}°F</p>
              </button>
            ))}
          </div>
        </div>

        {/* Bean freshness */}
        <div>
          <label className="text-stone-400 text-xs font-semibold uppercase tracking-wide mb-2 block">Bean Freshness <span className="text-stone-600 normal-case font-normal">(optional)</span></label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-stone-500 text-xs block mb-1">Roasted on</label>
              <input type="date" value={roastedOn} onChange={(e) => setRoastedOn(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="text-stone-500 text-xs block mb-1">Bag opened</label>
              <input type="date" value={openedOn} onChange={(e) => setOpenedOn(e.target.value)} className="input-field" />
            </div>
          </div>
        </div>

        {/* Brew Issues */}
        {issueOptions.length > 0 && (
          <div>
            <label className="text-stone-400 text-xs font-semibold uppercase tracking-wide mb-2 block">Brew Issues <span className="text-stone-600 normal-case font-normal">(optional)</span></label>
            <div className="flex flex-wrap gap-1.5">
              {issueOptions.map((issue) => {
                const active = brewIssues.includes(issue);
                return (
                  <button
                    key={issue}
                    onClick={() => setBrewIssues((prev) => active ? prev.filter((i) => i !== issue) : [...prev, issue])}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${active ? "bg-red-900/60 text-red-300 border border-red-700/60" : "bg-stone-800 text-stone-400 border border-stone-700 hover:border-stone-500"}`}
                  >
                    {issue}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <button onClick={save} disabled={saving || !beanId || !grindProfileId || !aidenProfileId}
          className="w-full py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white font-semibold rounded-xl transition-colors">
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </div>
  );
}
