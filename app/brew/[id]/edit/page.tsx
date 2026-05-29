"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { format } from "date-fns";

type WaterProfile = { id: string; brand: string; additives?: string | null };
type FilterProfile = { id: string; name: string };
type Bean = { id: string; producer: { name: string }; name: string; roastLevel: string; region?: string | null };
type GrindProfile = { id: string; name: string; setting: number };
type AidenProfile = { id: string; name: string; coffeeG: number; waterG: number; tempF: number };
type BeanBag = { id: string; roastedOn?: string | null; openedOn?: string | null; weightG?: number | null; notes?: string | null };

export default function EditBrewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [waterProfiles, setWaterProfiles] = useState<WaterProfile[]>([]);
  const [filterProfiles, setFilterProfiles] = useState<FilterProfile[]>([]);
  const [beans, setBeans] = useState<Bean[]>([]);
  const [grindProfiles, setGrindProfiles] = useState<GrindProfile[]>([]);
  const [aidenProfiles, setAidenProfiles] = useState<AidenProfile[]>([]);
  const [beanBags, setBeanBags] = useState<BeanBag[]>([]);

  const [waterProfileId, setWaterProfileId] = useState<string>("");
  const [filterProfileId, setFilterProfileId] = useState<string>("");
  const [beanId, setBeanId] = useState<string>("");
  const [grindProfileId, setGrindProfileId] = useState<string>("");
  const [aidenProfileId, setAidenProfileId] = useState<string>("");
  const [actualCoffeeG, setActualCoffeeG] = useState<string>("");
  const [beanBagId, setBeanBagId] = useState<string>("");
  const [bagBrewIndex, setBagBrewIndex] = useState<string>("");
  const [roastedOn, setRoastedOn] = useState("");
  const [openedOn, setOpenedOn] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
      if (brew.actualCoffeeG != null) setActualCoffeeG(String(brew.actualCoffeeG));
      setBeanBagId(brew.beanBagId ?? "");
      if (brew.bagBrewIndex != null) setBagBrewIndex(String(brew.bagBrewIndex));
      if (brew.roastedOn) setRoastedOn(brew.roastedOn.split("T")[0]);
      if (brew.openedOn) setOpenedOn(brew.openedOn.split("T")[0]);
      setWaterProfiles(Array.isArray(water) ? water : []);
      setFilterProfiles(Array.isArray(filter) ? filter : []);
      setBeans(Array.isArray(beansData) ? beansData : []);
      setGrindProfiles(Array.isArray(grind) ? grind : []);
      setAidenProfiles(Array.isArray(aiden) ? aiden : []);
      // fetch bags for the brew's bean
      return fetch(`/api/bean-bags?beanId=${brew.beanId}`).then((r) => r.json()).then((bags) => {
        setBeanBags(Array.isArray(bags) ? bags : []);
      });
    }).finally(() => setLoading(false));
  }, [id]);

  // reload bags when bean changes
  useEffect(() => {
    if (!beanId) return;
    fetch(`/api/bean-bags?beanId=${beanId}`).then((r) => r.json()).then((bags) => {
      setBeanBags(Array.isArray(bags) ? bags : []);
      // clear bag selection if it doesn't belong to the new bean
      if (beanBagId && !bags.find((b: BeanBag) => b.id === beanBagId)) {
        setBeanBagId("");
        setBagBrewIndex("");
      }
    });
  }, [beanId]); // eslint-disable-line react-hooks/exhaustive-deps

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
        actualCoffeeG: actualCoffeeG !== "" ? parseFloat(actualCoffeeG) : null,
        roastedOn: roastedOn || null,
        openedOn: openedOn || null,
        beanBagId: beanBagId || null,
        bagBrewIndex: beanBagId && bagBrewIndex !== "" ? parseInt(bagBrewIndex) : null,
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
        {filterProfiles.length > 0 && (
          <div>
            <label className="text-stone-400 text-xs font-semibold uppercase tracking-wide mb-2 block">Filter <span className="text-stone-600 normal-case font-normal">(optional)</span></label>
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

        {beanBags.length > 0 && (
          <div>
            <label className="text-stone-400 text-xs font-semibold uppercase tracking-wide mb-2 block">
              Bag <span className="text-stone-600 normal-case font-normal">(optional)</span>
            </label>
            <div className="space-y-2">
              <button
                onClick={() => { setBeanBagId(""); setBagBrewIndex(""); }}
                className={`w-full text-left rounded-xl p-3 border transition-colors ${beanBagId === "" ? "border-amber-500 bg-stone-900" : "border-stone-800 bg-stone-900 hover:border-stone-600"}`}
              >
                <p className="text-stone-400 text-sm">No bag</p>
              </button>
              {beanBags.map((bag) => (
                <button key={bag.id} onClick={() => setBeanBagId(bag.id)}
                  className={`w-full text-left rounded-xl p-3 border transition-colors ${beanBagId === bag.id ? "border-amber-500 bg-stone-900" : "border-stone-800 bg-stone-900 hover:border-stone-600"}`}>
                  <p className="text-stone-100 text-sm font-medium">
                    {bag.roastedOn ? `Roasted ${format(new Date(bag.roastedOn), "MMM d, yyyy")}` : bag.openedOn ? `Opened ${format(new Date(bag.openedOn), "MMM d, yyyy")}` : "Bag"}
                    {bag.weightG ? ` · ${bag.weightG}g` : ""}
                  </p>
                  {bag.notes && <p className="text-stone-500 text-xs">{bag.notes}</p>}
                </button>
              ))}
            </div>
            {beanBagId && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-stone-500 text-sm">#</span>
                <input
                  type="number" min="1" step="1" value={bagBrewIndex}
                  onChange={(e) => setBagBrewIndex(e.target.value)}
                  placeholder="1, 2, 3…"
                  className="bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 text-sm w-24 text-right"
                />
                <span className="text-stone-500 text-sm">brew from this bag</span>
              </div>
            )}
          </div>
        )}

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
        <div>
          <label className="text-stone-400 text-xs font-semibold uppercase tracking-wide mb-2 block">
            Actual coffee used <span className="text-stone-600 normal-case font-normal">(optional)</span>
          </label>
          {(() => {
            const profile = aidenProfiles.find((a) => a.id === aidenProfileId);
            return profile ? (
              <p className="text-stone-600 text-xs mb-2">Profile recommends <span className="text-amber-500">{profile.coffeeG}g</span></p>
            ) : null;
          })()}
          <div className="flex items-center gap-2">
            <input type="number" min="0" step="0.1" value={actualCoffeeG}
              onChange={(e) => setActualCoffeeG(e.target.value)}
              placeholder="g (leave blank to use profile default)"
              className="bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 text-sm w-full text-right" />
            <span className="text-stone-400 text-sm shrink-0">g</span>
          </div>
        </div>
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
        <button onClick={save} disabled={saving || !beanId || !grindProfileId || !aidenProfileId}
          className="w-full py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white font-semibold rounded-xl transition-colors">
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </div>
  );
}
