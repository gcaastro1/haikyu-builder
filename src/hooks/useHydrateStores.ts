import { useCharacterStore } from "@/stores/useCharacterStore";
import { useSavedTeamsStore } from "@/stores/useSavedTeamsStore";
import { useTeamStore } from "@/stores/useTeamStore";
import { useEffect, useState } from "react";

export function useHydrateStores() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

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
        setIsHydrated(true); 
      }
    };

    hydrate();
  }, []);

  return isHydrated;
}
