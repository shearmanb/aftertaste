import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { producerId, name, region, roastLevel, process, tastingNotes, imageUrl, productUrl, notes } = await req.json();
    const bean = await prisma.bean.update({
      where: { id },
      data: {
        ...(producerId ? { producerId } : {}),
        name,
        region: region || null,
        roastLevel,
        process: process || null,
        tastingNotes: tastingNotes ?? [],
        imageUrl: imageUrl || null,
        productUrl: productUrl || null,
        notes: notes || null,
      },
      include: { producer: true },
    });
    return NextResponse.json(bean);
  } catch (err) {
    console.error("PATCH /api/beans/[id]:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.bean.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("DELETE /api/beans/[id]:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
