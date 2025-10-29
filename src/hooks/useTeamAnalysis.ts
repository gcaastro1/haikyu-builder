import { useMemo } from "react";
import { useCharacterStore } from "@/stores/useCharacterStore";
import {
  TeamSlots,
  Character,
  TeamType,
  StyleCounts,
  dbStyleToTeamTypeMap,
  Bond,
} from "@/types";

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

  // === Análise de vínculos ativos ===
  const activeBonds = useMemo(() => {
    const bonds: Bond[] = [];
    const charactersOnCourt = Object.values(team).filter(Boolean) as Character[];
    if (!charactersOnCourt.length || !allBonds.length || !characterBondLinks.length)
      return bonds;

    const schoolCounts: Record<string, number> = {};
    charactersOnCourt.forEach((char) => {
      if (char.school)
        schoolCounts[char.school] = (schoolCounts[char.school] || 0) + 1;
    });

    Object.entries(schoolCounts).forEach(([schoolName, count]) => {
      if (count >= 4) {
        const schoolBond = allBonds.find((bond) => bond.name === schoolName);
        if (schoolBond) bonds.push(schoolBond);
      }
    });

    const characterNames = new Set(charactersOnCourt.map((c) => c.name));
    const nonSchoolBonds = allBonds.filter(
      (bond) => !Object.keys(schoolCounts).includes(bond.name || "")
    );

    nonSchoolBonds.forEach((bond) => {
      const links = characterBondLinks.filter((l) => l.bond_id === bond.id);
      const requiredNames = links
        .map((l) => allCharacters.find((c) => c.id === l.character_id)?.name)
        .filter(Boolean) as string[];

      if (requiredNames.every((name) => characterNames.has(name)))
        bonds.push(bond);
    });

    return bonds;
  }, [team, allBonds, characterBondLinks, allCharacters]);

  return { calculatedTeamType, styleCounts, activeBonds };
}
