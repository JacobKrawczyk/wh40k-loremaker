import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { PLANETS } from "@/data/planets";
import { FACTIONS } from "@/data/factions";
import type { PlanetDef, Segmentum, Biome, Allegiance } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Planet selection helper -------------------------------------------------

function normalizeAllegiance(a: Allegiance): Allegiance {
  // Treat Agents as Imperium for planet plausibility
  if (a === "Agents of the Imperium") return "Imperium";
  return a;
}

export interface PlanetPickerInput {
  segmentum?: Segmentum;
  biome?: Biome;
  factionKey?: string; // e.g., "space-marines"
  seed?: string;       // deterministic salt (optional)
}

/**
 * Picks a plausible planet based on segmentum/biome and faction allegiance.
 * Deterministic for a given seed+inputs.
 */
export function planetPicker(input: PlanetPickerInput): PlanetDef {
  const { segmentum, biome, factionKey, seed } = input ?? {};

  let allegiance: Allegiance | undefined;
  if (factionKey) {
    const f = FACTIONS.find((x) => x.key === factionKey);
    allegiance = f ? normalizeAllegiance(f.allegiance) : undefined;
  }

  // Progressive filtering: all → segmentum → +biome → +allegiance
  const filters: Array<(p: PlanetDef) => boolean> = [];
  if (segmentum) filters.push((p) => p.segmentum === segmentum);
  if (biome) filters.push((p) => p.biomes.includes(biome));
  if (allegiance) filters.push((p) => p.primaryAllegiances.includes(allegiance));

  let candidates = PLANETS.slice();
  for (let i = filters.length; i > 0; i--) {
    const subset = PLANETS.filter((p) => filters.slice(0, i).every((fn) => fn(p)));
    if (subset.length) {
      candidates = subset;
      break;
    }
  }
  if (!candidates.length) candidates = PLANETS.slice();

  const s = seed ?? `${segmentum ?? ""}|${biome ?? ""}|${allegiance ?? ""}`;
  const idx = hashToIndex(s, candidates.length);
  return candidates[idx] ?? PLANETS[0];
}

function hashToIndex(s: string, mod: number): number {
  if (!mod) return 0;
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h % mod;
}
