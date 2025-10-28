import { Bond, CalculatedBond, Character, CharacterBondLink, TeamSlots } from "@/types";

// Lista oficial de escolas (case-insensitive)
const SCHOOL_NAMES = [
  "Aoba Johsai",
  "Date Tech",
  "Fukurodani",
  "Inarizaki",
  "Itachiyama",
  "Johzenji",
  "Kamomedai",
  "Karasuno",
  "Kitagawa Daichi",
  "Nekoma",
  "Shiratorizawa",
];

export function calculateActiveBonds(
  teamSlots: TeamSlots,
  allCharacters: Character[],
  allBonds: Bond[],
  allLinks: CharacterBondLink[]
): CalculatedBond[] {
  const team = Object.values(teamSlots).filter((c): c is Character => !!c);
  if (team.length === 0) return [];

  const calculated: CalculatedBond[] = [];

  // -- Helpers
  const norm = (s: string) => s.toLowerCase().trim();
  const schoolSet = new Set(SCHOOL_NAMES.map(norm));
  const teamNames = team.map((c) => normalizeName(c.name));
  const teamSchoolsCount: Record<string, number> = {};
  for (const c of team) {
    const sc = c.school ? norm(String(c.school)) : "";
    if (!sc) continue;
    teamSchoolsCount[sc] = (teamSchoolsCount[sc] || 0) + 1;
  }

  // === 1) VÍNCULOS DE TIME (somente ATIVOS, nunca pendentes) ===
  // Detecta bonds cujo nome é exatamente o nome de uma escola
  const teamBondsBySchool = new Map<string, Bond>();
  for (const b of allBonds) {
    if (!b.name) continue;
    const n = norm(b.name);
    if (schoolSet.has(n)) {
      teamBondsBySchool.set(n, b);
    }
  }

  // Para cada escola presente no time, se tiver >=4, ativa o bond dessa escola
  for (const [schoolNorm, count] of Object.entries(teamSchoolsCount)) {
    if (count >= 4 && teamBondsBySchool.has(schoolNorm)) {
      const bond = teamBondsBySchool.get(schoolNorm)!;
      calculated.push({
        id: bond.id,
        name: bond.name,
        description:
          bond.description ??
          `Aumenta as estatísticas de todos os jogadores de ${bond.name}.`,
        totalRequired: 4,
        currentCount: 4, // barra cheia
        isActive: true,
        hasAnyMemberOnCourt: true,
        isTeamBond: true,
      });
    }
  }

  // === 2) VÍNCULOS NORMAIS (via pivot); ignorar os que são de time
  for (const bond of allBonds) {
    if (!bond.name) continue;
    const isTeamBond = schoolSet.has(norm(bond.name));
    if (isTeamBond) continue; // já tratamos acima

    const links = allLinks.filter((l) => l.bond_id === bond.id);
    if (links.length === 0) continue;

    // Regra de "versões": computa por NOME normalizado
    const bondNames = links
      .map((lnk) => {
        const ch = allCharacters.find((c) => c.id === lnk.character_id);
        return ch ? normalizeName(ch.name) : "";
      })
      .filter(Boolean);

    const uniqueRequiredNames = Array.from(new Set(bondNames));
    const currentCount = uniqueRequiredNames.filter((nm) =>
      teamNames.includes(nm)
    ).length;

    const totalRequired = uniqueRequiredNames.length;
    const hasAnyMemberOnCourt = currentCount > 0;
    const isActive = currentCount === totalRequired;

    calculated.push({
      id: bond.id,
      name: bond.name,
      description: bond.description,
      totalRequired,
      currentCount,
      isActive,
      hasAnyMemberOnCourt,
      isTeamBond: false,
    });
  }

  // === Dedup + ordenação (ativos primeiro)
  const unique = Array.from(new Map(calculated.map((b) => [b.id, b])).values());
  return unique.sort((a, b) => Number(b.isActive) - Number(a.isActive));
}

// remove sufixos/variações de versão no nome do personagem
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\(.*?\)/g, "") // remove qualquer coisa entre parênteses
    .replace(/-sp| ur| sr| ssr| sp/gi, "")
    .trim();
}
