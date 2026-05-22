import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") ?? undefined;
    const options = await prisma.dropdownOption.findMany({
      where: category ? { category } : undefined,
      orderBy: { value: "asc" },
    });
    return NextResponse.json(options);
  } catch (err) {
    console.error("GET /api/options:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { category, value } = await req.json();
    const option = await prisma.dropdownOption.create({ data: { category, value: value.trim() } });
    return NextResponse.json(option, { status: 201 });
  } catch (err) {
    console.error("POST /api/options:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
