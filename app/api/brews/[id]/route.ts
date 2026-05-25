import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const brew = await prisma.brew.findUnique({
      where: { id },
      include: {
        bean: { include: { producer: true } },
        beanBag: true,
        waterProfile: true,
        filterProfile: true,
        grindProfile: true,
        aidenProfile: true,
        tastingNote: true,
      },
    });
    if (!brew) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(brew);
  } catch (err) {
    console.error("GET /api/brews/[id]:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { beanId, waterProfileId, filterProfileId, grindProfileId, aidenProfileId, roastedOn, openedOn, brewIssues, miscVars, actualCoffeeG } = body;
    const data: Record<string, unknown> = {};
    if (beanId !== undefined) data.beanId = beanId;
    if ("waterProfileId" in body) data.waterProfileId = waterProfileId || null;
    if ("filterProfileId" in body) data.filterProfileId = filterProfileId || null;
    if (grindProfileId !== undefined) data.grindProfileId = grindProfileId;
    if (aidenProfileId !== undefined) data.aidenProfileId = aidenProfileId;
    if ("roastedOn" in body) data.roastedOn = roastedOn ? new Date(roastedOn) : null;
    if ("openedOn" in body) data.openedOn = openedOn ? new Date(openedOn) : null;
    if (brewIssues !== undefined) data.brewIssues = brewIssues;
    if (miscVars !== undefined) data.miscVars = miscVars;
    if ("actualCoffeeG" in body) data.actualCoffeeG = typeof actualCoffeeG === "number" ? actualCoffeeG : null;
    const brew = await prisma.brew.update({
      where: { id },
      data,
      include: {
        bean: { include: { producer: true } },
        beanBag: true,
        waterProfile: true,
        filterProfile: true,
        grindProfile: true,
        aidenProfile: true,
      },
    });
    return NextResponse.json(brew);
  } catch (err) {
    console.error("PATCH /api/brews/[id]:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.brew.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("DELETE /api/brews/[id]:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
