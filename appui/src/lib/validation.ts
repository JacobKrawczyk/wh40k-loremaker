// FILE: src/lib/validation.ts
import { z } from "zod";
import { LIMITS } from "@/lib/constants";

const max = (k: keyof typeof LIMITS, fallback: number) =>
  (LIMITS?.[k] as number | undefined) ?? fallback;

export const BattleFormatZ = z.enum([
  "1v1",
  "2v2",
  "3v3",
  "4v4",
  "ffa",
  "2v2v2v2",
]);

// Optional Warhost schema (lenient; UI enforces correctness)
const WarhostPlayerZ = z.object({
  factionKey: z.string().min(1),
  subKey: z.string().optional(),
});
const WarhostZ = z.object({
  name: z.string().min(1),
  players: z.array(WarhostPlayerZ).min(1),
});

export const ScenarioInputSchema = z.object({
  campaignName: z.string().trim().max(max("campaignName", 120)).optional().or(z.literal("")),
  battleFormat: BattleFormatZ.default("1v1"),
  playerFaction: z.string().trim().max(max("playerFaction", 80)).optional().or(z.literal("")),
  otherFactions: z.string().trim().max(max("otherFactions", 120)).optional().or(z.literal("")),
  planet: z.string().trim().max(max("planet", 80)).optional().or(z.literal("")),
  tone: z.string().trim().max(max("tone", 80)).optional().or(z.literal("")),
  stakes: z.string().trim().max(max("stakes", 400)).optional().or(z.literal("")),

  // NEW (optional)
  warhosts: z.array(WarhostZ).optional(),
  playersCount: z.number().int().positive().max(16).optional(),
});

// ✅ Use the *input* type so RHF accepts optional battleFormat at input time.
export type ScenarioInputForm = z.input<typeof ScenarioInputSchema>;
