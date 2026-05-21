"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import OdeDial from "@/components/OdeDial";
import { format } from "date-fns";

type Pour = { sequence: number; waterG: number; pauseS: number };
type WaterProfile = { id: string; brand: string; additives?: string | null };
type Bean = { id: string; producer: string; name: string; roastLevel: string; region?: string | null; process?: string | null };
type GrindProfile = { id: string; name: string; setting: number };
type AidenProfile = { id: string; name: string; coffeeG: number; waterG: number; tempF: number; bloomTimeS: number; bloomWaterG: number; pours: Pour[] };
type SourceBrew = { brewedAt: string; bean: Bean; waterProfile?: WaterProfile | null; grindProfile: GrindProfile; aidenProfile: AidenProfile };

export default function NewBrewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromId = searchParams.get("from");

  const [step, setStep] = useState(1);
  const [waterProfiles, setWaterProfiles] = useState<WaterProfile[]>([]);
  const [beans, setBeans] = useState<Bean[]>([]);
  const [grindProfiles, setGrindProfiles] = useState<GrindProfile[]>([]);
  const [aidenProfiles, setAidenProfiles] = useState<AidenProfile[]>([]);

  const [selectedWater, setSelectedWater] = useState<WaterProfile | null>(null);
  const [selectedBean, setSelectedBean] = useState<Bean | null>(null);
  const [selectedGrind, setSelectedGrind] = useState<GrindProfile | null>(null);
  const [selectedAiden, setSelectedAiden] = useState<AidenProfile | null>(null);
  const [sourceBrew, setSourceBrew] = useState<SourceBrew | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetches = [
      fetch("/api/profiles/water").then((r) => r.json()),
      fetch("/api/beans").then((r) => r.json()),
      fetch("/api/profiles/grind").then((r) => r.json()),
      fetch("/api/profiles/aiden").then((r) => r.json()),
    ];
    const sourcePromise = fromId
      ? fetch(`/api/brews/${fromId}`).then((r) => r.json())
      : Promise.resolve(null);

    Promise.all([...fetches, sourcePromise]).then(([water, beansData, grind, aiden, source]) => {
      setWaterProfiles(water);
      setBeans(beansData);
      setGrindProfiles(grind);
      setAidenProfiles(aiden);
      if (source) {
        setSourceBrew(source);
        if (source.waterProfile) setSelectedWater(source.waterProfile);
        setSelectedBean(source.bean);
        setSelectedGrind(source.grindProfile);
        setSelectedAiden(source.aidenProfile);
      }
    });
  }, [fromId]);

  async function submit() {
    setSubmitting(true);
    const res = await fetch("/api/brews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        waterProfileId: selectedWater?.id,
        beanId: selectedBean!.id,
        grindProfileId: selectedGrind!.id,
        aidenProfileId: selectedAiden!.id,
      }),
    });
    const brew = await res.json();
    router.push(`/brew/${brew.id}/taste`);
  }

  const totalSteps = 4;

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

      {/* Branch banner */}
      {sourceBrew && (
        <div className="bg-amber-950/40 border border-amber-800/40 rounded-xl px-4 py-2.5 mb-5 flex items-center gap-2">
          <span className="text-amber-500 text-sm">⑂</span>
          <p className="text-amber-300/80 text-xs">
            Branching from <span className="font-medium text-amber-300">{sourceBrew.bean.producer} — {sourceBrew.bean.name}</span>
            <span className="text-amber-500/60"> · {format(new Date(sourceBrew.brewedAt), "MMM d, yyyy")}</span>
          </p>
        </div>
      )}

      {/* Step 1: Water */}
      {step === 1 && (
        <div>
          <p className="text-stone-400 text-sm mb-4 font-medium">Select water</p>
          {waterProfiles.length === 0 ? (
            <div className="text-center py-10 text-stone-500">
              <p className="text-3xl mb-2">≋</p>
              <p>No water profiles yet.</p>
              <a href="/profiles/water" className="text-amber-500 underline text-sm mt-1 block">Add a water profile first →</a>
            </div>
          ) : (
            <div className="space-y-2">
              {waterProfiles.map((w) => (
                <button
                  key={w.id}
                  onClick={() => { setSelectedWater(w); setStep(2); }}
                  className={`w-full text-left rounded-xl p-4 border transition-colors ${
                    selectedWater?.id === w.id
                      ? "border-amber-500 bg-stone-900"
                      : "bg-stone-900 border-stone-800 hover:border-amber-600"
                  }`}
                >
                  <p className="font-semibold text-stone-100">{w.brand}</p>
                  {w.additives && <p className="text-stone-400 text-sm">{w.additives}</p>}
                  {selectedWater?.id === w.id && <p className="text-amber-500 text-xs mt-1">Selected ✓</p>}
                </button>
              ))}
            </div>
          )}
          {selectedWater && (
            <button onClick={() => setStep(2)} className="w-full mt-4 py-3 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl transition-colors">
              Next →
            </button>
          )}
        </div>
      )}

      {/* Step 2: Beans */}
      {step === 2 && (
        <div>
          <p className="text-stone-400 text-sm mb-4 font-medium">Select beans</p>
          {beans.length === 0 ? (
            <div className="text-center py-10 text-stone-500">
              <p>No beans yet.</p>
              <a href="/beans" className="text-amber-500 underline text-sm mt-1 block">Add beans first →</a>
            </div>
          ) : (
            <div className="space-y-2">
              {beans.map((bean) => (
                <button
                  key={bean.id}
                  onClick={() => { setSelectedBean(bean); setStep(3); }}
                  className={`w-full text-left rounded-xl p-4 border transition-colors ${
                    selectedBean?.id === bean.id
                      ? "border-amber-500 bg-stone-900"
                      : "bg-stone-900 border-stone-800 hover:border-amber-600"
                  }`}
                >
                  <p className="font-semibold text-stone-100">{bean.producer}</p>
                  <p className="text-stone-400 text-sm">
                    {bean.name} · {bean.roastLevel}
                    {bean.region ? ` · ${bean.region}` : ""}
                    {bean.process ? ` · ${bean.process}` : ""}
                  </p>
                  {selectedBean?.id === bean.id && <p className="text-amber-500 text-xs mt-1">Selected ✓</p>}
                </button>
              ))}
            </div>
          )}
          {selectedBean && (
            <button onClick={() => setStep(3)} className="w-full mt-4 py-3 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl transition-colors">
              Next →
            </button>
          )}
        </div>
      )}

      {/* Step 3: Grind */}
      {step === 3 && (
        <div>
          <p className="text-stone-400 text-sm mb-4 font-medium">Select grind profile</p>
          <div className="space-y-2 mb-4">
            {grindProfiles.map((gp) => (
              <button
                key={gp.id}
                onClick={() => setSelectedGrind(gp)}
                className={`w-full text-left bg-stone-900 border rounded-xl p-4 transition-colors ${
                  selectedGrind?.id === gp.id ? "border-amber-500" : "border-stone-800 hover:border-amber-700"
                }`}
              >
                <p className="font-semibold text-stone-100">{gp.name}</p>
                <p className="text-stone-400 text-sm">Setting {gp.setting}</p>
                {selectedGrind?.id === gp.id && <p className="text-amber-500 text-xs mt-1">Selected ✓</p>}
              </button>
            ))}
          </div>

          {selectedGrind && (
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 mb-4">
              <p className="text-stone-500 text-xs font-semibold uppercase tracking-wide mb-3 text-center">Dial Confirmation</p>
              <OdeDial setting={selectedGrind.setting} />
              <p className="text-stone-400 text-sm text-center mt-2">
                Set Fellow Ode Gen 2 to <span className="text-amber-400 font-bold">{selectedGrind.setting}</span>
              </p>
            </div>
          )}

          <button
            disabled={!selectedGrind}
            onClick={() => setStep(4)}
            className="w-full py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white font-semibold rounded-xl transition-colors"
          >
            Next →
          </button>
        </div>
      )}

      {/* Step 4: Aiden */}
      {step === 4 && (
        <div>
          <p className="text-stone-400 text-sm mb-4 font-medium">Select Aiden profile</p>
          <div className="space-y-2 mb-4">
            {aidenProfiles.map((ap) => (
              <button
                key={ap.id}
                onClick={() => setSelectedAiden(ap)}
                className={`w-full text-left bg-stone-900 border rounded-xl p-4 transition-colors ${
                  selectedAiden?.id === ap.id ? "border-amber-500" : "border-stone-800 hover:border-amber-700"
                }`}
              >
                <p className="font-semibold text-stone-100">{ap.name}</p>
                <p className="text-stone-400 text-sm">
                  {ap.coffeeG}g / {ap.waterG}g · {ap.tempF}°F
                  <span className="ml-1 text-stone-600">(ratio {(ap.waterG / ap.coffeeG).toFixed(1)}:1)</span>
                </p>
                {selectedAiden?.id === ap.id && <p className="text-amber-500 text-xs mt-1">Selected ✓</p>}
              </button>
            ))}
          </div>

          {selectedAiden && (
            <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden mb-4">
              <p className="text-stone-500 text-xs font-semibold uppercase tracking-wide px-4 pt-4 pb-2">Aiden Settings</p>
              <div className="grid grid-cols-3 divide-x divide-stone-800 border-y border-stone-800">
                <div className="p-3 text-center">
                  <p className="text-stone-500 text-xs mb-0.5">Coffee</p>
                  <p className="text-amber-400 font-bold">{selectedAiden.coffeeG}g</p>
                </div>
                <div className="p-3 text-center">
                  <p className="text-stone-500 text-xs mb-0.5">Water</p>
                  <p className="text-amber-400 font-bold">{selectedAiden.waterG}g</p>
                </div>
                <div className="p-3 text-center">
                  <p className="text-stone-500 text-xs mb-0.5">Temp</p>
                  <p className="text-amber-400 font-bold">{selectedAiden.tempF}°F</p>
                </div>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-stone-500 text-xs w-14 shrink-0">Bloom</span>
                  <div className="flex-1 bg-stone-800 rounded-full h-5 overflow-hidden">
                    <div
                      className="h-full bg-teal-700 rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${Math.min(100, (selectedAiden.bloomWaterG / selectedAiden.waterG) * 100)}%` }}
                    >
                      <span className="text-white text-xs">{selectedAiden.bloomWaterG}g</span>
                    </div>
                  </div>
                  <span className="text-stone-400 text-xs w-10 text-right">{selectedAiden.bloomTimeS}s</span>
                </div>
                {Array.isArray(selectedAiden.pours) && selectedAiden.pours.map((pour) => (
                  <div key={pour.sequence} className="flex items-center gap-3">
                    <span className="text-stone-500 text-xs w-14 shrink-0">Pour {pour.sequence}</span>
                    <div className="flex-1 bg-stone-800 rounded-full h-5 overflow-hidden">
                      <div
                        className="h-full bg-amber-700 rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${Math.min(100, (pour.waterG / selectedAiden.waterG) * 100)}%` }}
                      >
                        <span className="text-white text-xs">{pour.waterG}g</span>
                      </div>
                    </div>
                    <span className="text-stone-400 text-xs w-10 text-right">{pour.pauseS}s</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 mb-4 space-y-1 text-sm">
            <p className="text-stone-400 font-medium mb-2">Brew summary</p>
            {selectedWater && <p className="text-stone-300"><span className="text-stone-500">Water:</span> {selectedWater.brand}{selectedWater.additives ? ` · ${selectedWater.additives}` : ""}</p>}
            <p className="text-stone-300"><span className="text-stone-500">Beans:</span> {selectedBean?.producer} — {selectedBean?.name}</p>
            <p className="text-stone-300"><span className="text-stone-500">Grind:</span> {selectedGrind?.setting} (Ode Gen 2)</p>
            {selectedAiden && <p className="text-stone-300"><span className="text-stone-500">Profile:</span> {selectedAiden.name}</p>}
          </div>

          <button
            disabled={!selectedAiden || submitting}
            onClick={submit}
            className="w-full py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white font-semibold rounded-xl transition-colors"
          >
            {submitting ? "Logging..." : fromId ? "Branch →" : "Start Brew →"}
          </button>
        </div>
      )}
    </div>
  );
}
