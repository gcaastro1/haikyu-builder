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


