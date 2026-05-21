import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const note = await prisma.tastingNote.upsert({
    where: { brewId: id },
    create: { ...body, brewId: id },
    update: body,
  });
  return NextResponse.json(note, { status: 201 });
}
