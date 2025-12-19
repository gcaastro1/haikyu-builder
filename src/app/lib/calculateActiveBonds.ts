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

  // Otimização: Agrupa links por bond_id uma única vez
  const linksByBond = new Map<number, Set<number>>();
  for (const l of allLinks) {
    if (!linksByBond.has(l.bond_id)) {
      linksByBond.set(l.bond_id, new Set());
    }
    linksByBond.get(l.bond_id)!.add(l.character_id);
  }

  for (const bond of allBonds) {
    // 1. Identificar todos os participantes deste vínculo (fusão de JSON estático + Links dinâmicos)
    const participants = new Set<number>();

    // Adiciona participantes definidos no objeto do vínculo (ex: Team Bonds do JSON)
    if (bond.participants && Array.isArray(bond.participants)) {
      bond.participants.forEach((pid) => participants.add(pid));
    }

    // Adiciona participantes definidos na tabela de links (ex: Vínculos de Amizade/Específicos)
    const dynamicLinks = linksByBond.get(bond.id);
    if (dynamicLinks) {
      dynamicLinks.forEach((pid) => participants.add(pid));
    }

    if (participants.size === 0) continue;

    // 2. Contar quantos estão no time atual
    let currentCount = 0;
    participants.forEach((pid) => {
      if (teamIdsSet.has(pid)) {
        currentCount++;
      }
    });

    const totalRequired = participants.size;
    let isActive = false;
    let description = bond.description;

    // 3. Lógica de Ativação baseada no tipo de vínculo
    if (bond.is_team_bond) {
      // Regra de Time: Requer 4 ou mais membros
      isActive = currentCount >= 4;
      
      // Ajusta descrição se necessário
      if (!description && bond.name) {
        description = `Aumenta as estatísticas de todos os jogadores de ${bond.name}.`;
      }
      
      // Para Team Bonds, o total exibido na UI costuma ser o limiar (4) ou o total possível?
      // Geralmente em UIs de gacha, mostra-se "X/4" para ativação.
      // Vou manter a lógica anterior de exibir 4 como total necessário para ativação mínima.
    } else {
      // Regra Padrão: Requer todos os participantes
      isActive = currentCount === totalRequired;
    }

    // Se tiver pelo menos um membro ou estiver ativo, adiciona à lista
    if (currentCount > 0) {
      calculated.push({
        id: bond.id,
        name: bond.name,
        description: description,
        totalRequired: bond.is_team_bond ? 4 : totalRequired, // Para times, o alvo é 4
        currentCount: currentCount,
        isActive,
        hasAnyMemberOnCourt: currentCount > 0,
        isTeamBond: bond.is_team_bond,
      });
    }
  }

  return calculated;
}
