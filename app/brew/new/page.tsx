"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import OdeDial from "@/components/OdeDial";

type Pour = { sequence: number; waterG: number; pauseS: number };
type Bean = { id: string; producer: string; name: string; roastLevel: string; region?: string | null; process?: string | null };
type GrindProfile = { id: string; name: string; setting: number };
type AidenProfile = { id: string; name: string; coffeeG: number; waterG: number; tempF: number; bloomTimeS: number; bloomWaterG: number; pours: Pour[] };

export default function NewBrewPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [beans, setBeans] = useState<Bean[]>([]);
  const [grindProfiles, setGrindProfiles] = useState<GrindProfile[]>([]);
  const [aidenProfiles, setAidenProfiles] = useState<AidenProfile[]>([]);

  const [selectedBean, setSelectedBean] = useState<Bean | null>(null);
  const [selectedGrind, setSelectedGrind] = useState<GrindProfile | null>(null);
  const [selectedAiden, setSelectedAiden] = useState<AidenProfile | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/beans").then((r) => r.json()).then(setBeans);
    fetch("/api/profiles/grind").then((r) => r.json()).then(setGrindProfiles);
    fetch("/api/profiles/aiden").then((r) => r.json()).then(setAidenProfiles);
  }, []);

  async function submit() {
    setSubmitting(true);
    const res = await fetch("/api/brews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        beanId: selectedBean!.id,
        grindProfileId: selectedGrind!.id,
        aidenProfileId: selectedAiden!.id,
      }),
    });
    const brew = await res.json();
    router.push(`/brew/${brew.id}/taste`);
  }

  return (
    <div className="min-h-screen bg-stone-950 px-4 pt-6 pb-10 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => step > 1 ? setStep(s => s - 1) : router.back()} className="text-stone-400 hover:text-stone-200 text-2xl leading-none">‹</button>
        <h1 className="text-xl font-bold text-stone-100">New Brew</h1>
        <div className="ml-auto flex gap-1.5">
          {[1, 2, 3].map((n) => (
            <div key={n} className={`w-2 h-2 rounded-full ${step >= n ? "bg-amber-500" : "bg-stone-700"}`} />
          ))}
        </div>
      </div>

      {step === 1 && (
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
                  onClick={() => { setSelectedBean(bean); setStep(2); }}
                  className="w-full text-left bg-stone-900 border border-stone-800 hover:border-amber-600 rounded-xl p-4 transition-colors"
                >
                  <p className="font-semibold text-stone-100">{bean.producer}</p>
                  <p className="text-stone-400 text-sm">
                    {bean.name} · {bean.roastLevel}
                    {bean.region ? ` · ${bean.region}` : ""}
                    {bean.process ? ` · ${bean.process}` : ""}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div>
          <p className="text-stone-400 text-sm mb-4 font-medium">Select grind profile</p>
          <div className="space-y-2 mb-4">
            {grindProfiles.map((gp) => (
              <button
                key={gp.id}
                onClick={() => setSelectedGrind(gp)}
                className={`w-full text-left bg-stone-900 border rounded-xl p-4 transition-colors ${selectedGrind?.id === gp.id ? "border-amber-500" : "border-stone-800 hover:border-amber-700"}`}
              >
                <p className="font-semibold text-stone-100">{gp.name}</p>
                <p className="text-stone-400 text-sm">Setting {gp.setting}</p>
              </button>
            ))}
          </div>

          {selectedGrind && (
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 mb-4">
              <p className="text-stone-500 text-xs font-semibold uppercase tracking-wide mb-3 text-center">Dial Confirmation</p>
              <OdeDial setting={selectedGrind.setting} />
              <p className="text-stone-400 text-sm text-center mt-2">Set Fellow Ode Gen 2 to <span className="text-amber-400 font-bold">{selectedGrind.setting}</span></p>
            </div>
          )}

          <button
            disabled={!selectedGrind}
            onClick={() => setStep(3)}
            className="w-full py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white font-semibold rounded-xl transition-colors"
          >
            Next →
          </button>
        </div>
      )}

      {step === 3 && (
        <div>
          <p className="text-stone-400 text-sm mb-4 font-medium">Select Aiden profile</p>
          <div className="space-y-2 mb-4">
            {aidenProfiles.map((ap) => (
              <button
                key={ap.id}
                onClick={() => setSelectedAiden(ap)}
                className={`w-full text-left bg-stone-900 border rounded-xl p-4 transition-colors ${selectedAiden?.id === ap.id ? "border-amber-500" : "border-stone-800 hover:border-amber-700"}`}
              >
                <p className="font-semibold text-stone-100">{ap.name}</p>
                <p className="text-stone-400 text-sm">
                  {ap.coffeeG}g / {ap.waterG}g · {ap.tempF}°F
                  <span className="ml-1 text-stone-600">(ratio {(ap.waterG / ap.coffeeG).toFixed(1)}:1)</span>
                </p>
              </button>
            ))}
          </div>

          {selectedAiden && (
            <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden mb-4">
              <p className="text-stone-500 text-xs font-semibold uppercase tracking-wide px-4 pt-4 pb-2">Aiden Settings</p>
              <div className="grid grid-cols-3 divide-x divide-stone-800 border-y border-stone-800">
                <div className="p-3 text-center">
                  <p className="text-stone-500 text-xs mb-0.5">Ratio</p>
                  <p className="text-amber-400 font-bold">{(selectedAiden.waterG / selectedAiden.coffeeG).toFixed(1)}:1</p>
                </div>
                <div className="p-3 text-center">
                  <p className="text-stone-500 text-xs mb-0.5">Temp</p>
                  <p className="text-amber-400 font-bold">{selectedAiden.tempF}°F</p>
                </div>
                <div className="p-3 text-center">
                  <p className="text-stone-500 text-xs mb-0.5">Bloom</p>
                  <p className="text-amber-400 font-bold">{selectedAiden.bloomWaterG}g</p>
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

          <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 mb-4 space-y-1 text-sm">
            <p className="text-stone-400 font-medium mb-2">Brew summary</p>
            <p className="text-stone-300"><span className="text-stone-500">Beans:</span> {selectedBean?.producer} — {selectedBean?.name}</p>
            <p className="text-stone-300"><span className="text-stone-500">Grind:</span> {selectedGrind?.setting} (Ode Gen 2)</p>
            {selectedAiden && <p className="text-stone-300"><span className="text-stone-500">Profile:</span> {selectedAiden.name}</p>}
          </div>

          <button
            disabled={!selectedAiden || submitting}
            onClick={submit}
            className="w-full py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white font-semibold rounded-xl transition-colors"
          >
            {submitting ? "Logging..." : "Start Brew →"}
          </button>
        </div>
      )}
    </div>
  );
}
