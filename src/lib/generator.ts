import type { ScenarioInput, WarhostInput } from "@/lib/types";
import { buildNarrative } from "@/lib/narrativeBuilder";
import { formatFactionChoice } from "@/lib/options";

/* ============================================================================
   Campaign Continuity DTOs (Step 2)
   - New, canonical types for campaign-aware generation.
   - Keep legacy generator-local context separately (see LegacyCampaignContext).
============================================================================ */

export type CampaignMode = "planetary" | "interplanetary";

export interface EpisodeMeta {
  scenarioId: string;
  planetName?: string;
  factions: string[];                 // e.g., ["Imperial Fists", "Orks"]
  outcomeSummary?: string;            // short text entered post-battle
  rpDeltaByFaction?: Record<string, number>;
  cgpDelta?: number;
}

export interface CampaignContext {
  id: string;
  name: string;
  tone?: string;
  mode: CampaignMode;
  planetName?: string;                // fixed world when mode === "planetary"
  previousEpisodes?: EpisodeMeta[];   // latest-first or chronological; caller’s choice
}

export interface CampaignEpisodeInput {
  campaign: CampaignContext;
  warhosts: WarhostInput[];           // reuse existing warhost structure from types.ts
  requestedPlanet?: string;           // optional override for the next episode
  stakes?: string;                    // extra narrative stakes input by host
  tone?: string;                      // per-episode tone override
}

export interface CampaignEpisodeOutput {
  narrative: string;                  // full markdown narrative package
  assumptions: string[];              // explicit assumptions we made while generating
  usedAI: boolean;                    // whether OpenAI enhancement ran
  model?: string;                     // model id when usedAI === true
}

/* ============================================================================
   Legacy generator-local campaign context
   - Kept for backward-compat within this module and existing callers.
   - Do not export under the generic name "CampaignContext" to avoid collision.
============================================================================ */

export interface LegacyCampaignContext {
  mode?: "planetary" | "interplanetary";
  primaryPlanet?: string;          // planetary campaigns
  routePlan?: string[];            // interplanetary: list of planet names/keys
  battleIndex?: number;            // 0-based position in campaign timeline
  continuity?: Record<string, unknown>; // relics, ruins, characters, RP/CGP, etc.
  lastOutcomes?: Array<{
    winner?: string;
    objectivesCompleted?: string[];
    notes?: string;
  }>;
  seed?: string;                    // for deterministic choices/placements
}

/** Result shape aligned with /api/generate */
export interface GenerateResult {
  narrative: string;
  aiUsed: boolean;
  aiError?: string;
}

/** Central entry-point used by API routes */
export async function generateScenario(opts: {
  input: Partial<ScenarioInput> & { warhosts?: WarhostInput[]; playersCount?: number };
  env: { aiEnabled: boolean; model: string; apiKey?: string };
  campaignContext?: LegacyCampaignContext; // NOTE: legacy shape used internally
}): Promise<GenerateResult> {
  const { input, env, campaignContext } = opts;

  // 1) Build clean roster text (for both fallback + AI prompt)
  const warhosts = Array.isArray(input.warhosts) ? input.warhosts : [];
  const warhostRosterLines: string[] = [];
  for (const wh of warhosts) {
    const title = wh?.name || "Warhost";
    const entries = Array.isArray(wh?.players)
      ? wh.players
          .map((p) => formatFactionChoice(p.factionKey, p.subKey))
          .filter(Boolean)
      : [];
    warhostRosterLines.push(`${title}: ${entries.length ? entries.join("; ") : "(unassigned)"}`);
  }
  const warhostRosterText =
    warhostRosterLines.length > 0
      ? `\n\nForces Roster:\n${warhostRosterLines.map((l) => `- ${l}`).join("\n")}\n`
      : "";

  // 2) Always build baseline with the template builder
  const base = buildNarrative(input as ScenarioInput);

  // 3) If AI is disabled or no key: return template (+ roster text for visibility)
  if (!env.aiEnabled || !env.apiKey) {
    return {
      narrative: base + (warhostRosterText ? `\n\n---\n${warhostRosterText}` : ""),
      aiUsed: false,
    };
  }

  // 4) Try AI enhancement
  try {
    const enhanced = await enhanceWithOpenAI({
      input,
      baseMarkdown: base,
      model: env.model,
      apiKey: env.apiKey!,
      rosterText: warhostRosterText,
      playersCount: input.playersCount,
      campaignContext, // legacy context carried through
    });

    const narrative =
      typeof enhanced === "string" && enhanced.trim().length > base.length * 0.5
        ? enhanced.trim()
        : base;

    return { narrative, aiUsed: true };
  } catch (err) {
    const aiError =
      err instanceof Error ? err.message : typeof err === "string" ? err : "Unknown error";
    return {
      narrative: base + (warhostRosterText ? `\n\n---\n${warhostRosterText}` : ""),
      aiUsed: false,
      aiError: String(aiError).slice(0, 240),
    };
  }
}

/** OpenAI enhancer (shared by both routes) */
export async function enhanceWithOpenAI(opts: {
  input: Partial<ScenarioInput> & { warhosts?: WarhostInput[]; playersCount?: number };
  baseMarkdown: string;
  model: string;
  apiKey: string;
  rosterText?: string;
  playersCount?: number;
  campaignContext?: LegacyCampaignContext; // NOTE: legacy shape used internally
}): Promise<string> {
  const { input, baseMarkdown, model, apiKey, rosterText, playersCount, campaignContext } = opts;

  const system = [
    "You are WH40K Narrative Campaign Engine.",
    "Enhance the provided Markdown scenario for Warhammer 40,000 with vivid grimdark style,",
    "while preserving the section order and tabletop rules semantics.",
    'Keep all distances in inches on a 40\"x60\" board.',
    "Each faction must keep exactly one narrative objective with the same mechanics and reward (+3 RP).",
    "Keep risk scores and tables; you may clarify wording.",
    "Use EVERY team/faction listed in the Warhost roster. Write distinct per-faction intros in appropriate voices.",
    "If a Campaign Context is provided, maintain continuity: reference prior outcomes, relics, location damage, and absent characters where appropriate.",
    "Output ONLY raw Markdown — do not wrap your answer in code fences.",
  ].join(" ");

  const minimal = {
    campaignName: input.campaignName ?? "",
    battleFormat: input.battleFormat ?? "1v1",
    planet: input.planet ?? "",
    tone: input.tone ?? "",
    stakes: input.stakes ?? "",
    playersCount: playersCount ?? undefined,
  };

  const ctxSummary = campaignContext
    ? [
        "Campaign Context:",
        JSON.stringify(
          {
            mode: campaignContext.mode,
            primaryPlanet: campaignContext.primaryPlanet,
            routePlan: campaignContext.routePlan,
            battleIndex: campaignContext.battleIndex,
            continuity: campaignContext.continuity
              ? "[omitted keys count: " + Object.keys(campaignContext.continuity).length + "]"
              : undefined,
            lastOutcomes: (campaignContext.lastOutcomes || []).map((o, i) => ({
              i,
              winner: o.winner,
              objectivesCompleted: o.objectivesCompleted,
            })),
            seed: campaignContext.seed,
          },
          null,
          2
        ),
      ].join("\n")
    : "";

  const user = [
    "Input (JSON, minimal):",
    "```json",
    JSON.stringify(minimal, null, 2),
    "```",
    rosterText ? `\nWarhosts Roster (use ALL below):\n${rosterText}` : "",
    ctxSummary,
    "",
    "Base Markdown to enhance (preserve structure & rules exactly; improve prose only):",
    "```md",
    baseMarkdown,
    "```",
  ]
    .filter(Boolean)
    .join("\n");

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.7,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`OpenAI HTTP ${resp.status}: ${text}`);
  }

  const data = (await resp.json()) as {
    choices?: { message?: { content?: string } }[];
  };

  const content = data?.choices?.[0]?.message?.content ?? "";
  return unwrapMarkdown(content);
}

/** Strip ```md ... ``` or generic ``` ... ``` fences if the model wrapped the output */
export function unwrapMarkdown(s: string): string {
  const txt = (s ?? "").trim();

  // Exact fenced block ```md ... ```
  const m1 = txt.match(/^```(?:md|markdown)\s*\n([\s\S]*?)\n```$/i);
  if (m1) return m1[1].trim();

  // Generic fenced block ``` ... ```
  const m2 = txt.match(/^```\s*\n([\s\S]*?)\n```$/);
  if (m2) return m2[1].trim();

  // Starts with fence but no tidy close — strip first/last fence lines if present
  if (txt.startsWith("```")) {
    return txt.replace(/^```[^\n]*\n?/, "").replace(/```$/, "").trim();
  }

  return txt;
}
