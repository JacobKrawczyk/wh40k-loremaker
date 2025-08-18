export type BattleFormat = "1v1" | "2v2" | "3v3" | "4v4" | "ffa" | "2v2v2v2";

export interface ScenarioInput {
  campaignName?: string;
  battleFormat?: BattleFormat;
  playerFaction?: string;     // legacy: first slot of Warhost Alpha
  otherFactions?: string;     // legacy: everyone else, comma-separated
  planet?: string;
  tone?: string;
  stakes?: string;

  // NEW (preferred):
  warhosts?: WarhostInput[];  // team-based structure, used by the generator
  playersCount?: number;      // convenience (layout.teams * layout.playersPerTeam)
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

/* --------------------------------------------------------------------------
   Dataset scaffold (headless): segmenta, biomes, allegiances, planets, factions
--------------------------------------------------------------------------- */

export type Segmentum =
  | "Solar"
  | "Obscurus"
  | "Tempestus"
  | "Ultima"
  | "Pacificus";

export type Biome =
  | "Hive"
  | "Forge"
  | "Agri"
  | "Desert"
  | "Jungle"
  | "Tundra"
  | "Oceanic"
  | "Death World"
  | "Ruin"
  | "Urban"
  | "Frozen"
  | "Volcanic";

export type Allegiance =
  | "Imperium"
  | "Chaos"
  | "Aeldari"
  | "Ynnari"
  | "Drukhari"
  | "Necrons"
  | "Orks"
  | "T'au"
  | "Tyranids"
  | "Genestealer Cults"
  | "Agents of the Imperium";

export interface PlanetDef {
  key: string;                      // slug (e.g., "armageddon")
  name: string;                     // display name
  segmentum: Segmentum;
  biomes: Biome[];                  // dominant environments
  primaryAllegiances: Allegiance[]; // plausible controllers/influences
  keywords?: string[];              // tags to aid picker heuristics
  notes?: string;                   // flavor/state (e.g., "warzone", "ruined")
}

export interface SubfactionDef {
  key: string;   // slug (e.g., "ultramarines")
  name: string;  // display (e.g., "Ultramarines")
}

export interface FactionDef {
  key: string;                // slug (e.g., "space-marines")
  name: string;               // display
  allegiance: Allegiance;     // umbrella
  subfactions: SubfactionDef[];
}

/* ------------------------------ Warhost model ----------------------------- */

export interface WarhostPlayer {
  factionKey: string;   // e.g., "space-marines"
  subKey?: string;      // e.g., "imperial-fists"
}

export interface WarhostInput {
  name: string;               // e.g., "Warhost Alpha"
  players: WarhostPlayer[];   // one entry per player slot
}

/* ------------------------------ Campaign model ---------------------------- */

export interface CampaignMember {
  id: string;          // local user id or placeholder; will be auth user id later
  name: string;        // display name
  role: "host" | "player";
}

export interface CampaignRecord {
  id: string;           // uuid
  code: string;         // short join code (e.g., 6 chars)
  name: string;
  tone?: string;
  createdAt: string;    // ISO datetime
  hostId: string;       // who created it (local id for now)
  members: CampaignMember[];
  scenarioIds: string[]; // ids of scenarios associated to this campaign
}
