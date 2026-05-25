import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OutsideCupPatchSchema } from "@/lib/schemas";

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
    const parsed = OutsideCupPatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
    }
    const { visitedAt, beanId, ...rest } = parsed.data;
    const cup = await prisma.outsideCup.update({
      where: { id },
      data: {
        ...rest,
        ...(visitedAt !== undefined ? { visitedAt: new Date(visitedAt) } : {}),
        ...(beanId !== undefined ? { beanId: beanId ?? null } : {}),
      },
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
