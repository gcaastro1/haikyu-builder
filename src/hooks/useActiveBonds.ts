import { useCharacterStore } from "@/stores/useCharacterStore";
import { useTeamStore } from "@/stores/useTeamStore";
import { CalculatedBond, Character } from "@/types";
import { useMemo } from "react";

export function useActiveBonds() {
  const allBonds = useCharacterStore((state) => state.allBonds);
  const characterBondLinks = useCharacterStore(
    (state) => state.characterBondLinks
  );
  const team = useTeamStore((state) => state.team);

  const linksByBond = useMemo(() => {
    const map = new Map<number, Set<number>>();
    for (const l of characterBondLinks) {
      if (!map.has(l.bond_id)) {
        map.set(l.bond_id, new Set());
      }
      map.get(l.bond_id)!.add(l.character_id);
    }
    return map;
  }, [characterBondLinks]);

  const activeBonds = useMemo(() => {
    const teamMembers = Object.values(team).filter(
      (c): c is Character => !!c
    );

    if (teamMembers.length === 0) return [];

    const calculated: CalculatedBond[] = [];
    const teamIdsSet = new Set<number>(teamMembers.map((c) => c.id));

    for (const bond of allBonds) {
      const dynamicLinks = linksByBond.get(bond.id);
      
      let participantCount = 0;
      let currentCount = 0;

      if (bond.participants && Array.isArray(bond.participants)) {
        bond.participants.forEach((pid) => {
            participantCount++;
            if (teamIdsSet.has(pid)) currentCount++;
        });
      }

      const hasStatic = bond.participants && bond.participants.length > 0;
      const hasDynamic = dynamicLinks && dynamicLinks.size > 0;

      if (hasStatic && hasDynamic) {
          const participants = new Set<number>(bond.participants);
          dynamicLinks.forEach(id => participants.add(id));
          
          participantCount = participants.size;
          currentCount = 0;
          participants.forEach(pid => {
              if (teamIdsSet.has(pid)) currentCount++;
          });
      } else if (hasStatic) {
          participantCount = bond.participants!.length;
          bond.participants!.forEach(pid => {
              if (teamIdsSet.has(pid)) currentCount++;
          });
      } else if (hasDynamic) {
          participantCount = dynamicLinks.size;
          dynamicLinks.forEach(pid => {
              if (teamIdsSet.has(pid)) currentCount++;
          });
      } else {
          continue; 
      }

      if (participantCount === 0) continue;

      const totalRequired = participantCount;
      let isActive = false;
      let description = bond.description;

      if (bond.is_team_bond) {
        isActive = currentCount >= 4;
        if (!description && bond.name) {
          description = `Aumenta as estatísticas de todos os jogadores de ${bond.name}.`;
        }
      } else {
        isActive = currentCount === totalRequired;
      }

      if (currentCount > 0) {
        calculated.push({
          id: bond.id,
          name: bond.name,
          description: description,
          totalRequired: bond.is_team_bond ? 4 : totalRequired,
          currentCount: currentCount,
          isActive,
          hasAnyMemberOnCourt: currentCount > 0,
          isTeamBond: bond.is_team_bond,
        });
      }
    }

    return calculated;
  }, [allBonds, linksByBond, team]);

  return activeBonds;
}
