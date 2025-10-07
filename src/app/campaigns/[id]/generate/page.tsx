"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useCampaignStore } from "@/lib/campaignStore";
import { useScenarioStore } from "@/lib/scenarioStore";
import { useOutcomeStore } from "@/lib/outcomeStore";
import { useCampaignFlowStore, warhostsFromSlots, type CampaignBattle, type PlayerSlot } from "@/lib/campaignFlowStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatFactionChoice } from "@/lib/options";

import type { CampaignEpisodeInput } from "@/lib/generator";
import type { ScenarioInput, WarhostInput, BattleFormat } from "@/lib/types";

type ApiResp = { narrative?: string; aiUsed?: boolean; aiError?: string };

export default function CampaignGenerateLobbyPage() {
  const { id: campaignId } = useParams() as { id: string };

  // stores
  const campaigns = useCampaignStore((s) => s.campaigns);
  const attachScenario = useCampaignStore((s) => s.attachScenario);
  const scenarios = useScenarioStore((s) => s.scenarios);
  const addScenario = useScenarioStore((s) => s.addScenario);
  const outcomesByCampaign = useOutcomeStore((s) => s.outcomesByCampaign);

  const { battlesByCampaign, addBattle, setBattleMeta, setSlot, setGenerated, removeBattle } =
    useCampaignFlowStore();

  // hydration
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const campaign = useMemo(() => campaigns.find((c) => c.id === campaignId), [campaigns, campaignId]);
  const battles = battlesByCampaign[campaignId] || [];

  // ----- Create Draft form -----
  const [format, setFormat] = useState<BattleFormat>("1v1");
  const [planet, setPlanet] = useState<string>("");
  const [tone, setTone] = useState<string>(campaign?.tone || "");
  const [stakes, setStakes] = useState<string>("");
  const [seed, setSeed] = useState<string>("");

  const onCreateDraft = () => {
    if (!campaign) return;
    addBattle(campaign.id, { format, planet, tone, stakes, seed });
    setPlanet("");
    setStakes("");
  };

  // Derive previousEpisodes from outcome store for continuity
  const previousEpisodes = useMemo(() => {
    if (!campaign) return [];
    const cmap = outcomesByCampaign[campaign.id] || {};
    return campaign.scenarioIds
      .map((sid) => {
        const scen = scenarios.find((s) => s.id === sid);
        const out = cmap[sid];
        let factions: string[] = out?.factions ?? [];
        if ((!factions || factions.length === 0) && scen?.input?.warhosts) {
          const names: string[] = [];
          (scen.input.warhosts as WarhostInput[]).forEach((wh) => {
            (wh.players || []).forEach((p) => {
              const nm = formatFactionChoice(p.factionKey, p.subKey);
              if (nm) names.push(nm);
            });
          });
          factions = names;
        }
        const planetName = out?.planetName ?? (scen?.input as ScenarioInput | undefined)?.planet;
        const outcomeSummary = out?.outcomeSummary;
        const rpDeltaByFaction = out?.rpDeltaByFaction;
        const cgpDelta = out?.cgpDelta;
        if (!scen && !out) return null;
        return { scenarioId: sid, planetName, factions, outcomeSummary, rpDeltaByFaction, cgpDelta };
      })
      .filter(Boolean) as NonNullable<CampaignEpisodeInput["campaign"]>["previousEpisodes"];
  }, [campaign, outcomesByCampaign, scenarios]);

  // Check readiness: all slots have a faction
  const battleReady = (b: CampaignBattle) => b.slots.every((s) => !!s.faction && s.faction.trim().length > 0);

  // Generate a specific battle (no redirect; keep in campaign)
  const onGenerateBattle = async (b: CampaignBattle) => {
    if (!campaign) return;
    const warhosts = warhostsFromSlots(b.format, b.slots);
    const playersCount = b.slots.length;

    const payload: Partial<CampaignEpisodeInput> & { battleFormat: BattleFormat; playersCount?: number } = {
      campaign: {
        id: campaign.id,
        name: campaign.name,
        tone: b.tone || campaign.tone || undefined,
        mode: "planetary", // TODO: persist per-campaign; default planetary for now
        planetName: b.planet || undefined,
        previousEpisodes,
      },
      warhosts,
      requestedPlanet: b.planet || undefined,
      stakes: b.stakes || undefined,
      tone: b.tone || campaign.tone || undefined,
      battleFormat: b.format,
      playersCount,
    };

    try {
      const res = await fetch("/api/campaign-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`HTTP ${res.status} ${res.statusText} — ${txt}`);
      }
      const json: ApiResp = await res.json();
      const narrative = json.narrative?.trim() || "No narrative returned.";

      // Save as scenario (for preview/export) and mark battle generated
      const newId = globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}`;
      const newInput: ScenarioInput = {
        campaignName: campaign.name,
        battleFormat: b.format,
        planet: b.planet || "",
        tone: b.tone || campaign.tone || "",
        stakes: b.stakes || "",
        warhosts,
        playersCount,
      } as ScenarioInput;

      const record = { id: newId, createdAt: new Date().toISOString(), input: newInput, narrative };
      addScenario(record);
      attachScenario(campaign.id, newId);
      setGenerated(campaign.id, b.id, newId, narrative);
    } catch (e) {
      alert(`Generation failed.\n${String(e)}`);
    }
  };

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        <div className="h-8 w-72 animate-pulse rounded bg-white/10" />
        <div className="h-5 w-56 animate-pulse rounded bg-white/10" />
        <div className="h-[40vh] animate-pulse rounded-2xl border border-white/10 bg-black/50" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 p-6">
        <h1 className="text-2xl font-semibold text-white">Campaign not found</h1>
        <Link href="/campaigns">
          <Button className="bg-white text-black hover:bg-white/90">Back to Campaigns</Button>
        </Link>
      </div>
    );
  }

  // ----- UI -----
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Campaign Lobby — {campaign.name}</h1>
          <p className="text-sm opacity-75">Create a draft, let players lock slots, then generate the scenario.</p>
        </div>
        <Link href={`/campaigns/${campaign.id}`}>
          <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">Back</Button>
        </Link>
      </div>

      {/* Create draft */}
      <Card className="bg-black/60 border-white/10 text-white">
        <CardContent className="grid gap-4 p-5">
          <h2 className="text-xl font-semibold">Create Scenario (Draft)</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <Label>Battle format</Label>
              <select
                className="mt-1 w-full rounded-md border border-white/20 bg-black/40 p-2"
                value={format}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setFormat(e.target.value as BattleFormat)}
              >
                <option value="1v1">1v1</option>
                <option value="2v2">2v2</option>
                <option value="3v3">3v3</option>
                <option value="4v4">4v4</option>
                <option value="FFA">Free-for-all (4-way)</option>
                <option value="2v2v2v2">2v2v2v2</option>
              </select>
            </div>
            <div>
              <Label>Planet</Label>
              <Input className="mt-1" value={planet} onChange={(e) => setPlanet(e.target.value)} placeholder="e.g., Armageddon" />
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <Label>Tone (override)</Label>
              <Input className="mt-1" value={tone} onChange={(e) => setTone(e.target.value)} placeholder={campaign.tone || "grimdark"} />
            </div>
            <div>
              <Label>Seed (optional)</Label>
              <Input className="mt-1" value={seed} onChange={(e) => setSeed(e.target.value)} placeholder="stable generation seed" />
            </div>
          </div>

          <div>
            <Label>Personal stakes</Label>
            <Textarea className="mt-1" value={stakes} onChange={(e) => setStakes(e.target.value)} placeholder="e.g., rescue a VIP, secure archeotech" />
          </div>

          <div className="pt-1">
            <Button className="bg-white text-black hover:bg-white/90" onClick={onCreateDraft}>Create Draft</Button>
          </div>
        </CardContent>
      </Card>

      {/* Drafts & generated battles list */}
      {battles.length === 0 ? (
        <div className="rounded-xl border border-white/10 p-4 text-sm opacity-80">No battles yet. Create a draft above.</div>
      ) : (
        battles
          .slice()
          .reverse()
          .map((b) => (
            <Card key={b.id} className="bg-black/60 border-white/10 text-white">
              <CardContent className="grid gap-4 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-semibold">
                      {b.status === "draft" ? "Draft" : "Generated"} • {b.format} • {b.planet || "Unknown World"}
                    </div>
                    <div className="text-xs opacity-75">Created {new Date(b.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {b.status === "generated" && b.scenarioId ? (
                      <>
                        <Link href={`/saved/${b.scenarioId}`}>
                          <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">Open Preview</Button>
                        </Link>
                      </>
                    ) : (
                      <Button
                        className="bg-white text-black hover:bg-white/90"
                        disabled={!battleReady(b)}
                        onClick={() => onGenerateBattle(b)}
                        title={battleReady(b) ? "Generate scenario" : "Fill all slots with factions first"}
                      >
                        {battleReady(b) ? "Generate Scenario" : "Waiting for slots"}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="border-white/30 text-white hover:bg-white/10"
                      onClick={() => removeBattle(campaign.id, b.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>

                {/* Editable meta (planet/tone/stakes) */}
                {b.status === "draft" && (
                  <div className="grid gap-2 sm:grid-cols-3">
                    <div>
                      <Label>Planet</Label>
                      <Input
                        className="mt-1"
                        value={b.planet || ""}
                        onChange={(e) => setBattleMeta(campaign.id, b.id, { planet: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Tone</Label>
                      <Input
                        className="mt-1"
                        value={b.tone || ""}
                        onChange={(e) => setBattleMeta(campaign.id, b.id, { tone: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Seed</Label>
                      <Input
                        className="mt-1"
                        value={b.seed || ""}
                        onChange={(e) => setBattleMeta(campaign.id, b.id, { seed: e.target.value })}
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <Label>Personal stakes</Label>
                      <Textarea
                        className="mt-1"
                        value={b.stakes || ""}
                        onChange={(e) => setBattleMeta(campaign.id, b.id, { stakes: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {/* Slots grid */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {b.slots.map((s) => (
                    <SlotCard
                      key={s.index}
                      slot={s}
                      disabled={b.status !== "draft"}
                      onChange={(patch) => setSlot(campaign.id, b.id, s.index, patch)}
                    />
                  ))}
                </div>

                {/* Inline narrative preview (after generation) */}
                {b.status === "generated" && b.narrative && (
                  <details className="rounded-lg border border-white/10 bg-white/5 p-3">
                    <summary className="cursor-pointer text-sm opacity-80">Show narrative preview</summary>
                    <pre className="mt-2 max-h-[40vh] overflow-auto whitespace-pre-wrap text-sm leading-relaxed">
{b.narrative}
                    </pre>
                  </details>
                )}

                {/* Inline note */}
                {b.status === "draft" ? (
                  <div className="text-xs opacity-80">Players: enter a name (optional) and choose faction/subfaction to lock a slot. When all slots are filled, the host can Generate.</div>
                ) : (
                  <div className="text-xs opacity-80">
                    Scenario generated. You can open the preview or keep generating the next draft above.
                  </div>
                )}
              </CardContent>
            </Card>
          ))
      )}
    </div>
  );
}

function SlotCard({
  slot,
  disabled,
  onChange,
}: {
  slot: PlayerSlot;
  disabled?: boolean;
  onChange: (patch: Partial<PlayerSlot>) => void;
}) {
  return (
    <div className="rounded-xl border border-white/10 p-3">
      <div className="mb-2 text-sm opacity-80">Team {slot.team} • Slot {slot.index + 1}</div>
      <div className="grid gap-2">
        <div>
          <Label>Player (optional)</Label>
          <Input
            className="mt-1"
            value={slot.playerName || ""}
            disabled={disabled}
            onChange={(e) => onChange({ playerName: e.target.value })}
            placeholder="Your name"
          />
        </div>
        <div>
          <Label>Faction</Label>
          <Input
            className="mt-1"
            value={slot.faction || ""}
            disabled={disabled}
            onChange={(e) => onChange({ faction: e.target.value })}
            placeholder="e.g., imperial_fists"
          />
        </div>
        <div>
          <Label>Subfaction (optional)</Label>
          <Input
            className="mt-1"
            value={slot.subfaction || ""}
            disabled={disabled}
            onChange={(e) => onChange({ subfaction: e.target.value })}
            placeholder="e.g., templars"
          />
        </div>
        <div className="flex items-center gap-2 pt-1">
          <input
            id={`lock-${slot.index}`}
            type="checkbox"
            checked={!!slot.locked}
            disabled={disabled}
            onChange={(e) => onChange({ locked: e.target.checked })}
          />
          <Label htmlFor={`lock-${slot.index}`}>Lock this slot</Label>
        </div>
      </div>
    </div>
  );
}
