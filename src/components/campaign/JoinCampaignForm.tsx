"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function JoinCampaignForm() {
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const onJoin = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setPending(true);
    setErr(null);
    setMsg(null);
    try {
      const res = await fetch("/api/campaigns/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: trimmed }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
      setMsg("Joined! Redirecting…");
      // Simple refresh to show the new membership in the list
      window.location.reload();
    } catch (e: any) {
      setErr(e?.message || "Failed to join.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="rounded-xl border border-white/10 bg-black/50 p-4 text-white">
      <div className="mb-2 font-semibold">Join with Invite Code</div>
      <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
        <div>
          <Label className="sr-only">Invite Code</Label>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. 7K3Q9Z"
            className="bg-black/40"
          />
        </div>
        <Button onClick={onJoin} disabled={pending || !code.trim()}>
          {pending ? "Joining…" : "Join"}
        </Button>
      </div>
      {msg && <p className="mt-2 text-green-300 text-sm">{msg}</p>}
      {err && <p className="mt-2 text-red-300 text-sm">{err}</p>}
    </div>
  );
}
