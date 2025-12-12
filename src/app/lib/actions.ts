import { useCharacterStore } from '@/stores/useCharacterStore';
import { Bond, Character, CharacterBondLink, CharacterStatsBond, Skill } from '@/types';

type StorageFile = { name: string; publicUrl: string };

export async function getStorageImages(): Promise<{ images: StorageFile[] | null; error: string | null }> {
  const images: StorageFile[] = [
    { name: 'placeholder.png', publicUrl: '/images/placeholder.png' }
  ];
  return { images, error: null };
}

const fetchJson = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Falha ao carregar ${url}: ${res.status}`);
  return res.json();
};

export async function getBonds(): Promise<{ bonds: Bond[] | null; error: string | null }> {
  try {
    const mockBonds: Array<{ id: number; name: string | null; description: string | null; is_team_bond?: boolean }> = await fetchJson('/mock/bonds.json');
    const bonds: Bond[] = mockBonds.map((b) => ({ id: b.id, name: b.name, description: b.description }));
    return { bonds, error: null };
  } catch (e: any) {
    return { bonds: null, error: e?.message || 'Falha ao carregar bonds mock' };
  }
}

export async function getAllCharacterBondLinks(): Promise<{ links: CharacterBondLink[] | null; error: string | null }> {
  try {
    const links: CharacterBondLink[] = await fetchJson('/mock/character_bonds.json');
    return { links, error: null };
  } catch (e: any) {
    return { links: null, error: e?.message || 'Falha ao carregar character_bonds mock' };
  }
}

export async function getCharacterBonds(characterId: number): Promise<{ bondIds: number[] | null; error: string | null }> {
  if (!characterId) return { bondIds: [], error: null };
  const storeLinks = useCharacterStore.getState().characterBondLinks;
  let source = storeLinks;
  if (!source?.length) {
    try {
      source = await fetchJson('/mock/character_bonds.json');
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
    const allSkills: Skill[] = await fetchJson('/mock/skills.json');
    const skills = allSkills.filter((s) => s.character_id === _characterId);
    return { skills, error: null };
  } catch (e: any) {
    return { skills: null, error: e?.message || 'Falha ao carregar skills mock' };
  }
}

export async function getCharacterStatBonds(_characterId: number): Promise<{ statsBonds: CharacterStatsBond[] | null; error: string | null }> {
  try {
    const allStatsLinks: CharacterStatsBond[] = await fetchJson('/mock/character_stats_bonds.json');
    const typeDefs: { id: number; name: string | null }[] = await fetchJson('/mock/stats_bonds.json');
    const typeMap = new Map(typeDefs.map((t) => [t.id, t.name]));
    const statsBonds = allStatsLinks
      .filter((s) => s.character_id === _characterId)
      .map((s) => ({
        ...s,
        stats_bond_name: typeMap.get(s.stats_bond_id) ?? undefined,
      }));
    return { statsBonds, error: null };
  } catch (e: any) {
    return { statsBonds: null, error: e?.message || 'Falha ao carregar character_stats_bonds mock' };
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
  const merged: Character = { ...allCharacters[idx], ...(updateData as any) } as Character;
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
