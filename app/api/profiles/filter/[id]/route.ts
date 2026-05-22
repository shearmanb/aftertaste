import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const profile = await prisma.filterProfile.update({ where: { id }, data: body });
    return NextResponse.json(profile);
  } catch (err) {
    console.error("PATCH /api/profiles/filter/[id]:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.filterProfile.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("DELETE /api/profiles/filter/[id]:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
