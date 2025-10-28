'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { getStorageImages } from '../lib/actions';
import { Search } from 'lucide-react';
import "@/styles/components/_image-selector.scss";

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
      if (loadedImages) setAllImages(loadedImages);
      setLoading(false);
    };
    loadImages();
  }, []);

  const handleSelectImage = (url: string) => {
    onChange(url);
  };

  const filteredImages = allImages.filter((file) =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="image-selector">
      <label className="image-selector__label">
        Selecione a Imagem do Personagem
      </label>

      <input type="hidden" name={name} value={selectedUrl || ''} required />

      <div className="image-selector__container">
        <div className="image-selector__search">
          <input
            type="text"
            placeholder="Buscar imagem pelo nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="image-selector__input"
          />
          <Search className="image-selector__icon" size={16} />
        </div>

        {loading && <p className="image-selector__loading">Carregando imagens...</p>}

        <div className="image-selector__grid">
          {!loading &&
            filteredImages.map((file) => (
              <div
                key={file.name}
                onClick={() => handleSelectImage(file.publicUrl)}
                className={`image-selector__item ${
                  selectedUrl === file.publicUrl ? 'is-selected' : ''
                }`}
              >
                <Image
                  src={file.publicUrl}
                  alt={file.name}
                  width={80}
                  height={80}
                  className="image-selector__thumb"
                  unoptimized
                />
              </div>
            ))}

          {!loading && filteredImages.length === 0 && (
            <p className="image-selector__empty">
              {searchTerm
                ? `Nenhuma imagem encontrada para "${searchTerm}".`
                : 'Nenhuma imagem encontrada no bucket.'}
            </p>
          )}
        </div>
      </div>

      {selectedUrl && (
        <div className="image-selector__preview">
          <p className="image-selector__preview-text">Selecionado:</p>
          <Image
            src={selectedUrl}
            alt="Preview"
            width={60}
            height={60}
            className="image-selector__preview-thumb"
            unoptimized
          />
          <p className="image-selector__preview-name">
            {selectedUrl.split('/').pop()}
          </p>
        </div>
      )}
    </div>
  );
}
