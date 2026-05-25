import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const cup = await prisma.outsideCup.findUnique({
      where: { id },
      include: { bean: { include: { producer: true } } },
    });
    if (!cup) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(cup);
  } catch (err) {
    console.error("GET /api/outside-cups/[id]:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const cup = await prisma.outsideCup.update({
      where: { id },
      data: body,
      include: { bean: { include: { producer: true } } },
    });
    return NextResponse.json(cup);
  } catch (err) {
    console.error("PATCH /api/outside-cups/[id]:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.outsideCup.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/outside-cups/[id]:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
