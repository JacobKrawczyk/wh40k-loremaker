// /src/lib/optionFallbacks.ts
// Centralized, safe option getters. Prefer lib/options builders, fall back to datasets.

import * as opt from "@/lib/options";
import * as PlanetData from "@/data/planets";
import * as FactionData from "@/data/factions";

export type Option = { value: string; label: string };

/* ---------- tiny helpers ---------- */
function toStr(x: unknown): string {
  if (typeof x === "string") return x;
  if (typeof x === "number") return String(x);
  return "";
}
function isObj(x: unknown): x is Record<string, unknown> {
  return !!x && typeof x === "object";
}
function firstArrayExport(mod: Record<string, unknown>): Record<string, unknown>[] {
  for (const k of Object.keys(mod)) {
    const v = (mod as any)[k];
    if (Array.isArray(v) && v.every(isObj)) return v as Record<string, unknown>[];
  }
  return [];
}
function titleFromKey(k: string): string {
  return k
    .replace(/[_\-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

/* ---------- PLANETS (fallbacks) ---------- */
function fallbackSegmentumOptions(): Option[] {
  const arr = firstArrayExport(PlanetData as unknown as Record<string, unknown>);
  const segSet = new Set<string>();
  arr.forEach((p) => {
    const seg =
      toStr((p as any).segmentum) ||
      toStr((p as any)["segmentumKey"]) ||
      toStr((p as any)["segmentum_name"]);
    if (seg) segSet.add(seg);
  });
  return Array.from(segSet)
    .sort((a, b) => a.localeCompare(b))
    .map((s) => ({ value: s, label: s }));
}
function fallbackPlanetOptionsBySegmentum(seg: string): Option[] {
  const key = seg.trim().toLowerCase();
  const arr = firstArrayExport(PlanetData as unknown as Record<string, unknown>);
  const out: Option[] = [];
  arr.forEach((p) => {
    const segVal =
      toStr((p as any).segmentum) ||
      toStr((p as any)["segmentumKey"]) ||
      toStr((p as any)["segmentum_name"]);
    if (segVal && segVal.toLowerCase() === key) {
      const name =
        toStr((p as any).name) ||
        toStr((p as any)["label"]) ||
        toStr((p as any)["title"]);
      const id = toStr((p as any)["key"]) || name;
      if (name) out.push({ value: id || name, label: name });
    }
  });
  return out.sort((a, b) => a.label.localeCompare(b.label));
}

/* ---------- FACTIONS (fallbacks) ---------- */
type FactionLike = {
  key?: string;
  id?: string;
  value?: string;
  name?: string;
  label?: string;
  subfactions?: unknown;
  subs?: unknown;
  variants?: unknown;
};
function readFactionArray(): FactionLike[] {
  const arr = firstArrayExport(FactionData as unknown as Record<string, unknown>);
  return arr as FactionLike[];
}
function fallbackFactionOptions(): Option[] {
  const arr = readFactionArray();
  const opts: Option[] = [];
  arr.forEach((f) => {
    const key = toStr(f.key) || toStr(f.id) || toStr(f.value);
    const label = toStr(f.name) || toStr(f.label) || titleFromKey(key);
    if (key) opts.push({ value: key, label: label || key });
  });
  return opts.sort((a, b) => a.label.localeCompare(b.label));
}
function fallbackSubfactionOptions(factionKey: string): Option[] {
  const keyLc = factionKey.toLowerCase();
  const arr = readFactionArray();
  const found = arr.find((f) => {
    const k = toStr(f.key) || toStr(f.id) || toStr(f.value);
    return k.toLowerCase() === keyLc;
  });
  if (!found) return [];
  const subsRaw =
    (found.subfactions as unknown) ?? (found.subs as unknown) ?? (found.variants as unknown);

  const out: Option[] = [];
  if (Array.isArray(subsRaw)) {
    subsRaw.forEach((sf) => {
      if (isObj(sf)) {
        const sk =
          toStr((sf as any)["key"]) ||
          toStr((sf as any)["id"]) ||
          toStr((sf as any)["value"]) ||
          toStr((sf as any)["slug"]);
        const sn =
          toStr((sf as any)["name"]) ||
          toStr((sf as any)["label"]) ||
          titleFromKey(sk);
        if (sk) out.push({ value: sk, label: sn || sk });
      } else if (typeof sf === "string") {
        out.push({ value: sf, label: titleFromKey(sf) });
      }
    });
  }
  return out.sort((a, b) => a.label.localeCompare(b.label));
}

/* ---------- Public, safe getters (prefer builders) ---------- */
export function getSegmentumOptionsSafe(): Option[] {
  return (opt as any).getSegmentumOptions?.() ?? fallbackSegmentumOptions();
}
export function getPlanetOptionsBySegmentumSafe(seg: string): Option[] {
  return (opt as any).getPlanetOptionsBySegmentum?.(seg) ?? fallbackPlanetOptionsBySegmentum(seg);
}
export function getFactionOptionsSafe(): Option[] {
  return (opt as any).getFactionOptions?.() ?? fallbackFactionOptions();
}
export function getSubfactionOptionsSafe(fk: string): Option[] {
  return (opt as any).getSubfactionOptions?.(fk) ?? fallbackSubfactionOptions(fk);
}
