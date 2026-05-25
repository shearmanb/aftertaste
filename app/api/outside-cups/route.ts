import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OutsideCupSchema } from "@/lib/schemas";

export async function GET() {
  try {
    const cups = await prisma.outsideCup.findMany({
      orderBy: { visitedAt: "desc" },
      include: { bean: { include: { producer: true } } },
    });
    return NextResponse.json(cups);
  } catch (err) {
    console.error("GET /api/outside-cups:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = OutsideCupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
    }
    const { visitedAt, beanId, ...rest } = parsed.data;
    const cup = await prisma.outsideCup.create({
      data: {
        ...rest,
        ...(visitedAt ? { visitedAt: new Date(visitedAt) } : {}),
        ...(beanId ? { beanId } : {}),
      },
      include: { bean: { include: { producer: true } } },
    });
    return NextResponse.json(cup, { status: 201 });
  } catch (err) {
    console.error("POST /api/outside-cups:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
