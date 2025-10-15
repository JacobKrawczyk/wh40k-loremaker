import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BattleFormat, WarhostInput } from "@/lib/types";

export type BattleStatus = "draft" | "generated";

export type PlayerSlot = {
  index: number;
  team: number;                 // 1..n teams
  playerName?: string;          // optional label (who claimed the slot)
  faction?: string;             // faction *key* (from dropdown)
  subfaction?: string;          // subfaction key (from dropdown)
  locked?: boolean;             // simple local lock (no auth yet)
};

export type CampaignBattle = {
  id: string;
  createdAt: string;
  status: BattleStatus;
  format: BattleFormat;
  segmentum?: string;           // NEW: for dependent planet select
  planet?: string;
  tone?: string;
  stakes?: string;
  seed?: string;
  slots: PlayerSlot[];
  scenarioId?: string;          // filled when generated
  narrative?: string;           // optional cache for inline preview
};

type BattlesByCampaign = Record<string, CampaignBattle[]>;

type NewBattleInit = {
  format: BattleFormat;
  segmentum?: string;           // NEW
  planet?: string;
  tone?: string;
  stakes?: string;
  seed?: string;
};

type State = {
  battlesByCampaign: BattlesByCampaign;
  addBattle: (campaignId: string, init: NewBattleInit) => string; // returns battleId
  setBattleMeta: (campaignId: string, battleId: string, patch: Partial<CampaignBattle>) => void;
  setSlot: (campaignId: string, battleId: string, slotIndex: number, patch: Partial<PlayerSlot>) => void;
  setGenerated: (campaignId: string, battleId: string, scenarioId: string, narrative?: string) => void;
  removeBattle: (campaignId: string, battleId: string) => void;
  clearCampaign: (campaignId: string) => void;
  clearAll: () => void;
};

// --- helpers ---
function makeId(prefix = "b"): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function slotsForFormat(format: BattleFormat): PlayerSlot[] {
  if (format === "1v1") return [0, 1].map((i) => ({ index: i, team: i + 1 }));
  if (format === "2v2") return [0, 1, 2, 3].map((i) => ({ index: i, team: i < 2 ? 1 : 2 }));
  if (format === "3v3") return Array.from({ length: 6 }, (_, i) => ({ index: i, team: i < 3 ? 1 : 2 }));
  if (format === "4v4") return Array.from({ length: 8 }, (_, i) => ({ index: i, team: i < 4 ? 1 : 2 }));
  if (format === "2v2v2v2") return [0, 1, 2, 3, 4, 5, 6, 7].map((i) => ({ index: i, team: Math.floor(i / 2) + 1 }));
  // FFA (default): 4 solo teams 1..4
  return [0, 1, 2, 3].map((i) => ({ index: i, team: i + 1 }));
}

export const useCampaignFlowStore = create<State>()(
  persist(
    (set) => ({
      battlesByCampaign: {},
      addBattle: (campaignId, init) => {
        const id = makeId("battle");
        const battle: CampaignBattle = {
          id,
          createdAt: new Date().toISOString(),
          status: "draft",
          format: init.format,
          segmentum: init.segmentum,    // NEW
          planet: init.planet,
          tone: init.tone,
          stakes: init.stakes,
          seed: init.seed,
          slots: slotsForFormat(init.format),
        };
        set((state) => {
          const arr = state.battlesByCampaign[campaignId] || [];
          return { battlesByCampaign: { ...state.battlesByCampaign, [campaignId]: [...arr, battle] } };
        });
        return id;
      },
      setBattleMeta: (campaignId, battleId, patch) =>
        set((state) => {
          const arr = state.battlesByCampaign[campaignId] || [];
          return { battlesByCampaign: { ...state.battlesByCampaign, [campaignId]: arr.map((b) => (b.id === battleId ? { ...b, ...patch } : b)) } };
        }),
      setSlot: (campaignId, battleId, slotIndex, patch) =>
        set((state) => {
          const arr = state.battlesByCampaign[campaignId] || [];
          return {
            battlesByCampaign: {
              ...state.battlesByCampaign,
              [campaignId]: arr.map((b) =>
                b.id === battleId ? { ...b, slots: b.slots.map((s) => (s.index === slotIndex ? { ...s, ...patch } : s)) } : b
              ),
            },
          };
        }),
      setGenerated: (campaignId, battleId, scenarioId, narrative) =>
        set((state) => {
          const arr = state.battlesByCampaign[campaignId] || [];
          return {
            battlesByCampaign: {
              ...state.battlesByCampaign,
              [campaignId]: arr.map((b) => (b.id === battleId ? { ...b, status: "generated", scenarioId, narrative } : b)),
            },
          };
        }),
      removeBattle: (campaignId, battleId) =>
        set((state) => {
          const arr = state.battlesByCampaign[campaignId] || [];
          return { battlesByCampaign: { ...state.battlesByCampaign, [campaignId]: arr.filter((b) => b.id !== battleId) } };
        }),
      clearCampaign: (campaignId) =>
        set((state) => {
          const clone = { ...state.battlesByCampaign };
          delete clone[campaignId];
          return { battlesByCampaign: clone };
        }),
      clearAll: () => set({ battlesByCampaign: {} }),
    }),
    { name: "lm.campaign.battles.v1" }
  )
);

// Build Warhosts from slots (teams -> warhost players)
export function warhostsFromSlots(_format: BattleFormat, slots: PlayerSlot[]): WarhostInput[] {
  const byTeam = new Map<number, PlayerSlot[]>();
  slots.forEach((s) => {
    const arr = byTeam.get(s.team) || [];
    arr.push(s);
    byTeam.set(s.team, arr);
  });

  const teamLabel = (t: number) => {
    const labels = ["A", "B", "C", "D", "E", "F", "G", "H"];
    return labels[t - 1] || `Team ${t}`;
  };

  const warhosts: WarhostInput[] = [];
  Array.from(byTeam.keys())
    .sort((a, b) => a - b)
    .forEach((team) => {
      const players = (byTeam.get(team) || [])
        .map((s) => {
          const fk = (s.faction || "").trim();
          if (!fk) return null;
          const sk = (s.subfaction || "").trim();
          return {
            factionKey: fk as unknown as WarhostInput["players"][number]["factionKey"],
            subKey: sk ? (sk as unknown as WarhostInput["players"][number]["subKey"]) : undefined,
          };
        })
        .filter(Boolean) as WarhostInput["players"];
      warhosts.push({ name: `Team ${teamLabel(team)}`, players });
    });

  return warhosts;
}
