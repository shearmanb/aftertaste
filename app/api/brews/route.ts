import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const BREW_INCLUDE = {
  bean: { include: { producer: true } },
  beanBag: true,
  grindProfile: true,
  aidenProfile: true,
  tastingNote: true,
} as const;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") ?? "20");
    const skip = parseInt(searchParams.get("skip") ?? "0");
    const beanId = searchParams.get("beanId") ?? undefined;
    const beanBagId = searchParams.get("beanBagId") ?? undefined;

    const brews = await prisma.brew.findMany({
      take: limit,
      skip,
      where: {
        ...(beanId ? { beanId } : {}),
        ...(beanBagId ? { beanBagId } : {}),
      },
      orderBy: { brewedAt: "desc" },
      include: BREW_INCLUDE,
    });
    return NextResponse.json(brews);
  } catch (err) {
    console.error("GET /api/brews:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const {
      beanId: rawBeanId,
      beanBagId,
      waterProfileId,
      filterProfileId,
      grindProfileId,
      aidenProfileId,
      roastedOn,
      openedOn,
      brewIssues,
      miscVars,
      actualCoffeeG,
      bagBrewIndex: rawBagBrewIndex,
    } = await req.json();

    let beanId = rawBeanId;
    let bagBrewIndex: number | undefined;

    if (beanBagId) {
      const bag = await prisma.beanBag.findUnique({
        where: { id: beanBagId },
        select: { beanId: true, _count: { select: { brews: true } } },
      });
      if (!bag) return NextResponse.json({ error: "BeanBag not found" }, { status: 404 });
      beanId = bag.beanId;
      bagBrewIndex = typeof rawBagBrewIndex === "number" ? rawBagBrewIndex : bag._count.brews + 1;
    }

    const brew = await prisma.brew.create({
      data: {
        beanId,
        beanBagId: beanBagId || undefined,
        bagBrewIndex,
        waterProfileId,
        filterProfileId,
        grindProfileId,
        aidenProfileId,
        roastedOn: roastedOn ? new Date(roastedOn) : undefined,
        openedOn: openedOn ? new Date(openedOn) : undefined,
        brewIssues: brewIssues ?? [],
        miscVars: miscVars ?? [],
        actualCoffeeG: typeof actualCoffeeG === "number" ? actualCoffeeG : undefined,
      },
      include: BREW_INCLUDE,
    });
    return NextResponse.json(brew, { status: 201 });
  } catch (err) {
    console.error("POST /api/brews:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
