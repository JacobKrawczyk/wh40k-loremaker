// FILE: src/app/scenario/page.tsx
"use client";

import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useScenarioStore } from "@/lib/scenarioStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ScenarioInputSchema, type ScenarioInputForm } from "@/lib/validation";
import {
  SEGMENTUMS,
  FACTION_OPTIONS,
  getSubfactionOptions,
  getPlanetOptionsBySegmentum,
  formatFactionChoice,
} from "@/lib/options";

type ApiResp = {
  narrative?: string;
  aiUsed?: boolean;
  aiError?: string;
};

// Thematic team labels (instead of "Group A/B")
const WARHOST_NAMES = ["Warhost Alpha", "Warhost Beta", "Warhost Gamma", "Warhost Delta"] as const;

// Supported layouts per battle format
const FORMAT_MATRIX: Record<
  "1v1" | "2v2" | "3v3" | "4v4" | "ffa" | "2v2v2v2",
  { teams: number; playersPerTeam: number }
> = {
  "1v1": { teams: 2, playersPerTeam: 1 },
  "2v2": { teams: 2, playersPerTeam: 2 },
  "3v3": { teams: 2, playersPerTeam: 3 },
  "4v4": { teams: 2, playersPerTeam: 4 },
  ffa: { teams: 4, playersPerTeam: 1 }, // 4-way free-for-all (1 player each)
  "2v2v2v2": { teams: 4, playersPerTeam: 2 },
};

type PlayerSel = { factionKey: string; subKey?: string };
type TeamSel = PlayerSel[];

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
    setValue,
    watch,
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

  // Dependent selects for location
  const [segmentum, setSegmentum] = useState<string>("");
  const planetOptions = useMemo(
    () => getPlanetOptionsBySegmentum(segmentum),
    [segmentum]
  );

  // Dynamic teams UI driven by selected format
  const selectedFormat =
    (watch("battleFormat") as keyof typeof FORMAT_MATRIX) ?? "1v1";
  const layout = FORMAT_MATRIX[selectedFormat] ?? FORMAT_MATRIX["1v1"];

  const [teams, setTeams] = useState<TeamSel[]>(
    Array.from({ length: layout.teams }, () =>
      Array.from({ length: layout.playersPerTeam }, () => ({ factionKey: "", subKey: "" }))
    )
  );

  // Keep teams array shape in sync with selected format (preserve existing picks when possible)
  useEffect(() => {
    setTeams((prev) => {
      const next: TeamSel[] = Array.from({ length: layout.teams }, (_, ti) => {
        const prevTeam = prev[ti] ?? [];
        return Array.from({ length: layout.playersPerTeam }, (_, pi) => {
          return prevTeam[pi] ?? { factionKey: "", subKey: "" };
        });
      });
      return next;
    });
  }, [layout.teams, layout.playersPerTeam]);

  // Helper to update a player cell
  const setPlayerFaction = (teamIdx: number, playerIdx: number, factionKey: string) => {
    setTeams((prev) => {
      const copy = prev.map((t) => t.slice());
      copy[teamIdx][playerIdx] = { factionKey, subKey: "" }; // reset subfaction on faction change
      return copy;
    });
  };
  const setPlayerSubfaction = (teamIdx: number, playerIdx: number, subKey: string) => {
    setTeams((prev) => {
      const copy = prev.map((t) => t.slice());
      const cell = copy[teamIdx][playerIdx] ?? { factionKey: "", subKey: "" };
      copy[teamIdx][playerIdx] = { ...cell, subKey };
      return copy;
    });
  };

  // Build legacy fields for API from structured selections
  const { mine, others } = useMemo(() => {
    const fmt = (p: PlayerSel) =>
      p.factionKey ? formatFactionChoice(p.factionKey, p.subKey || undefined) : "";
    const alpha = teams[0]?.[0] ? fmt(teams[0][0]) : "";
    const rest: string[] = [];
    teams.forEach((t, ti) =>
      t.forEach((p, pi) => {
        if (ti === 0 && pi === 0) return; // skip "mine"
        const s = fmt(p);
        if (s) rest.push(s);
      })
    );
    return { mine: alpha, others: rest.join(", ") };
  }, [teams]);

  // Keep hidden fields in sync
  useEffect(() => {
    setValue("playerFaction", mine);
    setValue("otherFactions", others);
  }, [mine, others, setValue]);

  const onSubmit = async (values: ScenarioInputForm) => {
    setLoading(true);
    setOutput(null);
    setAiUsed(null);
    setAiError(null);

    try {
      const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), Number(process.env.NEXT_PUBLIC_GENERATE_TIMEOUT_MS || 120000));

      // Build Warhost structure for the generator
      const warhosts = teams.map((t, ti) => ({
        name: WARHOST_NAMES[ti] ?? `Warhost ${ti + 1}`,
        players: t.map((p) => ({
          factionKey: p.factionKey,
          subKey: p.subKey || undefined,
        })),
      }));
      const playersCount = teams.reduce((acc, t) => acc + t.length, 0);

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, warhosts, playersCount }),
        signal: ctrl.signal,
      });

      clearTimeout(t);

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`HTTP ${res.status} ${res.statusText} Ã¢â‚¬â€œ ${txt}`);
      }

      const data = (await res.json()) as ApiResp;
      setOutput(data.narrative ?? "No narrative returned.");
      setAiUsed(!!data.aiUsed);
      setAiError(data.aiError ?? null);

      if (data.narrative) {
        const record = {
          id: (globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}`),
          createdAt: new Date().toISOString(),
          input: { ...values, warhosts, playersCount },
          narrative: data.narrative,
        };
        addScenario(record);
      }
    } catch (err) {
      console.error("Generate failed:", err);
      setOutput(
        `Request failed.\n\nTip: DevTools Ã¢â€ â€™ Network Ã¢â€ â€™ /api/generate to see status/response.\n${String(
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
            <option value="3v3">3v3</option>
            <option value="4v4">4v4</option>
            <option value="ffa">Free-for-all (4-way)</option>
            <option value="2v2v2v2">2v2v2v2</option>
          </select>
          {errors.battleFormat && (
            <p className="mt-1 text-sm text-red-400">{errors.battleFormat.message}</p>
          )}
        </div>

        {/* Forces Ã¢â‚¬â€ team-based pickers */}
        <div className="space-y-3">
          <Label>Forces (Warhosts & Allegiances)</Label>
          <p className="text-sm opacity-80">
            Select a faction and (optional) subfaction for each player slot.
          </p>
          <div className="space-y-4">
            {teams.map((team, ti) => (
              <div
                key={`team-${ti}`}
                className="rounded-2xl border border-white/10 bg-black/40 p-4"
              >
                <div className="mb-3 text-lg font-semibold">
                  {WARHOST_NAMES[ti] ?? `Warhost ${ti + 1}`}
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {team.map((player, pi) => {
                    const subs = getSubfactionOptions(player.factionKey);
                    return (
                      <div key={`player-${ti}-${pi}`} className="grid gap-2">
                        <div className="text-sm opacity-80">Player {pi + 1}</div>
                        <select
                          className="rounded-md border border-white/20 bg-black/40 p-2"
                          value={player.factionKey}
                          onChange={(e) => setPlayerFaction(ti, pi, e.target.value)}
                        >
                          <option value="">Select factionÃ¢â‚¬Â¦</option>
                          {FACTION_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <select
                          className="rounded-md border border-white/20 bg-black/40 p-2"
                          value={player.subKey ?? ""}
                          onChange={(e) => setPlayerSubfaction(ti, pi, e.target.value)}
                          disabled={!player.factionKey}
                        >
                          <option value="">
                            {player.factionKey ? "Select subfactionÃ¢â‚¬Â¦" : "Select a faction first"}
                          </option>
                          {subs.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Hidden legacy fields bound for API */}
          <input type="hidden" {...register("playerFaction")} />
          <input type="hidden" {...register("otherFactions")} />
          {errors.playerFaction && (
            <p className="mt-1 text-sm text-red-400">{errors.playerFaction.message}</p>
          )}
          {errors.otherFactions && (
            <p className="mt-1 text-sm text-red-400">{errors.otherFactions.message}</p>
          )}
        </div>

        {/* Location / Planet (Segmentum Ã¢â€ â€™ Planet) */}
        <div>
          <Label>Location / Planet</Label>
          <div className="grid gap-2 sm:grid-cols-2">
            <select
              className="rounded-md border border-white/20 bg-black/40 p-2"
              value={segmentum}
              onChange={(e) => setSegmentum(e.target.value)}
            >
              <option value="">Any Segmentum</option>
              {SEGMENTUMS.map((seg) => (
                <option key={seg} value={seg}>
                  {seg}
                </option>
              ))}
            </select>
            <select
              className="rounded-md border border-white/20 bg-black/40 p-2"
              onChange={(e) => setValue("planet", e.target.value)}
            >
              <option value="">Select planet..."hidden" {...register("planet")} />
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
          {loading ? "GeneratingÃ¢â‚¬Â¦" : "Generate"}
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
                  Template fallback
                </span>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="mt-3 flex gap-2">
            <Link href="/saved" className="inline-block">
              <Button className="bg-white text-black hover:bg-white/90">
                View in Saved
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
