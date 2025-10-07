"use client";

import { useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  getFactionOptions,
  getSubfactionOptions,
} from "@/lib/optionsProvider";
import type { PlayerSlot } from "@/lib/campaignFlowStore";

export default function SlotCard({
  slot,
  onChange,
}: {
  slot: PlayerSlot;
  onChange: (patch: Partial<PlayerSlot>) => void;
}) {
  const factionOptions = useMemo(() => getFactionOptions(), []);
  const subfactionOptions = (fk: string) => getSubfactionOptions(fk);

  return (
    <div className="rounded-xl border border-white/10 p-3">
      <div className="mb-2 text-sm opacity-80">
        Team {slot.team} • Slot {slot.index + 1}
      </div>
      <div className="grid gap-2">
        <div>
          <Label>Player (optional)</Label>
          <Input
            className="mt-1"
            value={slot.playerName || ""}
            onChange={(e) => onChange({ playerName: e.target.value })}
            placeholder="Your name"
          />
        </div>
        <div>
          <Label>Faction</Label>
          <select
            className="mt-1 w-full rounded-md border border-white/20 bg-black/40 p-2"
            value={slot.faction || ""}
            onChange={(e) => onChange({ faction: e.target.value, subfaction: "" })}
          >
            <option value="">Select a faction</option>
            {factionOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Subfaction (optional)</Label>
          <select
            className="mt-1 w-full rounded-md border border-white/20 bg-black/40 p-2"
            value={slot.subfaction || ""}
            onChange={(e) => onChange({ subfaction: e.target.value })}
            disabled={!slot.faction}
          >
            <option value="">Select a subfaction</option>
            {(slot.faction ? subfactionOptions(slot.faction) : []).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <input
            id={`lock-${slot.index}`}
            type="checkbox"
            checked={!!slot.locked}
            onChange={(e) => onChange({ locked: e.target.checked })}
          />
          <Label htmlFor={`lock-${slot.index}`}>Lock this slot</Label>
        </div>
      </div>
    </div>
  );
}
