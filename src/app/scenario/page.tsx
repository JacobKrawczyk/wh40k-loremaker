"use client";

import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useScenarioStore } from "@/lib/scenarioStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ScenarioInputSchema, type ScenarioInputForm } from "@/lib/validation";

type ApiResp = {
  narrative?: string;
  aiUsed?: boolean;
  aiError?: string;
};

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [aiUsed, setAiUsed] = useState<boolean | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const addScenario = useScenarioStore((s) => s.addScenario);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ScenarioInputForm>({
    resolver: zodResolver(ScenarioInputSchema),
    defaultValues: {
      campaignName: "",
      battleFormat: "1v1",
      playerFaction: "",
      otherFactions: "",
      planet: "",
      tone: "",
      stakes: "",
    },
  });

  const onSubmit = async (values: ScenarioInputForm) => {
    setLoading(true);
    setOutput(null);
    setAiUsed(null);
    setAiError(null);

    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 15000);

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
        signal: ctrl.signal,
      });

      clearTimeout(t);

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`HTTP ${res.status} ${res.statusText} – ${txt}`);
      }

      const data = (await res.json()) as ApiResp;
      setOutput(data.narrative ?? "No narrative returned.");
      setAiUsed(!!data.aiUsed);
      setAiError(data.aiError ?? null);

      // Save to local history if we got a narrative
      if (data.narrative) {
        const record = {
          id: (globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}`),
          createdAt: new Date().toISOString(),
          input: values,
          narrative: data.narrative,
        };
        addScenario(record);
      }
    } catch (err) {
      console.error("Generate failed:", err);
      setOutput(
        `Request failed.\n\nTip: DevTools → Network → /api/generate to see status/response.\n${String(
          err
        )}`
      );
      setAiUsed(false);
      setAiError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <h1 className="text-3xl font-bold">Scenario Generator</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
        <div>
          <Label htmlFor="campaignName">Campaign name</Label>
          <Input
            id="campaignName"
            placeholder="Operation Codename"
            aria-invalid={!!errors.campaignName}
            {...register("campaignName")}
          />
          {errors.campaignName && (
            <p className="mt-1 text-sm text-red-400">{errors.campaignName.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="battleFormat">Battle format</Label>
          <select
            id="battleFormat"
            className="h-10 rounded-md border px-3"
            aria-invalid={!!errors.battleFormat}
            {...register("battleFormat")}
          >
            <option value="1v1">1v1</option>
            <option value="2v2">2v2</option>
            <option value="ffa">Free-for-all</option>
          </select>
          {errors.battleFormat && (
            <p className="mt-1 text-sm text-red-400">{errors.battleFormat.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="playerFaction">Your side</Label>
          <Input
            id="playerFaction"
            placeholder="Faction"
            aria-invalid={!!errors.playerFaction}
            {...register("playerFaction")}
          />
          {errors.playerFaction && (
            <p className="mt-1 text-sm text-red-400">{errors.playerFaction.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="otherFactions">Opponents / other sides</Label>
          <Input
            id="otherFactions"
            placeholder="Other faction(s)"
            aria-invalid={!!errors.otherFactions}
            {...register("otherFactions")}
          />
          {errors.otherFactions && (
            <p className="mt-1 text-sm text-red-400">{errors.otherFactions.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="planet">Location</Label>
          <Input
            id="planet"
            placeholder="Planet / theater"
            aria-invalid={!!errors.planet}
            {...register("planet")}
          />
          {errors.planet && (
            <p className="mt-1 text-sm text-red-400">{errors.planet.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="tone">Tone</Label>
          <Input
            id="tone"
            placeholder="Tone (e.g., grimdark)"
            aria-invalid={!!errors.tone}
            {...register("tone")}
          />
          {errors.tone && (
            <p className="mt-1 text-sm text-red-400">{errors.tone.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="stakes">Personal stakes</Label>
          <Textarea
            id="stakes"
            placeholder="Personal stakes (e.g., secure prototype, rescue VIP)"
            aria-invalid={!!errors.stakes}
            {...register("stakes")}
          />
          {errors.stakes && (
            <p className="mt-1 text-sm text-red-400">{errors.stakes.message}</p>
          )}
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? "Generating…" : "Generate"}
        </Button>
      </form>

      {output && (
        <Card>
          <CardContent className="prose prose-invert max-w-none p-6">
            <ReactMarkdown>{output}</ReactMarkdown>
          </CardContent>
        </Card>
      )}

      {output && (
        <>
          {/* AI status badge */}
          {aiUsed !== null && (
            <div className="mt-2 text-sm">
              {aiUsed ? (
                <span className="rounded-md bg-green-600/20 px-2 py-1 text-green-200">
                  AI enhanced
                </span>
              ) : (
                <span
                  className="rounded-md bg-yellow-600/20 px-2 py-1 text-yellow-200"
                  title={aiError ?? undefined}
                >
                  Template fallback{aiError ? " — check console/logs" : ""}
                </span>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="mt-3 flex gap-2">
            <Link href="/campaigns" className="inline-block">
              <Button className="bg-white text-black hover:bg-white/90">
                View in Campaigns
              </Button>
            </Link>
            <Button
              className="border border-white/30 text-white hover:bg-white/10"
              onClick={() => output && navigator.clipboard.writeText(output)}
              title="Copy narrative to clipboard"
            >
              Copy Narrative
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
