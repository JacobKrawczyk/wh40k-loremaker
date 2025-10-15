"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { getToneOptions } from "@/lib/options";
import { postJSON } from "@/lib/apiClient";
import { useBusyStore } from "@/lib/busyStore";

type CampaignMode = "interplanetary" | "sequential-claim";

export default function CreateCampaignForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const toneOptions = getToneOptions();
  const [toneKey, setToneKey] = useState<string>(toneOptions[0]?.value ?? "grimdark");
  const [mode, setMode] = useState<CampaignMode>("sequential-claim");

  const begin = useBusyStore((s) => s.begin);
  const endSuccess = useBusyStore((s) => s.endSuccess);
  const setError = useBusyStore((s) => s.setError);

  const onCreate = async () => {
    begin("Creating campaign…");
    try {
      const payload = { name, tone: toneKey, mode };
      const res = await postJSON<typeof payload, { campaign: { id: string } }>(
        "/api/campaigns",
        payload
      );
      endSuccess();
      router.push(`/campaigns/${res.campaign.id}`);
    } catch (e) {
      setError(String(e));
    }
  };

  return (
    <Card className="bg-black/60 border-white/10 text-white">
      <CardContent className="grid gap-4 p-5">
        <div>
          <Label>Campaign name</Label>
          <Input
            className="mt-1"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
