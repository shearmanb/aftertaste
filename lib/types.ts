// Shared slim types used across brew-related pages.
// These reflect the DB shape but only include fields that are actually fetched.

export type WaterProfile = { id: string; brand: string; additives?: string | null };
export type FilterProfile = { id: string; name: string };
export type Producer = { id: string; name: string };
export type GrindProfile = { id: string; name: string; setting: number };
export type Pour = { sequence: number; tempF: number; pauseS: number };
export type AidenProfile = {
  id: string;
  name: string;
  coffeeG: number;
  waterG: number;
  tempF: number;
  bloomTimeS: number;
  bloomWaterG: number;
  pours: Pour[];
};
export type Bean = {
  id: string;
  producer: Producer;
  name: string;
  roastLevel: string;
  region?: string | null;
  process?: string | null;
};
export type BeanBag = {
  id: string;
  beanId: string;
  roastedOn?: string | null;
  openedOn?: string | null;
  exhaustedOn?: string | null;
  weightG?: number | null;
  notes?: string | null;
  brews?: { id: string }[];
};
export type SourceBrew = {
  brewedAt: string;
  roastedOn?: string | null;
  openedOn?: string | null;
  beanBagId?: string | null;
  bean: Bean;
  waterProfile?: WaterProfile | null;
  filterProfile?: FilterProfile | null;
  grindProfile: GrindProfile;
  aidenProfile: AidenProfile;
};
