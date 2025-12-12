import { useCharacterStore } from "@/stores/useCharacterStore";
import { useSavedTeamsStore } from "@/stores/useSavedTeamsStore";
import { useTeamStore } from "@/stores/useTeamStore";
import { useEffect, useState } from "react";

/**
 * Hook para hidratar os stores do Zustand apenas no cliente
 * Evita erros de hidratação SSR/CSR
 */
export function useHydrateStores() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Hidrata os stores do localStorage
    const hydrate = async () => {
      try {
        const teamPersist = (useTeamStore as any).persist;
        if (teamPersist?.rehydrate) {
          await teamPersist.rehydrate();
        }
        const characterPersist = (useCharacterStore as any).persist;
        if (characterPersist?.rehydrate) {
          await characterPersist.rehydrate();
        }
        const savedTeamsPersist = (useSavedTeamsStore as any).persist;
        if (savedTeamsPersist?.rehydrate) {
          await savedTeamsPersist.rehydrate();
        }
        setIsHydrated(true);
      } catch (error) {
        console.warn("Erro ao hidratar stores:", error);
        setIsHydrated(true); // Continua mesmo com erro
      }
    };

    hydrate();
  }, []);

  return isHydrated;
}


