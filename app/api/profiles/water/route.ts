import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const profiles = await prisma.waterProfile.findMany({ orderBy: { brand: "asc" } });
    return NextResponse.json(profiles);
  } catch (err) {
    console.error("GET /api/profiles/water:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const profile = await prisma.waterProfile.create({ data: body });
    return NextResponse.json(profile, { status: 201 });
  } catch (err) {
    console.error("POST /api/profiles/water:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
