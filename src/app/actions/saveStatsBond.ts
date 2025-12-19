'use server';

import { StatsBondType } from '@/types';
import fs from 'fs/promises';
import path from 'path';

export async function saveStatsBond(
  name: string,
  initialParticipants?: { characterId: number; buffDescription?: string }[]
): Promise<{ success: boolean; message: string; statsBond?: StatsBondType }> {
  try {
    const typesPath = path.join(process.cwd(), 'public', 'mock', 'stats_bonds.json');
    const linksPath = path.join(process.cwd(), 'public', 'mock', 'character_stats_bonds.json');
    
    const typesContent = await fs.readFile(typesPath, 'utf-8');
    const types: StatsBondType[] = JSON.parse(typesContent);

    const maxId = types.reduce((max, t) => Math.max(max, t.id), 0);
    const nextId = maxId + 1;

    const newType: StatsBondType = {
      id: nextId,
      name,
      created_at: new Date().toISOString()
    };

    types.push(newType);
    await fs.writeFile(typesPath, JSON.stringify(types, null, 2), 'utf-8');

    if (initialParticipants && initialParticipants.length > 0) {
      const linksContent = await fs.readFile(linksPath, 'utf-8');
      const links: any[] = JSON.parse(linksContent);
      
      const maxLinkId = links.reduce((max, l) => Math.max(max, l.id || 0), 0);
      let nextLinkId = maxLinkId + 1;

      initialParticipants.forEach(p => {
        links.push({
          id: nextLinkId++,
          stats_bond_id: nextId,
          character_id: p.characterId,
          buff_description: p.buffDescription || "Buff padrão",
          created_at: new Date().toISOString()
        });
      });

      await fs.writeFile(linksPath, JSON.stringify(links, null, 2), 'utf-8');
    }

    return { success: true, message: `Vínculo de Status ${newType.name} criado com sucesso!`, statsBond: newType };
  } catch (error: any) {
    console.error('Erro ao salvar vínculo de status:', error);
    return { success: false, message: `Erro ao salvar vínculo de status: ${error.message}` };
  }
}
