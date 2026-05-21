import AppShell from "@/components/AppShell";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export const dynamic = "force-dynamic";

export default async function BrewsPage() {
  const brews = await prisma.brew.findMany({
    orderBy: { brewedAt: "desc" },
    include: { bean: true, grindProfile: true, tastingNote: true },
  });

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6 pt-2">
        <h1 className="text-xl font-bold text-stone-100">All Brews</h1>
        <Link href="/brew/new" className="bg-amber-600 hover:bg-amber-500 text-white font-bold w-10 h-10 rounded-full flex items-center justify-center text-xl transition-colors">+</Link>
      </div>

      {brews.length === 0 ? (
        <div className="text-center py-16 text-stone-500">
          <p className="text-4xl mb-3">☕</p>
          <p className="font-medium">No brews logged yet</p>
          <Link href="/brew/new" className="text-amber-500 underline text-sm mt-2 block">Log your first brew →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {brews.map((brew) => (
            <Link
              key={brew.id}
              href={`/brew/${brew.id}`}
              className="block bg-stone-900 border border-stone-800 hover:border-stone-600 rounded-xl p-4 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="font-semibold text-stone-100 truncate">{brew.bean.producer} — {brew.bean.name}</p>
                  <p className="text-stone-500 text-sm mt-0.5">
                    Grind {brew.grindOverride ?? brew.grindProfile.setting} ·{" "}
                    {formatDistanceToNow(new Date(brew.brewedAt), { addSuffix: true })}
                  </p>
                </div>
                <div className="ml-3 shrink-0 text-right">
                  {brew.tastingNote ? (
                    <>
                      <span className="text-amber-400 font-bold text-lg">{brew.tastingNote.overallScore}</span>
                      <span className="text-stone-600 text-xs">/10</span>
                    </>
                  ) : (
                    <span className="text-stone-600 text-xs italic">unrated</span>
                  )}
                </div>
              </div>
              {brew.tastingNote?.flavorTags && brew.tastingNote.flavorTags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {brew.tastingNote.flavorTags.slice(0, 3).map((tag) => (
                    <span key={tag} className="bg-stone-800 text-stone-400 text-xs px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}
