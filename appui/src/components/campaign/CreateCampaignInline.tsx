"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import { useCampaignStore, type CampaignMode } from "@/lib/campaignStore";
import { getToneOptions } from "@/lib/optionsProvider";

export default function CreateCampaignInline() {
  const router = useRouter();
  const addCampaign = useCampaignStore((s) => s.addCampaign);

  const [name, setName] = useState("");
  const toneOptions = useMemo(() => getToneOptions(), []);
  const [toneKey, setToneKey] = useState<string>(toneOptions[0]?.value ?? "grimdark");
  const [mode, setMode] = useState<CampaignMode>("sequential-claim");

  const onCreate = () => {
    const id = addCampaign({
      name: name.trim() || "Untitled Campaign",
      tone: toneKey,
      mode,
    });
    router.push(`/campaigns/${id}`);
  };

  return (
    <Card className="bg-black/60 border-white/10 text-white">
      <CardContent className="grid gap-4 p-5">
        <h2 className="text-xl font-semibold">Create Campaign</h2>

        <div>
          <Label>Campaign name</Label>
          <Input
            className="mt-1"
            value={name}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            placeholder="e.g., The Ghoul Stars Push"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Default tone</Label>
            <select
              className="mt-1 w-full rounded-md border border-white/20 bg-black/40 p-2"
              value={toneKey}
              onChange={(e) => setToneKey(e.target.value)}
            >
              {toneOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs opacity-70">
              Baseline vibe for generated scenarios (can be overridden per scenario).
            </p>
          </div>

          <div>
            <Label>Campaign type</Label>
            <select
              className="mt-1 w-full rounded-md border border-white/20 bg-black/40 p-2"
              value={mode}
              onChange={(e) => setMode(e.target.value as CampaignMode)}
            >
              <option value="sequential-claim">Conquest (claim planets sequentially)</option>
              <option value="interplanetary">Interplanetary (new world each battle)</option>
            </select>
            <p className="mt-1 text-xs opacity-70">
              Conquest: multiple games can happen on one planet until a side claims it, then the war
              advances. Interplanetary: every battle is on a different planet.
            </p>
          </div>
        </div>

        <div className="pt-2">
          <Button className="bg-white text-black hover:bg-white/90" onClick={onCreate}>
            Create Campaign
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
