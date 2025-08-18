import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CampaignRecord {
  id: string;
  name: string;
  tone?: string;
  code: string;           // invite code
  scenarioIds: string[];  // saved scenario ids attached to this campaign (exclusive)
  createdAt: string;      // ISO
  // Optional schedule per attached scenario (ISO datetime)
  battleTimes?: Record<string, string | undefined>;
}

type NewCampaign = {
  name: string;
  tone?: string;
};

type CampaignState = {
  campaigns: CampaignRecord[];
  addCampaign: (input: NewCampaign) => string; // returns new id
  attachScenario: (campaignId: string, scenarioId: string) => void;  // EXCLUSIVE
  detachScenario: (campaignId: string, scenarioId: string) => void;
  setBattleTime: (campaignId: string, scenarioId: string, iso?: string) => void;
  removeCampaign: (campaignId: string) => void;
  clearAll: () => void;
};

function genId() {
  return globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}`;
}

function genCode(len = 6) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // avoids 0/O/1/I
  let out = "";
  for (let i = 0; i < len; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

function dedupe<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

// Type guards for persisted state in migrate()
type PlainState = { campaigns?: CampaignRecord[] };
type WrapperState = { state?: PlainState; version?: number };

function hasPlainCampaigns(x: unknown): x is PlainState {
  return !!x && typeof x === "object" && "campaigns" in (x as Record<string, unknown>);
}

function hasWrapperState(x: unknown): x is WrapperState {
  return !!x && typeof x === "object" && "state" in (x as Record<string, unknown>);
}

export const useCampaignStore = create<CampaignState>()(
  persist(
    (set, get) => {
      // mark get as used to avoid eslint no-unused-vars
      void get;

      return {
        campaigns: [],

        addCampaign: (input) => {
          const id = genId();
          const rec: CampaignRecord = {
            id,
            name: input.name.trim() || "Untitled Campaign",
            tone: input.tone?.trim() || undefined,
            code: genCode(),
            scenarioIds: [],
            createdAt: new Date().toISOString(),
            battleTimes: {},
          };
          set((s) => ({ campaigns: [rec, ...s.campaigns] }));
          return id;
        },

        /** EXCLUSIVE attach: scenario is removed from all other campaigns first */
        attachScenario: (campaignId, scenarioId) => {
          set((s) => ({
            campaigns: s.campaigns.map((c) => {
              if (c.id === campaignId) {
                const nextIds = dedupe([...(c.scenarioIds ?? []), scenarioId]);
                return nextIds === c.scenarioIds ? c : { ...c, scenarioIds: nextIds };
              }
              // Remove from every other campaign (and clear schedule entry)
              if (c.scenarioIds?.includes(scenarioId)) {
                const nextTimes = { ...(c.battleTimes ?? {}) };
                delete nextTimes[scenarioId];
                return {
                  ...c,
                  scenarioIds: c.scenarioIds.filter((id) => id !== scenarioId),
                  battleTimes: nextTimes,
                };
              }
              return c;
            }),
          }));
        },

        detachScenario: (campaignId, scenarioId) => {
          set((s) => ({
            campaigns: s.campaigns.map((c) => {
              if (c.id !== campaignId) return c;
              const restTimes = { ...(c.battleTimes ?? {}) };
              delete restTimes[scenarioId];
              return {
                ...c,
                scenarioIds: (c.scenarioIds ?? []).filter((id) => id !== scenarioId),
                battleTimes: restTimes,
              };
            }),
          }));
        },

        setBattleTime: (campaignId, scenarioId, iso) => {
          set((s) => ({
            campaigns: s.campaigns.map((c) => {
              if (c.id !== campaignId) return c;
              const times = { ...(c.battleTimes ?? {}) };
              if (!iso) {
                delete times[scenarioId];
                return { ...c, battleTimes: times };
              }
              times[scenarioId] = iso;
              return { ...c, battleTimes: times };
            }),
          }));
        },

        removeCampaign: (campaignId) => {
          set((s) => ({ campaigns: s.campaigns.filter((c) => c.id !== campaignId) }));
        },

        clearAll: () => set({ campaigns: [] }),
      };
    },
    {
      name: "wh40k-campaigns",
      version: 2,
      migrate: (persisted: unknown): unknown => {
        // Handle both shapes: plain { campaigns: [...] } and wrapper { state: { campaigns: [...] } }
        const normalize = (arr: unknown): CampaignRecord[] => {
          if (!Array.isArray(arr)) return [];
          return arr.map((raw) => {
            const c = raw as Partial<CampaignRecord>;
            return {
              id: String(c.id ?? genId()),
              name: String(c.name ?? "Untitled Campaign"),
              tone: c.tone ? String(c.tone) : undefined,
              code: String(c.code ?? genCode()),
              scenarioIds: Array.isArray(c.scenarioIds) ? dedupe(c.scenarioIds.map(String)) : [],
              createdAt: c.createdAt ? String(c.createdAt) : new Date().toISOString(),
              battleTimes:
                typeof c.battleTimes === "object" && c.battleTimes
                  ? Object.fromEntries(
                      Object.entries(c.battleTimes).map(([k, v]) => [String(k), v ? String(v) : undefined])
                    )
                  : {},
            };
          });
        };

        if (hasPlainCampaigns(persisted)) {
          return { ...persisted, campaigns: normalize(persisted.campaigns) };
        }

        if (hasWrapperState(persisted) && hasPlainCampaigns(persisted.state)) {
          return {
            ...persisted,
            state: { ...persisted.state, campaigns: normalize(persisted.state.campaigns) },
          };
        }

        // Unknown shape; return as-is
        return persisted;
      },
    }
  )
);
