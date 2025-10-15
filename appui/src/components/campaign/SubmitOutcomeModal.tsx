"use client";

import { useMemo, useState, type ChangeEvent, FormEvent } from "react";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useOutcomeStore } from "@/lib/outcomeStore";
import { formatFactionChoice } from "@/lib/options";
import type { ScenarioInput, WarhostInput } from "@/lib/types";
import { useBusyStore } from "@/lib/busyStore";

type ScenarioRecord = {
  id: string;
  input: ScenarioInput;
};

export default function SubmitOutcomeModal({
  open,
  onClose,
  campaignId,
  scenario,
}: {
  open: boolean;
  onClose: () => void;
  campaignId: string;
  scenario: ScenarioRecord | null;
}) {
  const submitOutcome = useOutcomeStore((s) => s.submitOutcome);
  const begin = useBusyStore((s) => s.begin);
  const endSuccess = useBusyStore((s) => s.endSuccess);

  const planetDefault = scenario?.input?.planet || "";
  const factionLabels = useMemo(() => {
    if (!scenario?.input?.warhosts) return [];
    const names: string[] = [];
    (scenario.input.warhosts as WarhostInput[]).forEach((wh) => {
      (wh.players || []).forEach((p) => {
        const nm = formatFactionChoice(p.factionKey, p.subKey);
        if (nm) names.push(nm);
      });
    });
    // unique in insertion order
    return Array.from(new Set(names));
  }, [scenario]);

  const [planetName, setPlanetName] = useState<string>(planetDefault);
  const [winner, setWinner] = useState<string>("draw");
  const [summary, setSummary] = useState<string>("");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!scenario) return;

    begin("Recording outcome…");
    submitOutcome(campaignId, scenario.id, {
      planetName: planetName || undefined,
      factions: factionLabels,
      winner: winner === "draw" ? undefined : winner,
      outcomeSummary: summary.trim(),
      // optional fields (left out for now):
      rpDeltaByFaction: undefined,
      cgpDelta: undefined,
    });
    endSuccess();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Submit Battle Outcome" widthClassName="max-w-2xl">
      {!scenario ? (
        <div className="text-sm text-white/70">No scenario selected.</div>
      ) : (
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Planet</Label>
              <Input
                className="mt-1"
                value={planetName}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPlanetName(e.target.value)}
                placeholder="e.g., Armageddon"
              />
            </div>
            <div>
              <Label>Result</Label>
              <select
                className="mt-1 w-full rounded-md border border-white/20 bg-black/40 p-2"
                value={winner}
                onChange={(e) => setWinner(e.target.value)}
              >
                <option value="draw">Draw</option>
                {factionLabels.map((f) => (
                  <option key={f} value={f}>
                    {f} — Victory
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Label>Outcome summary</Label>
            <Textarea
              className="mt-1"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="e.g., Blood Angels seized the refinery; Orks fell back after losing their Warboss."
            />
            <p className="mt-1 text-xs opacity-70">
              A short write-up that will appear in the campaign timeline and inform future
              generation.
            </p>
          </div>

          {factionLabels.length > 0 && (
            <div className="text-xs opacity-70">
              Factions detected in this scenario:{" "}
              <span className="opacity-90">{factionLabels.join(", ")}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-white text-black hover:bg-white/90">
              Save Outcome
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
