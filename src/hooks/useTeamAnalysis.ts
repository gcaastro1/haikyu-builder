import { calculateActiveBonds } from "@/app/lib/calculateActiveBonds";
import { useCharacterStore } from "@/stores/useCharacterStore";
import {
    Bond,
    Character,
    StyleCounts,
    TeamSlots,
    TeamType,
    dbStyleToTeamTypeMap,
} from "@/types";
import { useMemo } from "react";

export function useTeamAnalysis(team: TeamSlots, isPositionFree: boolean) {
  const { allBonds, characterBondLinks, allCharacters } = useCharacterStore();

  const { calculatedTeamType, styleCounts } = useMemo(() => {
    const charactersOnCourt = Object.values(team).filter(Boolean) as Character[];
    const currentStyleCounts: StyleCounts = {
      "Ataque Rápido": 0,
      Potente: 0,
      Bloqueio: 0,
      Recepção: 0,
    };

    let finalTeamType: TeamType = "Nenhum";

    if (!isPositionFree && team.pos1_s?.styles) {
      for (const style of team.pos1_s.styles) {
        const mapped = dbStyleToTeamTypeMap[style];
        if (mapped) {
          finalTeamType = mapped;
          break;
        }
      }
    }

    charactersOnCourt.forEach((char) => {
      (char.styles || []).forEach((style) => {
        const mapped = dbStyleToTeamTypeMap[style];
        if (mapped) currentStyleCounts[mapped]++;
      });
    });

    if (isPositionFree && charactersOnCourt.length > 0) {
      if (currentStyleCounts["Recepção"] >= 5) finalTeamType = "Recepção";
      else if (currentStyleCounts["Bloqueio"] >= 4) finalTeamType = "Bloqueio";
      else if (currentStyleCounts["Potente"] >= 4) finalTeamType = "Potente";
      else if (currentStyleCounts["Ataque Rápido"] >= 4)
        finalTeamType = "Ataque Rápido";
    }

    return { calculatedTeamType: finalTeamType, styleCounts: currentStyleCounts };
  }, [team, isPositionFree]);

  const activeBonds = useMemo(() => {
    const charactersOnCourt = Object.values(team).filter(Boolean) as Character[];
    if (!charactersOnCourt.length || !allBonds.length || !characterBondLinks.length)
      return [];

    const calculated = calculateActiveBonds(team, allCharacters, allBonds, characterBondLinks);
    
    const bondMap = new Map(allBonds.map((b) => [b.id, b]));
    
    return calculated
      .filter((b) => b.isActive)
      .map((b) => bondMap.get(b.id))
      .filter((b): b is Bond => b !== undefined);
  }, [team, allBonds, characterBondLinks, allCharacters]);

  return { calculatedTeamType, styleCounts, activeBonds };
}
