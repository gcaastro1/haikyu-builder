'use server';

import { Memory } from '@/types';
import fs from 'fs/promises';
import path from 'path';

export async function saveMemoryToJson(
  memoryData: Memory
): Promise<{ success: boolean; message: string }> {
  try {
    const memoriesPath = path.join(process.cwd(), 'public', 'mock', 'memories.json');
    
    const fileContent = await fs.readFile(memoriesPath, 'utf-8');
    const memories: Memory[] = JSON.parse(fileContent);

    // If ID is provided, check if it exists. If not, generate one.
    if (!memoryData.id) {
        // Simple generation: mem_<name_snake_case>
        const sanitized = memoryData.name
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '_')
            .replace(/_+/g, '_');
        memoryData.id = `mem_${sanitized}`;
    }

    const existingIndex = memories.findIndex((m) => m.id === memoryData.id);

    if (existingIndex >= 0) {
      memories[existingIndex] = memoryData;
    } else {
      memories.push(memoryData);
    }

    await fs.writeFile(memoriesPath, JSON.stringify(memories, null, 2), 'utf-8');

    return { success: true, message: `Memória ${memoryData.name} salva com sucesso!` };
  } catch (error: any) {
    console.error('Erro ao salvar memória:', error);
    return { success: false, message: `Erro ao salvar memória: ${error.message}` };
  }
}
