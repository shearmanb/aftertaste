import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateInsights } from "@/lib/claude";

export async function POST() {
  const [brews, outsideCups] = await Promise.all([
    prisma.brew.findMany({
      take: 60,
      orderBy: { brewedAt: "desc" },
      include: {
        bean: { include: { producer: true } },
        waterProfile: true,
        grindProfile: true,
        aidenProfile: true,
        tastingNote: true,
      },
    }),
    prisma.outsideCup.findMany({
      take: 30,
      orderBy: { visitedAt: "desc" },
      include: { bean: { include: { producer: true } } },
    }),
  ]);

  if (brews.length === 0 && outsideCups.length === 0) {
    return NextResponse.json({ insights: "No brews logged yet. Start brewing!" });
  }

  const brewData = JSON.stringify(
    brews.map((b) => ({
      date: b.brewedAt,
      bean: `${b.bean.producer.name} - ${b.bean.name} (${b.bean.region ?? "unknown"}, ${b.bean.roastLevel}${b.bean.process ? `, ${b.bean.process}` : ""})`,
      water: b.waterProfile ? b.waterProfile.brand + (b.waterProfile.additives ? ` · ${b.waterProfile.additives}` : "") : "unknown",
      grind: b.grindProfile.setting,
      tempF: b.aidenProfile.tempF,
      ratio: `${b.aidenProfile.waterG}g water / ${b.aidenProfile.coffeeG}g coffee`,
      bloomTime: b.aidenProfile.bloomTimeS,
      issues: b.brewIssues.length > 0 ? b.brewIssues : undefined,
      tasting: b.tastingNote
        ? {
            overall: b.tastingNote.overallScore,
            fruit: b.tastingNote.fruit,
            strength: b.tastingNote.strength,
            chocolate: b.tastingNote.chocolate,
            sourness: b.tastingNote.sourness,
            clarity: b.tastingNote.clarity,
            body: b.tastingNote.body,
            tags: b.tastingNote.flavorTags,
            notes: b.tastingNote.initialThoughts,
          }
        : null,
    })),
    null,
    2
  );

  const outsideData = outsideCups.length > 0
    ? JSON.stringify(
        outsideCups.map((c) => ({
          date: c.visitedAt,
          location: c.location + (c.locationNote ? ` (${c.locationNote})` : ""),
          method: c.method,
          bean: c.bean ? `${c.bean.producer.name} - ${c.bean.name}` : "unknown",
          score: c.overallScore,
          notes: c.notes,
        })),
        null,
        2
      )
    : null;

  try {
    const insights = await generateInsights(brewData, outsideData ?? undefined);
    return NextResponse.json({ insights });
  } catch (err) {
    console.error("Insights generation failed:", err);
    return NextResponse.json({ insights: "Unable to generate insights right now. Please try again." });
  }
}
