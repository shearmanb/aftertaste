import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const skip = parseInt(searchParams.get("skip") ?? "0");
  const beanId = searchParams.get("beanId") ?? undefined;

  const brews = await prisma.brew.findMany({
    take: limit,
    skip,
    where: beanId ? { beanId } : undefined,
    orderBy: { brewedAt: "desc" },
    include: {
      bean: { include: { producer: true } },
      grindProfile: true,
      aidenProfile: true,
      tastingNote: true,
    },
  });
  return NextResponse.json(brews);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { beanId, waterProfileId, grindProfileId, aidenProfileId, roastedOn, openedOn } = body;
  const brew = await prisma.brew.create({
    data: {
      beanId, waterProfileId, grindProfileId, aidenProfileId,
      roastedOn: roastedOn ? new Date(roastedOn) : undefined,
      openedOn: openedOn ? new Date(openedOn) : undefined,
    },
    include: {
      bean: { include: { producer: true } },
      waterProfile: true,
      grindProfile: true,
      aidenProfile: true,
    },
  });
  return NextResponse.json(brew, { status: 201 });
}
