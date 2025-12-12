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
          if (!teamToLoad.court) {
            console.error("Dados de time corrompidos.");
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
