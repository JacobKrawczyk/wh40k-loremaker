// FILE: src/lib/options.ts
import { PLANETS } from "@/data/planets";
import { FACTIONS } from "@/data/factions";

export const SEGMENTUMS: string[] = Array.from(
  new Set(PLANETS.map((p) => p.segmentum))
);

export type Option = { value: string; label: string };

export const FACTION_OPTIONS: Option[] = FACTIONS.map((f) => ({
  value: f.key,
  label: f.name,
}));

export function getSubfactionOptions(factionKey?: string): Option[] {
  const f = FACTIONS.find((x) => x.key === factionKey);
  if (!f) return [];
  return f.subfactions.map((s) => ({ value: s.key, label: s.name }));
}

export function getPlanetOptionsBySegmentum(segmentum?: string): Option[] {
  const list = segmentum
    ? PLANETS.filter((p) => p.segmentum === segmentum)
    : PLANETS;
  return list.map((p) => ({ value: p.key, label: p.name }));
}

export function formatFactionChoice(factionKey?: string, subKey?: string): string {
  const f = FACTIONS.find((x) => x.key === factionKey);
  const s = f?.subfactions.find((y) => y.key === subKey);
  if (f && s) return `${f.name}: ${s.name}`;
  if (f) return f.name;
  return "";
}
    