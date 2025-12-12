import { Character } from "@/types";

/**
 * Helper function para parsear estilos de personagem
 * Evita código duplicado em vários lugares
 */
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

/**
 * Formata personagens do banco de dados para o formato esperado
 */
export function formatCharacters(characters: unknown[]): Character[] {
  return characters.map((char: any) => ({
    ...char,
    styles: parseCharacterStyles(char.styles),
  })) as Character[];
}


