import { useCharacterStore } from '@/stores/useCharacterStore';
import { Bond, Character, CharacterBondLink, CharacterStatsBond, Potential, Skill } from '@/types';
import { z } from 'zod';
import { fetchAndValidate } from './api';
import {
    BondSchema,
    CharacterBondLinkSchema,
    CharacterStatsBondSchema,
    PotentialSchema,
    SkillSchema,
    StatsBondTypeSchema
} from './schemas';

type StorageFile = { name: string; publicUrl: string };

export async function getStorageImages(): Promise<{ images: StorageFile[] | null; error: string | null }> {
  const images: StorageFile[] = [
    { name: 'placeholder.png', publicUrl: '/images/placeholder.png' }
  ];
  return { images, error: null };
}



export async function getPotentials(): Promise<{ potentials: Potential[] | null; error: string | null }> {
  try {
    const potentials: Potential[] = await fetchAndValidate('/mock/potentials.json', z.array(PotentialSchema));
    return { potentials, error: null };
  } catch (e: unknown) {
    const error = e instanceof Error ? e.message : 'Falha ao carregar potentials mock';
    return { potentials: null, error };
  }
}

export async function getBonds(): Promise<{ bonds: Bond[] | null; error: string | null }> {
  try {
    const bonds: Bond[] = await fetchAndValidate('/mock/bonds.json', z.array(BondSchema));
    return { bonds, error: null };
  } catch (e: unknown) {
    const error = e instanceof Error ? e.message : 'Falha ao carregar bonds mock';
    return { bonds: null, error };
  }
}

export async function getAllCharacterBondLinks(): Promise<{ links: CharacterBondLink[] | null; error: string | null }> {
  try {
    const links: CharacterBondLink[] = await fetchAndValidate('/mock/character_bonds.json', z.array(CharacterBondLinkSchema));
    return { links, error: null };
  } catch (e: unknown) {
    const error = e instanceof Error ? e.message : 'Falha ao carregar character_bonds mock';
    return { links: null, error };
  }
}

export async function getCharacterBonds(characterId: number): Promise<{ bondIds: number[] | null; error: string | null }> {
  if (!characterId) return { bondIds: [], error: null };
  const storeLinks = useCharacterStore.getState().characterBondLinks;
  let source = storeLinks;
  if (!source?.length) {
    try {
      source = await fetchAndValidate('/mock/character_bonds.json', z.array(CharacterBondLinkSchema));
    } catch {
      source = [];
    }
  }
  const ids = source.filter((l: any) => l.character_id === characterId).map((l: any) => l.bond_id);
  return { bondIds: ids, error: null };
}

export async function updateCharacterBonds(characterId: number, newBondIds: number[]): Promise<{ success: boolean; message: string }> {
  if (!characterId) return { success: false, message: 'Erro: ID do personagem não fornecido.' };
  const { characterBondLinks } = useCharacterStore.getState();
  const filtered = characterBondLinks.filter(l => l.character_id !== characterId);
  const added = (newBondIds || []).map(id => ({ character_id: characterId, bond_id: id }));
  useCharacterStore.setState({ characterBondLinks: [...filtered, ...added] });
  return { success: true, message: 'Vínculos atualizados com sucesso!' };
}

export async function getCharacterSkills(_characterId: number): Promise<{ skills: Skill[] | null; error: string | null }> {
  try {
    const allSkills: Skill[] = await fetchAndValidate('/mock/skills.json', z.array(SkillSchema));
    const skills = allSkills.filter((s) => s.character_id === _characterId);
    return { skills, error: null };
  } catch (e: unknown) {
    const error = e instanceof Error ? e.message : 'Falha ao carregar skills mock';
    return { skills: null, error };
  }
}

export async function getStatsBondTypes(): Promise<{ types: { id: number; name: string | null; description?: string }[] | null; error: string | null }> {
  try {
    const types = await fetchAndValidate('/mock/stats_bonds.json', z.array(StatsBondTypeSchema));
    return { types, error: null };
  } catch (e: unknown) {
    const error = e instanceof Error ? e.message : 'Falha ao carregar stats_bonds mock';
    return { types: null, error };
  }
}

export async function getCharacterStatBonds(_characterId: number): Promise<{ statsBonds: CharacterStatsBond[] | null; error: string | null }> {
  try {
    const allStatsLinks: CharacterStatsBond[] = await fetchAndValidate('/mock/character_stats_bonds.json', z.array(CharacterStatsBondSchema));
    const typeDefs: { id: number; name: string | null }[] = await fetchAndValidate('/mock/stats_bonds.json', z.array(StatsBondTypeSchema));
    const typeMap = new Map(typeDefs.map((t) => [t.id, t.name]));
    const statsBonds = allStatsLinks
      .filter((s) => s.character_id === _characterId)
      .map((s) => ({
        ...s,
        stats_bond_name: typeMap.get(s.stats_bond_id) ?? undefined,
      }));
    return { statsBonds, error: null };
  } catch (e: unknown) {
    const error = e instanceof Error ? e.message : 'Falha ao carregar character_stats_bonds mock';
    return { statsBonds: null, error };
  }
}

export async function updateCharacter(characterData: Partial<Character> & { id: number }): Promise<{ success: boolean; message: string }> {
  const { id, ...updateData } = characterData;
  if (!id) return { success: false, message: 'Erro: ID do personagem não fornecido.' };
  if (!updateData.name || !updateData.position || !updateData.rarity || !updateData.school) {
    return { success: false, message: 'Erro: Campos obrigatórios (Nome, Posição, Raridade, Escola) estão faltando.' };
  }
  const { allCharacters } = useCharacterStore.getState();
  const idx = allCharacters.findIndex(c => c.id === id);
  if (idx === -1) return { success: false, message: 'Personagem não encontrado.' };
  const merged: Character = { ...allCharacters[idx], ...(updateData as unknown as Partial<Character>) } as Character;
  const next = [...allCharacters];
  next[idx] = merged;
  useCharacterStore.setState({ allCharacters: next });
  return { success: true, message: `Personagem ${merged.name} atualizado com sucesso!` };
}

export async function createCharacterLocal(data: Omit<Character, 'id' | 'created_at'> & { id?: number }): Promise<{ success: boolean; message: string }> {
  const { allCharacters } = useCharacterStore.getState();
  const nextId = data.id ?? (allCharacters.reduce((m, c) => Math.max(m, c.id), 0) + 1);
  const newChar: Character = { ...data, id: nextId } as Character;
  useCharacterStore.setState({ allCharacters: [...allCharacters, newChar] });
  return { success: true, message: `Personagem ${newChar.name} cadastrado com sucesso!` };
}
