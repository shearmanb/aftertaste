import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const profiles = await prisma.waterProfile.findMany({ orderBy: { brand: "asc" } });
  return NextResponse.json(profiles);
}

export async function POST(req: Request) {
  const body = await req.json();
  const profile = await prisma.waterProfile.create({ data: body });
  return NextResponse.json(profile, { status: 201 });
}
