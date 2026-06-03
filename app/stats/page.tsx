import AppShell from "@/components/AppShell";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function avg(arr: number[]) {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 text-center">
      <p className="text-2xl font-bold text-amber-400">{value}</p>
      <p className="text-stone-400 text-xs mt-0.5">{label}</p>
      {sub && <p className="text-stone-600 text-xs mt-0.5">{sub}</p>}
    </div>
  );
}

function HBarChart({ data }: { data: { label: string; value: number; count: number }[] }) {
  const max = 10;
  const sorted = [...data].sort((a, b) => b.value - a.value);
  return (
    <div className="space-y-2.5">
      {sorted.map(({ label, value, count }) => (
        <div key={label}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-stone-400 capitalize">
              {label}{" "}
              <span className="text-stone-600">({count})</span>
            </span>
            <span className="text-stone-300 font-medium">{value.toFixed(1)}</span>
          </div>
          <div className="h-1.5 bg-stone-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-600 rounded-full transition-all"
              style={{ width: `${(value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function LineChart({ scores }: { scores: number[] }) {
  if (scores.length < 2) {
    return (
      <p className="text-stone-600 text-sm text-center py-6">
        Log 2+ rated brews to see trend
      </p>
    );
  }
  const W = 300;
  const H = 96;
  const PL = 22;
  const PR = 8;
  const PT = 8;
  const PB = 8;
  const innerW = W - PL - PR;
  const innerH = H - PT - PB;

  function cx(i: number) {
    return PL + (i / (scores.length - 1)) * innerW;
  }
  function cy(s: number) {
    return H - PB - ((s - 0) / 10) * innerH;
  }

  const pathD = scores
    .map((s, i) => `${i === 0 ? "M" : "L"} ${cx(i).toFixed(1)} ${cy(s).toFixed(1)}`)
    .join(" ");

  const yTicks = [0, 5, 10];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-hidden>
      {yTicks.map((t) => (
        <g key={t}>
          <line
            x1={PL}
            y1={cy(t)}
            x2={W - PR}
            y2={cy(t)}
            stroke="#292524"
            strokeWidth={1}
          />
          <text
            x={PL - 3}
            y={cy(t) + 3.5}
            textAnchor="end"
            fontSize={8}
            fill="#78716c"
          >
            {t}
          </text>
        </g>
      ))}
      <path
        d={pathD}
        fill="none"
        stroke="#d97706"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      {scores.map((s, i) => (
        <circle key={i} cx={cx(i)} cy={cy(s)} r={2.5} fill="#d97706" />
      ))}
    </svg>
  );
}

function ScatterPlot({ data }: { data: { days: number; score: number }[] }) {
  if (data.length === 0) {
    return (
      <p className="text-stone-600 text-sm text-center py-6">
        No brews with known roast date
      </p>
    );
  }
  const W = 300;
  const H = 120;
  const PL = 22;
  const PR = 16;
  const PT = 8;
  const PB = 20;
  const innerW = W - PL - PR;
  const innerH = H - PT - PB;

  const maxDays = Math.max(28, ...data.map((d) => d.days));

  function cx(days: number) {
    return PL + (days / maxDays) * innerW;
  }
  function cy(score: number) {
    return H - PB - (score / 10) * innerH;
  }

  const xTicks = [0, 7, 14, 21, ...(maxDays > 28 ? [28] : [])];
  const yTicks = [0, 5, 10];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-hidden>
      {yTicks.map((t) => (
        <g key={t}>
          <line
            x1={PL}
            y1={cy(t)}
            x2={W - PR}
            y2={cy(t)}
            stroke="#292524"
            strokeWidth={1}
          />
          <text
            x={PL - 3}
            y={cy(t) + 3.5}
            textAnchor="end"
            fontSize={8}
            fill="#78716c"
          >
            {t}
          </text>
        </g>
      ))}
      {xTicks.map((t) => (
        <g key={t}>
          <line
            x1={cx(t)}
            y1={PT}
            x2={cx(t)}
            y2={H - PB}
            stroke="#292524"
            strokeWidth={1}
          />
          <text
            x={cx(t)}
            y={H - PB + 10}
            textAnchor="middle"
            fontSize={8}
            fill="#78716c"
          >
            {t}d
          </text>
        </g>
      ))}
      {data.map((d, i) => (
        <circle
          key={i}
          cx={cx(d.days)}
          cy={cy(d.score)}
          r={3.5}
          fill="#d97706"
          fillOpacity={0.75}
        />
      ))}
    </svg>
  );
}

export default async function StatsPage() {
  const brews = await prisma.brew.findMany({
    take: 1000,
    orderBy: { brewedAt: "asc" },
    include: { bean: true, beanBag: true, tastingNote: true, grindProfile: true, waterProfile: true },
  });

  const outsideCups = await prisma.outsideCup.count();

  const rated = brews.filter((b) => b.tastingNote != null);
  const avgScore = rated.length ? avg(rated.map((b) => b.tastingNote!.overallScore)) : null;
  const wouldAgainCount = rated.filter((b) => b.tastingNote!.wouldBrewAgain).length;
  const wouldAgainPct = rated.length
    ? Math.round((wouldAgainCount / rated.length) * 100)
    : null;

  // Score over time (last 25 rated)
  const timelineScores = rated.slice(-25).map((b) => b.tastingNote!.overallScore);

  // Score by roast level
  const byRoast: Record<string, number[]> = {};
  for (const b of rated) {
    const k = b.bean.roastLevel;
    (byRoast[k] ??= []).push(b.tastingNote!.overallScore);
  }
  const roastData = Object.entries(byRoast).map(([label, scores]) => ({
    label,
    value: avg(scores),
    count: scores.length,
  }));

  // Score by process
  const byProcess: Record<string, number[]> = {};
  for (const b of rated) {
    const k = b.bean.process ?? "Unknown";
    (byProcess[k] ??= []).push(b.tastingNote!.overallScore);
  }
  const processData = Object.entries(byProcess).map(([label, scores]) => ({
    label,
    value: avg(scores),
    count: scores.length,
  }));

  // Days from roast scatter
  const scatterData = rated
    .map((b) => {
      const roastedOn = b.beanBag?.roastedOn ?? b.roastedOn;
      if (!roastedOn) return null;
      const days = Math.round(
        (new Date(b.brewedAt).getTime() - new Date(roastedOn).getTime()) /
          86_400_000
      );
      return days >= 0 && days <= 60
        ? { days, score: b.tastingNote!.overallScore }
        : null;
    })
    .filter((d): d is { days: number; score: number } => d !== null);

  // Score by grind profile
  const byGrind: Record<string, number[]> = {};
  for (const b of rated) {
    const k = `${b.grindProfile.name} (${b.grindProfile.setting})`;
    (byGrind[k] ??= []).push(b.tastingNote!.overallScore);
  }
  const grindData = Object.entries(byGrind)
    .filter(([, scores]) => scores.length >= 2)
    .map(([label, scores]) => ({ label, value: avg(scores), count: scores.length }));

  // Score by water profile
  const byWater: Record<string, number[]> = {};
  for (const b of rated) {
    const k = b.waterProfile
      ? b.waterProfile.brand + (b.waterProfile.additives ? ` · ${b.waterProfile.additives}` : "")
      : "No water profile";
    (byWater[k] ??= []).push(b.tastingNote!.overallScore);
  }
  const waterData = Object.entries(byWater)
    .filter(([, scores]) => scores.length >= 2)
    .map(([label, scores]) => ({ label, value: avg(scores), count: scores.length }));

  // Top confirmed flavor tags
  const tagCounts: Record<string, number> = {};
  for (const b of rated) {
    for (const tag of b.tastingNote!.flavorTags) {
      tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
    }
  }
  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  const maxTagCount = topTags[0]?.[1] ?? 1;

  return (
    <AppShell>
      <div className="pt-2 mb-6">
        <h1 className="text-xl font-bold text-stone-100">Statistics</h1>
        <p className="text-stone-500 text-sm mt-1">
          {brews.length} brews · {rated.length} rated · {outsideCups} outside cups
        </p>
      </div>

      {rated.length === 0 ? (
        <div className="text-center py-16 text-stone-600">
          <p className="text-4xl mb-3">◈</p>
          <p className="font-medium text-stone-500">No rated brews yet</p>
          <p className="text-sm mt-1">Rate some brews to see your stats</p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Avg score"
              value={avgScore != null ? avgScore.toFixed(1) : "—"}
              sub={`of ${rated.length} rated`}
            />
            <StatCard
              label="Would brew again"
              value={wouldAgainPct != null ? `${wouldAgainPct}%` : "—"}
              sub={`${wouldAgainCount} of ${rated.length}`}
            />
          </div>

          {/* Score over time */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-4">
            <p className="text-stone-400 text-xs font-semibold uppercase tracking-wide mb-3">
              Score over time
            </p>
            <LineChart scores={timelineScores} />
          </div>

          {/* Days from roast scatter */}
          {scatterData.length > 0 && (
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-4">
              <p className="text-stone-400 text-xs font-semibold uppercase tracking-wide mb-1">
                Days from roast vs score
              </p>
              <p className="text-stone-600 text-xs mb-3">
                X = days since roast · Y = overall score
              </p>
              <ScatterPlot data={scatterData} />
            </div>
          )}

          {/* By roast level */}
          {roastData.length > 0 && (
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-4">
              <p className="text-stone-400 text-xs font-semibold uppercase tracking-wide mb-3">
                Score by roast level
              </p>
              <HBarChart data={roastData} />
            </div>
          )}

          {/* By process */}
          {processData.length > 1 && (
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-4">
              <p className="text-stone-400 text-xs font-semibold uppercase tracking-wide mb-3">
                Score by process
              </p>
              <HBarChart data={processData} />
            </div>
          )}

          {/* By grind profile */}
          {grindData.length > 0 && (
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-4">
              <p className="text-stone-400 text-xs font-semibold uppercase tracking-wide mb-3">
                Score by grind profile
              </p>
              <HBarChart data={grindData} />
            </div>
          )}

          {/* By water profile */}
          {waterData.length > 0 && (
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-4">
              <p className="text-stone-400 text-xs font-semibold uppercase tracking-wide mb-3">
                Score by water profile
              </p>
              <HBarChart data={waterData} />
            </div>
          )}

          {/* Top flavor tags */}
          {topTags.length > 0 && (
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-4">
              <p className="text-stone-400 text-xs font-semibold uppercase tracking-wide mb-3">
                Top flavor tags
              </p>
              <div className="space-y-2">
                {topTags.map(([tag, count]) => (
                  <div key={tag}>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="text-stone-400 capitalize">{tag}</span>
                      <span className="text-stone-500">{count}</span>
                    </div>
                    <div className="h-1 bg-stone-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-800 rounded-full"
                        style={{ width: `${(count / maxTagCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
