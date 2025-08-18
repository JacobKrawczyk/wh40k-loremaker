// FILE: src/app/api/generate/route.ts
import { NextResponse } from "next/server";
import type { ScenarioInput } from "@/lib/types";
import { buildNarrative } from "@/lib/narrativeBuilder";

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
  const body = (await req.json()) as Partial<ScenarioInput>;
  const base = buildNarrative(body as ScenarioInput);

  const useAI =
    process.env.AI_ENABLED !== "0" &&
    typeof process.env.OPENAI_API_KEY === "string" &&
    process.env.OPENAI_API_KEY.length > 0;

  if (!useAI) {
    return NextResponse.json({ narrative: base, aiUsed: false });
  }

  try {
    const modelUsed = process.env.OPENAI_MODEL || "gpt-4o-mini";

    const enhanced = await enhanceWithOpenAI({
      input: body,
      baseMarkdown: base,
      model: modelUsed,
      apiKey: process.env.OPENAI_API_KEY!,
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
    return NextResponse.json({ narrative: base, aiUsed: false, aiError: short });
  }
}

async function enhanceWithOpenAI(opts: {
  input: Partial<ScenarioInput>;
  baseMarkdown: string;
  model: string;
  apiKey: string;
}): Promise<string> {
  const { input, baseMarkdown, model, apiKey } = opts;

  const system = [
    "You are WH40K Narrative Campaign Engine.",
    "Enhance the provided Markdown scenario for Warhammer 40,000 with vivid grimdark style,",
    "but DO NOT change the section order or the tabletop rules semantics.",
    "Always keep all distances in inches on a 40\"x60\" board.",
    "Each faction must keep exactly one narrative objective with the same mechanics and reward (+3 RP).",
    "Keep risk scores and tables, but you may clarify wording.",
    "Do not add placeholders; produce complete text.",
    "Output ONLY raw Markdown — do not wrap your answer in code fences.",
  ].join(" ");

  const user = [
    "Input (JSON, minimal):",
    "```json",
    JSON.stringify(
      {
        campaignName: input.campaignName ?? "",
        battleFormat: input.battleFormat ?? "1v1",
        playerFaction: input.playerFaction ?? "",
        otherFactions: input.otherFactions ?? "",
        planet: input.planet ?? "",
        tone: input.tone ?? "",
        stakes: input.stakes ?? "",
      },
      null,
      2
    ),
    "```",
    "",
    "Base Markdown to enhance (preserve structure & rules exactly, improve prose only):",
    "```md",
    baseMarkdown,
    "```",
  ].join("\n");

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
