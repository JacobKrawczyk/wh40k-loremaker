"use client";

import { useState, FormEvent } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setOutput(null);

    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());

    try {
      // Optional timeout so it can't hang forever
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 15000);

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: ctrl.signal,
      });

      clearTimeout(t);

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`HTTP ${res.status} ${res.statusText} – ${txt}`);
      }

      const data = await res.json();
      setOutput(data.narrative ?? "No narrative returned.");
    } catch (err) {
      console.error("Generate failed:", err);
      setOutput(
        `Request failed.\n\nTip: DevTools → Network → /api/generate to see status/response.\n${String(
          err
        )}`
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <h1 className="text-3xl font-bold">Scenario Generator</h1>

      <form onSubmit={onSubmit} className="grid gap-4">
        <div>
          <Label htmlFor="campaignName">Campaign name</Label>
          <Input id="campaignName" name="campaignName" placeholder="Operation Codename" />
        </div>

        <div>
          <Label htmlFor="battleFormat">Battle format</Label>
          <select id="battleFormat" name="battleFormat" className="h-10 rounded-md border px-3">
            <option value="1v1">1v1</option>
            <option value="2v2">2v2</option>
            <option value="ffa">Free-for-all</option>
          </select>
        </div>

        <div>
          <Label htmlFor="playerFaction">Your side</Label>
          <Input id="playerFaction" name="playerFaction" placeholder="Faction" />
        </div>

        <div>
          <Label htmlFor="otherFactions">Opponents / other sides</Label>
          <Input id="otherFactions" name="otherFactions" placeholder="Other faction(s)" />
        </div>

        <div>
          <Label htmlFor="planet">Location</Label>
          <Input id="planet" name="planet" placeholder="Planet / theater" />
        </div>

        <div>
          <Label htmlFor="tone">Tone</Label>
          <Input id="tone" name="tone" placeholder="Tone (e.g., grimdark)" />
        </div>

        <div>
          <Label htmlFor="stakes">Personal stakes</Label>
          <Textarea
            id="stakes"
            name="stakes"
            placeholder="Personal stakes (e.g., secure prototype, rescue VIP)"
          />
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? "Generating…" : "Generate"}
        </Button>
      </form>

      {output && (
        <Card>
          <CardContent className="max-w-none whitespace-pre-wrap p-6">
            {output}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
