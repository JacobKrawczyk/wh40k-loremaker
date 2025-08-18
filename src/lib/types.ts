export type BattleFormat = "1v1" | "2v2" | "ffa";

export interface ScenarioInput {
  campaignName?: string;
  battleFormat?: BattleFormat;
  playerFaction?: string;
  otherFactions?: string;
  planet?: string;
  tone?: string;
  stakes?: string;
}

export interface ScenarioOutput {
  narrative: string;
}

/** Persisted local history record (used by /campaigns list & zustand store) */
export interface ScenarioRecord {
  id: string;              // uuid
  createdAt: string;       // ISO datetime
  input: ScenarioInput;    // submitted form values
  narrative: string;       // generated markdown
}
