import { create, StoreApi, UseBoundStore } from "zustand";
import { persist } from "zustand/middleware";
import { Character, TeamSlots, SlotKey } from "@/types";
import { useCharacterStore } from "./useCharacterStore";

const initialTeamState: TeamSlots = {
  pos6_ws: null,
  pos5_mb: null,
  pos4_op: null,
  pos3_ws: null,
  pos2_mb: null,
  pos1_s: null,
  libero: null,
};

const clockwiseOrder: SlotKey[] = [
  "pos1_s",
  "pos2_mb",
  "pos3_ws",
  "pos4_op",
  "pos5_mb",
  "pos6_ws",
];

export type TeamStoreState = {
  team: TeamSlots;
  bench: (Character | null)[];
  isPositionFree: boolean;

  slotOrder: SlotKey[];

  isRotating: boolean;

  isJPMode: boolean;
  toggleJPMode: () => void;

  triggerRotation: () => void;

  setTeam: (newTeam: TeamSlots) => void;
  setBench: (newBench: (Character | null)[]) => void;

  setCharacterInSlot: (
    slotIdentifier: string,
    character: Character | null
  ) => void;

  removeFromCourt: (slotKey: SlotKey) => void;
  removeFromBench: (index: number) => void;

  togglePositionMode: () => void;

  rotateTeam: () => void;

  clearTeam: () => void;
  loadTeam: (team: TeamSlots, bench: (Character | null)[]) => void;
};

export const useTeamStore: UseBoundStore<StoreApi<TeamStoreState>> =
  create<TeamStoreState>()(
    persist(
      (set, get) => ({
        team: initialTeamState,
        bench: Array(6).fill(null),
        isPositionFree: false,

        slotOrder: [...clockwiseOrder],

        isRotating: false,

        setTeam: (newTeam) => {
          set({ team: newTeam });
          useCharacterStore.getState().calculateBondsForTeam(newTeam);
        },

        isJPMode: false,

        toggleJPMode: () => set((state) => ({ isJPMode: !state.isJPMode })),

        setBench: (newBench) => set({ bench: newBench }),

        setCharacterInSlot: (slotIdentifier, character) =>
          set((state) => {
            if (slotIdentifier.startsWith("court-")) {
              const slotKey = slotIdentifier.replace("court-", "") as SlotKey;
              const updatedTeam = { ...state.team, [slotKey]: character };
              useCharacterStore.getState().calculateBondsForTeam(updatedTeam);
              return { team: updatedTeam };
            }

            if (slotIdentifier.startsWith("bench-")) {
              const index = parseInt(slotIdentifier.replace("bench-", ""), 10);
              if (!isNaN(index) && index >= 0 && index < 6) {
                const bench = [...state.bench];
                bench[index] = character;
                return { bench };
              }
            }

            return {};
          }),

        removeFromCourt: (slotKey) =>
          set((state) => {
            const updatedTeam = { ...state.team, [slotKey]: null };
            useCharacterStore.getState().calculateBondsForTeam(updatedTeam);
            return { team: updatedTeam };
          }),

        removeFromBench: (index) =>
          set((state) => {
            const bench = [...state.bench];
            bench[index] = null;
            return { bench };
          }),

        togglePositionMode: () =>
          set((state) => {
            const newMode = !state.isPositionFree;
            if (state.isPositionFree && !newMode) {
              useCharacterStore
                .getState()
                .calculateBondsForTeam(initialTeamState);
              return { isPositionFree: newMode, team: initialTeamState };
            }
            return { isPositionFree: newMode };
          }),

        triggerRotation: () => {
          set({ isRotating: true });
          get().rotateTeam();
          setTimeout(() => set({ isRotating: false }), 450);
        },

        rotateTeam: () => {
          const { slotOrder } = get();
          const rotated = [
            slotOrder[slotOrder.length - 1],
            ...slotOrder.slice(0, -1),
          ];
          set({ slotOrder: rotated });
        },

        clearTeam: () => {
          set({ team: initialTeamState, bench: Array(6).fill(null) });
          useCharacterStore.getState().calculateBondsForTeam(initialTeamState);
        },

        loadTeam: (team, bench) => {
          set({ team, bench });
          useCharacterStore.getState().calculateBondsForTeam(team);
        },
      }),
      {
        name: "haikyu-team-storage",
        partialize: (state) => ({
          team: state.team,
          bench: state.bench,
          isPositionFree: state.isPositionFree,
          slotOrder: state.slotOrder,
        }),
      }
    )
  );
