import { Bond, CalculatedBond, Character, CharacterBondLink, TeamSlots } from "@/types";

/**
 * Calculates the active bonds for a given team configuration.
 * 
 * This function determines which bonds are active based on the characters currently in the team.
 * It handles two types of bonds:
 * 1. Standard Bonds: Require ALL listed participants to be present in the team.
 * 2. Team Bonds (`is_team_bond`): Require a minimum of 4 members from the specific group/school.
 * 
 * @param teamSlots - Current mapping of team positions to characters.
 * @param allCharacters - List of all characters (unused in current logic but kept for interface consistency).
 * @param allBonds - List of all available bond definitions.
 * @param allLinks - Association list linking characters to bonds.
 * @returns An array of calculated bonds that have at least one member present. 
 *          The `isActive` property indicates if the full bonus is applied.
 */
export function calculateActiveBonds(
  teamSlots: TeamSlots,
  allCharacters: Character[],
  allBonds: Bond[],
  allLinks: CharacterBondLink[]
): CalculatedBond[] {
  // Extract valid characters from team slots
  const team = Object.values(teamSlots).filter((c): c is Character => !!c);
  if (team.length === 0) return [];

  const calculated: CalculatedBond[] = [];
  // Create a Set for O(1) lookup of current team member IDs
  const teamIdsSet = new Set<number>(team.map((c) => c.id));

  // Pre-process links to map bond_id -> Set<character_id>
  const linksByBond = new Map<number, Set<number>>();
  for (const l of allLinks) {
    if (!linksByBond.has(l.bond_id)) {
      linksByBond.set(l.bond_id, new Set());
    }
    linksByBond.get(l.bond_id)!.add(l.character_id);
  }

  for (const bond of allBonds) {
    const participants = new Set<number>();

    // Add static participants defined in the bond
    if (bond.participants && Array.isArray(bond.participants)) {
      bond.participants.forEach((pid) => participants.add(pid));
    }

    // Add dynamic participants from links
    const dynamicLinks = linksByBond.get(bond.id);
    if (dynamicLinks) {
      dynamicLinks.forEach((pid) => participants.add(pid));
    }

    if (participants.size === 0) continue;

    // Count how many participants are currently in the team
    let currentCount = 0;
    participants.forEach((pid) => {
      if (teamIdsSet.has(pid)) {
        currentCount++;
      }
    });

    const totalRequired = participants.size;
    let isActive = false;
    let description = bond.description;

    // Determine activation status based on bond type
    if (bond.is_team_bond) {
      // Team bonds require at least 4 members
      isActive = currentCount >= 4;
      
      if (!description && bond.name) {
        description = `Aumenta as estatísticas de todos os jogadores de ${bond.name}.`;
      }
      
    } else {
      // Standard bonds require all members
      isActive = currentCount === totalRequired;
    }

    // Only include bonds relevant to the current team (at least 1 member present)
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
