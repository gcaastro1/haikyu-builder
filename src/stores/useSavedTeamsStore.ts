import { create } from 'zustand';
import { SavedTeam, TeamSlots } from '@/types';
import { useTeamStore } from './useTeamStore'; 


const LOCAL_STORAGE_KEY = "haikyuBuilderSavedTeams";

type SavedTeamsState = {
  savedTeamsList: SavedTeam[];
  

  loadFromStorage: () => void;

  saveCurrentTeam: (teamName: string) => void;

  loadTeam: (teamToLoad: SavedTeam) => boolean;

  deleteTeam: (indexToDelete: number) => void;
};

export const useSavedTeamsStore = create<SavedTeamsState>((set, get) => ({
  savedTeamsList: [],

  loadFromStorage: () => {
    try {
      const storedTeams = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedTeams) {
        set({ savedTeamsList: JSON.parse(storedTeams) });
      }
    } catch (error) {
      console.error("Erro ao carregar times salvos do LocalStorage:", error);
      set({ savedTeamsList: [] });
    }
  },

  saveCurrentTeam: (teamName) => {
    const { team, bench } = useTeamStore.getState();

    const newSavedTeam: SavedTeam = {
      name: teamName.trim(),
      court: { ...team },
      bench: [...bench],
      savedAt: new Date().toISOString(),
    };

    try {
      const updatedList = [...get().savedTeamsList, newSavedTeam];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));
      set({ savedTeamsList: updatedList });
    } catch (error) {
      console.error("Erro ao salvar time no LocalStorage:", error);
    }
  },

  loadTeam: (teamToLoad) => {
    if (!teamToLoad.court || !teamToLoad.bench) {
      console.error("Dados de time corrompidos.");
      return false; 
    }
    
    useTeamStore.getState().loadTeam(teamToLoad.court, teamToLoad.bench);
    return true; 
  },

  deleteTeam: (indexToDelete) => {
    try {
      const teamToDelete = get().savedTeamsList[indexToDelete];
      if (!teamToDelete) return;

      const updatedList = get().savedTeamsList.filter(
        (_, index) => index !== indexToDelete
      );
      
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));
      set({ savedTeamsList: updatedList });
    } catch (error) {
      console.error("Erro ao excluir time:", error);
    }
  },
}));