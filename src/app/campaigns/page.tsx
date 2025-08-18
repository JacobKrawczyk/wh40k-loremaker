// FILE: src/app/campaigns/page.tsx
"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useScenarioStore } from "@/lib/scenarioStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function fmt(dateIso: string) {
  try {
    return new Date(dateIso).toLocaleString();
  } catch {
    return dateIso;
  }
}

export default function CampaignsPage() {
  const scenarios = useScenarioStore((s) => s.scenarios);
  const clearAll = useScenarioStore((s) => s.clearAll);
  const empty = useMemo(() => scenarios.length === 0, [scenarios.length]);

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
          {scenarios.map((s) => (
            <Card key={s.id} className="bg-black/60 border-white/10 text-white">
              <CardContent className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-lg font-semibold">
                      {s.input.campaignName || "Untitled Campaign"} — {s.input.planet || "Theater"}
                    </div>
                    <div className="text-sm text-white/70">
                      {s.input.playerFaction || "Faction"} vs {s.input.otherFactions || "Opponents"} · {(s.input.battleFormat || "1v1").toUpperCase()} · {fmt(s.createdAt)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <CopyButton text={s.narrative} />
                    <ViewButton id={s.id} />
                    <DeleteButton id={s.id} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
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
    <Link href={`/campaigns/${id}`}>
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
