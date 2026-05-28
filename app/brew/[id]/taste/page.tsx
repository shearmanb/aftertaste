"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import TastingSlider from "@/components/TastingSlider";

const COMMON_TAGS_FALLBACK = [
  "jasmine", "berry", "citrus", "tropical", "stone fruit", "apple",
  "caramel", "chocolate", "nutty", "brown sugar", "vanilla",
  "roasty", "smoky", "earthy", "floral", "bright", "clean", "complex",
];

const LOCKED_MISC_VARS = ["used lid"];

type BrewData = {
  brewIssues: string[];
  miscVars: string[];
  bean: { tastingNotes: string[] };
  tastingNote?: {
    overallScore: number; fruit: number; strength: number; chocolate: number; sourness: number;
    confirmedTags: string[]; missedTags: string[]; bonusTags: string[]; flavorTags: string[];
    initialThoughts?: string | null; bestPart?: string | null;
    worstPart?: string | null; changesToMake?: string | null; wouldBrewAgain: boolean;
    grindAroma?: number | null;
  } | null;
};

export default function TastePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [commonTags, setCommonTags] = useState<string[]>(COMMON_TAGS_FALLBACK);
  const [bagNotes, setBagNotes] = useState<string[]>([]);
  const [issueOptions, setIssueOptions] = useState<string[]>([]);
  const [miscVarOptions, setMiscVarOptions] = useState<string[]>([]);
  const [brewIssues, setBrewIssues] = useState<string[]>([]);
  const [miscVars, setMiscVars] = useState<string[]>([]);
  const [overallScore, setOverallScore] = useState(7);
  const [fruit, setFruit] = useState(2.5);
  const [strength, setStrength] = useState(0); // signed position: -10=too weak, 0=perfect, +10=too strong
  const [chocolate, setChocolate] = useState(2.5);
  const [sourness, setSourness] = useState(1);
  const [grindAroma, setGrindAroma] = useState<number | null>(null);
  // 0 = unrated, 1 = tasted ✓, 2 = missed ✗
  const [bagTagStates, setBagTagStates] = useState<Record<string, 0 | 1 | 2>>({});
  const [bonusTags, setBonusTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [initialThoughts, setInitialThoughts] = useState("");
  const [bestPart, setBestPart] = useState("");
  const [worstPart, setWorstPart] = useState("");
  const [changesToMake, setChangesToMake] = useState("");
  const [wouldBrewAgain, setWouldBrewAgain] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/options?category=flavorTag")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0)
          setCommonTags(data.map((o: { value: string }) => o.value));
      });
    fetch("/api/options?category=brewIssue")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setIssueOptions(data.map((o: { value: string }) => o.value));
      });
    fetch("/api/options?category=miscVar")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setMiscVarOptions(data.map((o: { value: string }) => o.value));
      });
  }, []);

  useEffect(() => {
    fetch(`/api/brews/${id}`).then((r) => r.json()).then((data: BrewData) => {
      const notes = data.bean?.tastingNotes ?? [];
      setBagNotes(notes);
      if (Array.isArray(data.brewIssues)) setBrewIssues(data.brewIssues);
      if (Array.isArray(data.miscVars)) setMiscVars(data.miscVars);

      if (data.tastingNote) {
        const tn = data.tastingNote;
        setOverallScore(tn.overallScore);
        setFruit(tn.fruit);
        // Integer = new format (-10..+10); non-integer = legacy derived score, can't recover direction
        setStrength(Number.isInteger(tn.strength) ? tn.strength : 0);
        setChocolate(tn.chocolate);
        setSourness(tn.sourness);
        setInitialThoughts(tn.initialThoughts ?? "");
        setBestPart(tn.bestPart ?? "");
        setWorstPart(tn.worstPart ?? "");
        setChangesToMake(tn.changesToMake ?? "");
        setWouldBrewAgain(tn.wouldBrewAgain);
        if (tn.grindAroma != null) setGrindAroma(tn.grindAroma);
        const states: Record<string, 0 | 1 | 2> = {};
        notes.forEach((n) => { states[n] = 0; });
        (tn.confirmedTags ?? []).forEach((t) => { if (t in states) states[t] = 1; });
        (tn.missedTags ?? []).forEach((t) => { if (t in states) states[t] = 2; });
        setBagTagStates(states);
        const existing = tn.bonusTags?.length
          ? tn.bonusTags
          : (tn.flavorTags ?? []).filter((t) => !notes.includes(t));
        setBonusTags(existing);
      } else {
        const states: Record<string, 0 | 1 | 2> = {};
        notes.forEach((n) => { states[n] = 0; });
        setBagTagStates(states);
      }
      setLoading(false);
    });
  }, [id]);

  function cycleBagTag(tag: string) {
    setBagTagStates((prev) => ({ ...prev, [tag]: (((prev[tag] ?? 0) + 1) % 3) as 0 | 1 | 2 }));
  }

  function toggleBonus(tag: string) {
    setBonusTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  }

  function addCustomTag() {
    const t = customTag.trim().toLowerCase();
    if (!t) return;
    if (bagNotes.includes(t)) {
      setBagTagStates((prev) => ({ ...prev, [t]: prev[t] === 1 ? 0 : 1 }));
    } else if (!bonusTags.includes(t)) {
      setBonusTags((prev) => [...prev, t]);
    }
    setCustomTag("");
  }

  const confirmedTags = Object.entries(bagTagStates).filter(([, s]) => s === 1).map(([t]) => t);
  const missedTags = Object.entries(bagTagStates).filter(([, s]) => s === 2).map(([t]) => t);
  const extraCommonTags = commonTags.filter((t) => !bagNotes.includes(t));

  const scoreDisplay = overallScore % 1 === 0 ? String(overallScore) : String(+overallScore.toFixed(2));

  async function submit() {
    setSubmitting(true);
    await Promise.all([
      fetch(`/api/brews/${id}/taste`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          overallScore, fruit, strength, chocolate, sourness,
          ...(grindAroma !== null ? { grindAroma } : {}),
          confirmedTags, missedTags, bonusTags,
          flavorTags: [...confirmedTags, ...bonusTags],
          initialThoughts: initialThoughts || undefined,
          bestPart: bestPart || undefined,
          worstPart: worstPart || undefined,
          changesToMake: changesToMake || undefined,
          wouldBrewAgain,
        }),
      }),
      fetch(`/api/brews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brewIssues, miscVars }),
      }),
    ]);
    router.push(`/brew/${id}`);
  }

  if (loading) return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center text-stone-500">Loading...</div>
  );

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
            <span className="text-5xl font-bold text-amber-400">{scoreDisplay}</span>
            <span className="text-stone-500">/10</span>
          </div>
          <input type="range" min={1} max={10} step={0.25} value={overallScore}
            onChange={(e) => setOverallScore(parseFloat(e.target.value))}
            className="w-full accent-amber-500 h-3" />
          <div className="flex justify-between text-xs text-stone-600 mt-1">
            <span>Drain it</span><span>Perfect</span>
          </div>
        </div>

        {/* Flavor dimensions */}
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 space-y-5">
          <p className="text-stone-400 text-xs font-semibold uppercase tracking-wide">Flavor Dimensions</p>
          <TastingSlider label="Fruit" value={fruit} min={0} onChange={setFruit} lowLabel="None" highLabel="Tons" />
          <TastingSlider label="Chocolate / Roastness" value={chocolate} min={0} onChange={setChocolate} lowLabel="None" highLabel="Rich" />
          <TastingSlider label="Strength" value={strength} onChange={setStrength} symmetric />
          <TastingSlider label="Sourness / Off-flavors" value={sourness} onChange={setSourness} lowLabel="None" highLabel="Sharp" />
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-stone-300 text-sm font-medium">Grind Aroma</span>
              {grindAroma !== null ? (
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 font-semibold text-sm">{grindAroma.toFixed(1)}</span>
                  <button onClick={() => setGrindAroma(null)} className="text-stone-600 hover:text-stone-400 text-xs">clear</button>
                </div>
              ) : (
                <button onClick={() => setGrindAroma(2.5)} className="text-xs text-stone-500 hover:text-stone-300 border border-stone-700 px-2 py-0.5 rounded">+ Rate</button>
              )}
            </div>
            {grindAroma !== null && (
              <>
                <input type="range" min={0} max={5} step={0.5} value={grindAroma}
                  onChange={(e) => setGrindAroma(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 h-3" />
                <div className="flex justify-between text-xs text-stone-600 mt-1">
                  <span>Muted</span><span>Incredible</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Flavor tags */}
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-5">
          <p className="text-stone-400 text-xs font-semibold uppercase tracking-wide mb-3">Flavor Tags</p>

          {bagNotes.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-stone-500 text-xs font-medium">From the bag</p>
                <p className="text-stone-700 text-xs">tap once = got it · tap twice = missed</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {bagNotes.map((tag) => {
                  const state = bagTagStates[tag] ?? 0;
                  return (
                    <button key={tag} onClick={() => cycleBagTag(tag)}
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition-all select-none ${
                        state === 1
                          ? "bg-amber-600 text-white"
                          : state === 2
                          ? "bg-stone-800 text-stone-600 line-through"
                          : "bg-stone-800 border border-amber-800/50 text-amber-500/70 hover:border-amber-700"
                      }`}>
                      {state === 1 ? "✓ " : state === 2 ? "✗ " : ""}{tag}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mb-3">
            <p className="text-stone-500 text-xs font-medium mb-2">
              {bagNotes.length > 0 ? "Bonus finds — not on bag" : "Flavor notes"}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {extraCommonTags.map((tag) => (
                <button key={tag} onClick={() => toggleBonus(tag)}
                  className={`px-2.5 py-0.5 rounded-full text-xs transition-colors ${
                    bonusTags.includes(tag)
                      ? "bg-sky-800 text-sky-200"
                      : "bg-stone-800 text-stone-400 hover:bg-stone-700"
                  }`}>
                  {bonusTags.includes(tag) ? "★ " : ""}{tag}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <input type="text" placeholder="Add custom note..." value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCustomTag()}
              className="flex-1 bg-stone-800 border border-stone-700 rounded-lg px-3 py-1.5 text-sm text-stone-100 focus:outline-none focus:border-amber-500" />
            <button onClick={addCustomTag} className="px-3 py-1.5 bg-stone-700 hover:bg-stone-600 rounded-lg text-sm text-stone-300 transition-colors">Add</button>
          </div>

          {(confirmedTags.length > 0 || bonusTags.length > 0 || missedTags.length > 0) && (
            <div className="mt-3 pt-3 border-t border-stone-800 space-y-1.5">
              {confirmedTags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {confirmedTags.map((t) => (
                    <span key={t} className="bg-amber-900/40 text-amber-300 text-xs px-2 py-0.5 rounded-full">✓ {t}</span>
                  ))}
                </div>
              )}
              {bonusTags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {bonusTags.filter((t) => !extraCommonTags.includes(t)).map((t) => (
                    <span key={t} className="flex items-center gap-1 bg-sky-900/40 text-sky-300 text-xs px-2 py-0.5 rounded-full">
                      ★ {t}
                      <button onClick={() => toggleBonus(t)} className="leading-none hover:text-white">×</button>
                    </span>
                  ))}
                </div>
              )}
              {missedTags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {missedTags.map((t) => (
                    <span key={t} className="bg-stone-800 text-stone-600 text-xs px-2 py-0.5 rounded-full line-through">✗ {t}</span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Misc Variables */}
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-5">
          <p className="text-stone-400 text-xs font-semibold uppercase tracking-wide mb-3">Misc Variables <span className="text-stone-600 normal-case font-normal">(optional)</span></p>
          <div className="flex flex-wrap gap-1.5">
            {[...LOCKED_MISC_VARS, ...miscVarOptions].map((v) => {
              const active = miscVars.includes(v);
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => setMiscVars((prev) => active ? prev.filter((x) => x !== v) : [...prev, v])}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
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

        {/* Brew Issues */}
        {issueOptions.length > 0 && (
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-5">
            <p className="text-stone-400 text-xs font-semibold uppercase tracking-wide mb-3">Brew Issues <span className="text-stone-600 normal-case font-normal">(optional)</span></p>
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
