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