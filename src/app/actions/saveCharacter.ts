'use server';

import { Character } from '@/types';
import fs from 'fs/promises';
import path from 'path';

export async function saveCharacterToJson(
  characterData: Omit<Character, 'id'> & { id?: number },
  bondIds?: number[],
  statsBondIds?: number[]
): Promise<{ success: boolean; message: string }> {
  try {
    const charactersPath = path.join(process.cwd(), 'public', 'mock', 'characters.json');
    const bondsPath = path.join(process.cwd(), 'public', 'mock', 'bonds.json');
    const characterBondsPath = path.join(process.cwd(), 'public', 'mock', 'character_bonds.json');
    const characterStatsBondsPath = path.join(process.cwd(), 'public', 'mock', 'character_stats_bonds.json');
    
    const fileContent = await fs.readFile(charactersPath, 'utf-8');
    const characters: Character[] = JSON.parse(fileContent);

    let nextId = characterData.id;
    if (!nextId) {
      const maxId = characters.reduce((max, char) => Math.max(max, char.id), 0);
      nextId = maxId + 1;
    }

    const newCharacter: Character = {
      ...characterData,
      id: nextId,
    } as Character;

    const existingIndex = characters.findIndex((c) => c.id === nextId);
    if (existingIndex >= 0) {
      characters[existingIndex] = newCharacter;
    } else {
      characters.push(newCharacter);
    }

    await fs.writeFile(charactersPath, JSON.stringify(characters, null, 2), 'utf-8');

    if (bondIds) {
      const charBondsContent = await fs.readFile(characterBondsPath, 'utf-8');
      let charBonds: { character_id: number; bond_id: number }[] = JSON.parse(charBondsContent);

      charBonds = charBonds.filter(cb => cb.character_id !== nextId);

      bondIds.forEach(bondId => {
        charBonds.push({ character_id: nextId!, bond_id: bondId });
      });

      await fs.writeFile(characterBondsPath, JSON.stringify(charBonds, null, 2), 'utf-8');

      const bondsContent = await fs.readFile(bondsPath, 'utf-8');
      const bonds: any[] = JSON.parse(bondsContent);

      bonds.forEach(bond => {
        if (bond.participants) {
          bond.participants = bond.participants.filter((pid: number) => pid !== nextId);
        } else {
            bond.participants = [];
        }

        if (bondIds.includes(bond.id)) {
          bond.participants.push(nextId);
        }
      });

      await fs.writeFile(bondsPath, JSON.stringify(bonds, null, 2), 'utf-8');
    }

    if (statsBondIds) {
      const charStatsBondsContent = await fs.readFile(characterStatsBondsPath, 'utf-8');
      let charStatsBonds: any[] = JSON.parse(charStatsBondsContent);

      const existingLinks = charStatsBonds.filter(csb => csb.character_id === nextId);
      
      charStatsBonds = charStatsBonds.filter(csb => csb.character_id !== nextId);
      
      const maxLinkId = charStatsBonds.reduce((max, l) => Math.max(max, l.id || 0), 0);
      let nextLinkId = maxLinkId + 1;

      statsBondIds.forEach(sbId => {
        const existing = existingLinks.find(l => l.stats_bond_id === sbId);
        charStatsBonds.push({
          id: existing ? existing.id : nextLinkId++,
          stats_bond_id: sbId,
          character_id: nextId!,
          buff_description: existing ? existing.buff_description : "",
          created_at: existing ? existing.created_at : new Date().toISOString()
        });
      });

      await fs.writeFile(characterStatsBondsPath, JSON.stringify(charStatsBonds, null, 2), 'utf-8');
    }

    return { success: true, message: `Personagem ${newCharacter.name} salvo com sucesso no arquivo JSON!` };
  } catch (error: any) {
    console.error('Erro ao salvar personagem:', error);
    return { success: false, message: `Erro ao salvar personagem: ${error.message}` };
  }
}
