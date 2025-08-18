// FILE: src/app/campaigns/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCampaignStore } from "@/lib/campaignStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function NewCampaignPage() {
  const router = useRouter();
  const addCampaign = useCampaignStore((s) => s.addCampaign);

  const [name, setName] = useState("");
  const [tone, setTone] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const id = addCampaign({ name, tone });
    router.push(`/campaigns/${id}`);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <h1 className="text-3xl font-bold">New Campaign</h1>

      <form onSubmit={onSubmit} className="grid gap-4">
        <div>
          <Label htmlFor="name">Campaign name</Label>
          <Input
            id="name"
            placeholder="e.g., The Ashen Rift"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="tone">Tone (optional)</Label>
          <Input
            id="tone"
            placeholder="e.g., grimdark, tragic heroism"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit" className="bg-white text-black hover:bg-white/90">
            Create Campaign
          </Button>
          <Button
            type="button"
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10"
            onClick={() => history.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
