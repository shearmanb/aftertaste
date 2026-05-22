import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateInsights } from "@/lib/claude";

export async function POST() {
  const brews = await prisma.brew.findMany({
    take: 60,
    orderBy: { brewedAt: "desc" },
    include: {
      bean: { include: { producer: true } },
      waterProfile: true,
      grindProfile: true,
      aidenProfile: true,
      tastingNote: true,
    },
  });

  if (brews.length === 0) {
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
      tasting: b.tastingNote
        ? {
            overall: b.tastingNote.overallScore,
            fruit: b.tastingNote.fruit,
            bitterness: b.tastingNote.bitterness,
            chocolate: b.tastingNote.chocolate,
            sourness: b.tastingNote.sourness,
            tags: b.tastingNote.flavorTags,
            notes: b.tastingNote.initialThoughts,
          }
        : null,
    })),
    null,
    2
  );

  const insights = await generateInsights(brewData);
  return NextResponse.json({ insights });
}
