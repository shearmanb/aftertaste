"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import TastingSlider from "@/components/TastingSlider";

const COMMON_TAGS = [
  "jasmine", "berry", "citrus", "tropical", "stone fruit", "apple",
  "caramel", "chocolate", "nutty", "brown sugar", "vanilla",
  "roasty", "smoky", "earthy", "floral", "bright", "clean", "complex",
];

export default function TastePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [overallScore, setOverallScore] = useState(7);
  const [fruit, setFruit] = useState(3);
  const [bitterness, setBitterness] = useState(2);
  const [chocolate, setChocolate] = useState(2);
  const [sourness, setSourness] = useState(1);
  const [flavorTags, setFlavorTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [initialThoughts, setInitialThoughts] = useState("");
  const [bestPart, setBestPart] = useState("");
  const [worstPart, setWorstPart] = useState("");
  const [changesToMake, setChangesToMake] = useState("");
  const [wouldBrewAgain, setWouldBrewAgain] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  function toggleTag(tag: string) {
    setFlavorTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  }

  function addCustomTag() {
    const t = customTag.trim().toLowerCase();
    if (t && !flavorTags.includes(t)) setFlavorTags((prev) => [...prev, t]);
    setCustomTag("");
  }

  async function submit() {
    setSubmitting(true);
    await fetch(`/api/brews/${id}/taste`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        overallScore, fruit, bitterness, chocolate, sourness,
        flavorTags,
        initialThoughts: initialThoughts || undefined,
        bestPart: bestPart || undefined,
        worstPart: worstPart || undefined,
        changesToMake: changesToMake || undefined,
        wouldBrewAgain,
      }),
    });
    router.push(`/brew/${id}`);
  }

  return (
    <div className="min-h-screen bg-stone-950 px-4 pt-6 pb-10 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-stone-400 hover:text-stone-200 text-2xl">‹</button>
        <h1 className="text-xl font-bold text-stone-100">Rate this brew</h1>
      </div>

      <div className="space-y-6">
        {/* Overall score */}
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-5">
          <p className="text-stone-400 text-xs font-semibold uppercase tracking-wide mb-4">Overall Score</p>
          <div className="flex items-center justify-between mb-2">
            <span className="text-5xl font-bold text-amber-400">{overallScore}</span>
            <span className="text-stone-500">/10</span>
          </div>
          <input type="range" min={1} max={10} value={overallScore}
            onChange={(e) => setOverallScore(parseInt(e.target.value))}
            className="w-full accent-amber-500 h-3" />
          <div className="flex justify-between text-xs text-stone-600 mt-1">
            <span>Drain it</span><span>Perfect</span>
          </div>
        </div>

        {/* Flavor dimensions — scale: 1 = lots, 5 = none */}
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 space-y-5">
          <p className="text-stone-400 text-xs font-semibold uppercase tracking-wide">Flavor Dimensions</p>
          <TastingSlider label="Fruit" value={fruit} onChange={setFruit} lowLabel="Tons" highLabel="None" />
          <TastingSlider label="Chocolate / Sweetness" value={chocolate} onChange={setChocolate} lowLabel="Rich" highLabel="None" />
          <TastingSlider label="Bitterness" value={bitterness} onChange={setBitterness} lowLabel="Harsh" highLabel="None" />
          <TastingSlider label="Sourness / Off-flavors" value={sourness} onChange={setSourness} lowLabel="Sharp" highLabel="None" />
        </div>

        {/* Flavor tags */}
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-5">
          <p className="text-stone-400 text-xs font-semibold uppercase tracking-wide mb-3">Flavor Tags</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {COMMON_TAGS.map((tag) => (
              <button key={tag} onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  flavorTags.includes(tag) ? "bg-amber-600 text-white" : "bg-stone-800 text-stone-400 hover:bg-stone-700"
                }`}>
                {tag}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="text" placeholder="Add custom tag..." value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCustomTag()}
              className="flex-1 bg-stone-800 border border-stone-700 rounded-lg px-3 py-1.5 text-sm text-stone-100 focus:outline-none focus:border-amber-500" />
            <button onClick={addCustomTag} className="px-3 py-1.5 bg-stone-700 hover:bg-stone-600 rounded-lg text-sm text-stone-300 transition-colors">Add</button>
          </div>
          {flavorTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {flavorTags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 bg-amber-900/50 text-amber-300 text-xs px-2 py-0.5 rounded-full">
                  {tag}
                  <button onClick={() => toggleTag(tag)} className="text-amber-500 hover:text-amber-200 leading-none">×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 space-y-4">
          <p className="text-stone-400 text-xs font-semibold uppercase tracking-wide">Notes</p>
          <div>
            <label className="text-stone-400 text-sm block mb-1">Initial thoughts</label>
            <textarea placeholder="First impressions, anything notable..." value={initialThoughts}
              onChange={(e) => setInitialThoughts(e.target.value)} rows={2}
              className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500 resize-none text-sm" />
          </div>
          <div>
            <label className="text-stone-400 text-sm block mb-1">Best part of this brew</label>
            <textarea placeholder="What stood out positively..." value={bestPart}
              onChange={(e) => setBestPart(e.target.value)} rows={2}
              className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500 resize-none text-sm" />
          </div>
          <div>
            <label className="text-stone-400 text-sm block mb-1">Worst part of this brew</label>
            <textarea placeholder="What fell short..." value={worstPart}
              onChange={(e) => setWorstPart(e.target.value)} rows={2}
              className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500 resize-none text-sm" />
          </div>
          <div>
            <label className="text-stone-400 text-sm block mb-1">Changes to make next time</label>
            <textarea placeholder="Adjustments, experiments to try..." value={changesToMake}
              onChange={(e) => setChangesToMake(e.target.value)} rows={2}
              className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500 resize-none text-sm" />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-stone-300 text-sm font-medium">Would brew again?</label>
            <button onClick={() => setWouldBrewAgain((v) => !v)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${wouldBrewAgain ? "bg-green-700 text-green-100" : "bg-stone-700 text-stone-400"}`}>
              {wouldBrewAgain ? "Yes" : "No"}
            </button>
          </div>
        </div>

        <button onClick={submit} disabled={submitting}
          className="w-full py-4 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold rounded-xl transition-colors text-lg">
          {submitting ? "Saving..." : "Save Rating"}
        </button>
      </div>
    </div>
  );
}
