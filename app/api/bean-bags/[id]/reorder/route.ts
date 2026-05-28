import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { orderedBrewIds } = await req.json();

    if (!Array.isArray(orderedBrewIds) || orderedBrewIds.length === 0) {
      return NextResponse.json({ error: "orderedBrewIds must be a non-empty array" }, { status: 400 });
    }

    const existing = await prisma.brew.findMany({
      where: { beanBagId: id },
      select: { id: true },
    });
    const existingIds = new Set(existing.map((b) => b.id));
    for (const brewId of orderedBrewIds) {
      if (!existingIds.has(brewId)) {
        return NextResponse.json({ error: `Brew ${brewId} does not belong to this bag` }, { status: 400 });
      }
    }

    await prisma.$transaction(
      orderedBrewIds.map((brewId: string, index: number) =>
        prisma.brew.update({
          where: { id: brewId },
          data: { bagBrewIndex: index + 1 },
        })
      )
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/bean-bags/[id]/reorder:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
