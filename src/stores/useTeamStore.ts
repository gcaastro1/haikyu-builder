import { Character, SlotKey, TeamSlots } from "@/types";
import { create, StoreApi, UseBoundStore } from "zustand";
import { persist } from "zustand/middleware";
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
  isPositionFree: boolean;

  slotOrder: SlotKey[];

  isRotating: boolean;

  triggerRotation: () => void;

  setTeam: (newTeam: TeamSlots) => void;

  setCharacterInSlot: (
    slotIdentifier: string,
    character: Character | null
  ) => void;

  removeFromCourt: (slotKey: SlotKey) => void;

  togglePositionMode: () => void;

  rotateTeam: () => void;

  clearTeam: () => void;
  loadTeam: (team: TeamSlots) => void;
};

export const useTeamStore: UseBoundStore<StoreApi<TeamStoreState>> =
  create<TeamStoreState>()(
    persist(
      (set, get) => ({
        team: initialTeamState,
        isPositionFree: false,

        slotOrder: [...clockwiseOrder],

        isRotating: false,

        setTeam: (newTeam) => {
          set({ team: newTeam });
        },

        setCharacterInSlot: (slotIdentifier, character) =>
          set((state) => {
            if (slotIdentifier.startsWith("court-")) {
              const slotKey = slotIdentifier.replace("court-", "") as SlotKey;
              const updatedTeam = { ...state.team, [slotKey]: character };
              return { team: updatedTeam };
            }

            return {};
          }),

        removeFromCourt: (slotKey) =>
          set((state) => {
            const updatedTeam = { ...state.team, [slotKey]: null };
            return { team: updatedTeam };
          }),

        togglePositionMode: () =>
          set((state) => {
            const newMode = !state.isPositionFree;
            if (state.isPositionFree && !newMode) {
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
            ...slotOrder.slice(1),
            slotOrder[0],
          ];
          set({ slotOrder: rotated });
        },

        clearTeam: () => {
          set({ team: initialTeamState });
          useCharacterStore.getState().calculateBondsForTeam(initialTeamState);
        },

        loadTeam: (team) => {
          set({ team });
          useCharacterStore.getState().calculateBondsForTeam(team);
        },
      }),
      {
        name: "haikyu-team-storage",
        skipHydration: true, 
        partialize: (state) => ({
          team: state.team,
          isPositionFree: state.isPositionFree,
          slotOrder: state.slotOrder,
        }),
      }
    )
  );
