import AppShell from "@/components/AppShell";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import BrewAgainButton from "@/components/BrewAgainButton";

export const dynamic = "force-dynamic";

export default async function BrewDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const brew = await prisma.brew.findUnique({
    where: { id },
    include: { bean: true, grindProfile: true, aidenProfile: true, tastingNote: true },
  });
  if (!brew) notFound();

  const grind = brew.grindOverride ?? brew.grindProfile.setting;
  const temp = brew.tempOverride ?? brew.aidenProfile.tempF;
  const ratio = (brew.aidenProfile.waterG / brew.aidenProfile.coffeeG).toFixed(1);

  return (
    <AppShell>
      <div className="flex items-center gap-3 mb-6 pt-2">
        <Link href="/brews" className="text-stone-400 hover:text-stone-200 text-2xl">‹</Link>
        <div className="min-w-0">
          <h1 className="font-bold text-stone-100 truncate">{brew.bean.producer} — {brew.bean.name}</h1>
          <p className="text-stone-500 text-sm">{format(new Date(brew.brewedAt), "MMM d, yyyy · h:mm a")}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 space-y-2">
          <p className="text-stone-400 text-xs font-semibold uppercase tracking-wide mb-3">Bean</p>
          <Row label="Producer" value={brew.bean.producer} />
          <Row label="Name" value={brew.bean.name} />
          {brew.bean.country && <Row label="Country" value={brew.bean.country} />}
          <Row label="Roast" value={brew.bean.roastLevel} />
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 space-y-2">
          <p className="text-stone-400 text-xs font-semibold uppercase tracking-wide mb-3">Brew Settings</p>
          <Row label="Grind" value={String(grind)} highlight={!!brew.grindOverride} />
          <Row label="Profile" value={brew.aidenProfile.name} />
          <Row label="Ratio" value={`${ratio}:1 (${brew.aidenProfile.coffeeG}g / ${brew.aidenProfile.waterG}g)`} />
          <Row label="Temp" value={`${temp}°F`} highlight={!!brew.tempOverride} />
          <Row label="Bloom" value={`${brew.aidenProfile.bloomWaterG}g / ${brew.aidenProfile.bloomTimeS}s`} />
        </div>

        {brew.tastingNote ? (
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-stone-400 text-xs font-semibold uppercase tracking-wide">Tasting Notes</p>
              <Link href={`/brew/${id}/taste`} className="text-amber-500 text-xs hover:text-amber-400">Edit</Link>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-5xl font-bold text-amber-400">{brew.tastingNote.overallScore}</span>
              <div>
                <p className="text-stone-500 text-xs">/10 overall</p>
                {brew.tastingNote.wouldBrewAgain && <p className="text-green-400 text-xs mt-0.5">Would brew again ✓</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <ScoreBar label="Fruit" value={brew.tastingNote.fruit} />
              <ScoreBar label="Chocolate" value={brew.tastingNote.chocolate} />
              <ScoreBar label="Bitterness" value={brew.tastingNote.bitterness} />
              <ScoreBar label="Sourness" value={brew.tastingNote.sourness} />
            </div>
            {brew.tastingNote.flavorTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {brew.tastingNote.flavorTags.map((t) => (
                  <span key={t} className="bg-stone-800 text-stone-300 text-xs px-2 py-0.5 rounded-full">{t}</span>
                ))}
              </div>
            )}
            {brew.tastingNote.drinkingTempF && (
              <p className="text-stone-500 text-sm">Drinking temp: {brew.tastingNote.drinkingTempF}°F</p>
            )}
            {brew.tastingNote.initialThoughts && (
              <p className="text-stone-300 text-sm mt-2 italic">"{brew.tastingNote.initialThoughts}"</p>
            )}
          </div>
        ) : (
          <Link
            href={`/brew/${id}/taste`}
            className="block bg-amber-900/30 border border-amber-700/40 rounded-xl p-4 text-center text-amber-300 font-medium hover:bg-amber-900/50 transition-colors"
          >
            + Rate this brew
          </Link>
        )}

        <BrewAgainButton brewId={id} />
      </div>
    </AppShell>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-baseline text-sm">
      <span className="text-stone-500">{label}</span>
      <span className={highlight ? "text-amber-400 font-medium" : "text-stone-300"}>{value}</span>
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-stone-500">{label}</span>
        <span className="text-stone-300 font-medium">{value}/5</span>
      </div>
      <div className="h-1.5 bg-stone-800 rounded-full overflow-hidden">
        <div className="h-full bg-amber-600 rounded-full" style={{ width: `${(value / 5) * 100}%` }} />
      </div>
    </div>
  );
}
