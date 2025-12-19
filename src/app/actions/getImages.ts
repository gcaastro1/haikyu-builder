'use server';

import fs from 'fs/promises';
import path from 'path';

export type StorageFile = {
  name: string;
  publicUrl: string;
};

export async function getStorageImages(): Promise<{ images: StorageFile[] | null; error: string | null }> {
  try {
    const imagesDir = path.join(process.cwd(), 'public', 'images', 'characters_lg');
    
    try {
        await fs.access(imagesDir);
    } catch {
        return { images: [], error: null };
    }

    const files = await fs.readdir(imagesDir);
    
    const images: StorageFile[] = files
      .filter(file => /\.(png|jpg|jpeg|gif|webp)$/i.test(file))
      .map(file => ({
        name: file,
        publicUrl: `/images/characters_lg/${file}`
      }));

    return { images, error: null };
  } catch (error: any) {
    console.error('Erro ao listar imagens:', error);
    return { images: null, error: `Erro ao listar imagens: ${error.message}` };
  }
}
