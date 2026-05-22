import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const producers = await prisma.producer.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { beans: true } } },
    });
    return NextResponse.json(producers);
  } catch (err) {
    console.error("GET /api/producers:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, quality, beanNotes, variance, website } = await req.json();
    const producer = await prisma.producer.create({
      data: {
        name,
        quality: quality || undefined,
        beanNotes: beanNotes || undefined,
        variance: variance || undefined,
        website: website || undefined,
      },
    });
    return NextResponse.json(producer, { status: 201 });
  } catch (err) {
    console.error("POST /api/producers:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
