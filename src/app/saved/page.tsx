// FILE: src/app/saved/page.tsx
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useScenarioStore } from "@/lib/scenarioStore";
import { useCampaignStore } from "@/lib/campaignStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function fmt(dateIso: string) {
  try {
    return new Date(dateIso).toLocaleString();
  } catch {
    return dateIso;
  }
}

export default function SavedScenariosPage() {
  const scenarios = useScenarioStore((s) => s.scenarios);
  const clearAll = useScenarioStore((s) => s.clearAll);
  const empty = useMemo(() => scenarios.length === 0, [scenarios.length]);

  const campaigns = useCampaignStore((s) => s.campaigns);

  return (
    <div className="relative z-10 mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Saved Scenarios</h1>
        <Button
          onClick={() => clearAll()}
          className="bg-white text-black hover:bg-white/90"
          disabled={empty}
          title={empty ? "No scenarios to clear" : "Remove all saved scenarios"}
        >
          Clear all
        </Button>
      </div>

      {empty ? (
        <p className="text-white/70">
          Nothing here yet. Generate a scenario on <span className="underline">/scenario</span> and it will show up here automatically.
        </p>
      ) : (
        <div className="grid gap-4">
          {scenarios.map((s) => {
            const attachedTo = campaigns.filter((c) => c.scenarioIds.includes(s.id));

            return (
              <Card key={s.id} className="bg-black/60 border-white/10 text-white">
                <CardContent className="p-5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      {/* Title is scenario name only */}
                      <div className="truncate text-lg font-semibold">
                        {s.input.campaignName || "Untitled Scenario"}
                      </div>

                      {/* Meta row: format + time */}
                      <div className="text-sm text-white/70">
                        {(s.input.battleFormat || "1v1").toUpperCase()} · {fmt(s.createdAt)}
                      </div>

                      {/* Planet badge */}
                      {s.input.planet ? (
                        <div className="mt-2">
                          <span className="rounded-md border border-sky-400/40 bg-sky-500/10 px-2 py-0.5 text-xs text-sky-200">
                            Planet: {s.input.planet}
                          </span>
                        </div>
                      ) : null}

                      {/* Attached campaign badges (each is a link) */}
                      {attachedTo.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {attachedTo.map((c) => (
                            <Link key={c.id} href={`/campaigns/${c.id}`}>
                              <span
                                className="cursor-pointer rounded-md border border-emerald-400/40 bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-200 hover:bg-emerald-500/20"
                                title={`Open ${c.name}`}
                              >
                                {c.name} Campaign
                              </span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <CopyButton text={s.narrative} />
                      <ViewButton id={s.id} />
                      <DeleteButton id={s.id} />
                    </div>
                  </div>

                  {/* Quick attach controls — limited to ONE campaign */}
                  <AttachControls scenarioId={s.id} />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  return (
    <Button
      className="bg-white text-black hover:bg-white/90"
      onClick={() => navigator.clipboard.writeText(text)}
      title="Copy narrative to clipboard"
    >
      Copy
    </Button>
  );
}

function ViewButton({ id }: { id: string }) {
  return (
    <Link href={`/saved/${id}`}>
      <Button
        variant="outline"
        className="border-white/30 text-white hover:bg-white/10"
        title="Open detailed preview"
      >
        View
      </Button>
    </Link>
  );
}

function DeleteButton({ id }: { id: string }) {
  const removeScenario = useScenarioStore((s) => s.removeScenario);
  const onDelete = () => {
    if (confirm("Delete this scenario? This cannot be undone.")) {
      removeScenario(id);
    }
  };
  return (
    <Button
      variant="outline"
      className="border-red-400/40 text-red-200 hover:bg-red-500/10"
      onClick={onDelete}
      title="Delete this scenario"
    >
      Delete
    </Button>
  );
}

/* ---- per-card attach select/button (ONE campaign only) ---- */
function AttachControls({ scenarioId }: { scenarioId: string }) {
  const campaigns = useCampaignStore((s) => s.campaigns);
  const attach = useCampaignStore((s) => s.attachScenario);
  const [cid, setCid] = useState<string>(campaigns[0]?.id || "");

  if (campaigns.length === 0) {
    return (
      <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white/80">
        No campaigns yet. Create one on <Link href="/campaigns" className="underline">/campaigns</Link>.
      </div>
    );
  }

  // Enforce ONE campaign: if already attached anywhere, hide the attach UI
  const attachedTo = campaigns.filter((c) => c.scenarioIds.includes(scenarioId));
  const alreadyAttached = attachedTo.length > 0;
  const first = attachedTo[0];

  if (alreadyAttached && first) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Button className="cursor-default bg-white/20 text-white" disabled>
          Attached
        </Button>
        <Link href={`/campaigns/${first.id}`}>
          <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
            Open Campaign
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        className="rounded-md border border-white/20 bg-black/40 p-2"
        value={cid}
        onChange={(e) => setCid(e.target.value)}
      >
        {campaigns.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name} {c.tone ? `· ${c.tone}` : ""}
          </option>
        ))}
      </select>
      <Button
        className="bg-white text-black hover:bg-white/90 disabled:opacity-60"
        onClick={() => cid && attach(cid, scenarioId)}
        disabled={!cid}
        title="Attach scenario to this campaign"
      >
        Attach
      </Button>
      {cid && (
        <Link href={`/campaigns/${cid}`}>
          <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
            Open Campaign
          </Button>
        </Link>
      )}
    </div>
  );
}
