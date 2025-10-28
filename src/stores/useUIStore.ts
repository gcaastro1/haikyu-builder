import { create, StoreApi, UseBoundStore } from "zustand";

type FeedbackMessage =
  | {
      type: "success" | "error";
      text: string;
    }
  | null;

export type UIStoreState = {
  // === Estados existentes ===
  isTeamsModalOpen: boolean;
  isSelectionModalOpen: boolean;
  targetSlotIdentifier: string | null;
  feedbackMessage: FeedbackMessage;
  _feedbackTimer: ReturnType<typeof setTimeout> | null;

  // === Novo estado ===
  modalPosition: string; // ✅ adicionamos isso

  // === Métodos ===
  openTeamsModal: () => void;
  openSelectionModal: (slotIdentifier: string, position?: string) => void; // ✅ agora recebe posição opcional
  closeModals: () => void;
  showFeedback: (text: string, type?: "success" | "error") => void;
};

export const useUIStore: UseBoundStore<StoreApi<UIStoreState>> =
  create<UIStoreState>((set, get) => ({
    // === Defaults ===
    isTeamsModalOpen: false,
    isSelectionModalOpen: false,
    targetSlotIdentifier: null,
    feedbackMessage: null,
    _feedbackTimer: null,
    modalPosition: "ALL", 

    openSelectionModal: (slotIdentifier, position = "ALL") =>
      set({
        isSelectionModalOpen: true,
        targetSlotIdentifier: slotIdentifier,
        modalPosition: position,
      }),

    openTeamsModal: () => set({ isTeamsModalOpen: true }),

    closeModals: () =>
      set({
        isTeamsModalOpen: false,
        isSelectionModalOpen: false,
        targetSlotIdentifier: null,
        modalPosition: "ALL", 
      }),

    showFeedback: (text, type = "success") => {
      const { _feedbackTimer } = get();

      if (_feedbackTimer) clearTimeout(_feedbackTimer);

      set({ feedbackMessage: { text, type } });

      const newTimer = setTimeout(() => {
        set({ feedbackMessage: null, _feedbackTimer: null });
      }, 3000);

      set({ _feedbackTimer: newTimer });
    },
  }));
