import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [brews, outsideCups, beans, producers] = await Promise.all([
      prisma.brew.findMany({
        orderBy: { brewedAt: "desc" },
        include: {
          bean: { include: { producer: true } },
          beanBag: true,
          grindProfile: true,
          aidenProfile: true,
          waterProfile: true,
          filterProfile: true,
          tastingNote: true,
        },
      }),
      prisma.outsideCup.findMany({
        orderBy: { visitedAt: "desc" },
        include: { bean: { include: { producer: true } } },
      }),
      prisma.bean.findMany({ include: { producer: true } }),
      prisma.producer.findMany(),
    ]);

    const payload = {
      exportedAt: new Date().toISOString(),
      counts: {
        brews: brews.length,
        outsideCups: outsideCups.length,
        beans: beans.length,
        producers: producers.length,
      },
      brews,
      outsideCups,
      beans,
      producers,
    };

    const date = new Date().toISOString().slice(0, 10);
    return new NextResponse(JSON.stringify(payload, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="aftertaste-${date}.json"`,
      },
    });
  } catch (err) {
    console.error("GET /api/export:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
