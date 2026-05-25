import AppShell from "@/components/AppShell";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function OutsideCupsPage() {
  const cups = await prisma.outsideCup.findMany({
    orderBy: { visitedAt: "desc" },
    include: { bean: { include: { producer: true } } },
  });

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6 pt-2">
        <h1 className="text-xl font-bold text-stone-100">Outside Cups</h1>
        <Link
          href="/outside-cup/new"
          className="bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          + Log cup
        </Link>
      </div>

      {cups.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-stone-500 text-lg mb-2">No outside cups yet</p>
          <p className="text-stone-600 text-sm mb-6">Log coffee you have at cafés and shops</p>
          <Link
            href="/outside-cup/new"
            className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Log your first cup
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {cups.map((cup) => (
            <Link
              key={cup.id}
              href={`/outside-cup/${cup.id}`}
              className="block bg-stone-900 border border-stone-800 rounded-xl p-4 hover:border-stone-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-stone-100 truncate">{cup.location}</p>
                  {cup.locationNote && (
                    <p className="text-stone-500 text-xs truncate">{cup.locationNote}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs text-amber-600/80 font-medium">{cup.method}</span>
                    {cup.bean && (
                      <span className="text-xs text-stone-500">
                        · {cup.bean.producer.name} {cup.bean.name}
                      </span>
                    )}
                  </div>
                  <p className="text-stone-600 text-xs mt-1">
                    {format(new Date(cup.visitedAt), "MMM d, yyyy")}
                  </p>
                </div>
                {cup.overallScore != null && (
                  <span className="text-2xl font-bold text-amber-400 shrink-0">
                    {cup.overallScore % 1 === 0 ? cup.overallScore : cup.overallScore.toFixed(1)}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}
