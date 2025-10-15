// src/lib/constants.ts

// Universal placeholders
export const DEFAULTS = {
  campaignName: "Untitled Campaign",
  battleFormat: "1v1" as const,
  playerFaction: "Faction",
  otherFactions: "Opponents",
  planet: "Theater",
  tone: "Tone",
  stakes: "Primary objective",
};

// Resonance Point (RP) system rules
export const RP_RULES = {
  earn: {
    narrativeObjective: 3,
    vpWin: 1,
    cinematicMoment: 1, // only if opponent agrees
  },
  spend: {
    reviveNamed: 2,
    rerollMissionOrSecondary: 2,
    winDeploymentRoll: 3,
    forceRedeployOneEnemyUnit: 3,
    freeStratagem: 4,
    buyCGP: 5,
  },
};

// Optional: prevent absurdly long inputs
export const LIMITS = {
  campaignName: 120,
  playerFaction: 80,
  otherFactions: 160,
  planet: 80,
  tone: 40,
  stakes: 400,
};

