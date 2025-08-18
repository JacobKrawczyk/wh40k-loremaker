"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="relative z-10 mx-auto max-w-5xl p-6 space-y-8">
      {/* Hero */}
      <section className="space-y-3">
        <h1 className="text-4xl font-extrabold tracking-tight">WH40k LoreMaker</h1>
        <p className="max-w-3xl text-white/80">
          Generate playable, lore-faithful narrative content for Warhammer 40,000. Create
          one-off <strong>Scenarios</strong> (single-battle narratives with rules-ready
          objectives), then organize them into <strong>Campaigns</strong> to play across
          multiple linked battles. Everything saves locally in your browser—no accounts yet.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link href="/scenario">
            <Button className="bg-white text-black hover:bg-white/90">Create Scenario</Button>
          </Link>
          <Link href="/campaigns">
            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
              View Campaigns
            </Button>
          </Link>
          <Link href="/saved">
            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
              Saved Scenarios
            </Button>
          </Link>
        </div>
      </section>

      {/* What is what */}
      <section className="grid gap-4 md:grid-cols-2">
        <Card className="bg-black/60 border-white/10 text-white">
          <CardContent className="p-5 space-y-2">
            <h2 className="text-xl font-semibold">Scenarios (single battles)</h2>
            <ul className="list-disc space-y-1 pl-6 text-white/80">
              <li>
                Built in <Link href="/scenario" className="underline">/scenario</Link> using
                faction/subfaction pickers, segmentum → planet, tone, and stakes.
              </li>
              <li>
                Output is full Markdown with: cinematic intro, per-faction voices,
                precise objectives on a 40&quot;×60&quot; board, and risk scores.
              </li>
              <li>
                After generation, each Scenario is auto-saved locally and appears in{" "}
                <Link href="/saved" className="underline">/saved</Link> where you can copy or download
                the Markdown.
              </li>
              <li>
                You can attach a Scenario to a Campaign from <Link href="/saved" className="underline">Saved</Link>.
                A Scenario can belong to <strong>one Campaign at a time</strong>.
              </li>
              <li>
                AI status badge shows whether the narrative was AI-enhanced (green) or template fallback (yellow).
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-black/60 border-white/10 text-white">
          <CardContent className="p-5 space-y-2">
            <h2 className="text-xl font-semibold">Campaigns (linked play)</h2>
            <ul className="list-disc space-y-1 pl-6 text-white/80">
              <li>
                Create a room in{" "}
                <Link href="/campaigns" className="underline">/campaigns</Link> →{" "}
                <Link href="/campaigns/new" className="underline">New Campaign</Link>. Set a name and tone.
              </li>
              <li>
                Open a Campaign to see its attached Scenarios, copy an invite link/code, and set a
                real-world date/time for each battle.
              </li>
              <li>
                From the Campaign page you can <em>detach</em> Scenarios (they remain in Saved).
              </li>
              <li>
                Deleting a Campaign requires typing <code>DELETE</code> and does <em>not</em> remove your saved Scenarios.
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* How it works */}
      <section>
        <Card className="bg-black/60 border-white/10 text-white">
          <CardContent className="p-5 space-y-3">
            <h2 className="text-xl font-semibold">Quick start</h2>
            <ol className="list-decimal space-y-2 pl-6 text-white/80">
              <li>
                Go to <Link href="/scenario" className="underline">/scenario</Link>, pick your format
                (1v1, 2v2, 3v3, 4v4, FFA, 2v2v2v2) and assign Warhosts &amp; factions.
              </li>
              <li>
                Generate the Scenario. It appears in{" "}
                <Link href="/saved" className="underline">/saved</Link> with Copy / View / Download.
              </li>
              <li>
                Create a Campaign in{" "}
                <Link href="/campaigns" className="underline">/campaigns</Link> →{" "}
                <Link href="/campaigns/new" className="underline">New Campaign</Link>.
              </li>
              <li>
                Open the Campaign and click <em>Attach from Saved</em> (or go to{" "}
                <Link href="/saved" className="underline">Saved</Link> and attach there). Each Scenario can be attached to one Campaign.
              </li>
              <li>
                Optionally set a real-world date/time for each upcoming battle right in the Campaign.
              </li>
              <li>
                Share the invite code/link from the Campaign header with your players.
              </li>
            </ol>
          </CardContent>
        </Card>
      </section>

      {/* Tech & data behavior */}
      <section className="grid gap-4 md:grid-cols-2">
        <Card className="bg-black/60 border-white/10 text-white">
          <CardContent className="p-5 space-y-2">
            <h2 className="text-xl font-semibold">AI & generation</h2>
            <ul className="list-disc space-y-1 pl-6 text-white/80">
              <li>
                If server env has <code>AI_ENABLED=1</code> and a valid key/model, Scenarios are
                enhanced via OpenAI; otherwise the pure template is returned safely.
              </li>
              <li>
                We preserve rules semantics and the section order; AI improves prose only.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-black/60 border-white/10 text-white">
          <CardContent className="p-5 space-y-2">
            <h2 className="text-xl font-semibold">Data & privacy</h2>
            <ul className="list-disc space-y-1 pl-6 text-white/80">
              <li>No sign-in yet; data is stored locally via your browser (Zustand + localStorage).</li>
              <li>Clearing site data or switching browsers/devices resets your Campaigns/Saved.</li>
              <li>No secrets on the client; generation runs via a server route.</li>
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* CTA footer */}
      <section className="flex flex-wrap gap-2">
        <Link href="/scenario">
          <Button className="bg-white text-black hover:bg-white/90">Create Scenario</Button>
        </Link>
        <Link href="/campaigns/new">
          <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
            New Campaign
          </Button>
        </Link>
        <Link href="/saved">
          <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
            Open Saved
          </Button>
        </Link>
      </section>
    </main>
  );
}
