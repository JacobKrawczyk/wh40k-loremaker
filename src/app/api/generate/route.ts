import { NextResponse } from "next/server";

type Payload = {
  campaignName: string;
  battleFormat: "1v1" | "2v2" | "ffa";
  playerFaction: string;
  otherFactions: string;
  planet: string;
  tone: string;
  stakes: string;
};

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<Payload>;

const campaignName = body.campaignName?.trim() || "Untitled Campaign";
const battleFormat = (body.battleFormat as "1v1" | "2v2" | "ffa") || "1v1";

// neutral fallbacks (no IP-specific names)
const playerFaction = (body.playerFaction?.trim() || "Faction").slice(0, 80);
const otherFactions = (body.otherFactions?.trim() || "Opponents").slice(0, 120);
const planet = (body.planet?.trim() || "Theater").slice(0, 80);
const tone = (body.tone?.trim() || "Tone").slice(0, 40);
const stakes = (body.stakes?.trim() || "Primary objective").slice(0, 200);

  const narrative = `# ${campaignName}: Pre-Battle Dossier

**Battle format (player count)**: ${battleFormat.toUpperCase()}
**Location**: ${planet}
**Tone**: ${tone}

## Player Faction
- **Name**: ${playerFaction}
- **Personal stakes**: ${stakes}

## Other Factions
- **Present**: ${otherFactions}

## Overarching Story Hook
A shard of pre-Heresy intelligence has surfaced on ${planet}, drawing ${playerFaction} and ${otherFactions} into a collision of duty, vengeance, and opportunism.

## Faction Entries (motives & alliances)
- **${playerFaction}**: Deploy to secure ${stakes}. Alliance possible with lore-plausible factions if it preserves the asset; ceasefire collapses on betrayal.
- **${otherFactions}**: Each arrives with clear goals (artifacts, revenge, territory). Temporary alliances must be plausible in canon and fragile by design.

## Objectives
### Matched-play (common)
1) Hold central control points.
2) Destroy priority enemy units.

### Narrative (per-faction)
- **${playerFaction}**: Extract the vault codes from a battlefield relay and evacuate a Techmarine alive. (+3 RP)
- **${otherFactions}**: Define a signature narrative objective aligned with their motives. (+3 RP)

### Narrative Achievement Points
- Minor feats grant small persistent perks (rerolls, deployment priority, initiative edges) tracked as Resonance Points (RP).

## Resonance Points (RP) – Updated Economy
- +3 RP: Complete your narrative objective.
- +1 RP: Win via standard VP.
- +1 RP: Cinematic Moment (only if opponent agrees).
Spend RP: 2 RP revive named character (skip one game if not revived); 2 RP re-roll mission type/secondary; 3 RP win deployment roll-off; 3 RP force opponent to redeploy one unit to a chosen half of their DZ; 4 RP one free Stratagem; 5 RP buy 1 Campaign Game Point (CGP).

## Risk Scores (1–5)
Assign risk to each objective considering 40x60 board, DZs, unit movement, exposure time, and enemy contesting paths.`;

  return NextResponse.json({ narrative });
}
