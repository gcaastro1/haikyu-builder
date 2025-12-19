import { Bond, CalculatedBond, Character, CharacterBondLink, TeamSlots } from "@/types";

export function calculateActiveBonds(
  teamSlots: TeamSlots,
  allCharacters: Character[],
  allBonds: Bond[],
  allLinks: CharacterBondLink[]
): CalculatedBond[] {
  const team = Object.values(teamSlots).filter((c): c is Character => !!c);
  if (team.length === 0) return [];

  const calculated: CalculatedBond[] = [];
  const teamIdsSet = new Set<number>(team.map((c) => c.id));

  const linksByBond = new Map<number, Set<number>>();
  for (const l of allLinks) {
    if (!linksByBond.has(l.bond_id)) {
      linksByBond.set(l.bond_id, new Set());
    }
    linksByBond.get(l.bond_id)!.add(l.character_id);
  }

  for (const bond of allBonds) {
    const participants = new Set<number>();

    if (bond.participants && Array.isArray(bond.participants)) {
      bond.participants.forEach((pid) => participants.add(pid));
    }

    const dynamicLinks = linksByBond.get(bond.id);
    if (dynamicLinks) {
      dynamicLinks.forEach((pid) => participants.add(pid));
    }

    if (participants.size === 0) continue;

    let currentCount = 0;
    participants.forEach((pid) => {
      if (teamIdsSet.has(pid)) {
        currentCount++;
      }
    });

    const totalRequired = participants.size;
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
}
