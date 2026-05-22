import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const brew = await prisma.brew.findUnique({
      where: { id },
      include: {
        bean: { include: { producer: true } },
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
    const { beanId, waterProfileId, filterProfileId, grindProfileId, aidenProfileId, roastedOn, openedOn, brewIssues } = await req.json();
    const brew = await prisma.brew.update({
      where: { id },
      data: {
        beanId,
        waterProfileId: waterProfileId || null,
        filterProfileId: filterProfileId || null,
        grindProfileId,
        aidenProfileId,
        roastedOn: roastedOn ? new Date(roastedOn) : null,
        openedOn: openedOn ? new Date(openedOn) : null,
        ...(brewIssues !== undefined && { brewIssues }),
      },
      include: {
        bean: { include: { producer: true } },
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
