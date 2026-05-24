import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const beanId = searchParams.get("beanId") ?? undefined;
    const bags = await prisma.beanBag.findMany({
      where: beanId ? { beanId } : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        bean: { include: { producer: true } },
        brews: { select: { id: true, actualCoffeeG: true, aidenProfile: { select: { coffeeG: true } } } },
      },
    });
    return NextResponse.json(bags);
  } catch (err) {
    console.error("GET /api/bean-bags:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { beanId, roastedOn, purchasedOn, openedOn, exhaustedOn, weightG, notes } = await req.json();
    const bag = await prisma.beanBag.create({
      data: {
        beanId,
        roastedOn: roastedOn ? new Date(roastedOn) : undefined,
        purchasedOn: purchasedOn ? new Date(purchasedOn) : undefined,
        openedOn: openedOn ? new Date(openedOn) : undefined,
        exhaustedOn: exhaustedOn ? new Date(exhaustedOn) : undefined,
        weightG: typeof weightG === "number" ? weightG : undefined,
        notes: notes || undefined,
      },
      include: {
        bean: { include: { producer: true } },
        brews: { select: { id: true, actualCoffeeG: true, aidenProfile: { select: { coffeeG: true } } } },
      },
    });
    return NextResponse.json(bag, { status: 201 });
  } catch (err) {
    console.error("POST /api/bean-bags:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
