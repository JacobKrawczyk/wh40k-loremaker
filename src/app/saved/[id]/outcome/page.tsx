"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useScenarioStore } from "@/lib/scenarioStore";
import { useCampaignStore } from "@/lib/campaignStore";
import { useOutcomeStore } from "@/lib/outcomeStore";
import { formatFactionChoice } from "@/lib/options";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ScenarioInput, WarhostInput } from "@/lib/types";

export default function MarkOutcomePage() {
  const { id } = useParams() as { id: string };        // scenarioId
  const router = useRouter();
  const scenarios = useScenarioStore((s) => s.scenarios);
  const campaigns = useCampaignStore((s) => s.campaigns);
  const submitOutcome = useOutcomeStore((s) => s.submitOutcome);
  const outcomesByCampaign = useOutcomeStore((s) => s.outcomesByCampaign);

  const scenario = scenarios.find((s) => s.id === id);
  const attachedCampaign = useMemo(
    () => campaigns.find((c) => c.scenarioIds.includes(id)),
    [campaigns, id]
  );

  const existingOutcome = attachedCampaign ? (outcomesByCampaign[attachedCampaign.id]?.[id] ?? undefined) : undefined;

  const input = (scenario?.input as ScenarioInput | undefined) ?? undefined;
  const derivedFactions: string[] = useMemo(() => {
    if (!input?.warhosts) return [];
    const names: string[] = [];
    (input.warhosts as WarhostInput[]).forEach((wh) => {
      (wh.players || []).forEach((p) => {
        const nm = formatFactionChoice(p.factionKey, p.subKey);
        if (nm) names.push(nm);
      });
    });
    return names;
  }, [input?.warhosts]);

  const [summary, setSummary] = useState<string>(existingOutcome?.outcomeSummary ?? "");
  const [cgpDelta, setCgpDelta] = useState<string>(
    typeof existingOutcome?.cgpDelta === "number" ? String(existingOutcome.cgpDelta) : "0"
  );
  const [rpMap, setRpMap] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    derivedFactions.forEach((f) => {
      const v = existingOutcome?.rpDeltaByFaction?.[f];
      init[f] = typeof v === "number" ? String(v) : "0";
    });
    return init;
  });

  const onRpChange = (f: string) => (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (/^-?\d*$/.test(v)) setRpMap((m) => ({ ...m, [f]: v }));
  };

  const onSave = () => {
    if (!attachedCampaign || !scenario) {
      alert("Attach this scenario to a campaign first.");
      return;
    }
    const rpDeltaByFaction: Record<string, number> = {};
    Object.entries(rpMap).forEach(([k, v]) => {
      const n = parseInt(v || "0", 10);
      if (Number.isFinite(n) && n !== 0) rpDeltaByFaction[k] = n;
    });

    submitOutcome(attachedCampaign.id, scenario.id, {
      planetName: input?.planet,
      factions: derivedFactions,
      outcomeSummary: summary.trim(),
      rpDeltaByFaction: Object.keys(rpDeltaByFaction).length ? rpDeltaByFaction : undefined,
      cgpDelta: Number.isFinite(Number(cgpDelta)) ? Number(cgpDelta) : undefined,
    });

    router.push(`/saved/${scenario.id}`);
  };

  if (!scenario) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 p-6">
        <h1 className="text-2xl font-semibold text-white">Scenario not found</h1>
        <Link href="/saved">
          <Button className="bg-white text-black hover:bg-white/90">Back to Saved</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Mark Outcome — {scenario.input?.planet || "Unknown World"}</h1>
        <Link href={`/saved/${scenario.id}`}>
          <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">Back to Scenario</Button>
        </Link>
      </div>

      {!attachedCampaign ? (
        <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-4 text-amber-100">
          This scenario is not attached to any campaign. Attach it in <Link className="underline" href={`/saved/${scenario.id}`}>Saved → {scenario.id}</Link> first.
        </div>
      ) : (
        <Card className="bg-black/60 border-white/10 text-white">
          <CardContent className="grid gap-4 p-5">
            <div>
              <Label>Outcome summary</Label>
              <Textarea
                className="mt-1"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Who won, key plays, objective completions…"
              />
            </div>

            <div className="grid gap-3">
              <Label>Resonance Points Δ by faction (RP)</Label>
              {derivedFactions.length === 0 ? (
                <div className="text-sm opacity-80">No roster detected for this scenario.</div>
              ) : (
                <div className="grid gap-2">
                  {derivedFactions.map((f) => (
                    <div key={f} className="flex items-center gap-3">
                      <div className="min-w-48">{f}</div>
                      <Input
                        className="w-28"
                        value={rpMap[f] ?? "0"}
                        onChange={onRpChange(f)}
                        inputMode="numeric"
                        placeholder="0"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label>Campaign Game Points Δ (CGP)</Label>
              <Input
                className="mt-1 w-32"
                value={cgpDelta}
                onChange={(e) => { if (/^-?\d*$/.test(e.target.value)) setCgpDelta(e.target.value); }}
                inputMode="numeric"
                placeholder="0"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button className="bg-white text-black hover:bg-white/90" onClick={onSave}>
                Save Outcome
              </Button>
              <Link href={`/saved/${scenario.id}`}>
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  Cancel
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
