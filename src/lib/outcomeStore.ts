import { create } from "zustand";
import { persist } from "zustand/middleware";

export type OutcomeRecord = {
  scenarioId: string;
  planetName?: string;
  factions?: string[];           // human-friendly faction labels present in the battle
  winner?: string;               // winning faction label (optional if draw)
  outcomeSummary: string;        // free text summary
  rpDeltaByFaction?: Record<string, number>; // optional per-faction deltas
  cgpDelta?: number;             // optional campaign/global points delta
  createdAt: string;             // ISO
};

type OutcomeState = {
  // outcomesByCampaign[campaignId][scenarioId] = OutcomeRecord
  outcomesByCampaign: Record<string, Record<string, OutcomeRecord>>;

  submitOutcome: (
    campaignId: string,
    scenarioId: string,
    outcome: Omit<OutcomeRecord, "scenarioId" | "createdAt">
  ) => void;

  removeOutcome: (campaignId: string, scenarioId: string) => void;
  clearAll: () => void;
};

export const useOutcomeStore = create<OutcomeState>()(
  persist(
    (set, get) => ({
      outcomesByCampaign: {},

      submitOutcome: (campaignId, scenarioId, outcome) => {
        const rec: OutcomeRecord = {
          ...outcome,
          scenarioId,
          createdAt: new Date().toISOString(),
        };
        set((s) => {
          const byCamp = { ...(s.outcomesByCampaign[campaignId] ?? {}) };
          byCamp[scenarioId] = rec;
          return {
            outcomesByCampaign: {
              ...s.outcomesByCampaign,
              [campaignId]: byCamp,
            },
          };
        });
      },

      removeOutcome: (campaignId, scenarioId) => {
        set((s) => {
          const byCamp = { ...(s.outcomesByCampaign[campaignId] ?? {}) };
          delete byCamp[scenarioId];
          return {
            outcomesByCampaign: {
              ...s.outcomesByCampaign,
              [campaignId]: byCamp,
            },
          };
        });
      },

      clearAll: () => set({ outcomesByCampaign: {} }),
    }),
    { name: "wh40k-outcomes", version: 1 }
  )
);
