import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { value } = await req.json();
    const option = await prisma.dropdownOption.update({
      where: { id },
      data: { value: value.trim() },
    });
    return NextResponse.json(option);
  } catch (err) {
    console.error("PATCH /api/options/[id]:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.dropdownOption.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("DELETE /api/options/[id]:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
