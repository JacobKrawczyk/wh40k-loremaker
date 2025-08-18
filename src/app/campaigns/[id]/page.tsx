// FILE: src/app/campaigns/[id]/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useCampaignStore } from "@/lib/campaignStore";
import { useScenarioStore } from "@/lib/scenarioStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function CampaignRoomPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  // Stores (hooks must be unconditional)
  const campaigns = useCampaignStore((s) => s.campaigns);
  const scenarios = useScenarioStore((s) => s.scenarios);
  const setBattleTime = useCampaignStore((s) => s.setBattleTime);
  const detachScenario = useCampaignStore((s) => s.detachScenario);
  const removeCampaign = useCampaignStore((s) => s.removeCampaign);

  // Hydration guard
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  // Find the campaign (can be undefined on first render)
  const campaign = useMemo(() => campaigns.find((x) => x.id === id), [campaigns, id]);

  // Compute attached scenarios regardless of found/not found (empty if not found)
  const attachedScenarios = useMemo(() => {
    const ids = campaign?.scenarioIds ?? [];
    return scenarios.filter((s) => ids.includes(s.id));
  }, [scenarios, campaign?.scenarioIds]);

  // Helper
  function copyInvite() {
    if (!campaign) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/campaigns/${campaign.id}?join=${campaign.code ?? ""}`;
    navigator.clipboard.writeText(url);
  }

  function onDeleteCampaign() {
    if (!campaign) return;
    const typed = prompt(
      `To permanently delete this campaign, type DELETE (all caps).\n\nCampaign: "${campaign.name}"`
    );
    if (typed !== "DELETE") {
      alert("Deletion cancelled. You must type DELETE exactly.");
      return;
    }
    removeCampaign(campaign.id);
    router.push("/campaigns");
  }

  // Renders
  if (!hydrated) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 p-6">
        <div className="h-8 w-72 animate-pulse rounded bg-white/10" />
        <div className="h-5 w-56 animate-pulse rounded bg-white/10" />
        <div className="h-[50vh] animate-pulse rounded-2xl border border-white/10 bg-black/50 p-6 backdrop-blur" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 p-6">
        <h1 className="text-2xl font-semibold text-white">Campaign not found</h1>
        <p className="text-white/70">The campaign ID doesn&apos;t exist in your local store.</p>
        <Link href="/campaigns">
          <Button className="bg-white text-black hover:bg-white/90">Back to Campaigns</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">{campaign.name}</h1>
          <p className="text-white/70">
            Tone: {campaign.tone || "—"} · Code: <span className="font-mono">{campaign.code ?? "—"}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/campaigns">
            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
              Back
            </Button>
          </Link>
          <Button className="bg-white text-black hover:bg-white/90" onClick={copyInvite}>
            Copy Invite
          </Button>
        </div>
      </div>

      {/* Attached scenarios overview */}
      <Card className="bg-black/60 border-white/10 text-white">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold">Scenarios</div>
            <Link href="/saved">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                Attach from Saved
              </Button>
            </Link>
          </div>

          {attachedScenarios.length === 0 ? (
            <p className="text-white/70">
              No scenarios attached yet. Go to Saved and decide which ones belong to this campaign.
            </p>
          ) : (
            <div className="grid gap-3">
              {attachedScenarios.map((s) => (
                <Card key={s.id} className="bg-black/40 border-white/10">
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="truncate font-semibold">
                          {s.input.campaignName || "Untitled"} — {s.input.planet || "Theater"}
                        </div>
                        <div className="text-sm opacity-80">
                          {(s.input.battleFormat || "1v1").toUpperCase()} · {new Date(s.createdAt).toLocaleString()}
                        </div>
                        {/* Schedule display */}
                        <div className="mt-1 text-sm">
                          <span className="opacity-70">Scheduled:</span>{" "}
                          {campaign.battleTimes?.[s.id]
                            ? new Date(campaign.battleTimes[s.id]!).toLocaleString()
                            : "—"}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/saved/${s.id}`}>
                          <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                            View
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          className="border-red-400/40 text-red-200 hover:bg-red-500/10"
                          onClick={() => detachScenario(campaign.id, s.id)}
                          title="Detach scenario from this campaign"
                        >
                          Detach
                        </Button>
                      </div>
                    </div>

                    {/* Schedule editor */}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <input
                        type="datetime-local"
                        className="rounded-md border border-white/20 bg-black/40 p-2 text-white"
                        value={campaign.battleTimes?.[s.id] ? toLocalInputValue(campaign.battleTimes[s.id]!) : ""}
                        onChange={(e) => {
                          const iso = fromLocalInputValue(e.target.value);
                          setBattleTime(campaign.id, s.id, iso);
                        }}
                      />
                      <Button
                        variant="outline"
                        className="border-white/30 text-white hover:bg-white/10"
                        onClick={() => setBattleTime(campaign.id, s.id, undefined)}
                        title="Clear scheduled time"
                      >
                        Clear
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone (delete campaign) */}
      <Card className="bg-black/60 border-red-500/30 text-white">
        <CardContent className="p-5 space-y-3">
          <div className="text-lg font-semibold text-red-300">Danger Zone</div>
          <p className="text-sm text-white/80">
            Deleting a campaign removes it from your device. Saved scenarios remain available in{" "}
            <span className="underline">/saved</span>.
          </p>
          <Button
            variant="outline"
            className="border-red-400/40 text-red-200 hover:bg-red-500/10"
            onClick={onDeleteCampaign}
            title="Delete this campaign"
          >
            Delete Campaign
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Helpers: convert between ISO and <input type="datetime-local"> local value
function toLocalInputValue(iso: string): string {
  try {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  } catch {
    return "";
  }
}
function fromLocalInputValue(local: string): string | undefined {
  if (!local) return undefined;
  const d = new Date(local);
  return isNaN(d.getTime()) ? undefined : d.toISOString();
}
