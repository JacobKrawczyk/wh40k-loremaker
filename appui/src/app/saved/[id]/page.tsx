// FILE: src/app/saved/[id]/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { useScenarioStore } from "@/lib/scenarioStore";
import { useCampaignStore } from "@/lib/campaignStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/* -------------------------- Main preview component ------------------------- */
export default function SavedScenarioPreviewPage() {
  const { id } = useParams() as { id: string };
  const scenarios = useScenarioStore((s) => s.scenarios);

  // hydration guard so Zustand data exists on client
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const rec = useMemo(() => scenarios.find((r) => r.id === id), [scenarios, id]);

  if (!hydrated) {
    return (
      <div className="relative z-10 mx-auto max-w-3xl space-y-6 p-6">
        <div className="h-8 w-72 animate-pulse rounded bg-white/10" />
        <div className="h-5 w-56 animate-pulse rounded bg-white/10" />
        <div className="h-[60vh] animate-pulse rounded-2xl border border-white/10 bg-black/50 p-6 backdrop-blur" />
      </div>
    );
  }

  if (!rec) {
    return (
      <div className="relative z-10 mx-auto max-w-3xl space-y-4 p-6">
        <h1 className="text-2xl font-semibold text-white">Scenario not found</h1>
        <p className="text-white/70">
          This scenario isn&apos;t in your local history. It may have been cleared, or the link is
          invalid.
        </p>
        <div className="mt-2">
          <Link href="/saved">
            <Button className="bg-white text-black hover:bg-white/90">Back to Saved</Button>
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
    const name = `${(input.campaignName || "scenario")}-${stamp}.md`;
    downloadFile(name, narrative);
  }

  return (
    <div className="relative z-10 mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-white">
          {input.campaignName || "Untitled Campaign"}
        </h1>
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
          <Link href="/saved">
            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
              Back
            </Button>
          </Link>
        </div>
      </div>

      {/* Attach to Campaign */}
      <AttachToCampaign scenarioId={id} />

      <Card className="bg-black/60 border-white/10 text-white">
        <CardContent className="prose prose-invert max-w-none p-6">
          <ReactMarkdown>{narrative}</ReactMarkdown>
        </CardContent>
      </Card>
    </div>
  );
}

/* -------------------------- Attach-to-campaign UI -------------------------- */
function AttachToCampaign({ scenarioId }: { scenarioId: string }) {
  const campaigns = useCampaignStore((s) => s.campaigns);
  const attach = useCampaignStore((s) => s.attachScenario);
  const [cid, setCid] = useState<string>(campaigns[0]?.id || "");

  if (campaigns.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/50 p-4 text-white/80">
        No campaigns yet. Create one on <Link href="/campaigns" className="underline">/campaigns</Link>.
      </div>
    );
  }

  const alreadyIn =
    !!cid && !!campaigns.find((c) => c.id === cid)?.scenarioIds.includes(scenarioId);

  return (
    <div className="rounded-2xl border border-white/10 bg-black/50 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <select
          className="rounded-md border border-white/20 bg-black/40 p-2 text-white"
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
          disabled={!cid || alreadyIn}
          className="bg-white text-black hover:bg-white/90 disabled:opacity-60"
          onClick={() => cid && attach(cid, scenarioId)}
          title={alreadyIn ? "Already attached" : "Attach scenario to campaign"}
        >
          {alreadyIn ? "Attached" : "Attach to Campaign"}
        </Button>
      </div>
    </div>
  );
}
