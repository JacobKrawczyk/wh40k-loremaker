// FILE: src/lib/narrativeBuilder.ts
import { DEFAULTS, LIMITS, RP_RULES } from "@/lib/constants";
import type { ScenarioInput } from "@/lib/types";

/** Clamp text to a max length if LIMITS defines it. */
function clamp(key: keyof typeof LIMITS, val?: string): string {
  const raw = (val ?? "").trim();
  const max = LIMITS[key];
  return max ? raw.slice(0, max) : raw;
}

/** Build a markdown scenario in the required section order (pure, no I/O). */
export function buildNarrative(input: ScenarioInput): string {
  const campaignName =
    clamp("campaignName", input.campaignName) || DEFAULTS.campaignName;
  const battleFormat = input.battleFormat ?? DEFAULTS.battleFormat;
  const playerFaction =
    clamp("playerFaction", input.playerFaction) || DEFAULTS.playerFaction;
  const otherFactions =
    clamp("otherFactions", input.otherFactions) || DEFAULTS.otherFactions;
  const planet = clamp("planet", input.planet) || DEFAULTS.planet;
  const tone = clamp("tone", input.tone) || DEFAULTS.tone;
  const stakes = clamp("stakes", input.stakes) || DEFAULTS.stakes;

  const md = [
    // ======================
    // scenario_title
    // ======================
    `# ${campaignName} — ${planet}
**Format:** ${battleFormat.toUpperCase()} • **Tone:** ${tone} • **Stake:** ${stakes}

---`,

    // ======================
    // intro_global
    // ======================
    `## Opening Brief
The guns speak first. **${playerFaction}** descend upon **${planet}** to prosecute a limited operation against **${otherFactions}**. Command expectations: *short, brutal exchanges*, a mobile center, and flanks trading bodies for inches. The stake — **${stakes}** — will decide who dictates the next move.

> *Operational Notes:* Expect counter-actions on mid-board terrain. Priority is tempo over attrition: secure, extract, and deny.`,

    // ======================
    // intro_factions
    // ======================
    `## Faction Briefings
### ${playerFaction}
Doctrinal advance under fire. Secure the asset, control the clock, and refuse wasteful melees. Mid-board must be held just long enough to complete the uplink and extract.

### Opposition (${otherFactions})
Exploit overextension, jam rituals, and trade units to stall extraction lanes. Punish isolated carriers and force resets on actions.

---`,

    // ======================
    // objectives_rules_with_risk
    // ======================
    `## Narrative Objectives (Matched-Play Compatible)
**Board:** 40"x60" • **Objective radius:** 3" • **Deployment:** neutral/standard

### ${playerFaction} — “Secure the Proof”
- **Markers:** Place **2** Objective Markers, each **>6"** from any table edge and **>9"** from each other; neither may start in a deployment zone.
- **Action — *Uplink*** *(Infantry/Character only)*:
  - Start at **end of your Movement** while within **3"** of a Marker and **no enemy** within **3"**.
  - Acting unit **cannot Shoot or Charge** this turn.
  - Completes at the **start of your next Command phase** if still uncontested (unit not destroyed/falling back; no enemy within 3").
- **On Success:** Unit gains the **Data Core** (it carries the item).
- **Extract:** End a Movement phase **wholly within your deployment zone** while carrying the Core to bank it.
- **Drop/Pickup:** If carrier is destroyed, place a **40mm token** at that spot. Any Infantry/Character within **1"** at end of Movement may pick it up.
- **When Scored:** **End of battle** if the Core was Extracted.
- **Reward:** **+3 RP**.
- **Risk Score:** **4/5**
  
  | Factor | Reason |
  |---|---|
  | Exposure | Multi-turn action in the mid-board invites contesting fire. |
  | Complexity | Action → carry → extract adds steps to fail. |
  | Contest | Two markers ease access, but both are outside DZs. |

---

### ${otherFactions} — “Deny the Signal”
- **Ritual Site:** Place **1** Ritual token at **table center** (within 1").
- **Action — *Jam*** *(any Infantry)*:
  - Start at **end of your Movement** within **3"** of center and **no enemy** within **3"**.
  - Unit **cannot Shoot or Charge** this turn.
  - **Completes at end of your turn.**
- **On Success:** Place a **3" Jamming Field** token. While active, **enemy Actions within 6" of center fail on a D6 roll of 1–2** (roll when the Action would complete).
- **Dispel:** Enemy Infantry/Character may take **Action — Dispel** (same timing); on completion, **remove** the Jamming Field.
- **When Scored:** **End of battle** if a Jamming Field is active.
- **Reward:** **+3 RP**.
- **Risk Score:** **3/5**
  
  | Factor | Reason |
  |---|---|
  | Exposure | Central, but completion is single-turn. |
  | Control | Aura taxes opposing actions without needing extract. |
  | Contest | Dispel exists, but costs the enemy tempo. |`,

    // ======================
    // post_battle_summary
    // ======================
    `## Post-Battle Summary (fill after game)
Record decisive moments, who completed which narrative objective, and whether both players agreed on a **Cinematic Moment**.

### RP / CGP Economy
**Earn**
- **+3 RP**: Complete your narrative objective  
- **+1 RP**: Win by standard VP  
- **+1 RP**: Cinematic Moment *(only if opponent agrees)*

**Spend**
- **${RP_RULES.spend.reviveNamed} RP**: Revive a fallen **named** character (otherwise skips next game)
- **${RP_RULES.spend.rerollMissionOrSecondary} RP**: Re-roll mission type or secondary
- **${RP_RULES.spend.winDeploymentRoll} RP**: Win the deployment roll-off
- **${RP_RULES.spend.forceRedeployOneEnemyUnit} RP**: Force opponent to redeploy **one** unit into the half DZ **you** choose
- **${RP_RULES.spend.freeStratagem} RP**: Use **one** Stratagem for free once
- **${RP_RULES.spend.buyCGP} RP**: **Buy 1 CGP** (Campaign Game Point)

> **Death Rule:** If a **named** character dies and isn’t revived for 2 RP, they **must skip** the next game.`,

    // ======================
    // cliffhanger
    // ======================
    `## Next Hook
A second signal whispers beyond no-man’s-land. Do you press the advantage, or draw the foe into a kill-corridor and bleed them dry?
`,
  ].join("\n\n");

  return md;
}
