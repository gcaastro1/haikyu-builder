import { useCharacterStore } from "@/stores/useCharacterStore";
import { useTeamStore } from "@/stores/useTeamStore";
import { Bond, CalculatedBond, Character, TeamSlots } from "@/types";
import { useMemo } from "react";

export function useActiveBonds() {
  const allBonds = useCharacterStore((state) => state.allBonds);
  const characterBondLinks = useCharacterStore(
    (state) => state.characterBondLinks
  );
  const team = useTeamStore((state) => state.team);

  // 1. Memoize the links map (Heavy operation 1)
  // This only recalculates if characterBondLinks changes (which is rare/never after load)
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

  // 2. Memoize the active bonds calculation (Heavy operation 2)
  // This recalculates when team changes, but uses the pre-computed map
  const activeBonds = useMemo(() => {
    const teamMembers = Object.values(team).filter(
      (c): c is Character => !!c
    );

    if (teamMembers.length === 0) return [];

    const calculated: CalculatedBond[] = [];
    const teamIdsSet = new Set<number>(teamMembers.map((c) => c.id));

    for (const bond of allBonds) {
      // 1. Identify participants (Static + Dynamic)
      // We use the memoized map here to avoid rebuilding sets
      const dynamicLinks = linksByBond.get(bond.id);
      
      // Optimization: Calculate size first to fail fast if needed, 
      // but we need to check intersection with team.
      
      let participantCount = 0;
      let currentCount = 0;

      // Check static participants
      if (bond.participants && Array.isArray(bond.participants)) {
        bond.participants.forEach((pid) => {
            participantCount++;
            if (teamIdsSet.has(pid)) currentCount++;
        });
      }

      // Check dynamic participants (avoiding duplicates if any ID is in both lists is tricky without a Set,
      // but assuming data integrity where IDs are either static OR dynamic for a bond helps.
      // If mixed, we need a Set. Let's assume we need a Set for correctness but optimized.)
      
      // To optimize: Only build the full participant Set if we actually have matches? 
      // No, we need totalRequired.
      
      // Let's build a temporary Set only if we have both types, otherwise use direct count?
      // Most bonds are either Team (static) or Normal (dynamic).
      // Let's try to handle them separately to avoid Set construction if possible.
      
      const hasStatic = bond.participants && bond.participants.length > 0;
      const hasDynamic = dynamicLinks && dynamicLinks.size > 0;

      if (hasStatic && hasDynamic) {
          // Fallback to Set for mixed types (safest)
          const participants = new Set<number>(bond.participants);
          dynamicLinks.forEach(id => participants.add(id));
          
          participantCount = participants.size;
          currentCount = 0;
          participants.forEach(pid => {
              if (teamIdsSet.has(pid)) currentCount++;
          });
      } else if (hasStatic) {
          participantCount = bond.participants!.length;
          // Optimization: bond.participants is an array, we can loop it.
          // Note: Assuming no duplicates in JSON static list.
          bond.participants!.forEach(pid => {
              if (teamIdsSet.has(pid)) currentCount++;
          });
      } else if (hasDynamic) {
          participantCount = dynamicLinks.size;
          dynamicLinks.forEach(pid => {
              if (teamIdsSet.has(pid)) currentCount++;
          });
      } else {
          continue; // No participants
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
