'use server';

import { Bond } from '@/types';
import fs from 'fs/promises';
import path from 'path';

export async function saveBond(
  bondData: Omit<Bond, 'id'>, 
  initialParticipants?: number[]
): Promise<{ success: boolean; message: string; bond?: Bond }> {
  try {
    const bondsPath = path.join(process.cwd(), 'public', 'mock', 'bonds.json');
    const charBondsPath = path.join(process.cwd(), 'public', 'mock', 'character_bonds.json');
    
    const fileContent = await fs.readFile(bondsPath, 'utf-8');
    const bonds: (Bond & { participants?: number[], is_team_bond?: boolean })[] = JSON.parse(fileContent);

    const maxId = bonds.reduce((max, bond) => Math.max(max, bond.id), 0);
    const nextId = maxId + 1;

    const newBond = {
      ...bondData,
      id: nextId,
      participants: [],
      is_team_bond: false 
    };

    bonds.push(newBond);

    await fs.writeFile(bondsPath, JSON.stringify(bonds, null, 2), 'utf-8');

    if (initialParticipants && initialParticipants.length > 0) {
      const charBondsContent = await fs.readFile(charBondsPath, 'utf-8');
      const charBonds: { character_id: number; bond_id: number }[] = JSON.parse(charBondsContent);

      initialParticipants.forEach(charId => {
        if (!charBonds.some(cb => cb.character_id === charId && cb.bond_id === nextId)) {
          charBonds.push({ character_id: charId, bond_id: nextId });
        }
      });

      await fs.writeFile(charBondsPath, JSON.stringify(charBonds, null, 2), 'utf-8');
    }

    return { success: true, message: `Vínculo ${newBond.name} criado com sucesso!`, bond: newBond };
  } catch (error: any) {
    console.error('Erro ao salvar vínculo:', error);
    return { success: false, message: `Erro ao salvar vínculo: ${error.message}` };
  }
}
