import { SavedTeam } from "@/types";
import { create, StoreApi, UseBoundStore } from "zustand";
import { persist } from "zustand/middleware";
import { useTeamStore } from "./useTeamStore";

export type SavedTeamsState = {
  savedTeamsList: SavedTeam[];

  saveCurrentTeam: (teamName: string) => void;
  loadTeam: (teamToLoad: SavedTeam) => boolean;
  deleteTeam: (indexToDelete: number) => void;
};

export const useSavedTeamsStore: UseBoundStore<StoreApi<SavedTeamsState>> =
  create<SavedTeamsState>()(
    persist(
      (set, get) => ({
        savedTeamsList: [],

        saveCurrentTeam: (teamName) => {
          const trimmedName = teamName.trim();
          if (!trimmedName) return;

          const { team } = useTeamStore.getState();

          const existing = get().savedTeamsList.find(
            (t) => t.name.toLowerCase() === trimmedName.toLowerCase()
          );
          if (existing) {
            console.warn(`Já existe um time chamado "${trimmedName}".`);
            return;
          }

          const newSavedTeam: SavedTeam = {
            name: trimmedName,
            court: { ...team },
            savedAt: new Date().toISOString(),
          };

          const updatedList = [...get().savedTeamsList, newSavedTeam];
          set({ savedTeamsList: updatedList });
        },

        loadTeam: (teamToLoad) => {
          if (!teamToLoad || !teamToLoad.court) {
            console.error("Dados de time corrompidos.");
            return false;
          }

          // Basic validation of the team structure
          const validKeys = ["pos1_s", "pos2_mb", "pos3_ws", "pos4_op", "pos5_mb", "pos6_ws", "libero"];
          const keys = Object.keys(teamToLoad.court);
          const hasAllKeys = validKeys.every(k => keys.includes(k));
          
          if (!hasAllKeys) {
             console.error("Time salvo incompatível ou malformado.");
             return false;
          }

          useTeamStore.getState().loadTeam(teamToLoad.court);
          return true;
        },

        deleteTeam: (indexToDelete) => {
          const updatedList = get().savedTeamsList.filter(
            (_, i) => i !== indexToDelete
          );
          set({ savedTeamsList: updatedList });
        },
      }),
      {
        name: "haikyu-saved-teams",
        skipHydration: true, // ✅ Evita hidratação automática que causa mismatch SSR/CSR
        partialize: (state) => ({
          savedTeamsList: state.savedTeamsList,
        }),
      }
    )
  );
