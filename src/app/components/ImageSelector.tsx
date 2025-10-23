'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { getStorageImages } from '../lib/actions';
import { Search } from 'lucide-react';

interface StorageFile {
    name: string;
    publicUrl: string;
}

type ImageSelectorProps = {
    name: string; 
    initialValue?: string | null; 
    onChange: (newUrl: string) => void; 
};

export function ImageSelector({ name, initialValue, onChange }: ImageSelectorProps) {
    const [images, setImages] = useState<StorageFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [allImages, setAllImages] = useState<StorageFile[]>([]); 
    const [searchTerm, setSearchTerm] = useState('');

    const selectedUrl = initialValue;

    useEffect(() => {
        const loadImages = async () => {
            setLoading(true);
            const { images: loadedImages, error } = await getStorageImages();
            if (error) console.error("Erro ao carregar imagens:", error);
            if (loadedImages) {
                setAllImages(loadedImages); 
            }
            setLoading(false);
        };
        loadImages();
    }, []);

    const handleSelectImage = (url: string) => {
        onChange(url); 
    };

    const filteredImages = allImages.filter(file =>
        file.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">
                Selecione a Imagem do Personagem
            </label>

            <input type="hidden" name={name} value={selectedUrl || ''} required />

            <div className="bg-zinc-800 p-3 rounded-lg border border-zinc-700 flex flex-col gap-3"> 
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Buscar imagem pelo nome..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-zinc-700 border border-zinc-600 rounded-md py-1.5 px-3 text-sm text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                     <Search
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400"
                        size={16}
                    />
                </div>

                {loading && <p className="text-center text-zinc-400">Carregando imagens...</p>}
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto custom-scrollbar">
                    {!loading && filteredImages.map((file) => ( 
                        <div
                            key={file.name}
                            onClick={() => handleSelectImage(file.publicUrl)}
                            className={`relative cursor-pointer transition-all border-2 rounded-lg
                                ${selectedUrl === file.publicUrl ? 'border-orange-500 ring-2 ring-orange-500' : 'border-transparent hover:border-zinc-500'}
                            `}
                        >
                            <Image
                                src={file.publicUrl}
                                alt={file.name}
                                width={80}
                                height={80}
                                className="rounded-lg object-cover w-20 h-20"
                                unoptimized
                            />
                        </div>
                    ))}
                    {!loading && filteredImages.length === 0 && (
                         <p className="text-zinc-500 text-sm text-center w-full py-4">
                            {searchTerm ? `Nenhuma imagem encontrada para "${searchTerm}".` : 'Nenhuma imagem encontrada no bucket.'}
                         </p>
                    )}
                </div>
            </div>
            
            {selectedUrl && (
                <div className="mt-4 flex items-center gap-4 bg-zinc-900 p-3 rounded-lg">
                    <p className="text-sm">Selecionado:</p>
                    <Image 
                        src={selectedUrl} 
                        alt="Preview" 
                        width={60} 
                        height={60} 
                        className="rounded object-cover" 
                        unoptimized
                    />
                    <p className="text-xs text-zinc-400 truncate">{selectedUrl.split('/').pop()}</p>
                </div>
            )}
        </div>
    );
}