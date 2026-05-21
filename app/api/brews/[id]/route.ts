import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const brew = await prisma.brew.findUnique({
    where: { id },
    include: { bean: true, grindProfile: true, aidenProfile: true, tastingNote: true },
  });
  if (!brew) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(brew);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.brew.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
