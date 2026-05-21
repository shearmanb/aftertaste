import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const beans = await prisma.bean.findMany({ orderBy: { producer: "asc" } });
  return NextResponse.json(beans);
}

export async function POST(req: Request) {
  const body = await req.json();
  const bean = await prisma.bean.create({ data: body });
  return NextResponse.json(bean, { status: 201 });
}
