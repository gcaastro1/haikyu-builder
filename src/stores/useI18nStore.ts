import { create, StoreApi, UseBoundStore } from "zustand";
import { persist } from "zustand/middleware";
import { useCharacterStore } from "./useCharacterStore";

export type Lang = "pt" | "en" | "es";

export type I18nStoreState = {
  lang: Lang;
  setLang: (lang: Lang) => void;
};

export const useI18nStore: UseBoundStore<StoreApi<I18nStoreState>> =
  create<I18nStoreState>()(
    persist(
      (set) => ({
        lang: "pt",
        setLang: (lang) => {
          set({ lang });
          useCharacterStore.getState().refreshBondsLanguage(lang);
        },
      }),
      {
        name: "haikyu-i18n",
        skipHydration: true,
        partialize: (state) => ({ lang: state.lang }),
      }
    )
  );

