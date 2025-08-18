// FILE: src/app/campaigns/[id]/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { useScenarioStore } from "@/lib/scenarioStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ScenarioPreviewPage() {
  const { id } = useParams() as { id: string };
  const scenarios = useScenarioStore((s) => s.scenarios);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  const rec = useMemo(() => scenarios.find((r) => r.id === id), [scenarios, id]);

  // Skeleton while zustand (localStorage) rehydrates
  if (!hydrated) {
    return (
      <div className="relative z-10 mx-auto max-w-3xl space-y-6 p-6">
        <div className="h-8 w-72 animate-pulse rounded bg-white/10" />
        <div className="h-5 w-56 animate-pulse rounded bg-white/10" />
        <div className="h-[60vh] animate-pulse rounded-2xl border border-white/10 bg-black/50 p-6 backdrop-blur" />
      </div>
    );
  }

  // Not found state (e.g., cleared storage or wrong URL)
  if (!rec) {
    return (
      <div className="relative z-10 mx-auto max-w-3xl space-y-4 p-6">
        <h1 className="text-2xl font-semibold text-white">Scenario not found</h1>
        <p className="text-white/70">
          This scenario isn&apos;t in your local history. It may have been cleared, or the link is
          invalid.
        </p>
        <div className="mt-2">
          <Link href="/campaigns">
            <Button className="bg-white text-black hover:bg-white/90">Back to Campaigns</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { input, narrative, createdAt } = rec;

  function copyNarrative() {
    navigator.clipboard.writeText(narrative);
  }

  function downloadFile(name: string, content: string) {
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function handleDownload() {
    const stamp = new Date(createdAt).toISOString().slice(0, 19).replace(/[:T]/g, "-");
    const name =
      `${(input.campaignName || "scenario")
        .toLowerCase()
        .replace(/[^a-z0-9\-]+/gi, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")}-${stamp}.md` || `scenario-${stamp}.md`;
    downloadFile(name, narrative);
  }

  return (
    <div className="relative z-10 mx-auto max-w-3xl space-y-4 p-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {input.campaignName || "Untitled Campaign"}
          </h1>
          <p className="text-sm text-white/70">
            {input.playerFaction || "Faction"} vs {input.otherFactions || "Opponents"} ·{" "}
            {(input.battleFormat || "1v1").toUpperCase()} ·{" "}
            {new Date(createdAt).toLocaleString()}
            {input.planet ? ` · ${input.planet}` : ""}
          </p>
        </div>

        <div className="flex gap-2">
          <Button className="bg-white text-black hover:bg-white/90" onClick={copyNarrative}>
            Copy
          </Button>
          <Button
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10"
            onClick={handleDownload}
            title="Download as Markdown"
          >
            Download .md
          </Button>
          <Link href="/campaigns">
            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
              Back
            </Button>
          </Link>
        </div>
      </div>

      <Card className="bg-black/60 border-white/10 text-white">
        <CardContent className="prose prose-invert max-w-none p-6">
          <ReactMarkdown>{narrative}</ReactMarkdown>
        </CardContent>
      </Card>
    </div>
  );
}
