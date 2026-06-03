"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { WaterProfile, FilterProfile, Producer, Bean, BeanBag, GrindProfile, AidenProfile, Pour } from "@/lib/types";

async function requireAuth() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
}

export async function createWaterProfile(data: {
  brand: string;
  additives?: string;
}): Promise<WaterProfile> {
  await requireAuth();
  return prisma.waterProfile.create({
    data,
    select: { id: true, brand: true, additives: true },
  });
}

export async function createFilterProfile(data: {
  name: string;
}): Promise<FilterProfile> {
  await requireAuth();
  return prisma.filterProfile.create({
    data,
    select: { id: true, name: true },
  });
}

export async function createProducer(data: {
  name: string;
}): Promise<Producer> {
  await requireAuth();
  return prisma.producer.create({
    data,
    select: { id: true, name: true },
  });
}

export async function createBean(data: {
  producerId: string;
  name: string;
  roastLevel: string;
  region?: string;
  process?: string;
}): Promise<Bean> {
  await requireAuth();
  return prisma.bean.create({
    data,
    select: {
      id: true,
      name: true,
      roastLevel: true,
      region: true,
      process: true,
      producer: { select: { id: true, name: true } },
    },
  });
}

export async function createBeanBag(data: {
  beanId: string;
  roastedOn?: string;
  openedOn?: string;
  weightG?: number;
  notes?: string;
}): Promise<BeanBag> {
  await requireAuth();
  const bag = await prisma.beanBag.create({
    data: {
      beanId: data.beanId,
      roastedOn: data.roastedOn ? new Date(data.roastedOn) : undefined,
      openedOn: data.openedOn ? new Date(data.openedOn) : undefined,
      weightG: data.weightG,
      notes: data.notes,
    },
    select: {
      id: true,
      beanId: true,
      roastedOn: true,
      openedOn: true,
      exhaustedOn: true,
      weightG: true,
      notes: true,
    },
  });
  return {
    ...bag,
    roastedOn: bag.roastedOn?.toISOString() ?? null,
    openedOn: bag.openedOn?.toISOString() ?? null,
    exhaustedOn: bag.exhaustedOn?.toISOString() ?? null,
    brews: [],
  };
}

export async function createGrindProfile(data: {
  name: string;
  setting: number;
  notes?: string;
}): Promise<GrindProfile> {
  await requireAuth();
  return prisma.grindProfile.create({
    data,
    select: { id: true, name: true, setting: true },
  });
}

export async function createAidenProfile(data: {
  name: string;
  coffeeG: number;
  waterG: number;
  tempF: number;
  bloomTimeS: number;
  bloomWaterG: number;
  pours: Pour[];
  notes?: string;
}): Promise<AidenProfile> {
  await requireAuth();
  const result = await prisma.aidenProfile.create({ data });
  return { ...result, pours: result.pours as unknown as Pour[] };
}

export async function createBrew(data: {
  beanId?: string;
  beanBagId?: string;
  bagBrewIndex?: number;
  waterProfileId?: string;
  filterProfileId?: string;
  grindProfileId: string;
  aidenProfileId: string;
  actualCoffeeG?: number;
  roastedOn?: string;
  openedOn?: string;
  miscVars?: string[];
  brewedAt?: string;
}): Promise<{ id: string }> {
  await requireAuth();

  let beanId = data.beanId;
  let bagBrewIndex = data.bagBrewIndex;

  if (data.beanBagId) {
    const bag = await prisma.beanBag.findUnique({
      where: { id: data.beanBagId },
      select: { beanId: true, _count: { select: { brews: true } } },
    });
    if (!bag) throw new Error("BeanBag not found");
    beanId = bag.beanId;
    bagBrewIndex = typeof bagBrewIndex === "number" ? bagBrewIndex : bag._count.brews + 1;
  }

  return prisma.brew.create({
    data: {
      beanId: beanId!,
      brewedAt: data.brewedAt ? new Date(data.brewedAt) : undefined,
      beanBagId: data.beanBagId || undefined,
      bagBrewIndex,
      waterProfileId: data.waterProfileId,
      filterProfileId: data.filterProfileId,
      grindProfileId: data.grindProfileId,
      aidenProfileId: data.aidenProfileId,
      roastedOn: data.roastedOn ? new Date(data.roastedOn) : undefined,
      openedOn: data.openedOn ? new Date(data.openedOn) : undefined,
      brewIssues: [],
      miscVars: data.miscVars ?? [],
      actualCoffeeG: typeof data.actualCoffeeG === "number" ? data.actualCoffeeG : undefined,
    },
    select: { id: true },
  });
}
