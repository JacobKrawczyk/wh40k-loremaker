import { NextResponse } from "next/server";
import type { ScenarioInput, WarhostInput, BattleFormat } from "@/lib/types";
import {
  generateScenario,
  type LegacyCampaignContext,
  type CampaignEpisodeInput,
} from "@/lib/generator";

/**
 * Canonical campaign-aware generator.
 * Accepts the new CampaignEpisodeInput shape, but remains tolerant of older payloads.
 * Returns a stable envelope: { narrative, aiUsed, aiError? }.
 */

// Small helpers to avoid `any`
type UnknownRecord = Record<string, unknown>;
const isRecord = (v: unknown): v is UnknownRecord => typeof v === "object" && v !== null;

const pickString = (o: unknown, key: string): string | undefined => {
  if (!isRecord(o)) return undefined;
  const v = o[key];
  return typeof v === "string" ? v : undefined;
};

// Coerce unknown value into a valid BattleFormat union
const coerceBattleFormat = (v: unknown): BattleFormat | undefined => {
  if (typeof v !== "string") return undefined;
  const s = v.trim();
  const up = s.toUpperCase();
  if (s === "1v1" || s === "2v2" || s === "3v3" || s === "4v4" || s === "2v2v2v2") {
    return s as BattleFormat;
  }
  if (up === "FFA") return "FFA" as BattleFormat;
  return undefined;
};

export async function POST(req: Request) {
  const raw: unknown = await req.json();

  // Be liberal in what we accept (support old callers too)
  const body = raw as Partial<CampaignEpisodeInput> &
    Partial<ScenarioInput> & {
      warhosts?: WarhostInput[];
      playersCount?: number;
      campaign?: CampaignEpisodeInput["campaign"] | UnknownRecord;
    };

  // ------- derive env -------
  const env = {
    aiEnabled:
      process.env.AI_ENABLED !== "0" &&
      !!process.env.OPENAI_API_KEY &&
      process.env.OPENAI_API_KEY.length > 0,
    model: process.env.OPENAI_MODEL || "gpt-5-chat-latest",
    apiKey: process.env.OPENAI_API_KEY,
  };

  // ------- normalize inputs -------
  const warhosts: WarhostInput[] = Array.isArray(body.warhosts) ? body.warhosts : [];
  const playersCount =
    typeof body.playersCount === "number" && body.playersCount > 0
      ? body.playersCount
      : warhosts.reduce(
          (sum, wh) => sum + (Array.isArray(wh.players) ? wh.players.length : 0),
          0
        ) || undefined;

  const campaign = (body.campaign || {}) as NonNullable<CampaignEpisodeInput["campaign"]> & {
    id?: string;
    name?: string;
    tone?: string;
    mode?: "planetary" | "interplanetary";
    planetName?: string;
    previousEpisodes?: Array<{
      scenarioId?: string;
      planetName?: string;
      factions?: string[];
      outcomeSummary?: string;
      rpDeltaByFaction?: Record<string, number>;
      cgpDelta?: number;
    }>;
  };

  // Requested next planet (override) -> else planetary fixed planet -> else any old "planet"
  const requestedPlanet =
    pickString(raw, "requestedPlanet") ??
    pickString(body, "requestedPlanet") ??
    (campaign?.mode === "planetary" ? campaign?.planetName : undefined) ??
    pickString(body, "planet");

  // ------- continuity tag (for human-visible stakes + AI prompt) -------
  const parts: string[] = [];
  if (campaign?.mode) parts.push(`Mode=${campaign.mode}`);
  if (campaign?.planetName) parts.push(`Planet=${campaign.planetName}`);
  if (requestedPlanet && requestedPlanet !== campaign?.planetName) parts.push(`Next=${requestedPlanet}`);

  const prev = Array.isArray(campaign?.previousEpisodes) ? campaign.previousEpisodes! : [];
  if (prev.length) {
    const summaries = prev
      .slice(-6) // keep tidy
      .map((e) => {
        const world = e.planetName || "Unspecified World";
        const brief = (e.outcomeSummary || "").trim();
        return brief ? `${world}: ${brief}` : world;
      })
      .filter(Boolean);
    if (summaries.length) parts.push(`Prior=${summaries.join(" | ")}`);
  }

  const continuityTag = parts.length ? `Continuity → ${parts.join("; ")}` : "";

  // ------- legacy campaign context for enhancer -------
  const legacyCtx: LegacyCampaignContext | undefined =
    campaign && (campaign.mode || campaign.planetName || prev.length)
      ? {
          mode: campaign.mode,
          primaryPlanet: campaign.planetName,
          routePlan: undefined,
          battleIndex: prev.length || 0,
          continuity: { previousEpisodesCount: prev.length },
          lastOutcomes: prev.slice(-6).map((e) => ({
            // winner intentionally omitted (not reliably tracked yet)
            objectivesCompleted: undefined,
            notes: e.outcomeSummary,
          })),
          seed: undefined,
        }
      : undefined;

  // ------- battleFormat (typed) -------
  const battleFormat: BattleFormat =
    coerceBattleFormat(pickString(body, "battleFormat")) ??
    coerceBattleFormat(pickString(raw, "battleFormat")) ??
    ("1v1" as BattleFormat);

  // ------- compose ScenarioInput (back-compat) -------
  const mergedStakes = [body.stakes ?? "", continuityTag].filter(Boolean).join(" || ");

  const scenarioInput: Partial<ScenarioInput> & {
    warhosts?: WarhostInput[];
    playersCount?: number;
  } = {
    campaignName: pickString(body, "campaignName") ?? campaign?.name ?? "",
    battleFormat,
    planet: requestedPlanet ?? "",
    tone: pickString(body, "tone") ?? campaign?.tone ?? pickString(raw, "tone") ?? "",
    stakes: mergedStakes,
    warhosts,
    playersCount,
  };

  // ------- generate -------
  const { narrative, aiUsed, aiError } = await generateScenario({
    input: scenarioInput,
    env,
    campaignContext: legacyCtx,
  });

  return NextResponse.json({ narrative, aiUsed, aiError });
}
