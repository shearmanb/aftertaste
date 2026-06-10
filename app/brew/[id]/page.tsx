import AppShell from "@/components/AppShell";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import BrewAgainButton from "@/components/BrewAgainButton";
import DeleteBrewButton from "@/components/DeleteBrewButton";

export const dynamic = "force-dynamic";

function formatScore(n: number): string {
  if (Number.isInteger(n)) return String(n);
  const oneDp = Math.round(n * 10) / 10;
  if (Math.abs(oneDp - n) < 1e-9) return oneDp.toFixed(1);
  return n.toFixed(2);
}

function ScoreRing({ score }: { score: number }) {
  const r = 46;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, score / 10));
  const offset = c * (1 - pct);
  return (
    <svg width="104" height="104" viewBox="0 0 104 104" className="shrink-0">
      <defs>
        <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--accent-deep)" />
          <stop offset="100%" stopColor="var(--accent-bright)" />
        </linearGradient>
      </defs>
      <circle cx="52" cy="52" r={r} fill="none" stroke="oklch(1 0 0 / 0.08)" strokeWidth="7" />
      <circle
        cx="52" cy="52" r={r}
        fill="none"
        stroke="url(#ringGrad)"
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform="rotate(-90 52 52)"
      />
      <text x="52" y="52" textAnchor="middle" dominantBaseline="central" fontFamily="var(--font-plex-mono)" fontSize="26" fontWeight="600" fill="var(--accent-bright)">
        {formatScore(score)}
      </text>
      <text x="52" y="72" textAnchor="middle" fontFamily="var(--font-plex-mono)" fontSize="10" fill="var(--text-3)">
        / 10
      </text>
    </svg>
  );
}

function FlavorBar({ label, value, max = 5, cool = false }: { label: string; value: number; max?: number; cool?: boolean }) {
  const segs = Array.from({ length: max }, (_, i) => i < value);
  const fillStart = cool ? "oklch(0.55 0.10 240)" : "var(--accent-deep)";
  const fillEnd = cool ? "var(--cool)" : "var(--accent-bright)";
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-[12.5px] font-semibold" style={{ color: "var(--text-2)" }}>{label}</span>
        <span className="font-mono-plex text-[11px]" style={{ color: "var(--text-3)" }}>{value}/{max}</span>
      </div>
      <div className="flex gap-1">
        {segs.map((on, i) => (
          <div
            key={i}
            className="flex-1 h-[6px] rounded-[3px]"
            style={{
              background: on
                ? `linear-gradient(90deg, ${fillStart}, ${fillEnd})`
                : "oklch(1 0 0 / 0.07)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function StrengthFlavorBar({ value }: { value: number }) {
  const isNew = Number.isInteger(value);
  const score = isNew ? Math.max(0, 5 - Math.abs(value) * 0.5) : Math.min(value, 5);
  const segs = Math.round(score);
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-[12.5px] font-semibold" style={{ color: "var(--text-2)" }}>Strength</span>
        <span className="font-mono-plex text-[11px]" style={{ color: "var(--text-3)" }}>
          {isNew && value !== 0 ? (value > 0 ? `+${value}` : `${value}`) : `${score % 1 === 0 ? score : score.toFixed(1)}/5`}
        </span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className="flex-1 h-[6px] rounded-[3px]"
            style={{
              background: i < segs
                ? "linear-gradient(90deg, var(--accent-deep), var(--accent-bright))"
                : "oklch(1 0 0 / 0.07)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

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
  const tn = brew.tastingNote;

  return (
    <AppShell>
      <div className="flex items-start gap-3 pt-3">
        <Link href="/brews" aria-label="Back" className="at-back-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6" /></svg>
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-[21px] font-extrabold leading-[1.15] truncate" style={{ letterSpacing: "-0.03em" }}>
            {brew.bean.producer.name} — {brew.bean.name}
          </h1>
          <p className="font-mono-plex text-[11.5px] mt-1" style={{ color: "var(--text-3)" }}>
            {format(new Date(brew.brewedAt), "MMM d, yyyy · h:mm a")}
          </p>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <Link href={`/brew/new?from=${id}`} className="at-chip">
          <span className="inline-flex items-center gap-1.5">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 3v18M18 3v8a4 4 0 0 1-4 4H6" /></svg>
            Branch
          </span>
        </Link>
        <Link href={`/brew/${id}/edit`} className="at-chip">
          <span className="inline-flex items-center gap-1.5">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4v16h16v-7" /><path d="M18.5 2.5a2 2 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
            Edit
          </span>
        </Link>
      </div>

      <div className="flex flex-col gap-4 mt-5">
        {tn ? (
          <div className="at-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="at-eyebrow">Tasting Notes</span>
              <Link href={`/brew/${id}/taste`} className="at-link">Edit</Link>
            </div>
            <div className="flex items-center gap-5 my-2 mb-5">
              <ScoreRing score={tn.overallScore} />
              <div className="flex flex-col gap-2 min-w-0">
                {tn.initialThoughts ? (
                  <p className="text-[15px] font-semibold leading-snug" style={{ color: "var(--text-1)" }}>
                    “{tn.initialThoughts}”
                  </p>
                ) : (
                  <p className="text-[15px] font-semibold" style={{ color: "var(--text-1)" }}>
                    Overall score
                  </p>
                )}
                <p className="font-mono-plex text-[11px]" style={{ color: "var(--text-3)" }}>
                  {brew.aidenProfile.name}
                  {brew.bagBrewIndex != null && ` · brew #${brew.bagBrewIndex}`}
                </p>
                {tn.wouldBrewAgain && (
                  <span className="at-badge-good">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>
                    Would brew again
                  </span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-[22px] gap-y-4 mt-1">
              <FlavorBar label="Fruit" value={tn.fruit} />
              <FlavorBar label="Chocolate" value={tn.chocolate} />
              <StrengthFlavorBar value={tn.strength} />
              <FlavorBar label="Sourness" value={tn.sourness} cool />
              {(tn as any).clarity != null && (
                <FlavorBar label="Clarity" value={(tn as any).clarity} />
              )}
              {(tn as any).body != null && (
                <FlavorBar label="Body" value={(tn as any).body} />
              )}
              {(tn as any).grindAroma != null && (
                <FlavorBar label="Grind Aroma" value={(tn as any).grindAroma} />
              )}
            </div>
            {(() => {
              const confirmed = (tn as any).confirmedTags as string[] | undefined;
              const missed = (tn as any).missedTags as string[] | undefined;
              const bonus = (tn as any).bonusTags as string[] | undefined;
              const legacy = tn.flavorTags;
              const hasNew = (confirmed?.length ?? 0) + (missed?.length ?? 0) + (bonus?.length ?? 0) > 0;
              if (hasNew) {
                return (
                  <div className="space-y-1.5 mt-5">
                    {confirmed && confirmed.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {confirmed.map((t) => <span key={t} className="at-tag">✓ {t}</span>)}
                      </div>
                    )}
                    {bonus && bonus.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {bonus.map((t) => (
                          <span key={t} className="font-mono-plex text-[10.5px] px-[9px] py-[2px] rounded-full" style={{ color: "var(--cool)", background: "oklch(0.74 0.11 240 / 0.14)", border: "1px solid oklch(0.74 0.11 240 / 0.32)" }}>★ {t}</span>
                        ))}
                      </div>
                    )}
                    {missed && missed.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {missed.map((t) => <span key={t} className="at-tag neutral line-through">✗ {t}</span>)}
                      </div>
                    )}
                  </div>
                );
              }
              return legacy.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 mt-5">
                  {legacy.map((t) => <span key={t} className="at-tag neutral">{t}</span>)}
                </div>
              ) : null;
            })()}
            {tn.drinkingTempF && (
              <p className="font-mono-plex text-[11.5px] mt-4" style={{ color: "var(--text-3)" }}>
                Drinking temp: {tn.drinkingTempF}°F
              </p>
            )}
          </div>
        ) : (
          <Link href={`/brew/${id}/taste`} className="at-card block p-4 text-center font-semibold" style={{ background: "var(--accent-soft)", borderColor: "var(--accent-line)", color: "var(--accent-bright)" }}>
            + Rate this brew
          </Link>
        )}

        <div className="at-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="at-eyebrow">Bean</span>
            {brew.bagBrewIndex != null && (
              <span className="at-tag">Brew #{brew.bagBrewIndex} from bag</span>
            )}
          </div>
          <div className="flex flex-col">
            <Row k="Producer" v={brew.bean.producer.name} />
            <Row k="Name" v={brew.bean.name} />
            {brew.bean.region && <Row k="Region" v={brew.bean.region} />}
            {brew.bean.process && <Row k="Process" v={brew.bean.process} />}
            <Row k="Roast" v={brew.bean.roastLevel} accent />
          </div>
        </div>

        <div className="at-card p-5">
          <p className="at-eyebrow mb-3">Brew Settings</p>
          <div className="flex flex-col">
            {brew.waterProfile ? (
              <Row k="Water" v={brew.waterProfile.brand + (brew.waterProfile.additives ? ` · ${brew.waterProfile.additives}` : "")} />
            ) : (
              <div className="at-row">
                <span className="k">Water</span>
                <Link href={`/brew/${id}/edit`} className="at-link">Set water profile →</Link>
              </div>
            )}
            {brew.filterProfile && <Row k="Filter" v={brew.filterProfile.name} />}
            <Row k="Grind" v={`${grind} (Ode Gen 2)`} />
            <Row k="Profile" v={brew.aidenProfile.name} />
            {brew.actualCoffeeG != null ? (
              <>
                <Row k="Coffee used" v={`${brew.actualCoffeeG}g`} />
                {brew.actualCoffeeG !== brew.aidenProfile.coffeeG && (
                  <div className="at-row">
                    <span className="k">vs. profile</span>
                    <span className="v" style={{ color: brew.actualCoffeeG > brew.aidenProfile.coffeeG ? "var(--accent-bright)" : "var(--cool)" }}>
                      {brew.actualCoffeeG > brew.aidenProfile.coffeeG ? "+" : ""}
                      {(brew.actualCoffeeG - brew.aidenProfile.coffeeG).toFixed(1)}g from {brew.aidenProfile.coffeeG}g
                    </span>
                  </div>
                )}
                <Row k="Ratio" v={`${(brew.aidenProfile.waterG / brew.actualCoffeeG).toFixed(1)}:1 (${brew.actualCoffeeG}g / ${brew.aidenProfile.waterG}g)`} />
              </>
            ) : (
              <Row k="Ratio" v={`${ratio}:1 (${brew.aidenProfile.coffeeG}g / ${brew.aidenProfile.waterG}g)`} />
            )}
            <Row k="Temp" v={`${temp}°F`} />
            <Row k="Bloom" v={`${brew.aidenProfile.bloomWaterG}g / ${brew.aidenProfile.bloomTimeS}s`} />
            {(() => {
              const roastedOn = brew.beanBag?.roastedOn ?? brew.roastedOn;
              const openedOn = brew.beanBag?.openedOn ?? brew.openedOn;
              return (
                <>
                  {roastedOn && <Row k="Roasted" v={format(new Date(roastedOn), "MMM d, yyyy")} />}
                  {openedOn && <Row k="Bag opened" v={format(new Date(openedOn), "MMM d, yyyy")} />}
                  {roastedOn && (() => {
                    const days = Math.round((new Date(brew.brewedAt).getTime() - new Date(roastedOn).getTime()) / 86400000);
                    return <Row k="Days from roast" v={`${days} days`} />;
                  })()}
                  {openedOn && brew.bagBrewIndex != null && (() => {
                    const days = Math.round((new Date(brew.brewedAt).getTime() - new Date(openedOn).getTime()) / 86400000);
                    return <Row k="Days since opening" v={`${days} days`} />;
                  })()}
                </>
              );
            })()}
            {(brew as any).miscVars?.length > 0 && (
              <div className="pt-3 border-t mt-2" style={{ borderColor: "var(--hairline)" }}>
                <p className="at-eyebrow mb-2">Misc</p>
                <div className="flex flex-wrap gap-1.5">
                  {((brew as any).miscVars as string[]).map((v) => (
                    <span key={v} className="at-tag">{v}</span>
                  ))}
                </div>
              </div>
            )}
            {(brew as any).brewIssues?.length > 0 && (
              <div className="pt-3 border-t mt-2" style={{ borderColor: "var(--hairline)" }}>
                <p className="at-eyebrow mb-2">Issues</p>
                <div className="flex flex-wrap gap-1.5">
                  {((brew as any).brewIssues as string[]).map((issue) => (
                    <span key={issue} className="font-mono-plex text-[10.5px] px-[9px] py-[2px] rounded-full" style={{ color: "oklch(0.78 0.13 25)", background: "oklch(0.55 0.18 25 / 0.14)", border: "1px solid oklch(0.55 0.18 25 / 0.32)" }}>{issue}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <BrewAgainButton brewId={id} />
        <DeleteBrewButton brewId={id} />
      </div>
    </AppShell>
  );
}

function Row({ k, v, accent }: { k: string; v: string; accent?: boolean }) {
  return (
    <div className="at-row">
      <span className="k">{k}</span>
      <span className="v" style={accent ? { color: "var(--accent-bright)" } : undefined}>{v}</span>
    </div>
  );
}
