import { create } from 'zustand';
import { Character, TeamSlots, SlotKey } from '@/types';

const initialTeamState: TeamSlots = {
  pos5_ws: null,
  pos6_mb: null,
  pos1_op: null,
  pos4_ws: null,
  pos3_mb: null,
  pos2_s: null,
  libero: null,
};

type TeamStoreState = {
  team: TeamSlots;
  bench: (Character | null)[];
  isPositionFree: boolean;
  
  setTeam: (newTeam: TeamSlots) => void;
  setBench: (newBench: (Character | null)[]) => void;
  setCharacterInSlot: (slotIdentifier: string, character: Character | null) => void;
  removeFromCourt: (slotKey: SlotKey) => void;
  removeFromBench: (index: number) => void;
  togglePositionMode: () => void;
  rotateTeam: () => void;
  clearTeam: () => void;
  loadTeam: (team: TeamSlots, bench: (Character | null)[]) => void;
};

export const useTeamStore = create<TeamStoreState>((set, get) => ({
  team: initialTeamState,
  bench: Array(6).fill(null),
  isPositionFree: false,

  setTeam: (newTeam) => set({ team: newTeam }),

  setBench: (newBench) => set({ bench: newBench }),

  setCharacterInSlot: (slotIdentifier, character) => set((state) => {
    if (slotIdentifier.startsWith('court-')) {
      const slotKey = slotIdentifier.split('-')[1] as SlotKey;
      return { team: { ...state.team, [slotKey]: character } };
    }
    if (slotIdentifier.startsWith('bench-')) {
      const index = parseInt(slotIdentifier.split('-')[1], 10);
      if (!isNaN(index) && index >= 0 && index < 6) {
        const newBench = [...state.bench];
        newBench[index] = character;
        return { bench: newBench };
      }
    }
    return {}; 
  }),
  
  removeFromCourt: (slotKey) => {
    set((state) => ({
      team: { ...state.team, [slotKey]: null },
    }));
  },

  removeFromBench: (index) => {
    set((state) => {
      const newBench = [...state.bench];
      newBench[index] = null;
      return { bench: newBench };
    });
  },

  togglePositionMode: () => {
    set((state) => {
      const newMode = !state.isPositionFree;
      if (state.isPositionFree === true && newMode === false) {
        return { isPositionFree: newMode, team: initialTeamState };
      }
      return { isPositionFree: newMode };
    });
  },

  rotateTeam: () => {
    set((state) => {
      const rotatedTeam: TeamSlots = {
        pos3_mb: state.team.pos2_s,
        pos4_ws: state.team.pos3_mb,
        pos1_op: state.team.pos4_ws,
        pos6_mb: state.team.pos1_op,
        pos5_ws: state.team.pos6_mb,
        pos2_s: state.team.pos5_ws,
        libero: state.team.libero, 
      };
      return { team: rotatedTeam };
    });
  },

  clearTeam: () => {
    set({ team: initialTeamState, bench: Array(6).fill(null) });
  },

  loadTeam: (team, bench) => {
    set({ team, bench });
  },
}));