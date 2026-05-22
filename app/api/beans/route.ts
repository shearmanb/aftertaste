import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const beans = await prisma.bean.findMany({
      orderBy: { createdAt: "asc" },
      include: { producer: true },
    });
    return NextResponse.json(beans.filter((b) => b.producer !== null));
  } catch (err) {
    console.error("GET /api/beans:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { producerId, name, region, roastLevel, process, tastingNotes, imageUrl, productUrl, notes } = await req.json();
    const bean = await prisma.bean.create({
      data: {
        producerId,
        name,
        region: region || undefined,
        roastLevel,
        process: process || undefined,
        tastingNotes: tastingNotes ?? [],
        imageUrl: imageUrl || undefined,
        productUrl: productUrl || undefined,
        notes: notes || undefined,
      },
      include: { producer: true },
    });
    return NextResponse.json(bean, { status: 201 });
  } catch (err) {
    console.error("POST /api/beans:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
