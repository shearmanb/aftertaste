import AppShell from "@/components/AppShell";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import BeanBagManager from "./BeanBagManager";

export const dynamic = "force-dynamic";

export default async function BeanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const bean = await prisma.bean.findUnique({
    where: { id },
    include: {
      producer: true,
      bags: {
        orderBy: { createdAt: "desc" },
        include: {
          brews: {
            select: { id: true, actualCoffeeG: true, aidenProfile: { select: { coffeeG: true } } },
          },
        },
      },
      brews: {
        orderBy: { brewedAt: "desc" },
        include: {
          beanBag: true,
          grindProfile: true,
          aidenProfile: true,
          tastingNote: { select: { overallScore: true, wouldBrewAgain: true } },
        },
      },
    },
  });

  if (!bean) notFound();

  return (
    <AppShell>
      <div className="flex items-center gap-3 mb-6 pt-2">
        <Link href="/beans" className="text-stone-400 hover:text-stone-200 text-2xl">‹</Link>
        <div className="min-w-0 flex-1">
          <h1 className="font-bold text-stone-100 truncate">{bean.producer.name}</h1>
          <p className="text-stone-500 text-sm truncate">{bean.name}</p>
        </div>
        <Link href="/beans" className="text-stone-500 hover:text-stone-300 text-sm">
          Edit
        </Link>
      </div>

      {bean.imageUrl && (
        <img src={bean.imageUrl} alt={bean.name} className="w-full h-48 object-cover rounded-xl mb-4" />
      )}

      <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 mb-4 space-y-2">
        <p className="text-stone-400 text-xs font-semibold uppercase tracking-wide mb-3">Details</p>
        <Row label="Producer" value={bean.producer.name} />
        <Row label="Name" value={bean.name} />
        {bean.region && <Row label="Region" value={bean.region} />}
        {bean.process && <Row label="Process" value={bean.process} />}
        <Row label="Roast" value={bean.roastLevel} />
        {bean.tastingNotes.length > 0 && (
          <div className="flex justify-between items-start pt-1">
            <span className="text-stone-500 text-sm">Bag notes</span>
            <div className="flex flex-wrap gap-1 justify-end max-w-[60%]">
              {bean.tastingNotes.map((n) => (
                <span key={n} className="bg-amber-900/30 text-amber-300 text-xs px-2 py-0.5 rounded-full">{n}</span>
              ))}
            </div>
          </div>
        )}
        {bean.notes && <p className="text-stone-600 text-xs italic pt-1">{bean.notes}</p>}
        {bean.productUrl && (
          <a href={bean.productUrl} target="_blank" rel="noopener noreferrer" className="block text-amber-500 text-xs hover:text-amber-400 pt-1">
            Product page →
          </a>
        )}
      </div>

      <BeanBagManager beanId={bean.id} initialBags={bean.bags.map((bag) => ({
        id: bag.id,
        beanId: bag.beanId,
        roastedOn: bag.roastedOn?.toISOString() ?? null,
        purchasedOn: bag.purchasedOn?.toISOString() ?? null,
        openedOn: bag.openedOn?.toISOString() ?? null,
        exhaustedOn: bag.exhaustedOn?.toISOString() ?? null,
        weightG: bag.weightG ?? null,
        notes: bag.notes ?? null,
        brewCount: bag.brews.length,
        gramsUsed: bag.brews.reduce((sum, b) => sum + (b.actualCoffeeG ?? b.aidenProfile.coffeeG), 0),
      }))} />

      <div className="mt-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-stone-400 text-xs font-semibold uppercase tracking-wide">
            All Brews <span className="text-stone-600 font-normal normal-case">({bean.brews.length})</span>
          </p>
          <Link href="/brew/new" className="text-amber-500 text-xs hover:text-amber-400">+ New brew</Link>
        </div>

        {bean.brews.length === 0 ? (
          <div className="text-center py-8 text-stone-600 text-sm">No brews yet for this bean.</div>
        ) : (
          <div className="space-y-2">
            {bean.brews.map((brew) => {
              const roastedOn = brew.beanBag?.roastedOn ?? brew.roastedOn;
              const daysFromRoast = roastedOn
                ? Math.round((new Date(brew.brewedAt).getTime() - new Date(roastedOn).getTime()) / 86400000)
                : null;
              return (
                <Link key={brew.id} href={`/brew/${brew.id}`}
                  className="block bg-stone-900 border border-stone-800 rounded-xl p-4 hover:border-stone-700 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-stone-300 text-sm font-medium">{format(new Date(brew.brewedAt), "MMM d, yyyy")}</p>
                        {brew.bagBrewIndex != null && (
                          <span className="bg-amber-900/40 text-amber-500 text-[10px] px-1.5 py-0.5 rounded-full border border-amber-800/40">
                            Brew #{brew.bagBrewIndex}
                          </span>
                        )}
                      </div>
                      <p className="text-stone-500 text-xs">
                        Grind {brew.grindProfile.setting} · {brew.aidenProfile.name}
                        {daysFromRoast != null && <span className="text-stone-600"> · {daysFromRoast}d from roast</span>}
                      </p>
                    </div>
                    {brew.tastingNote ? (
                      <div className="text-right shrink-0">
                        <span className="text-amber-400 font-bold">{brew.tastingNote.overallScore}</span>
                        <span className="text-stone-600 text-xs">/10</span>
                        {brew.tastingNote.wouldBrewAgain && (
                          <p className="text-green-500 text-[10px]">again ✓</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-stone-600 text-xs shrink-0">unrated</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
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
