// FILE: src/lib/scenarioStore.ts
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ScenarioInput } from "@/lib/types";

export interface ScenarioRecord {
  id: string;          // uuid
  createdAt: string;   // ISO timestamp
  input: ScenarioInput;
  narrative: string;   // generated markdown
}

interface ScenarioState {
  scenarios: ScenarioRecord[];
  addScenario: (rec: ScenarioRecord) => void;
  removeScenario: (id: string) => void;
  clearAll: () => void;
}

export const useScenarioStore = create<ScenarioState>()(
  persist(
    (set) => ({
      scenarios: [],
      addScenario: (rec) =>
        set((s) => ({ scenarios: [rec, ...s.scenarios].slice(0, 100) })), // keep last 100
      removeScenario: (id) =>
        set((s) => ({ scenarios: s.scenarios.filter((r) => r.id !== id) })),
      clearAll: () => set({ scenarios: [] }),
    }),
    { name: "wh40k-scenarios" } // localStorage key
  )
);
