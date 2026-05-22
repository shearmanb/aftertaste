import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { name, quality, beanNotes, variance, website } = await req.json();
    const producer = await prisma.producer.update({
      where: { id },
      data: {
        name,
        quality: quality || null,
        beanNotes: beanNotes || null,
        variance: variance || null,
        website: website || null,
      },
    });
    return NextResponse.json(producer);
  } catch (err) {
    console.error("PATCH /api/producers/[id]:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.producer.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("DELETE /api/producers/[id]:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
