// FILE: src/app/api/generate/route.ts
import { NextResponse } from "next/server";
export const runtime = "nodejs";
import type { ScenarioInput, WarhostInput } from "@/lib/types";
import { generateScenario } from "@/lib/generator";

/**
 * Scenario generator (campaign-agnostic).
 * Delegates to the central generator in lib/generator to avoid duplication.
 *
 * Env toggles:
 *   - OPENAI_API_KEY=sk-...         // required to enable AI
 *   - OPENAI_MODEL=gpt-4o-mini      // optional (default)
 *   - AI_ENABLED=1                  // optional; if "0" skip AI even if key exists
 */
export async function POST(req: Request) {
  const body = (await req.json()) as Partial<ScenarioInput> & {
    warhosts?: WarhostInput[];
    playersCount?: number;
  };

  const env = {
    aiEnabled:
      process.env.AI_ENABLED !== "0" &&
      !!process.env.OPENAI_API_KEY &&
      process.env.OPENAI_API_KEY.length > 0,
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    apiKey: process.env.OPENAI_API_KEY,
  };

  const { narrative, aiUsed, aiError } = await generateScenario({
    input: body,
    env,
  });

  return NextResponse.json({ narrative, aiUsed, aiError });
}

