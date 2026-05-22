import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const producers = await prisma.producer.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { beans: true } } },
  });
  return NextResponse.json(producers);
}

export async function POST(req: Request) {
  const body = await req.json();
  const producer = await prisma.producer.create({ data: body });
  return NextResponse.json(producer, { status: 201 });
}
