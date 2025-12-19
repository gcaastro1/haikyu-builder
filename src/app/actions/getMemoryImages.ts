'use server';

import fs from 'fs/promises';
import path from 'path';

export type StorageFile = {
  name: string;
  publicUrl: string;
};

export async function getMemoryImages(): Promise<{ images: StorageFile[] | null; error: string | null }> {
  try {
    // Busca imagens diretamente da pasta public/images/memories
    const imagesDir = path.join(process.cwd(), 'public', 'images', 'memories');
    
    // Verifica se o diretório existe
    try {
        await fs.access(imagesDir);
    } catch (e: any) {
        return { images: [], error: `Diretório não encontrado: ${imagesDir}` };
    }

    // Lê todos os arquivos da pasta
    const files = await fs.readdir(imagesDir);
    
    // Filtra apenas imagens e cria o objeto de retorno
    const images: StorageFile[] = files
      .filter(file => /\.(png|jpg|jpeg|gif|webp)$/i.test(file))
      .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
      .map(file => ({
        name: file,
        // O caminho público deve começar com /images/memories/ para o Next.js encontrar o arquivo
        publicUrl: `/images/memories/${file}`
      }));

    return { images, error: null };
  } catch (error: any) {
    console.error('[getMemoryImages] Error:', error);
    return { images: null, error: `Erro ao listar imagens: ${error.message}` };
  }
}
