import AppShell from "@/components/AppShell";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import BrewAgainButton from "@/components/BrewAgainButton";
import DeleteBrewButton from "@/components/DeleteBrewButton";

export const dynamic = "force-dynamic";

export default async function BrewDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const brew = await prisma.brew.findUnique({
    where: { id },
    include: { bean: { include: { producer: true } }, beanBag: true, waterProfile: true, filterProfile: true, grindProfile: true, aidenProfile: true, tastingNote: true },
  });
  if (!brew) notFound();

  const grind = brew.grindProfile.setting;
  const temp = brew.aidenProfile.tempF;
  const ratio = (brew.aidenProfile.waterG / brew.aidenProfile.coffeeG).toFixed(1);

  return (
    <AppShell>
      <div className="flex items-center gap-3 mb-6 pt-2">
        <Link href="/brews" className="text-stone-400 hover:text-stone-200 text-2xl">‹</Link>
        <div className="min-w-0 flex-1">
          <h1 className="font-bold text-stone-100 truncate">{brew.bean.producer.name} — {brew.bean.name}</h1>
          <p className="text-stone-500 text-sm">{format(new Date(brew.brewedAt), "MMM d, yyyy · h:mm a")}</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <Link href={`/brew/new?from=${id}`} className="text-amber-500 hover:text-amber-400 text-sm font-medium">Branch</Link>
          <Link href={`/brew/${id}/edit`} className="text-stone-400 hover:text-stone-200 text-sm">Edit</Link>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between mb-3">
            <p className="text-stone-400 text-xs font-semibold uppercase tracking-wide">Bean</p>
            {brew.bagBrewIndex != null && (
              <span className="bg-amber-900/40 text-amber-400 text-xs px-2 py-0.5 rounded-full border border-amber-800/40">
                Brew #{brew.bagBrewIndex} from bag
              </span>
            )}
          </div>
          <Row label="Producer" value={brew.bean.producer.name} />
          <Row label="Name" value={brew.bean.name} />
          {brew.bean.region && <Row label="Region" value={brew.bean.region} />}
          {brew.bean.process && <Row label="Process" value={brew.bean.process} />}
          <Row label="Roast" value={brew.bean.roastLevel} />
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 space-y-2">
          <p className="text-stone-400 text-xs font-semibold uppercase tracking-wide mb-3">Brew Settings</p>
          {brew.waterProfile
            ? <Row label="Water" value={brew.waterProfile.brand + (brew.waterProfile.additives ? ` · ${brew.waterProfile.additives}` : "")} />
            : <div className="flex justify-between items-baseline text-sm">
                <span className="text-stone-500">Water</span>
                <Link href={`/brew/${id}/edit`} className="text-amber-500 text-xs hover:text-amber-400">Set water profile →</Link>
              </div>
          }
          {brew.filterProfile && <Row label="Filter" value={brew.filterProfile.name} />}
          <Row label="Grind" value={`${grind} (Ode Gen 2)`} />
          <Row label="Profile" value={brew.aidenProfile.name} />
          {brew.actualCoffeeG != null ? (
            <>
              <Row label="Coffee used" value={`${brew.actualCoffeeG}g`} />
              {brew.actualCoffeeG !== brew.aidenProfile.coffeeG && (
                <div className="flex justify-between items-baseline text-sm">
                  <span className="text-stone-500">vs. profile</span>
                  <span className={brew.actualCoffeeG > brew.aidenProfile.coffeeG ? "text-amber-400" : "text-sky-400"}>
                    {brew.actualCoffeeG > brew.aidenProfile.coffeeG ? "+" : ""}
                    {(brew.actualCoffeeG - brew.aidenProfile.coffeeG).toFixed(1)}g from {brew.aidenProfile.coffeeG}g
                  </span>
                </div>
              )}
              <Row label="Ratio (actual)" value={`${(brew.aidenProfile.waterG / brew.actualCoffeeG).toFixed(1)}:1 (${brew.actualCoffeeG}g / ${brew.aidenProfile.waterG}g)`} />
            </>
          ) : (
            <Row label="Ratio" value={`${ratio}:1 (${brew.aidenProfile.coffeeG}g / ${brew.aidenProfile.waterG}g)`} />
          )}
          <Row label="Temp" value={`${temp}°F`} />
          <Row label="Bloom" value={`${brew.aidenProfile.bloomWaterG}g / ${brew.aidenProfile.bloomTimeS}s`} />
          {(() => {
            const roastedOn = brew.beanBag?.roastedOn ?? brew.roastedOn;
            const openedOn = brew.beanBag?.openedOn ?? brew.openedOn;
            return (
              <>
                {roastedOn && <Row label="Roasted" value={format(new Date(roastedOn), "MMM d, yyyy")} />}
                {openedOn && <Row label="Bag opened" value={format(new Date(openedOn), "MMM d, yyyy")} />}
                {roastedOn && (() => {
                  const days = Math.round((new Date(brew.brewedAt).getTime() - new Date(roastedOn).getTime()) / 86400000);
                  return <Row label="Days from roast" value={`${days} days`} />;
                })()}
                {openedOn && brew.bagBrewIndex != null && (() => {
                  const days = Math.round((new Date(brew.brewedAt).getTime() - new Date(openedOn).getTime()) / 86400000);
                  return <Row label="Days since opening" value={`${days} days`} />;
                })()}
              </>
            );
          })()}
          {(brew as any).miscVars?.length > 0 && (
            <div className="pt-1">
              <p className="text-stone-500 text-xs mb-1.5">Misc</p>
              <div className="flex flex-wrap gap-1">
                {((brew as any).miscVars as string[]).map((v) => (
                  <span key={v} className="bg-amber-900/30 text-amber-400 text-xs px-2 py-0.5 rounded-full border border-amber-800/30">{v}</span>
                ))}
              </div>
            </div>
          )}
          {(brew as any).brewIssues?.length > 0 && (
            <div className="pt-1">
              <p className="text-stone-500 text-xs mb-1.5">Issues</p>
              <div className="flex flex-wrap gap-1">
                {((brew as any).brewIssues as string[]).map((issue) => (
                  <span key={issue} className="bg-red-900/40 text-red-300 text-xs px-2 py-0.5 rounded-full border border-red-800/40">{issue}</span>
                ))}
              </div>
            </div>
          )}
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
              <StrengthBar value={brew.tastingNote.strength} />
              <ScoreBar label="Sourness" value={brew.tastingNote.sourness} />
              {(brew.tastingNote as any).grindAroma != null && (
                <ScoreBar label="Grind Aroma" value={(brew.tastingNote as any).grindAroma} />
              )}
            </div>
            {(() => {
              const confirmed = (brew.tastingNote as any).confirmedTags as string[] | undefined;
              const missed = (brew.tastingNote as any).missedTags as string[] | undefined;
              const bonus = (brew.tastingNote as any).bonusTags as string[] | undefined;
              const legacy = brew.tastingNote.flavorTags;
              const hasNew = (confirmed?.length ?? 0) + (missed?.length ?? 0) + (bonus?.length ?? 0) > 0;
              return hasNew ? (
                <div className="space-y-1.5 mb-3">
                  {confirmed && confirmed.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {confirmed.map((t) => <span key={t} className="bg-amber-900/40 text-amber-300 text-xs px-2 py-0.5 rounded-full">✓ {t}</span>)}
                    </div>
                  )}
                  {bonus && bonus.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {bonus.map((t) => <span key={t} className="bg-sky-900/40 text-sky-300 text-xs px-2 py-0.5 rounded-full">★ {t}</span>)}
                    </div>
                  )}
                  {missed && missed.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {missed.map((t) => <span key={t} className="bg-stone-800 text-stone-600 text-xs px-2 py-0.5 rounded-full line-through">✗ {t}</span>)}
                    </div>
                  )}
                </div>
              ) : legacy.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {legacy.map((t) => <span key={t} className="bg-stone-800 text-stone-300 text-xs px-2 py-0.5 rounded-full">{t}</span>)}
                </div>
              ) : null;
            })()}
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
        <DeleteBrewButton brewId={id} />
      </div>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-baseline text-sm">
      <span className="text-stone-500">{label}</span>
      <span className="text-stone-300">{value}</span>
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

function StrengthBar({ value }: { value: number }) {
  // Integer values are the new -10..+10 format; non-integers are legacy 0-5 derived scores.
  const isNew = Number.isInteger(value);
  const score = isNew ? Math.max(0, 5 - Math.abs(value) * 0.5) : Math.min(value, 5);
  const scoreLabel = score % 1 === 0 ? String(score) : score.toFixed(1);
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-stone-500">Strength</span>
        <span className="text-stone-300 font-medium">{scoreLabel}/5</span>
      </div>
      <div className="h-1.5 bg-stone-800 rounded-full overflow-hidden">
        <div className="h-full bg-amber-600 rounded-full" style={{ width: `${(score / 5) * 100}%` }} />
      </div>
      {isNew && value !== 0 && (
        <div className="text-xs text-stone-600 mt-0.5 text-right">
          {value > 0 ? `too strong (+${value})` : `too weak (${value})`}
        </div>
      )}
    </div>
  );
}
