import AppShell from "@/components/AppShell";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";

export const dynamic = "force-dynamic";

async function getRecentBrews() {
  try {
    return await prisma.brew.findMany({
      take: 5,
      orderBy: { brewedAt: "desc" },
      include: { bean: { include: { producer: true } }, grindProfile: true, tastingNote: true },
    });
  } catch {
    return [];
  }
}

function ScoreDots({ score, max = 10 }: { score: number; max?: number }) {
  return (
    <span className="text-amber-400 font-bold text-lg">{score}<span className="text-stone-500 text-sm">/{max}</span></span>
  );
}

export default async function DashboardPage() {
  const recentBrews = await getRecentBrews();
  const unratedCount = recentBrews.filter((b) => !b.tastingNote).length;

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6 pt-2">
        <h1 className="text-2xl font-bold text-amber-400">Aftertaste</h1>
        <Link
          href="/brew/new"
          className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xl w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-colors"
          aria-label="Log new brew"
        >
          +
        </Link>
      </div>

      {unratedCount > 0 && (
        <div className="bg-amber-900/30 border border-amber-700/40 rounded-xl p-4 mb-4">
          <p className="text-amber-300 text-sm font-medium">
            You have {unratedCount} unrated brew{unratedCount > 1 ? "s" : ""}.{" "}
            <Link href="/brews" className="underline">Rate now →</Link>
          </p>
        </div>
      )}

      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-stone-400 text-sm font-semibold uppercase tracking-wide">Recent Brews</h2>
          <Link href="/brews" className="text-amber-500 text-sm hover:text-amber-400">See all</Link>
        </div>

        {recentBrews.length === 0 ? (
          <div className="text-center py-12 text-stone-500">
            <p className="text-4xl mb-3">☕</p>
            <p className="font-medium">No brews yet</p>
            <p className="text-sm mt-1">Tap + to log your first brew</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentBrews.map((brew) => (
              <Link
                key={brew.id}
                href={`/brew/${brew.id}`}
                className="block bg-stone-900 border border-stone-800 rounded-xl p-4 hover:border-stone-600 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold text-stone-100 truncate">
                      {brew.bean.producer.name} — {brew.bean.name}
                    </p>
                    <p className="text-stone-500 text-sm mt-0.5">
                      Grind {brew.grindProfile.setting}{" · "}
                      {formatDistanceToNow(new Date(brew.brewedAt), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="ml-3 shrink-0">
                    {brew.tastingNote ? (
                      <ScoreDots score={brew.tastingNote.overallScore} />
                    ) : (
                      <span className="text-stone-600 text-sm italic">unrated</span>
                    )}
                  </div>
                </div>
                {brew.tastingNote?.flavorTags && brew.tastingNote.flavorTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {brew.tastingNote.flavorTags.slice(0, 4).map((tag) => (
                      <span key={tag} className="bg-stone-800 text-stone-400 text-xs px-2 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-stone-400 text-sm font-semibold uppercase tracking-wide mb-3">Quick Access</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { href: "/producers", label: "Producers", icon: "◈" },
            { href: "/beans", label: "Beans", icon: "◉" },
            { href: "/profiles/water", label: "Water", icon: "≋" },
            { href: "/profiles/filter", label: "Filters", icon: "▽" },
            { href: "/profiles/grind", label: "Grind Profiles", icon: "⚙" },
            { href: "/profiles/aiden", label: "Aiden Profiles", icon: "⊕" },
            { href: "/admin", label: "Control Panel", icon: "⚒" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="bg-stone-900 border border-stone-800 rounded-xl p-4 hover:border-stone-600 transition-colors flex items-center gap-3"
            >
              <span className="text-amber-500 text-xl">{item.icon}</span>
              <span className="text-stone-300 text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <div className="fixed bottom-20 right-3 z-10">
        <details className="group">
          <summary className="list-none cursor-pointer text-right">
            <span className="text-stone-500 text-base hover:text-stone-300 transition-colors select-none">·</span>
          </summary>
          <p className="text-stone-500 text-[10px] tabular-nums text-right mt-0.5 bg-stone-950/80 rounded px-1.5 py-0.5">
            {process.env.NEXT_PUBLIC_COMMIT_SHA}
            {" · "}
            {new Date(process.env.NEXT_PUBLIC_BUILD_TIME!).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
          </p>
        </details>
      </div>
    </AppShell>
  );
}
