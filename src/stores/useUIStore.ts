import { create } from 'zustand';

type FeedbackMessage = {
  type: "success" | "error";
  text: string;
} | null;

type UIStoreState = {
  isTeamsModalOpen: boolean;
  isSelectionModalOpen: boolean;
  targetSlotIdentifier: string | null; 
  feedbackMessage: FeedbackMessage;
  
  _feedbackTimer: NodeJS.Timeout | null; 

  openTeamsModal: () => void;
  openSelectionModal: (slotIdentifier: string) => void;
  closeModals: () => void;
  showFeedback: (text: string, type?: "success" | "error") => void;
};

export const useUIStore = create<UIStoreState>((set, get) => ({

  isTeamsModalOpen: false,
  isSelectionModalOpen: false,
  targetSlotIdentifier: null,
  feedbackMessage: null,
  _feedbackTimer: null,

  openTeamsModal: () => set({ isTeamsModalOpen: true }),
  
  openSelectionModal: (slotIdentifier) => set({
    isSelectionModalOpen: true,
    targetSlotIdentifier: slotIdentifier,
  }),

  closeModals: () => set({
    isTeamsModalOpen: false,
    isSelectionModalOpen: false,
    targetSlotIdentifier: null,
  }),

  showFeedback: (text, type = "success") => {

    const existingTimer = get()._feedbackTimer;
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    set({ feedbackMessage: { text, type } });

    const newTimer = setTimeout(() => {
      set({ feedbackMessage: null, _feedbackTimer: null });
    }, 3000); 

    set({ _feedbackTimer: newTimer });
  },
}));