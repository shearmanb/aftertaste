import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") ?? "20");
    const skip = parseInt(searchParams.get("skip") ?? "0");
    const beanId = searchParams.get("beanId") ?? undefined;

    const brews = await prisma.brew.findMany({
      take: limit,
      skip,
      where: beanId ? { beanId } : undefined,
      orderBy: { brewedAt: "desc" },
      include: {
        bean: { include: { producer: true } },
        grindProfile: true,
        aidenProfile: true,
        tastingNote: true,
      },
    });
    return NextResponse.json(brews);
  } catch (err) {
    console.error("GET /api/brews:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { beanId, waterProfileId, filterProfileId, grindProfileId, aidenProfileId, roastedOn, openedOn } = await req.json();
    const brew = await prisma.brew.create({
      data: {
        beanId, waterProfileId, filterProfileId, grindProfileId, aidenProfileId,
        roastedOn: roastedOn ? new Date(roastedOn) : undefined,
        openedOn: openedOn ? new Date(openedOn) : undefined,
      },
      include: {
        bean: { include: { producer: true } },
        waterProfile: true,
        filterProfile: true,
        grindProfile: true,
        aidenProfile: true,
      },
    });
    return NextResponse.json(brew, { status: 201 });
  } catch (err) {
    console.error("POST /api/brews:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
