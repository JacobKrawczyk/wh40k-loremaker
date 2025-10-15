// src/lib/optionsProvider.ts
import * as opt from "@/lib/options";
import * as PlanetData from "@/data/planets";
import * as FactionData from "@/data/factions";

export type Option = { value: string; label: string };

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
    const v = mod[k];
    if (Array.isArray(v) && v.every(isObj)) {
      return v as Record<string, unknown>[];
    }
  }
  return [];
}
function get(obj: Record<string, unknown>, key: string): unknown {
  return obj[key];
}
function titleFromKey(k: string): string {
  return k
    .replace(/[_\-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

// We prefer using concrete exports from lib/options; fallbacks below cover dataset-only cases.

/** ---------- Tone ---------- */
export function getToneOptions(): Option[] {
  if (typeof opt.getToneOptions === "function") return opt.getToneOptions();
  // Fallback baseline tones
  return [
    { value: "grimdark", label: "Grimdark" },
    { value: "heroic", label: "Heroic" },
    { value: "tragic", label: "Tragic" },
    { value: "mysterious", label: "Mysterious" },
  ];
}

/** ---------- Planets ---------- */
function fallbackSegmentumOptions(): Option[] {
  const arr = firstArrayExport(PlanetData as unknown as Record<string, unknown>);
  const segSet = new Set<string>();
  arr.forEach((p) => {
    const seg =
      toStr(get(p, "segmentum")) ||
      toStr(get(p, "segmentumKey")) ||
      toStr(get(p, "segmentum_name"));
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
      toStr(get(p, "segmentum")) ||
      toStr(get(p, "segmentumKey")) ||
      toStr(get(p, "segmentum_name"));
    if (segVal && segVal.toLowerCase() === key) {
      const name =
        toStr(get(p, "name")) ||
        toStr(get(p, "label")) ||
        toStr(get(p, "title"));
      const id = toStr(get(p, "key")) || name;
      if (name) out.push({ value: id || name, label: name });
    }
  });
  return out.sort((a, b) => a.label.localeCompare(b.label));
}

export function getSegmentumOptions(): Option[] {
  if (Array.isArray(opt.SEGMENTUMS)) {
    return opt.SEGMENTUMS.map((s) => ({ value: s, label: s }));
  }
  return fallbackSegmentumOptions();
}
export function getPlanetOptionsBySegmentum(seg: string): Option[] {
  if (typeof opt.getPlanetOptionsBySegmentum === "function") {
    return opt.getPlanetOptionsBySegmentum(seg);
  }
  return fallbackPlanetOptionsBySegmentum(seg);
}

/** ---------- Factions ---------- */
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
  const subsRaw = (found.subfactions as unknown) ?? (found.subs as unknown) ?? (found.variants as unknown);
  const out: Option[] = [];
  if (Array.isArray(subsRaw)) {
    subsRaw.forEach((sf) => {
      if (isObj(sf)) {
        const sk = toStr(get(sf, "key")) || toStr(get(sf, "id")) || toStr(get(sf, "value")) || toStr(get(sf, "slug"));
        const sn = toStr(get(sf, "name")) || toStr(get(sf, "label")) || titleFromKey(sk);
        if (sk) out.push({ value: sk, label: sn || sk });
      } else if (typeof sf === "string") {
        out.push({ value: sf, label: titleFromKey(sf) });
      }
    });
  }
  return out.sort((a, b) => a.label.localeCompare(b.label));
}

export function getFactionOptions(): Option[] {
  const fromConst = (opt as unknown as { FACTION_OPTIONS?: Option[] }).FACTION_OPTIONS;
  if (Array.isArray(fromConst)) return fromConst;
  return fallbackFactionOptions();
}
export function getSubfactionOptions(factionKey: string): Option[] {
  if (typeof opt.getSubfactionOptions === "function") {
    return opt.getSubfactionOptions(factionKey);
  }
  return fallbackSubfactionOptions(factionKey);
}
