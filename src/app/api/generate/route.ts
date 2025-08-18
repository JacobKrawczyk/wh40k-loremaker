// FILE: src/app/api/generate/route.ts
import { NextResponse } from "next/server";
import type { ScenarioInput, WarhostInput } from "@/lib/types";
import { buildNarrative } from "@/lib/narrativeBuilder";
import { formatFactionChoice } from "@/lib/options";

/**
 * If OPENAI_API_KEY is set, we try to enhance the builder output via OpenAI.
 * If the key is missing or the request fails, we return the pure builder output.
 *
 * Toggle with env:
 *   - OPENAI_API_KEY=sk-...         // required to enable AI
 *   - OPENAI_MODEL=gpt-4o-mini      // optional (default)
 *   - AI_ENABLED=1                  // optional; if "0" we skip AI even if key exists
 */
export async function POST(req: Request) {
  const body = (await req.json()) as Partial<ScenarioInput> & {
    warhosts?: WarhostInput[];
    playersCount?: number;
  };

  // Build a clean, human-readable roster for the model (and fallback)
  const warhosts = Array.isArray(body.warhosts) ? body.warhosts : [];
  const warhostRosterLines: string[] = [];
  for (const wh of warhosts) {
    const title = wh?.name || "Warhost";
    const entries = Array.isArray(wh?.players)
      ? wh.players
          .map((p) => formatFactionChoice(p.factionKey, p.subKey))
          .filter(Boolean)
      : [];
    warhostRosterLines.push(
      `${title}: ${entries.length ? entries.join("; ") : "(unassigned)"}`
    );
  }
  const warhostRosterText =
    warhostRosterLines.length > 0
      ? `\n\nForces Roster:\n${warhostRosterLines.map((l) => `- ${l}`).join("\n")}\n`
      : "";

  // Always build the baseline template
  const base = buildNarrative(body as ScenarioInput);

  const useAI =
    process.env.AI_ENABLED !== "0" &&
    typeof process.env.OPENAI_API_KEY === "string" &&
    process.env.OPENAI_API_KEY.length > 0;

  if (!useAI) {
    // No-AI path: return template, but include roster block so narrative reflects teams
    return NextResponse.json({
      narrative: base + (warhostRosterText ? `\n\n---\n${warhostRosterText}` : ""),
      aiUsed: false,
    });
  }

  try {
    const modelUsed = process.env.OPENAI_MODEL || "gpt-4o-mini";

    const enhanced = await enhanceWithOpenAI({
      input: body,
      baseMarkdown: base,
      model: modelUsed,
      apiKey: process.env.OPENAI_API_KEY!,
      rosterText: warhostRosterText,
      playersCount: body.playersCount,
    });

    console.info(`[AI] Enhanced narrative using model: ${modelUsed}`);

    const narrative =
      typeof enhanced === "string" && enhanced.trim().length > base.length * 0.5
        ? enhanced.trim()
        : base;

    return NextResponse.json({ narrative, aiUsed: true });
  } catch (err) {
    const aiError =
      err instanceof Error ? err.message : typeof err === "string" ? err : "Unknown error";
    console.error("[/api/generate] AI enhance failed – falling back:", aiError);
    // Truncate the error we return to the client for safety/noise
    const short = String(aiError).slice(0, 240);
    return NextResponse.json({
      narrative: base + (warhostRosterText ? `\n\n---\n${warhostRosterText}` : ""),
      aiUsed: false,
      aiError: short,
    });
  }
}

async function enhanceWithOpenAI(opts: {
  input: Partial<ScenarioInput> & { warhosts?: WarhostInput[]; playersCount?: number };
  baseMarkdown: string;
  model: string;
  apiKey: string;
  rosterText?: string;
  playersCount?: number;
}): Promise<string> {
  const { input, baseMarkdown, model, apiKey, rosterText, playersCount } = opts;

  const system = [
    "You are WH40K Narrative Campaign Engine.",
    "Enhance the provided Markdown scenario for Warhammer 40,000 with vivid grimdark style,",
    "while preserving the section order and tabletop rules semantics.",
    'Keep all distances in inches on a 40\"x60\" board.',
    "Each faction must keep exactly one narrative objective with the same mechanics and reward (+3 RP).",
    "Keep risk scores and tables; you may clarify wording.",
    "Use EVERY team/faction listed in the Warhost roster. Write distinct per-faction intros in appropriate voices.",
    "If the baseline implies a single protagonist versus 'the rest', you MUST refactor to the proper multi-warhost framing per the Team Framing Guide. Remove phrasing like 'arrayed against them' and instead present opposing warhosts or rival warhosts as appropriate.",
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

  // Build a precise team-framing instruction the model must follow
  const fmt = String(minimal.battleFormat || "1v1");
  let teamGuide = "";
  if (["1v1", "2v2", "3v3", "4v4"].includes(fmt)) {
    teamGuide =
      "Team Framing Guide: Two opposing sides — Warhost Alpha vs Warhost Beta. Treat all players listed under each Warhost as allied.";
  } else if (fmt === "ffa") {
    teamGuide =
      "Team Framing Guide: Free-for-all — Warhost Alpha, Warhost Beta, Warhost Gamma, and Warhost Delta are all independent rivals (no alliances).";
  } else if (fmt === "2v2v2v2") {
    teamGuide =
      "Team Framing Guide: Four-sided conflict — Warhost Alpha vs Warhost Beta vs Warhost Gamma vs Warhost Delta. Each Warhost is its own allied side.";
  }

  const user = [
    "Input (JSON, minimal):",
    "```json",
    JSON.stringify(minimal, null, 2),
    "```",
    teamGuide ? `\n${teamGuide}` : "",
    rosterText ? `\nWarhosts Roster (use ALL below):\n${rosterText}` : "",
    "",
    "Base Markdown to enhance (preserve structure & rules exactly; improve prose only):",
    "```md",
    baseMarkdown,
    "```",
  ]
    .filter(Boolean)
    .join("\n");

  // Use Chat Completions via fetch to avoid SDK peer-dep issues.
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
function unwrapMarkdown(s: string): string {
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
