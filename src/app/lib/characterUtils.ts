import { Character } from "@/types";

export function parseCharacterStyles(styles: unknown): string[] {
  if (Array.isArray(styles)) return styles;
  if (typeof styles === "string") {
    try {
      const parsed = JSON.parse(styles);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function formatCharacters(characters: unknown[]): Character[] {
  return characters.map((char: any) => ({
    ...char,
    styles: parseCharacterStyles(char.styles),
  })) as Character[];
}

const RARITY_ORDER: Record<string, number> = {
  R: 0,
  SR: 1,
  SSR: 2,
  UR: 3,
  SP: 4,
};

export function sortCharacters(a: Character, b: Character): number {
  // 1. School (Alphabetical)
  const schoolA = (a.school || "").toString();
  const schoolB = (b.school || "").toString();
  const schoolCompare = schoolA.localeCompare(schoolB);
  if (schoolCompare !== 0) return schoolCompare;

  // 2. Name (Alphabetical)
  const nameCompare = a.name.localeCompare(b.name);
  if (nameCompare !== 0) return nameCompare;

  // 3. Rarity (Specific Order: SR -> SSR -> UR -> SP)
  const rarityA = RARITY_ORDER[a.rarity || ""] ?? -1;
  const rarityB = RARITY_ORDER[b.rarity || ""] ?? -1;
  
  return rarityA - rarityB;
}
