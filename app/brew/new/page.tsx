"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Bean = { id: string; producer: string; name: string; roastLevel: string; country?: string | null };
type GrindProfile = { id: string; name: string; setting: number };
type AidenProfile = { id: string; name: string; coffeeG: number; waterG: number; tempF: number };

export default function NewBrewPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [beans, setBeans] = useState<Bean[]>([]);
  const [grindProfiles, setGrindProfiles] = useState<GrindProfile[]>([]);
  const [aidenProfiles, setAidenProfiles] = useState<AidenProfile[]>([]);

  const [selectedBean, setSelectedBean] = useState<Bean | null>(null);
  const [selectedGrind, setSelectedGrind] = useState<GrindProfile | null>(null);
  const [selectedAiden, setSelectedAiden] = useState<AidenProfile | null>(null);
  const [grindOverride, setGrindOverride] = useState("");
  const [tempOverride, setTempOverride] = useState("");
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
        grindOverride: grindOverride ? parseFloat(grindOverride) : undefined,
        tempOverride: tempOverride ? parseInt(tempOverride) : undefined,
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
                  <p className="text-stone-400 text-sm">{bean.name} · {bean.roastLevel}{bean.country ? ` · ${bean.country}` : ""}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div>
          <p className="text-stone-400 text-sm mb-4 font-medium">Select grind profile</p>
          {grindProfiles.length === 0 ? (
            <div className="text-center py-10 text-stone-500">
              <p>No grind profiles yet.</p>
              <a href="/profiles/grind" className="text-amber-500 underline text-sm mt-1 block">Add a grind profile first →</a>
            </div>
          ) : (
            <div className="space-y-2 mb-6">
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
          )}
          {selectedGrind && (
            <div className="mb-4">
              <label className="text-stone-400 text-sm block mb-1">Override grind setting (optional)</label>
              <input
                type="number"
                step="0.5"
                placeholder={String(selectedGrind.setting)}
                value={grindOverride}
                onChange={(e) => setGrindOverride(e.target.value)}
                className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          )}
          {grindProfiles.length > 0 && (
            <button
              disabled={!selectedGrind}
              onClick={() => setStep(3)}
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white font-semibold rounded-xl transition-colors mt-2"
            >
              Next →
            </button>
          )}
        </div>
      )}

      {step === 3 && (
        <div>
          <p className="text-stone-400 text-sm mb-4 font-medium">Select Aiden profile</p>
          <div className="space-y-2 mb-6">
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
            <div className="mb-4">
              <label className="text-stone-400 text-sm block mb-1">Override temp °F (optional)</label>
              <input
                type="number"
                placeholder={String(selectedAiden.tempF)}
                value={tempOverride}
                onChange={(e) => setTempOverride(e.target.value)}
                className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          )}

          <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 mb-4 space-y-1 text-sm">
            <p className="text-stone-400 font-medium mb-2">Brew summary</p>
            <p className="text-stone-300"><span className="text-stone-500">Beans:</span> {selectedBean?.producer} — {selectedBean?.name}</p>
            <p className="text-stone-300"><span className="text-stone-500">Grind:</span> {grindOverride || selectedGrind?.setting}</p>
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
