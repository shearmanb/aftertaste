"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import OdeDial from "@/components/OdeDial";
import { format } from "date-fns";

type Pour = { sequence: number; tempF: number; pauseS: number };
type WaterProfile = { id: string; brand: string; additives?: string | null };
type FilterProfile = { id: string; name: string };
type Bean = { id: string; producer: { name: string }; name: string; roastLevel: string; region?: string | null; process?: string | null };
type GrindProfile = { id: string; name: string; setting: number };
type AidenProfile = { id: string; name: string; coffeeG: number; waterG: number; tempF: number; bloomTimeS: number; bloomWaterG: number; pours: Pour[] };
type SourceBrew = { brewedAt: string; roastedOn?: string | null; openedOn?: string | null; beanBagId?: string | null; bean: Bean; waterProfile?: WaterProfile | null; filterProfile?: FilterProfile | null; grindProfile: GrindProfile; aidenProfile: AidenProfile };
type Producer = { id: string; name: string };
type BeanBag = { id: string; beanId: string; roastedOn?: string | null; openedOn?: string | null; exhaustedOn?: string | null; weightG?: number | null; notes?: string | null; brews?: { id: string }[] };

function NewBrewPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromId = searchParams.get("from");

  const [step, setStep] = useState(1);
  const [waterProfiles, setWaterProfiles] = useState<WaterProfile[]>([]);
  const [filterProfiles, setFilterProfiles] = useState<FilterProfile[]>([]);
  const [beans, setBeans] = useState<Bean[]>([]);
  const [grindProfiles, setGrindProfiles] = useState<GrindProfile[]>([]);
  const [aidenProfiles, setAidenProfiles] = useState<AidenProfile[]>([]);

  const [selectedWater, setSelectedWater] = useState<WaterProfile | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<FilterProfile | null>(null);
  const [selectedBean, setSelectedBean] = useState<Bean | null>(null);
  const [selectedGrind, setSelectedGrind] = useState<GrindProfile | null>(null);
  const [selectedAiden, setSelectedAiden] = useState<AidenProfile | null>(null);
  const [actualCoffeeG, setActualCoffeeG] = useState<string>("");
  const [sourceBrew, setSourceBrew] = useState<SourceBrew | null>(null);
  const [roastedOn, setRoastedOn] = useState("");
  const [openedOn, setOpenedOn] = useState("");
  const [brewedAt, setBrewedAt] = useState(() => new Date().toISOString().slice(0, 16));
  const [submitting, setSubmitting] = useState(false);

  // Bag selection
  const [bags, setBags] = useState<BeanBag[]>([]);
  const [selectedBag, setSelectedBag] = useState<BeanBag | null>(null);
  const [bagBrewIndex, setBagBrewIndex] = useState<string>("");
  const [showNewBagForm, setShowNewBagForm] = useState(false);
  const [newBagRoastedOn, setNewBagRoastedOn] = useState("");
  const [newBagOpenedOn, setNewBagOpenedOn] = useState("");
  const [newBagWeightG, setNewBagWeightG] = useState("");
  const [newBagNotes, setNewBagNotes] = useState("");
  const [savingBag, setSavingBag] = useState(false);

  // Misc variables
  const [miscVarOptions, setMiscVarOptions] = useState<string[]>([]);
  const [selectedMiscVars, setSelectedMiscVars] = useState<string[]>([]);

  // Quick-add bean form
  const [producers, setProducers] = useState<Producer[]>([]);
  const [roastLevels, setRoastLevels] = useState<string[]>([]);
  const [processes, setProcesses] = useState<string[]>([]);
  const [showAddBean, setShowAddBean] = useState(false);
  const [addingBean, setAddingBean] = useState(false);
  const [newProducerId, setNewProducerId] = useState("");
  const [newProducerName, setNewProducerName] = useState("");
  const [newBeanName, setNewBeanName] = useState("");
  const [newRoastLevel, setNewRoastLevel] = useState("");
  const [newRegion, setNewRegion] = useState("");
  const [newProcess, setNewProcess] = useState("");

  // Quick-add water profile
  const [showAddWater, setShowAddWater] = useState(false);
  const [newWaterBrand, setNewWaterBrand] = useState("");
  const [newWaterAdditives, setNewWaterAdditives] = useState("");
  const [savingWater, setSavingWater] = useState(false);

  // Quick-add filter profile
  const [showAddFilter, setShowAddFilter] = useState(false);
  const [newFilterName, setNewFilterName] = useState("");
  const [savingFilter, setSavingFilter] = useState(false);

  // Quick-add grind profile
  const [showAddGrind, setShowAddGrind] = useState(false);
  const [newGrindName, setNewGrindName] = useState("");
  const [newGrindSetting, setNewGrindSetting] = useState("");
  const [savingGrind, setSavingGrind] = useState(false);

  // Quick-add Aiden profile
  const [showAddAiden, setShowAddAiden] = useState(false);
  const [newAidenName, setNewAidenName] = useState("");
  const [newAidenCoffeeG, setNewAidenCoffeeG] = useState("");
  const [newAidenWaterG, setNewAidenWaterG] = useState("");
  const [newAidenTempF, setNewAidenTempF] = useState("");
  const [newAidenBloomTimeS, setNewAidenBloomTimeS] = useState("");
  const [newAidenBloomWaterG, setNewAidenBloomWaterG] = useState("");
  const [newAidenPours, setNewAidenPours] = useState<{ tempF: string; pauseS: string }[]>([{ tempF: "", pauseS: "" }, { tempF: "", pauseS: "" }]);
  const [savingAiden, setSavingAiden] = useState(false);

  useEffect(() => {
    const fetches = [
      fetch("/api/profiles/water").then((r) => r.json()),
      fetch("/api/profiles/filter").then((r) => r.json()),
      fetch("/api/beans").then((r) => r.json()),
      fetch("/api/profiles/grind").then((r) => r.json()),
      fetch("/api/profiles/aiden").then((r) => r.json()),
      fetch("/api/producers").then((r) => r.json()),
      fetch("/api/options?category=roastLevel").then((r) => r.ok ? r.json() : []),
      fetch("/api/options?category=process").then((r) => r.ok ? r.json() : []),
      fetch("/api/options?category=miscVar").then((r) => r.ok ? r.json() : []),
    ];
    const sourcePromise = fromId
      ? fetch(`/api/brews/${fromId}`).then((r) => r.json())
      : Promise.resolve(null);

    Promise.all([...fetches, sourcePromise]).then(([water, filter, beansData, grind, aiden, producersData, roastData, processData, miscVarData, source]) => {
      setWaterProfiles(Array.isArray(water) ? water : []);
      setFilterProfiles(Array.isArray(filter) ? filter : []);
      setBeans(Array.isArray(beansData) ? beansData : []);
      setGrindProfiles(Array.isArray(grind) ? grind : []);
      setAidenProfiles(Array.isArray(aiden) ? aiden : []);
      setProducers(Array.isArray(producersData) ? producersData : []);
      const rl = Array.isArray(roastData) ? roastData.map((o: { value: string }) => o.value) : [];
      setRoastLevels(rl);
      setNewRoastLevel(rl[0] ?? "");
      setProcesses(Array.isArray(processData) ? processData.map((o: { value: string }) => o.value) : []);
      setMiscVarOptions(Array.isArray(miscVarData) ? miscVarData.map((o: { value: string }) => o.value) : []);
      if (source) {
        setSourceBrew(source);
        if (source.waterProfile) setSelectedWater(source.waterProfile);
        if (source.filterProfile) setSelectedFilter(source.filterProfile);
        setSelectedBean(source.bean);
        setSelectedGrind(source.grindProfile);
        setSelectedAiden(source.aidenProfile);
        if (source.roastedOn) setRoastedOn(source.roastedOn.split("T")[0]);
        if (source.openedOn) setOpenedOn(source.openedOn.split("T")[0]);
      }
    });
  }, [fromId]);

  // Load bags when a bean is selected
  useEffect(() => {
    if (!selectedBean) { setBags([]); setSelectedBag(null); return; }
    fetch(`/api/bean-bags?beanId=${selectedBean.id}`)
      .then((r) => r.json())
      .then((data) => {
        const list: BeanBag[] = Array.isArray(data) ? data : [];
        setBags(list);
        // Auto-select the most recent non-exhausted bag from the source brew, or the first active one
        if (fromId && sourceBrew?.beanBagId) {
          const match = list.find((b) => b.id === sourceBrew.beanBagId);
          if (match) { setSelectedBag(match); return; }
        }
        const active = list.find((b) => !b.exhaustedOn);
        if (active) setSelectedBag(active);
      })
      .catch(() => setBags([]));
  }, [selectedBean?.id]);

  // Update freshness dates and default bag position when bag changes
  useEffect(() => {
    if (selectedBag) {
      setRoastedOn(selectedBag.roastedOn ? selectedBag.roastedOn.split("T")[0] : "");
      setOpenedOn(selectedBag.openedOn ? selectedBag.openedOn.split("T")[0] : "");
      setBagBrewIndex(String((selectedBag.brews?.length ?? 0) + 1));
    }
  }, [selectedBag?.id]);

  // Fall back to last brew dates when no bag and not branching
  useEffect(() => {
    if (!selectedBean || fromId || selectedBag) return;
    fetch(`/api/brews?beanId=${selectedBean.id}&limit=1`)
      .then((r) => r.json())
      .then((brews) => {
        if (Array.isArray(brews) && brews.length > 0) {
          if (brews[0].roastedOn) setRoastedOn(brews[0].roastedOn.split("T")[0]);
          if (brews[0].openedOn) setOpenedOn(brews[0].openedOn.split("T")[0]);
        }
      });
  }, [selectedBean?.id, fromId]);

  async function createAndSelectBag() {
    if (!selectedBean) return;
    setSavingBag(true);
    try {
      const res = await fetch("/api/bean-bags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          beanId: selectedBean.id,
          roastedOn: newBagRoastedOn || undefined,
          openedOn: newBagOpenedOn || undefined,
          weightG: newBagWeightG ? parseFloat(newBagWeightG) : undefined,
          notes: newBagNotes || undefined,
        }),
      });
      const bag = await res.json();
      if (!res.ok) throw new Error(bag.error ?? `HTTP ${res.status}`);
      setBags((prev) => [bag, ...prev]);
      setSelectedBag(bag);
      setShowNewBagForm(false);
      setNewBagRoastedOn(""); setNewBagOpenedOn(""); setNewBagWeightG(""); setNewBagNotes("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create bag");
    } finally {
      setSavingBag(false);
    }
  }

  async function submit() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/brews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          beanId: selectedBag ? undefined : selectedBean!.id,
          beanBagId: selectedBag?.id,
          bagBrewIndex: selectedBag && bagBrewIndex !== "" ? parseInt(bagBrewIndex) : undefined,
          waterProfileId: selectedWater?.id,
          filterProfileId: selectedFilter?.id,
          grindProfileId: selectedGrind!.id,
          aidenProfileId: selectedAiden!.id,
          actualCoffeeG: actualCoffeeG !== "" ? parseFloat(actualCoffeeG) : undefined,
          roastedOn: !selectedBag && roastedOn ? roastedOn : undefined,
          openedOn: !selectedBag && openedOn ? openedOn : undefined,
          miscVars: selectedMiscVars,
          brewedAt,
        }),
      });
      const brew = await res.json();
      if (!res.ok) throw new Error(brew.error ?? `HTTP ${res.status}`);
      router.push(`/brew/${brew.id}/taste`);
    } catch (err) {
      alert(err instanceof Error ? `Save failed: ${err.message}` : "Save failed");
      setSubmitting(false);
    }
  }

  async function addBean() {
    if (!newBeanName.trim() || !newRoastLevel) return;
    setAddingBean(true);
    try {
      let producerId = newProducerId;
      if (!producerId) {
        if (!newProducerName.trim()) { setAddingBean(false); return; }
        const pr = await fetch("/api/producers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newProducerName.trim() }),
        });
        const newProd = await pr.json();
        if (!pr.ok) throw new Error(newProd.error ?? "Failed to create producer");
        setProducers((p) => [...p, newProd]);
        producerId = newProd.id;
      }
      const br = await fetch("/api/beans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          producerId,
          name: newBeanName.trim(),
          roastLevel: newRoastLevel,
          region: newRegion.trim() || undefined,
          process: newProcess || undefined,
        }),
      });
      const newBean = await br.json();
      if (!br.ok) throw new Error(newBean.error ?? "Failed to create bean");
      setBeans((b) => [newBean, ...b]);
      setSelectedBean(newBean);
      setShowAddBean(false);
      setNewProducerId(""); setNewProducerName(""); setNewBeanName("");
      setNewRegion(""); setNewProcess("");
      setStep(4);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setAddingBean(false);
    }
  }

  async function createWater() {
    if (!newWaterBrand.trim()) return;
    setSavingWater(true);
    try {
      const res = await fetch("/api/profiles/water", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand: newWaterBrand.trim(), additives: newWaterAdditives.trim() || undefined }),
      });
      const profile = await res.json();
      if (!res.ok) throw new Error(profile.error ?? `HTTP ${res.status}`);
      setWaterProfiles((p) => [...p, profile]);
      setSelectedWater(profile);
      setShowAddWater(false);
      setNewWaterBrand(""); setNewWaterAdditives("");
      setStep(2);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create water profile");
    } finally {
      setSavingWater(false);
    }
  }

  async function createFilter() {
    if (!newFilterName.trim()) return;
    setSavingFilter(true);
    try {
      const res = await fetch("/api/profiles/filter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newFilterName.trim() }),
      });
      const profile = await res.json();
      if (!res.ok) throw new Error(profile.error ?? `HTTP ${res.status}`);
      setFilterProfiles((p) => [...p, profile]);
      setSelectedFilter(profile);
      setShowAddFilter(false);
      setNewFilterName("");
      setStep(3);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create filter profile");
    } finally {
      setSavingFilter(false);
    }
  }

  async function createGrind() {
    if (!newGrindName.trim() || !newGrindSetting) return;
    setSavingGrind(true);
    try {
      const res = await fetch("/api/profiles/grind", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newGrindName.trim(), setting: parseFloat(newGrindSetting) }),
      });
      const profile = await res.json();
      if (!res.ok) throw new Error(profile.error ?? `HTTP ${res.status}`);
      setGrindProfiles((p) => [...p, profile].sort((a, b) => a.setting - b.setting));
      setSelectedGrind(profile);
      setShowAddGrind(false);
      setNewGrindName(""); setNewGrindSetting("");
      setStep(5);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create grind profile");
    } finally {
      setSavingGrind(false);
    }
  }

  async function createAiden() {
    const name = newAidenName.trim();
    const coffeeG = parseFloat(newAidenCoffeeG);
    const waterG = parseFloat(newAidenWaterG);
    const tempF = parseInt(newAidenTempF);
    const bloomTimeS = parseInt(newAidenBloomTimeS);
    const bloomWaterG = parseFloat(newAidenBloomWaterG);
    if (!name || isNaN(coffeeG) || isNaN(waterG) || isNaN(tempF) || isNaN(bloomTimeS) || isNaN(bloomWaterG)) return;
    const pours = newAidenPours
      .filter((p) => p.tempF !== "")
      .map((p, i) => ({ sequence: i + 1, tempF: parseInt(p.tempF) || tempF, pauseS: parseInt(p.pauseS) || 0 }));
    setSavingAiden(true);
    try {
      const res = await fetch("/api/profiles/aiden", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, coffeeG, waterG, tempF, bloomTimeS, bloomWaterG, pours }),
      });
      const profile = await res.json();
      if (!res.ok) throw new Error(profile.error ?? `HTTP ${res.status}`);
      setAidenProfiles((p) => [...p, profile].sort((a, b) => a.name.localeCompare(b.name)));
      setSelectedAiden(profile);
      setActualCoffeeG(String(profile.coffeeG));
      setShowAddAiden(false);
      setNewAidenName(""); setNewAidenCoffeeG(""); setNewAidenWaterG(""); setNewAidenTempF("");
      setNewAidenBloomTimeS(""); setNewAidenBloomWaterG("");
      setNewAidenPours([{ tempF: "", pauseS: "" }, { tempF: "", pauseS: "" }]);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create Aiden profile");
    } finally {
      setSavingAiden(false);
    }
  }

  const totalSteps = 5;

  return (
    <div className="min-h-screen bg-stone-950 px-4 pt-6 pb-10 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => step > 1 ? setStep(s => s - 1) : router.back()}
          className="text-stone-400 hover:text-stone-200 text-2xl leading-none"
        >
          ‹
        </button>
        <h1 className="text-xl font-bold text-stone-100">
          {fromId ? "Branch Brew" : "New Brew"}
        </h1>
        <div className="ml-auto flex gap-1.5">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full ${step > i ? "bg-amber-500" : "bg-stone-700"}`} />
          ))}
        </div>
      </div>

      {sourceBrew && (
        <div className="bg-amber-950/40 border border-amber-800/40 rounded-xl px-4 py-2.5 mb-5 flex items-center gap-2">
          <span className="text-amber-500 text-sm">④</span>
          <p className="text-amber-300/80 text-xs">
            Branching from <span className="font-medium text-amber-300">{sourceBrew.bean.producer.name} — {sourceBrew.bean.name}</span>
            <span className="text-amber-500/60"> · {format(new Date(sourceBrew.brewedAt), "MMM d, yyyy")}</span>
          </p>
        </div>
      )}

      {step === 1 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-stone-400 text-sm font-medium">Select water</p>
            <button onClick={() => setShowAddWater((v) => !v)} className="text-amber-500 hover:text-amber-400 text-sm font-medium">
              {showAddWater ? "Cancel" : "+ New"}
            </button>
          </div>
          {showAddWater && (
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 mb-4 space-y-3">
              <p className="text-stone-400 text-xs font-semibold uppercase tracking-wide">New water profile</p>
              <div>
                <label className="text-stone-500 text-xs block mb-1">Brand / source *</label>
                <input type="text" placeholder="e.g. Third Wave Water" value={newWaterBrand}
                  onChange={(e) => setNewWaterBrand(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="text-stone-500 text-xs block mb-1">Additives <span className="text-stone-700">(optional)</span></label>
                <input type="text" placeholder="e.g. Classic Light Roast mineral packet" value={newWaterAdditives}
                  onChange={(e) => setNewWaterAdditives(e.target.value)} className="input-field" />
              </div>
              <button onClick={createWater} disabled={savingWater || !newWaterBrand.trim()}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white font-semibold rounded-xl transition-colors text-sm">
                {savingWater ? "Saving…" : "Create & select →"}
              </button>
            </div>
          )}
          {!showAddWater && waterProfiles.length === 0 ? (
            <div className="text-center py-10 text-stone-500">
              <p className="text-3xl mb-2">≈</p>
              <p>No water profiles yet — use "+ New" to add one.</p>
            </div>
          ) : !showAddWater && (
            <div className="space-y-2">
              {waterProfiles.map((w) => (
                <button key={w.id} onClick={() => { setSelectedWater(w); setStep(2); }}
                  className={`w-full text-left rounded-xl p-4 border transition-colors ${
                    selectedWater?.id === w.id ? "border-amber-500 bg-stone-900" : "bg-stone-900 border-stone-800 hover:border-amber-600"
                  }`}>
                  <p className="font-semibold text-stone-100">{w.brand}</p>
                  {w.additives && <p className="text-stone-400 text-sm">{w.additives}</p>}
                  {selectedWater?.id === w.id && <p className="text-amber-500 text-xs mt-1">Selected ✓</p>}
                </button>
              ))}
            </div>
          )}
          {selectedWater && !showAddWater && (
            <button onClick={() => setStep(2)} className="w-full mt-4 py-3 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl transition-colors">Next →</button>
          )}
        </div>
      )}

      {step === 2 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-stone-400 text-sm font-medium">Select filter <span className="text-stone-600 font-normal">(optional)</span></p>
            <button onClick={() => setShowAddFilter((v) => !v)} className="text-amber-500 hover:text-amber-400 text-sm font-medium">
              {showAddFilter ? "Cancel" : "+ New"}
            </button>
          </div>
          {showAddFilter && (
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 mb-4 space-y-3">
              <p className="text-stone-400 text-xs font-semibold uppercase tracking-wide">New filter profile</p>
              <div>
                <label className="text-stone-500 text-xs block mb-1">Filter name *</label>
                <input type="text" placeholder="e.g. Sibarist Flat" value={newFilterName}
                  onChange={(e) => setNewFilterName(e.target.value)} className="input-field" />
              </div>
              <button onClick={createFilter} disabled={savingFilter || !newFilterName.trim()}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white font-semibold rounded-xl transition-colors text-sm">
                {savingFilter ? "Saving…" : "Create & select →"}
              </button>
            </div>
          )}
          {!showAddFilter && (
            <div className="space-y-2">
              {filterProfiles.map((f) => (
                <button key={f.id} onClick={() => { setSelectedFilter(f); setStep(3); }}
                  className={`w-full text-left rounded-xl p-4 border transition-colors ${
                    selectedFilter?.id === f.id ? "border-amber-500 bg-stone-900" : "bg-stone-900 border-stone-800 hover:border-amber-600"
                  }`}>
                  <p className="font-semibold text-stone-100">{f.name}</p>
                  {selectedFilter?.id === f.id && <p className="text-amber-500 text-xs mt-1">Selected ✓</p>}
                </button>
              ))}
              {filterProfiles.length === 0 && (
                <p className="text-center text-stone-600 text-sm py-6">No filters yet — use "+ New" to add one.</p>
              )}
            </div>
          )}
          <button onClick={() => { setSelectedFilter(null); setStep(3); }}
            className="w-full mt-4 py-3 bg-stone-800 hover:bg-stone-700 text-stone-400 font-medium rounded-xl transition-colors">
            Skip (no filter)
          </button>
          {selectedFilter && !showAddFilter && (
            <button onClick={() => setStep(3)} className="w-full mt-2 py-3 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl transition-colors">Next →</button>
          )}
        </div>
      )}

      {step === 3 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-stone-400 text-sm font-medium">Select beans</p>
            <button onClick={() => setShowAddBean((v) => !v)}
              className="text-amber-500 hover:text-amber-400 text-sm font-medium">
              {showAddBean ? "Cancel" : "+ New bean"}
            </button>
          </div>

          {showAddBean && (
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 mb-4 space-y-3">
              <p className="text-stone-400 text-xs font-semibold uppercase tracking-wide">Quick add bean</p>

              <div>
                <label className="text-stone-500 text-xs block mb-1">Producer</label>
                <select value={newProducerId} onChange={(e) => { setNewProducerId(e.target.value); setNewProducerName(""); }}
                  className="input-field">
                  <option value="">+ New producer…</option>
                  {producers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                {!newProducerId && (
                  <input type="text" placeholder="Producer name" value={newProducerName}
                    onChange={(e) => setNewProducerName(e.target.value)}
                    className="input-field mt-2" />
                )}
              </div>

              <div>
                <label className="text-stone-500 text-xs block mb-1">Name / blend</label>
                <input type="text" placeholder="e.g. Yirgacheffe Natural" value={newBeanName}
                  onChange={(e) => setNewBeanName(e.target.value)}
                  className="input-field" />
              </div>

              <div>
                <label className="text-stone-500 text-xs block mb-1">Roast level</label>
                <select value={newRoastLevel} onChange={(e) => setNewRoastLevel(e.target.value)} className="input-field">
                  {roastLevels.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div>
                <label className="text-stone-500 text-xs block mb-1">Region <span className="text-stone-700">(optional)</span></label>
                <input type="text" placeholder="e.g. Yirgacheffe" value={newRegion}
                  onChange={(e) => setNewRegion(e.target.value)}
                  className="input-field" />
              </div>

              <div>
                <label className="text-stone-500 text-xs block mb-1">Process <span className="text-stone-700">(optional)</span></label>
                <select value={newProcess} onChange={(e) => setNewProcess(e.target.value)} className="input-field">
                  <option value="">—</option>
                  {processes.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <button onClick={addBean} disabled={addingBean || !newBeanName.trim() || !newRoastLevel || (!newProducerId && !newProducerName.trim())}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white font-semibold rounded-xl transition-colors text-sm">
                {addingBean ? "Saving…" : "Add & select →"}
              </button>
            </div>
          )}

          {!showAddBean && beans.length === 0 ? (
            <div className="text-center py-10 text-stone-500">
              <p>No beans yet.</p>
              <p className="text-xs mt-1">Use "+ New bean" above to add one.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {beans.map((bean) => (
                <button key={bean.id} onClick={() => { setSelectedBean(bean); setSelectedBag(null); }}
                  className={`w-full text-left rounded-xl p-4 border transition-colors ${
                    selectedBean?.id === bean.id ? "border-amber-500 bg-stone-900" : "bg-stone-900 border-stone-800 hover:border-amber-600"
                  }`}>
                  <p className="font-semibold text-stone-100">{bean.producer?.name}</p>
                  <p className="text-stone-400 text-sm">{bean.name} · {bean.roastLevel}{bean.region ? ` · ${bean.region}` : ""}{bean.process ? ` · ${bean.process}` : ""}</p>
                  {selectedBean?.id === bean.id && <p className="text-amber-500 text-xs mt-1">Selected ✓</p>}
                </button>
              ))}
            </div>
          )}

          {/* Bag picker — shown after a bean is selected */}
          {selectedBean && !showAddBean && (
            <div className="mt-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-stone-400 text-sm font-medium">Which bag?</p>
                <button
                  onClick={() => { setShowNewBagForm((v) => !v); setSelectedBag(null); }}
                  className="text-amber-500 hover:text-amber-400 text-xs font-medium"
                >
                  {showNewBagForm ? "Cancel" : "+ New bag"}
                </button>
              </div>

              {showNewBagForm && (
                <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 mb-3 space-y-3">
                  <p className="text-stone-400 text-xs font-semibold uppercase tracking-wide">New bag</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-stone-500 text-xs block mb-1">Roasted on</label>
                      <input type="date" value={newBagRoastedOn} onChange={(e) => setNewBagRoastedOn(e.target.value)} className="input-field" />
                    </div>
                    <div>
                      <label className="text-stone-500 text-xs block mb-1">Opened</label>
                      <input type="date" value={newBagOpenedOn} onChange={(e) => setNewBagOpenedOn(e.target.value)} className="input-field" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-stone-500 text-xs block mb-1">Bag size <span className="text-stone-700">(g, optional)</span></label>
                      <input type="number" min="0" step="1" value={newBagWeightG} onChange={(e) => setNewBagWeightG(e.target.value)} placeholder="e.g. 250" className="input-field" />
                    </div>
                    <div>
                      <label className="text-stone-500 text-xs block mb-1">Notes <span className="text-stone-700">(optional)</span></label>
                      <input type="text" value={newBagNotes} onChange={(e) => setNewBagNotes(e.target.value)} className="input-field" />
                    </div>
                  </div>
                  <button onClick={createAndSelectBag} disabled={savingBag}
                    className="w-full py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white font-semibold rounded-xl transition-colors text-sm">
                    {savingBag ? "Saving…" : "Create bag & select →"}
                  </button>
                </div>
              )}

              {!showNewBagForm && bags.length > 0 && (
                <div className="space-y-2 mb-2">
                  {bags.map((bag) => {
                    const isActive = !bag.exhaustedOn;
                    return (
                      <button key={bag.id} onClick={() => setSelectedBag(selectedBag?.id === bag.id ? null : bag)}
                        className={`w-full text-left rounded-xl p-3 border transition-colors ${
                          selectedBag?.id === bag.id
                            ? "border-amber-500 bg-stone-900"
                            : isActive
                            ? "bg-stone-900 border-stone-700 hover:border-amber-600"
                            : "bg-stone-900/50 border-stone-800 opacity-60"
                        }`}>
                        <div className="flex items-center justify-between">
                          <div>
                            {bag.roastedOn && (
                              <p className="text-stone-300 text-sm">Roasted {format(new Date(bag.roastedOn), "MMM d, yyyy")}</p>
                            )}
                            {bag.openedOn && (
                              <p className="text-stone-500 text-xs">Opened {format(new Date(bag.openedOn), "MMM d, yyyy")}</p>
                            )}
                            {!bag.roastedOn && !bag.openedOn && (
                              <p className="text-stone-500 text-xs">Bag (no dates recorded)</p>
                            )}
                          </div>
                          <div className="text-right">
                            {isActive
                              ? <span className="text-green-500 text-xs">Active</span>
                              : <span className="text-stone-600 text-xs">Exhausted</span>
                            }
                            {selectedBag?.id === bag.id && <p className="text-amber-500 text-xs">Selected ✓</p>}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {!showNewBagForm && bags.length === 0 && (
                <p className="text-stone-600 text-xs mb-2">No bags on record for this bean — create one above, or skip.</p>
              )}

              <button
                onClick={() => setSelectedBag(null)}
                className={`w-full py-2 text-xs rounded-xl border transition-colors ${
                  !selectedBag
                    ? "border-stone-600 bg-stone-800 text-stone-300"
                    : "border-stone-800 bg-stone-900 text-stone-600 hover:text-stone-400"
                }`}
              >
                No bag / skip
              </button>

              {selectedBag && (
                <div className="mt-3">
                  <label className="text-stone-500 text-xs block mb-1">Which brew from this bag?</label>
                  <div className="flex items-center gap-2">
                    <span className="text-stone-500 text-sm">#</span>
                    <input type="number" min="1" step="1" value={bagBrewIndex}
                      onChange={(e) => setBagBrewIndex(e.target.value)}
                      className="input-field w-24" />
                    <span className="text-stone-600 text-xs">1st, 2nd, 3rd… brew pulled from the bag</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedBean && !showAddBean && (
            <button onClick={() => setStep(4)} className="w-full mt-4 py-3 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl transition-colors">Next →</button>
          )}
        </div>
      )}

      {step === 4 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-stone-400 text-sm font-medium">Select grind profile</p>
            <button onClick={() => setShowAddGrind((v) => !v)} className="text-amber-500 hover:text-amber-400 text-sm font-medium">
              {showAddGrind ? "Cancel" : "+ New"}
            </button>
          </div>
          {showAddGrind && (
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 mb-4 space-y-3">
              <p className="text-stone-400 text-xs font-semibold uppercase tracking-wide">New grind profile</p>
              <div>
                <label className="text-stone-500 text-xs block mb-1">Profile name *</label>
                <input type="text" placeholder="e.g. Pourovers Light" value={newGrindName}
                  onChange={(e) => setNewGrindName(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="text-stone-500 text-xs block mb-1">Setting (Ode Gen 2) *</label>
                <input type="number" min="0" max="11" step="0.5" placeholder="e.g. 3.5" value={newGrindSetting}
                  onChange={(e) => setNewGrindSetting(e.target.value)} className="input-field" />
              </div>
              {newGrindSetting && !isNaN(parseFloat(newGrindSetting)) && (
                <div className="bg-stone-900 border border-stone-700 rounded-xl p-3">
                  <OdeDial setting={parseFloat(newGrindSetting)} />
                  <p className="text-stone-400 text-xs text-center mt-2">Setting <span className="text-amber-400 font-bold">{newGrindSetting}</span></p>
                </div>
              )}
              <button onClick={createGrind} disabled={savingGrind || !newGrindName.trim() || !newGrindSetting}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white font-semibold rounded-xl transition-colors text-sm">
                {savingGrind ? "Saving…" : "Create & select →"}
              </button>
            </div>
          )}
          {!showAddGrind && (
            <div className="space-y-2 mb-4">
              {grindProfiles.map((gp) => (
                <button key={gp.id} onClick={() => setSelectedGrind(gp)}
                  className={`w-full text-left bg-stone-900 border rounded-xl p-4 transition-colors ${
                    selectedGrind?.id === gp.id ? "border-amber-500" : "border-stone-800 hover:border-amber-700"
                  }`}>
                  <p className="font-semibold text-stone-100">{gp.name}</p>
                  <p className="text-stone-400 text-sm">Setting {gp.setting}</p>
                  {selectedGrind?.id === gp.id && <p className="text-amber-500 text-xs mt-1">Selected ✓</p>}
                </button>
              ))}
              {grindProfiles.length === 0 && (
                <p className="text-center text-stone-600 text-sm py-6">No grind profiles yet — use "+ New" to add one.</p>
              )}
            </div>
          )}
          {selectedGrind && !showAddGrind && (
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 mb-4">
              <p className="text-stone-500 text-xs font-semibold uppercase tracking-wide mb-3 text-center">Dial Confirmation</p>
              <OdeDial setting={selectedGrind.setting} />
              <p className="text-stone-400 text-sm text-center mt-2">Set Fellow Ode Gen 2 to <span className="text-amber-400 font-bold">{selectedGrind.setting}</span></p>
            </div>
          )}
          <button disabled={!selectedGrind} onClick={() => setStep(5)}
            className="w-full py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white font-semibold rounded-xl transition-colors">
            Next →
          </button>
        </div>
      )}

      {step === 5 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-stone-400 text-sm font-medium">Select Aiden profile</p>
            <button onClick={() => setShowAddAiden((v) => !v)} className="text-amber-500 hover:text-amber-400 text-sm font-medium">
              {showAddAiden ? "Cancel" : "+ New"}
            </button>
          </div>
          {showAddAiden && (
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 mb-4 space-y-3">
              <p className="text-stone-400 text-xs font-semibold uppercase tracking-wide">New Aiden profile</p>
              <div>
                <label className="text-stone-500 text-xs block mb-1">Profile name *</label>
                <input type="text" placeholder="e.g. Light Roast 1:16" value={newAidenName}
                  onChange={(e) => setNewAidenName(e.target.value)} className="input-field" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-stone-500 text-xs block mb-1">Coffee (g) *</label>
                  <input type="number" min="0" step="0.1" placeholder="20" value={newAidenCoffeeG}
                    onChange={(e) => setNewAidenCoffeeG(e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="text-stone-500 text-xs block mb-1">Water (g) *</label>
                  <input type="number" min="0" step="1" placeholder="320" value={newAidenWaterG}
                    onChange={(e) => setNewAidenWaterG(e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="text-stone-500 text-xs block mb-1">Temp (°F) *</label>
                  <input type="number" min="150" max="215" step="1" placeholder="205" value={newAidenTempF}
                    onChange={(e) => setNewAidenTempF(e.target.value)} className="input-field" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-stone-500 text-xs block mb-1">Bloom water (g) *</label>
                  <input type="number" min="0" step="1" placeholder="60" value={newAidenBloomWaterG}
                    onChange={(e) => setNewAidenBloomWaterG(e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="text-stone-500 text-xs block mb-1">Bloom time (s) *</label>
                  <input type="number" min="0" step="1" placeholder="45" value={newAidenBloomTimeS}
                    onChange={(e) => setNewAidenBloomTimeS(e.target.value)} className="input-field" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-stone-500 text-xs">Pulses (temp + pause after)</label>
                  <button type="button"
                    onClick={() => setNewAidenPours((p) => [...p, { tempF: newAidenTempF, pauseS: "" }])}
                    className="text-amber-500 hover:text-amber-400 text-xs">+ Add pulse</button>
                </div>
                <div className="space-y-2">
                  {newAidenPours.map((pour, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-stone-600 text-xs w-12 shrink-0">Pulse {i + 1}</span>
                      <input type="number" min="150" max="215" step="1" placeholder={newAidenTempF || "°F"}
                        value={pour.tempF} onChange={(e) => setNewAidenPours((p) => p.map((x, j) => j === i ? { ...x, tempF: e.target.value } : x))}
                        className="input-field flex-1" />
                      <span className="text-stone-600 text-xs shrink-0">°F +</span>
                      <input type="number" min="0" step="1" placeholder="0s"
                        value={pour.pauseS} onChange={(e) => setNewAidenPours((p) => p.map((x, j) => j === i ? { ...x, pauseS: e.target.value } : x))}
                        className="input-field w-16" />
                      <span className="text-stone-600 text-xs shrink-0">s</span>
                      {newAidenPours.length > 1 && (
                        <button type="button" onClick={() => setNewAidenPours((p) => p.filter((_, j) => j !== i))}
                          className="text-stone-700 hover:text-red-400 text-xs shrink-0">×</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={createAiden} disabled={savingAiden || !newAidenName.trim() || !newAidenCoffeeG || !newAidenWaterG || !newAidenTempF || !newAidenBloomTimeS || !newAidenBloomWaterG}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white font-semibold rounded-xl transition-colors text-sm">
                {savingAiden ? "Saving…" : "Create & select →"}
              </button>
            </div>
          )}
          {!showAddAiden && (
            <div className="space-y-2 mb-4">
              {aidenProfiles.map((ap) => (
                <button key={ap.id} onClick={() => { setSelectedAiden(ap); setActualCoffeeG(String(ap.coffeeG)); }}
                  className={`w-full text-left bg-stone-900 border rounded-xl p-4 transition-colors ${
                    selectedAiden?.id === ap.id ? "border-amber-500" : "border-stone-800 hover:border-amber-700"
                  }`}>
                  <p className="font-semibold text-stone-100">{ap.name}</p>
                  <p className="text-stone-400 text-sm">{ap.coffeeG}g / {ap.waterG}g · {ap.tempF}°F
                    <span className="ml-1 text-stone-600">(ratio {(ap.waterG / ap.coffeeG).toFixed(1)}:1)</span>
                  </p>
                  {selectedAiden?.id === ap.id && <p className="text-amber-500 text-xs mt-1">Selected ✓</p>}
                </button>
              ))}
              {aidenProfiles.length === 0 && (
                <p className="text-center text-stone-600 text-sm py-6">No Aiden profiles yet — use "+ New" to add one.</p>
              )}
            </div>
          )}
          {selectedAiden && !showAddAiden && (
            <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden mb-4">
              <p className="text-stone-500 text-xs font-semibold uppercase tracking-wide px-4 pt-4 pb-2">Aiden Settings</p>
              <div className="grid grid-cols-3 divide-x divide-stone-800 border-y border-stone-800">
                <div className="p-3 text-center"><p className="text-stone-500 text-xs mb-0.5">Coffee</p><p className="text-amber-400 font-bold">{selectedAiden.coffeeG}g</p></div>
                <div className="p-3 text-center"><p className="text-stone-500 text-xs mb-0.5">Water</p><p className="text-amber-400 font-bold">{selectedAiden.waterG}g</p></div>
                <div className="p-3 text-center"><p className="text-stone-500 text-xs mb-0.5">Temp</p><p className="text-amber-400 font-bold">{selectedAiden.tempF}°F</p></div>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-stone-500 text-xs w-14 shrink-0">Bloom</span>
                  <div className="flex-1 bg-stone-800 rounded-full h-5 overflow-hidden">
                    <div className="h-full bg-teal-700 rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${Math.min(100, (selectedAiden.bloomWaterG / selectedAiden.waterG) * 100)}%` }}>
                      <span className="text-white text-xs">{selectedAiden.bloomWaterG}g</span>
                    </div>
                  </div>
                  <span className="text-stone-400 text-xs w-10 text-right">{selectedAiden.bloomTimeS}s</span>
                </div>
                {Array.isArray(selectedAiden.pours) && selectedAiden.pours.map((pour) => (
                  <div key={pour.sequence} className="flex items-center justify-between">
                    <span className="text-stone-500 text-xs w-14 shrink-0">Pulse {pour.sequence}</span>
                    <div className="text-right">
                      <span className="text-amber-400 text-sm font-semibold">{pour.tempF}°F</span>
                      {pour.pauseS != null && <span className="text-stone-500 text-xs ml-2">+{pour.pauseS}s</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {selectedAiden && (
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 mb-4">
              <p className="text-stone-400 text-xs font-semibold uppercase tracking-wide mb-1">Actual coffee used</p>
              <p className="text-stone-600 text-xs mb-3">
                Profile recommends <span className="text-amber-500 font-medium">{selectedAiden.coffeeG}g</span>
                {" "}— adjust if you used a different amount
              </p>
              <div className="flex items-center gap-2">
                <input type="number" min="0" step="0.1" value={actualCoffeeG}
                  onChange={(e) => setActualCoffeeG(e.target.value)}
                  className="bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 text-sm w-28 text-right" />
                <span className="text-stone-400 text-sm">g</span>
              </div>
            </div>
          )}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 mb-4 space-y-1 text-sm">
            <p className="text-stone-400 font-medium mb-2">Brew summary</p>
            {selectedWater && <p className="text-stone-300"><span className="text-stone-500">Water:</span> {selectedWater.brand}{selectedWater.additives ? ` · ${selectedWater.additives}` : ""}</p>}
            {selectedFilter && <p className="text-stone-300"><span className="text-stone-500">Filter:</span> {selectedFilter.name}</p>}
            <p className="text-stone-300"><span className="text-stone-500">Beans:</span> {selectedBean?.producer?.name} — {selectedBean?.name}</p>
            {selectedBag && (
              <p className="text-stone-300">
                <span className="text-stone-500">Bag:</span>{" "}
                {selectedBag.roastedOn ? `Roasted ${format(new Date(selectedBag.roastedOn), "MMM d")}` : "no roast date"}
                {selectedBag.openedOn ? ` · opened ${format(new Date(selectedBag.openedOn), "MMM d")}` : ""}
              </p>
            )}
            <p className="text-stone-300"><span className="text-stone-500">Grind:</span> {selectedGrind?.setting} (Ode Gen 2)</p>
            {selectedAiden && <p className="text-stone-300"><span className="text-stone-500">Profile:</span> {selectedAiden.name}</p>}
          </div>

          {/* Freshness — editable only when no bag is selected */}
          {selectedBag ? (
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 mb-4">
              <p className="text-stone-400 text-xs font-semibold uppercase tracking-wide mb-2">Bean Freshness</p>
              <p className="text-stone-600 text-xs mb-2">Dates sourced from bag record.</p>
              <div className="grid grid-cols-2 gap-3">
                {selectedBag.roastedOn && (
                  <div>
                    <p className="text-stone-500 text-xs mb-0.5">Roasted on</p>
                    <p className="text-stone-300 text-sm">{format(new Date(selectedBag.roastedOn), "MMM d, yyyy")}</p>
                  </div>
                )}
                {selectedBag.openedOn && (
                  <div>
                    <p className="text-stone-500 text-xs mb-0.5">Bag opened</p>
                    <p className="text-stone-300 text-sm">{format(new Date(selectedBag.openedOn), "MMM d, yyyy")}</p>
                  </div>
                )}
              </div>
              {selectedBag.roastedOn && (
                <p className="text-stone-600 text-xs mt-2">{Math.round((Date.now() - new Date(selectedBag.roastedOn).getTime()) / 86400000)} days since roast</p>
              )}
            </div>
          ) : (
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 mb-4">
              <p className="text-stone-400 text-xs font-semibold uppercase tracking-wide mb-3">Bean Freshness <span className="text-stone-600 normal-case font-normal">(optional)</span></p>
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
              {roastedOn && (
                <p className="text-stone-600 text-xs mt-2">{Math.round((Date.now() - new Date(roastedOn).getTime()) / 86400000)} days since roast</p>
              )}
            </div>
          )}

          {/* Misc variables */}
          {(miscVarOptions.length > 0 || true) && (
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 mb-4">
              <p className="text-stone-400 text-xs font-semibold uppercase tracking-wide mb-3">Misc Variables <span className="text-stone-600 normal-case font-normal">(optional)</span></p>
              <div className="flex flex-wrap gap-2">
                {["used lid", ...miscVarOptions].map((v) => {
                  const active = selectedMiscVars.includes(v);
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() =>
                        setSelectedMiscVars((prev) =>
                          active ? prev.filter((x) => x !== v) : [...prev, v]
                        )
                      }
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        active
                          ? "bg-amber-600 border-amber-500 text-white"
                          : "bg-stone-800 border-stone-700 text-stone-400 hover:border-amber-700 hover:text-stone-300"
                      }`}
                    >
                      {v}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 mb-4">
            <label className="text-stone-400 text-xs font-semibold uppercase tracking-wide block mb-2">Brew time</label>
            <input
              type="datetime-local"
              value={brewedAt}
              onChange={(e) => setBrewedAt(e.target.value)}
              className="input-field"
            />
          </div>

          <button disabled={!selectedAiden || submitting} onClick={submit}
            className="w-full py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white font-semibold rounded-xl transition-colors">
            {submitting ? "Logging..." : fromId ? "Branch →" : "Start Brew →"}
          </button>
        </div>
      )}
    </div>
  );
}

export default function NewBrewPage() {
  return (
    <Suspense>
      <NewBrewPageContent />
    </Suspense>
  );
}
