import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const beans = await prisma.bean.findMany({
    orderBy: { producer: { name: "asc" } },
    include: { producer: true },
  });
  return NextResponse.json(beans);
}

export async function POST(req: Request) {
  const { producerId, ...rest } = await req.json();
  const bean = await prisma.bean.create({
    data: { ...rest, producerId },
    include: { producer: true },
  });
  return NextResponse.json(bean, { status: 201 });
}
