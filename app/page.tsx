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

function formatScore(n: number): string {
  if (Number.isInteger(n)) return String(n);
  const oneDp = Math.round(n * 10) / 10;
  if (Math.abs(oneDp - n) < 1e-9) return oneDp.toFixed(1);
  return n.toFixed(2);
}

function scoreColor(score: number): string {
  if (score >= 8) return "var(--accent-bright)";
  if (score >= 7) return "var(--text-1)";
  return "var(--text-2)";
}

function CupMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 8h12v6a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V8Z" />
      <path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17" />
      <path d="M9 4c0 1 1 1.5 1 2.5M12 4c0 1 1 1.5 1 2.5" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function QAIcon({ d }: { d: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const QA_ICONS: Record<string, string> = {
  producers: "M4 20V8l8-4 8 4v12M9 20v-6h6v6",
  beans: "M7 4c5 0 10 3 10 9s-5 7-10 7-4-5-4-8 0-8 4-8ZM9 6c2 2 2 10-2 12",
  water: "M5 13c2-2 4-2 6 0s4 2 6 0M5 17c2-2 4-2 6 0s4 2 6 0M5 9c2-2 4-2 6 0s4 2 6 0",
  filter: "M4 5h16l-6 8v6l-4-2v-4Z",
  grind: "M12 4v3M12 17v3M4 12h3M17 12h3M6.5 6.5l2 2M15.5 15.5l2 2M6.5 17.5l2-2M15.5 8.5l2-2",
  recipe: "M5 4h10l4 4v12H5zM9 9h6M9 13h6M9 17h4",
  stats: "M4 20V10M10 20V4M16 20v-7M22 20H2",
  compare: "M7 7h12l-3-3M17 17H5l3 3",
  control: "M4 7h16M4 12h10M4 17h16M16 10v4",
};

export default async function DashboardPage() {
  const recentBrews = await getRecentBrews();
  const unratedCount = recentBrews.filter((b) => !b.tastingNote).length;

  const quickAccess = [
    { href: "/producers", label: "Producers", icon: "producers" },
    { href: "/beans", label: "Beans", icon: "beans" },
    { href: "/profiles/water", label: "Water", icon: "water" },
    { href: "/profiles/filter", label: "Filters", icon: "filter" },
    { href: "/profiles/grind", label: "Grind", icon: "grind" },
    { href: "/profiles/aiden", label: "Aiden", icon: "recipe" },
    { href: "/stats", label: "Statistics", icon: "stats" },
    { href: "/compare", label: "Compare", icon: "compare" },
    { href: "/admin", label: "Control Panel", icon: "control" },
  ];

  return (
    <AppShell>
      <header className="flex items-center justify-between pt-3 pb-1">
        <div className="flex items-center gap-3">
          <span className="at-mark"><CupMark /></span>
          <span
            className="text-[23px] font-extrabold"
            style={{ letterSpacing: "-0.03em" }}
          >
            Aftertaste
          </span>
        </div>
        <Link href="/brew/new" aria-label="Log new brew" className="at-add-btn">
          <PlusIcon />
        </Link>
      </header>

      {unratedCount > 0 && (
        <div
          className="mt-4 rounded-[14px] px-4 py-3"
          style={{
            background: "var(--accent-soft)",
            border: "1px solid var(--accent-line)",
          }}
        >
          <p className="text-sm font-medium" style={{ color: "var(--accent-bright)" }}>
            You have {unratedCount} unrated brew{unratedCount > 1 ? "s" : ""}.{" "}
            <Link href="/brews" className="underline">Rate now →</Link>
          </p>
        </div>
      )}

      <section>
        <div className="flex items-baseline justify-between mt-[30px] mx-[2px] mb-[13px]">
          <span className="at-eyebrow">Recent Brews</span>
          <Link href="/brews" className="at-link">See all</Link>
        </div>

        {recentBrews.length === 0 ? (
          <div
            className="at-card text-center py-12"
            style={{ color: "var(--text-3)" }}
          >
            <p className="text-4xl mb-3">☕</p>
            <p className="font-medium" style={{ color: "var(--text-2)" }}>No brews yet</p>
            <p className="text-sm mt-1">Tap + to log your first brew</p>
          </div>
        ) : (
          <div>
            {recentBrews.map((brew) => {
              const title = `${brew.bean.producer.name} — ${brew.bean.name}`;
              const score = brew.tastingNote?.overallScore;
              const flavorTag = brew.tastingNote?.flavorTags?.[0];
              return (
                <Link
                  key={brew.id}
                  href={`/brew/${brew.id}`}
                  className="at-card at-press flex items-stretch justify-between mb-[11px] px-[18px] py-4"
                >
                  <div className="min-w-0 flex flex-col gap-[7px]">
                    <p
                      className="text-[16px] font-bold leading-tight truncate"
                      style={{ letterSpacing: "-0.01em", color: "var(--text-1)" }}
                    >
                      {title}
                    </p>
                    <div className="flex items-center gap-[9px]">
                      <span
                        className="font-mono-plex text-[11.5px]"
                        style={{ color: "var(--text-3)", letterSpacing: "0.02em" }}
                      >
                        {formatDistanceToNow(new Date(brew.brewedAt), { addSuffix: true })}
                      </span>
                      {flavorTag && <span className="at-tag">{flavorTag}</span>}
                    </div>
                  </div>
                  <div className="ml-3 shrink-0 flex flex-col items-end justify-between">
                    {typeof score === "number" ? (
                      <>
                        <div className="flex items-baseline gap-1">
                          <span
                            className="font-mono-plex text-[26px] font-semibold leading-none"
                            style={{ color: scoreColor(score) }}
                          >
                            {formatScore(score)}
                          </span>
                          <span
                            className="font-mono-plex text-[12px]"
                            style={{ color: "var(--text-3)" }}
                          >
                            /10
                          </span>
                        </div>
                        <div className="at-score-meter mt-2">
                          <span style={{ width: `${Math.min(100, (score / 10) * 100)}%` }} />
                        </div>
                      </>
                    ) : (
                      <span className="at-tag neutral">unrated</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-baseline justify-between mt-[30px] mx-[2px] mb-[13px]">
          <span className="at-eyebrow">Quick Access</span>
        </div>
        <div className="grid grid-cols-2 gap-[11px]">
          {quickAccess.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="at-card at-press flex items-center gap-3 p-[15px]"
            >
              <span className="at-qa-icon">
                <QAIcon d={QA_ICONS[item.icon]} />
              </span>
              <span
                className="text-[13.5px] font-semibold"
                style={{ letterSpacing: "-0.01em", color: "var(--text-1)" }}
              >
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <div className="fixed bottom-24 right-3 z-10">
        <details className="group">
          <summary className="list-none cursor-pointer text-right">
            <span
              className="text-base select-none"
              style={{ color: "var(--text-3)" }}
            >
              ·
            </span>
          </summary>
          <p
            className="font-mono-plex text-[10px] text-right mt-0.5 rounded px-1.5 py-0.5"
            style={{
              color: "var(--text-3)",
              background: "oklch(0.10 0.004 58 / 0.8)",
            }}
          >
            {process.env.NEXT_PUBLIC_COMMIT_SHA}
            {" · "}
            {process.env.NEXT_PUBLIC_BUILD_TIME
              ? new Date(process.env.NEXT_PUBLIC_BUILD_TIME).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
              : "—"}
          </p>
        </details>
      </div>
    </AppShell>
  );
}
