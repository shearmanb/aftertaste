"use client";

import AppShell from "@/components/AppShell";
import { useEffect, useState } from "react";
import { format } from "date-fns";

type TN = {
  overallScore: number;
  fruit: number;
  strength: number;
  chocolate: number;
  sourness: number;
  clarity?: number | null;
  body?: number | null;
  flavorTags: string[];
  wouldBrewAgain: boolean;
};

type Brew = {
  id: string;
  brewedAt: string;
  bean: { name: string; producer: { name: string }; roastLevel: string; process?: string | null };
  grindProfile: { setting: number };
  aidenProfile: { name: string; coffeeG: number; waterG: number };
  tastingNote: TN | null;
};

// Radar chart: axes normalised to 0–1
const AXES = [
  { label: "Overall", fn: (n: TN) => n.overallScore / 10 },
  { label: "Fruit",   fn: (n: TN) => n.fruit / 5 },
  { label: "Choc.",   fn: (n: TN) => n.chocolate / 5 },
  { label: "Sour.",   fn: (n: TN) => n.sourness / 5 },
  { label: "Clar.",   fn: (n: TN) => (n.clarity ?? 0) / 5 },
  { label: "Body",    fn: (n: TN) => (n.body ?? 0) / 5 },
  { label: "Strength", fn: (n: TN) => (10 - Math.abs(n.strength)) / 10 },
];
const N = AXES.length;
const CX = 130, CY = 130, R = 85, LR = 106;

function axisXY(radius: number, i: number): [number, number] {
  const a = (i * 2 * Math.PI) / N - Math.PI / 2;
  return [CX + radius * Math.cos(a), CY + radius * Math.sin(a)];
}

function polyPoints(values: number[]) {
  return values
    .map((v, i) => axisXY(v * R, i).map((n) => n.toFixed(1)).join(","))
    .join(" ");
}

function RadarChart({ a, b }: { a: number[]; b: number[] }) {
  const rings = [0.25, 0.5, 0.75, 1];
  return (
    <svg viewBox="0 0 260 260" className="w-full max-w-[260px] mx-auto" aria-hidden>
      {rings.map((r) => (
        <polygon
          key={r}
          fill="none"
          stroke="#292524"
          strokeWidth={1}
          points={AXES.map((_, i) =>
            axisXY(r * R, i).map((n) => n.toFixed(1)).join(",")
          ).join(" ")}
        />
      ))}
      {AXES.map((_, i) => {
        const [ex, ey] = axisXY(R, i);
        return (
          <line
            key={i}
            x1={CX}
            y1={CY}
            x2={ex.toFixed(1)}
            y2={ey.toFixed(1)}
            stroke="#44403c"
            strokeWidth={1}
          />
        );
      })}
      <polygon
        points={polyPoints(a)}
        fill="#d97706"
        fillOpacity={0.25}
        stroke="#d97706"
        strokeWidth={2}
      />
      <polygon
        points={polyPoints(b)}
        fill="#60a5fa"
        fillOpacity={0.18}
        stroke="#60a5fa"
        strokeWidth={2}
        strokeDasharray="5 3"
      />
      {AXES.map(({ label }, i) => {
        const [lx, ly] = axisXY(LR, i);
        return (
          <text
            key={i}
            x={lx.toFixed(1)}
            y={ly.toFixed(1)}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={9}
            fill="#78716c"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}

function Row({
  label,
  a,
  b,
  win = "none",
}: {
  label: string;
  a: string;
  b: string;
  win?: "a" | "b" | "none";
}) {
  return (
    <div className="grid grid-cols-[5fr_4fr_4fr] gap-1 py-2 border-b border-stone-800 last:border-0 text-xs items-center">
      <span className="text-stone-500">{label}</span>
      <span
        className={`text-right font-medium truncate ${
          win === "a" ? "text-amber-400" : "text-stone-300"
        }`}
      >
        {a}
      </span>
      <span
        className={`text-right font-medium truncate ${
          win === "b" ? "text-sky-400" : "text-stone-300"
        }`}
      >
        {b}
      </span>
    </div>
  );
}

function winOf(a: number, b: number): "a" | "b" | "none" {
  if (a === b) return "none";
  return a > b ? "a" : "b";
}

function fmtStrength(s: number) {
  return s === 0 ? "perfect" : s > 0 ? `+${s} (strong)` : `${s} (weak)`;
}

export default function ComparePage() {
  const [brews, setBrews] = useState<Brew[]>([]);
  const [idA, setIdA] = useState("");
  const [idB, setIdB] = useState("");

  useEffect(() => {
    fetch("/api/brews?limit=200")
      .then((r) => r.json())
      .then((data: Brew[]) =>
        setBrews(data.filter((b) => b.tastingNote != null))
      )
      .catch(() => {});
  }, []);

  const brewA = brews.find((b) => b.id === idA) ?? null;
  const brewB = brews.find((b) => b.id === idB) ?? null;
  const tn_a = brewA?.tastingNote ?? null;
  const tn_b = brewB?.tastingNote ?? null;

  const radarA = tn_a ? AXES.map((ax) => ax.fn(tn_a)) : null;
  const radarB = tn_b ? AXES.map((ax) => ax.fn(tn_b)) : null;

  function brewLabel(b: Brew) {
    return `${b.bean.producer.name} – ${b.bean.name} · ${format(new Date(b.brewedAt), "MMM d")}`;
  }

  return (
    <AppShell>
      <div className="pt-2 mb-6">
        <h1 className="text-xl font-bold text-stone-100">Compare Brews</h1>
        <p className="text-stone-500 text-sm mt-1">Pick two rated brews to compare</p>
      </div>

      {brews.length === 0 ? (
        <div className="text-center py-16 text-stone-600">
          <p className="font-medium text-stone-500">No rated brews yet</p>
          <p className="text-sm mt-1">Rate at least two brews to compare them</p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Selectors */}
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                { id: idA, setId: setIdA, color: "text-amber-400", label: "Brew A", other: idB },
                { id: idB, setId: setIdB, color: "text-sky-400", label: "Brew B", other: idA },
              ] as const
            ).map(({ id, setId, color, label, other }) => (
              <div key={label}>
                <p className={`text-xs font-semibold mb-1.5 ${color}`}>{label}</p>
                <select
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2 py-2 text-stone-200 text-xs focus:outline-none focus:border-amber-500"
                >
                  <option value="">Select…</option>
                  {brews
                    .filter((b) => b.id !== other)
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        {brewLabel(b)}
                      </option>
                    ))}
                </select>
              </div>
            ))}
          </div>

          {brewA && brewB && tn_a && tn_b && radarA && radarB ? (
            <>
              {/* Radar */}
              <div className="bg-stone-900 border border-stone-800 rounded-xl p-4">
                <div className="flex justify-center gap-6 mb-2 text-xs">
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <svg width={16} height={2}><line x1={0} y1={1} x2={16} y2={1} stroke="#d97706" strokeWidth={2}/></svg>
                    A
                  </span>
                  <span className="flex items-center gap-1.5 text-sky-400">
                    <svg width={16} height={2}><line x1={0} y1={1} x2={16} y2={1} stroke="#60a5fa" strokeWidth={2} strokeDasharray="5 3"/></svg>
                    B
                  </span>
                </div>
                <RadarChart a={radarA} b={radarB} />
              </div>

              {/* Headers */}
              <div className="bg-stone-900 border border-stone-800 rounded-xl p-4">
                <div className="grid grid-cols-[5fr_4fr_4fr] gap-1 mb-3 text-xs font-semibold">
                  <span />
                  <span className="text-right text-amber-400 truncate">A</span>
                  <span className="text-right text-sky-400 truncate">B</span>
                </div>

                <p className="text-stone-600 text-[10px] uppercase tracking-wide font-semibold mb-1">Bean</p>
                <Row label="Producer" a={brewA.bean.producer.name} b={brewB.bean.producer.name} />
                <Row label="Name" a={brewA.bean.name} b={brewB.bean.name} />
                <Row label="Roast" a={brewA.bean.roastLevel} b={brewB.bean.roastLevel} />
                <Row
                  label="Process"
                  a={brewA.bean.process ?? "—"}
                  b={brewB.bean.process ?? "—"}
                />

                <p className="text-stone-600 text-[10px] uppercase tracking-wide font-semibold mt-4 mb-1">Brew</p>
                <Row
                  label="Grind"
                  a={String(brewA.grindProfile.setting)}
                  b={String(brewB.grindProfile.setting)}
                />
                <Row label="Profile" a={brewA.aidenProfile.name} b={brewB.aidenProfile.name} />
                <Row
                  label="Dose"
                  a={`${brewA.aidenProfile.coffeeG}g`}
                  b={`${brewB.aidenProfile.coffeeG}g`}
                />
                <Row
                  label="Date"
                  a={format(new Date(brewA.brewedAt), "MMM d, yyyy")}
                  b={format(new Date(brewB.brewedAt), "MMM d, yyyy")}
                />

                <p className="text-stone-600 text-[10px] uppercase tracking-wide font-semibold mt-4 mb-1">Scores</p>
                <Row
                  label="Overall"
                  a={String(tn_a.overallScore)}
                  b={String(tn_b.overallScore)}
                  win={winOf(tn_a.overallScore, tn_b.overallScore)}
                />
                <Row
                  label="Fruit"
                  a={String(tn_a.fruit)}
                  b={String(tn_b.fruit)}
                  win={winOf(tn_a.fruit, tn_b.fruit)}
                />
                <Row
                  label="Chocolate"
                  a={String(tn_a.chocolate)}
                  b={String(tn_b.chocolate)}
                  win={winOf(tn_a.chocolate, tn_b.chocolate)}
                />
                <Row
                  label="Sourness"
                  a={String(tn_a.sourness)}
                  b={String(tn_b.sourness)}
                  win={winOf(tn_a.sourness, tn_b.sourness)}
                />
                <Row
                  label="Clarity"
                  a={tn_a.clarity != null ? String(tn_a.clarity) : "—"}
                  b={tn_b.clarity != null ? String(tn_b.clarity) : "—"}
                  win={winOf(tn_a.clarity ?? 0, tn_b.clarity ?? 0)}
                />
                <Row
                  label="Body"
                  a={tn_a.body != null ? String(tn_a.body) : "—"}
                  b={tn_b.body != null ? String(tn_b.body) : "—"}
                  win={winOf(tn_a.body ?? 0, tn_b.body ?? 0)}
                />
                <Row
                  label="Strength"
                  a={fmtStrength(tn_a.strength)}
                  b={fmtStrength(tn_b.strength)}
                  win={winOf(
                    Math.abs(tn_a.strength) === 0 ? 1 : 0,
                    Math.abs(tn_b.strength) === 0 ? 1 : 0
                  )}
                />

                <p className="text-stone-600 text-[10px] uppercase tracking-wide font-semibold mt-4 mb-2">Tags</p>
                <div className="grid grid-cols-2 gap-x-2">
                  <div className="flex flex-wrap gap-1">
                    {tn_a.flavorTags.slice(0, 6).map((t) => (
                      <span key={t} className="bg-amber-900/30 text-amber-400 text-[10px] px-1.5 py-0.5 rounded-full">
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {tn_b.flavorTags.slice(0, 6).map((t) => (
                      <span key={t} className="bg-sky-900/30 text-sky-400 text-[10px] px-1.5 py-0.5 rounded-full">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-[5fr_4fr_4fr] gap-1 mt-3 pt-2 border-t border-stone-800 text-xs items-center">
                  <span className="text-stone-500">Brew again</span>
                  <span className={`text-right font-medium ${tn_a.wouldBrewAgain ? "text-green-400" : "text-stone-500"}`}>
                    {tn_a.wouldBrewAgain ? "✓" : "✗"}
                  </span>
                  <span className={`text-right font-medium ${tn_b.wouldBrewAgain ? "text-green-400" : "text-stone-500"}`}>
                    {tn_b.wouldBrewAgain ? "✓" : "✗"}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-10 text-stone-600 text-sm">
              Select two brews above to see the comparison
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
