import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { roastedOn, purchasedOn, openedOn, exhaustedOn, weightG, notes } = body;
    const data: Record<string, unknown> = {};
    if ("roastedOn" in body) data.roastedOn = roastedOn ? new Date(roastedOn) : null;
    if ("purchasedOn" in body) data.purchasedOn = purchasedOn ? new Date(purchasedOn) : null;
    if ("openedOn" in body) data.openedOn = openedOn ? new Date(openedOn) : null;
    if ("exhaustedOn" in body) data.exhaustedOn = exhaustedOn ? new Date(exhaustedOn) : null;
    if ("weightG" in body) data.weightG = typeof weightG === "number" ? weightG : null;
    if ("notes" in body) data.notes = notes || null;
    const bag = await prisma.beanBag.update({
      where: { id },
      data,
      include: {
        bean: { include: { producer: true } },
        brews: { select: { id: true, actualCoffeeG: true, aidenProfile: { select: { coffeeG: true } } } },
      },
    });
    return NextResponse.json(bag);
  } catch (err) {
    console.error("PATCH /api/bean-bags/[id]:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.beanBag.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("DELETE /api/bean-bags/[id]:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
