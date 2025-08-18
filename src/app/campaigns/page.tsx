// FILE: src/app/campaigns/page.tsx
"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useCampaignStore } from "@/lib/campaignStore";
import { useScenarioStore } from "@/lib/scenarioStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";


/** Returns a human label for the next upcoming battle.
 *  - Uses only battle times belonging to scenarios that still exist.
 *  - Picks the soonest future time; if none, shows the most recent past time with "(past)".
 */
function nextBattleLabel(
  campaign: { scenarioIds: string[]; battleTimes?: Record<string, string | undefined> },
  existingScenarioIds: Set<string>
): string {
  const times = Object.entries(campaign.battleTimes ?? {})
    .filter(([sid, iso]) => !!iso && existingScenarioIds.has(sid) && campaign.scenarioIds.includes(sid))
    .map(([, iso]) => Date.parse(iso as string))
    .filter((t) => !Number.isNaN(t));

  if (times.length === 0) return "—";

  const now = Date.now();
  const future = times.filter((t) => t >= now).sort((a, b) => a - b);
  if (future.length > 0) {
    return new Date(future[0]).toLocaleString();
    }
  const latestPast = Math.max(...times);
  return `${new Date(latestPast).toLocaleString()} (past)`;
}

export default function CampaignsPage() {
  const campaigns = useCampaignStore((s) => s.campaigns);
  const scenarios = useScenarioStore((s) => s.scenarios);
  const existingScenarioIds = useMemo(() => new Set(scenarios.map((s) => s.id)), [scenarios]);
  const empty = campaigns.length === 0;

  return (
    <div className="relative z-10 mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Campaigns</h1>
        <Link href="/campaigns/new">
          <Button className="bg-white text-black hover:bg-white/90">New Campaign</Button>
        </Link>
      </div>

      {empty ? (
        <p className="text-white/70">No campaigns yet. Create one to start organizing scenarios and schedules.</p>
      ) : (
        <div className="grid gap-4">
          {campaigns.map((c) => {
            const attachedCount = c.scenarioIds.filter((id) => existingScenarioIds.has(id)).length;
            const nextLabel = nextBattleLabel(c, existingScenarioIds);
            return (
              <Card key={c.id} className="bg-black/60 border-white/10 text-white">
                <CardContent className="p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-lg font-semibold">{c.name}</div>
                      <div className="text-sm text-white/70">
                        Tone: {c.tone || "—"} · Code: <span className="font-mono">{c.code}</span> · Scenarios: {attachedCount}
                      </div>
                      <div className="text-sm mt-1">
                        <span className="opacity-80">Next battle:</span> {nextLabel}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/campaigns/${c.id}`}>
                        <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                          Open
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
