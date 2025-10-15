// app/src/app/campaigns/[id]/ScenariosPanel.tsx
"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { useCampaignStore } from "@/lib/campaignStore";
import { useScenarioStore } from "@/lib/scenarioStore";
import { useOutcomeStore } from "@/lib/outcomeStore";
import {
  useCampaignFlowStore,
  warhostsFromSlots,
  type CampaignBattle,
} from "@/lib/campaignFlowStore";
import { formatFactionChoice } from "@/lib/options";
import { postJSON } from "@/lib/apiClient";

import type { CampaignEpisodeInput } from "@/lib/generator";
import type { ScenarioInput, WarhostInput, BattleFormat } from "@/lib/types";

import {
  getSegmentumOptions,
  getPlanetOptionsBySegmentum,
  getToneOptions,
  type Option,
} from "@/lib/optionsProvider";

import ScenarioSchedule from "@/components/campaign/ScenarioSchedule";
import SlotCard from "@/components/campaign/SlotCard";
import SubmitOutcomeModal from "@/components/campaign/SubmitOutcomeModal";

type ApiResp = { narrative?: string; aiUsed?: boolean; aiError?: string };

export default function ScenariosPanel({ campaignId }: { campaignId: string }) {
  const campaigns = useCampaignStore((s) => s.campaigns);
  const addScenario = useScenarioStore((s) => s.addScenario);
  const attachScenario = useCampaignStore((s) => s.attachScenario);
  const detachScenario = useCampaignStore((s) => s.detachScenario);
  const scenarios = useScenarioStore((s) => s.scenarios);
  const outcomesByCampaign = useOutcomeStore((s) => s.outcomesByCampaign);
  const { battlesByCampaign, addBattle, setSlot, setGenerated, removeBattle } =
    useCampaignFlowStore();

  const campaign = campaigns.find((c) => c.id === campaignId);
  const attachedScenarioRecords = useMemo(() => {
    if (!campaign) return [];
    const ids = campaign.scenarioIds ?? [];
    return scenarios.filter((s) => ids.includes(s.id));
  }, [campaign, scenarios]);

  const battles = battlesByCampaign[campaignId] || [];
  const drafts = battles.filter((b) => b.status === "draft");

  const segOptions: Option[] = useMemo(() => getSegmentumOptions(), []);
  const [format, setFormat] = useState<BattleFormat>("1v1");
  const [segmentum, setSegmentum] = useState<string>(segOptions[0]?.value ?? "");
  const planetOptions = useMemo(
    () => (segmentum ? getPlanetOptionsBySegmentum(segmentum) : []),
    [segmentum]
  );
  const [planet, setPlanet] = useState<string>("");

  const toneOpts = useMemo(() => getToneOptions(), []);
  const initialToneKey =
    campaign?.tone && toneOpts.some((o) => o.value === campaign.tone)
      ? (campaign.tone as string)
      : toneOpts[0]?.value ?? "grimdark";
  const [toneKey, setToneKey] = useState<string>(initialToneKey);

  const [stakes, setStakes] = useState<string>("");
  const [seed, setSeed] = useState<string>("");

  const onCreateDraft = () => {
    if (!campaign) return;
    addBattle(campaign.id, { format, segmentum, planet, tone: toneKey, stakes, seed });
    setStakes("");
  };

  // previousEpisodes are derived on-demand where needed via buildPrevEpisodes()

  const [outcomeTarget, setOutcomeTarget] = useState<null | { id: string; input: ScenarioInput }>(
    null
  );

  return (
    <div className="space-y-5">
      <Card className="bg-transparent border-none shadow-none">
        <CardContent className="p-0">
          <details className="group rounded-2xl border border-black/20 bg-white text-black">
            <summary className="list-none cursor-pointer select-none rounded-2xl border-b border-black/10 px-4 py-4 text-center text-2xl font-bold [&::-webkit-details-marker]:hidden [&::marker]:hidden">
              Create Scenario (Draft)
            </summary>

            <div className="rounded-b-2xl bg-black/60 p-5 text-white">
              <div className="grid gap-2 sm:grid-cols-3">
                <div>
                  <Label>Battle format</Label>
                  <select
                    className="mt-1 w-full rounded-md border border-white/20 bg-black/40 p-2"
                    value={format}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                      setFormat(e.target.value as BattleFormat)
                    }
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
                  <Label>Segmentum</Label>
                  <select
                    className="mt-1 w-full rounded-md border border-white/20 bg-black/40 p-2"
                    value={segmentum}
                    onChange={(e) => {
                      setSegmentum(e.target.value);
                      setPlanet("");
                    }}
                  >
                    {segOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label>Planet</Label>
                  <select
                    className="mt-1 w-full rounded-md border border-white/20 bg-black/40 p-2"
                    value={planet}
                    onChange={(e) => setPlanet(e.target.value)}
                  >
                    <option value="">Select a planet</option>
                    {planetOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                <div>
                  <Label>Tone</Label>
                  <select
                    className="mt-1 w-full rounded-md border border-white/20 bg-black/40 p-2"
                    value={toneKey}
                    onChange={(e) => setToneKey(e.target.value)}
                  >
                    {toneOpts.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Seed (optional)</Label>
                <Input
                    className="mt-1"
                    value={seed}
                    onChange={(e) => setSeed(e.target.value)}
                    placeholder="stable generation seed"
                  />
                </div>
                <div className="sm:col-span-1">
                  <Label>Personal stakes</Label>
                  <Textarea
                    className="mt-1"
                    value={stakes}
                    onChange={(e) => setStakes(e.target.value)}
                    placeholder="e.g., rescue a VIP, secure archeotech"
                  />
                </div>
              </div>

              <div className="pt-3">
                <Button className="bg-white text-black hover:bg-white/90" onClick={onCreateDraft}>
                  Create Draft
                </Button>
              </div>
            </div>
          </details>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {attachedScenarioRecords
          .slice()
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
          .map((s) => (
            <Card key={s.id} className="bg-black/60 border-white/10 text-white">
              <CardContent className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="truncate font-semibold">
                      {s.input.campaignName || "Untitled"} — {s.input.planet || "Unknown World"}
                    </div>
                    <div className="text-sm opacity-80">
                      {(s.input.battleFormat || "1v1").toUpperCase()} ·{" "}
                      {new Date(s.createdAt).toLocaleString()}
                    </div>
                    <ScenarioSchedule
                      valueIso={campaign?.battleTimes?.[s.id]}
                      onChange={(iso) =>
                        useCampaignStore.getState().setBattleTime(campaignId, s.id, iso)
                      }
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/saved/${s.id}`}>
                      <Button
                        variant="outline"
                        className="border-white/30 text-white hover:bg-white/10"
                      >
                        View
                      </Button>
                    </Link>

                    <Button
                      variant="outline"
                      className="border-emerald-400/40 text-emerald-200 hover:bg-emerald-500/10"
                      onClick={() => setOutcomeTarget({ id: s.id, input: s.input })}
                      title="Submit outcome for this scenario"
                    >
                      Submit Outcome
                    </Button>

                    <Button
                      variant="outline"
                      className="border-red-400/40 text-red-200 hover:bg-red-500/10"
                      onClick={() => detachScenario(campaignId, s.id)}
                      title="Remove this scenario from the campaign"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

        {drafts
          .slice()
          .reverse()
          .map((b) => (
            <Card key={b.id} className="bg-black/60 border-white/10 text-white">
              <CardContent className="p-4">
                <details>
                  <summary className="flex cursor-pointer items-center justify-between gap-2">
                    <div>
                      <div className="font-semibold">
                        <span className="mr-2 rounded-md border border-yellow-400/40 bg-yellow-500/10 px-2 py-0.5 text-xs text-yellow-200">
                          Draft
                        </span>
                        {b.format} • {b.planet || "Unknown World"}
                      </div>
                      <div className="text-xs opacity-70">
                        {b.segmentum ? `${b.segmentum} Segmentum • ` : ""}
                        Created {new Date(b.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        className="border-white/30 text-white hover:bg-white/10"
                        onClick={() => removeBattle(campaignId, b.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </summary>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {b.slots.map((s) => (
                      <SlotCard
                        key={s.index}
                        slot={s}
                        onChange={(patch) => setSlot(campaignId, b.id, s.index, patch)}
                      />
                    ))}
                  </div>

                  <FooterGenerate
                    b={b}
                    campaignId={campaignId}
                    campaignName={campaign?.name || ""}
                    campaignTone={campaign?.tone}
                    previousEpisodes={buildPrevEpisodes(campaignId)}
                    onAfterGenerate={(scenarioId, narrative) =>
                      setGenerated(campaignId, b.id, scenarioId, narrative)
                    }
                    attachScenario={attachScenario}
                    addScenario={addScenario}
                  />
                </details>
              </CardContent>
            </Card>
          ))}
      </div>

      <SubmitOutcomeModal
        open={!!outcomeTarget}
        onClose={() => setOutcomeTarget(null)}
        campaignId={campaignId}
        scenario={outcomeTarget}
      />
    </div>
  );
}

function FooterGenerate(props: {
  b: CampaignBattle;
  campaignId: string;
  campaignName: string;
  campaignTone?: string;
  previousEpisodes: NonNullable<CampaignEpisodeInput["campaign"]>["previousEpisodes"];
  onAfterGenerate: (scenarioId: string, narrative?: string) => void;
  attachScenario: (campaignId: string, scenarioId: string) => void;
  addScenario: (rec: { id: string; createdAt: string; input: ScenarioInput; narrative: string }) => void;
}) {
  const {
    b,
    campaignId,
    campaignName,
    campaignTone,
    previousEpisodes,
    onAfterGenerate,
    attachScenario,
    addScenario,
  } = props;

  const ready = b.slots.every((s) => !!s.faction && s.faction.trim().length > 0);

  const onGenerate = async () => {
    const warhosts = warhostsFromSlots(b.format, b.slots);
    const playersCount = b.slots.length;

    const campaignMode =
      useCampaignStore.getState().campaigns.find((c) => c.id === campaignId)?.mode ===
      "interplanetary"
        ? "interplanetary"
        : "planetary";

    const payload: Partial<CampaignEpisodeInput> & {
      battleFormat: BattleFormat;
      playersCount?: number;
    } = {
      campaign: {
        id: campaignId,
        name: campaignName,
        tone: b.tone || campaignTone || undefined,
        mode: campaignMode,
        planetName: b.planet || undefined,
        previousEpisodes,
      },
      warhosts,
      requestedPlanet: b.planet || undefined,
      stakes: b.stakes || undefined,
      tone: b.tone || campaignTone || undefined,
      battleFormat: b.format,
      playersCount,
    };

    const json = await postJSON<typeof payload, ApiResp>(
      "/api/campaign-generate",
      payload,
      { message: "Assembling forces and mission parameters…" }
    );

    const narrative = json.narrative?.trim() || "No narrative returned.";
    const newId = globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}`;
    const input: ScenarioInput = {
      campaignName,
      battleFormat: b.format,
      planet: b.planet || "",
      tone: b.tone || campaignTone || "",
      stakes: b.stakes || "",
      warhosts,
      playersCount,
    } as ScenarioInput;

    addScenario({ id: newId, createdAt: new Date().toISOString(), input, narrative });
    attachScenario(campaignId, newId);
    onAfterGenerate(newId, narrative);
  };

  return (
    <div className="mt-4 flex items-center justify-between gap-3">
      <div className="text-xs opacity-80">
        Players: select Faction & Subfaction. When all slots are filled, the host can generate the scenario.
      </div>
      <div className="flex items-center gap-2">
        <Button
          className="bg-white text-black hover:bg-white/90"
          disabled={!ready}
          onClick={onGenerate}
          title={ready ? "Generate scenario" : "Fill all slots with factions first"}
        >
          {ready ? "Generate Scenario" : "Waiting for slots"}
        </Button>
      </div>
    </div>
  );
}

function buildPrevEpisodes(campaignId: string) {
  const campaigns = useCampaignStore.getState().campaigns;
  const campaign = campaigns.find((c) => c.id === campaignId);
  const outcomesByCampaign = useOutcomeStore.getState().outcomesByCampaign;
  const scenarios = useScenarioStore.getState().scenarios;
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
}
