'use client';

import "@/styles/components/_image-selector.scss";
import { Search } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { getMemoryImages, StorageFile } from '../actions/getMemoryImages';

type ImageSelectorProps = {
  name?: string;
  initialValue?: string | null;
  onChange: (newUrl: string) => void;
  images?: StorageFile[]; // New prop to receive images
  loadError?: string | null; // New prop for load error
};

export function MemoryImageSelector({ name, initialValue, onChange, images, loadError }: ImageSelectorProps) {
  const [loading, setLoading] = useState(!images);
  const [allImages, setAllImages] = useState<StorageFile[]>(images || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(loadError || null);

  const selectedUrl = initialValue;

  useEffect(() => {
    // If images are provided via props, use them and don't fetch
    if (images) {
      setAllImages(images);
      setLoading(false);
      setError(loadError || null);
      return;
    }

    // Fallback to client-side fetch if images not provided
    const loadImages = async () => {
      setLoading(true);
      setError(null);
      try {
        const { images: loadedImages, error: loadError } = await getMemoryImages();
        if (loadError) {
             console.error("Erro ao carregar imagens:", loadError);
             setError(loadError);
        } else if (loadedImages) {
             setAllImages(loadedImages);
        }
      } catch (err: any) {
          console.error("Erro inesperado:", err);
          setError(err.message || "Erro inesperado");
      }
      setLoading(false);
    };
    loadImages();
  }, [images, loadError]);

  const handleSelectImage = (url: string) => {
    onChange(url);
  };

  const filteredImages = allImages.filter((file) =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDisplayUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return url;
    // Handle legacy paths
    if (url.startsWith('img/memories/')) {
        return url.replace('img/memories/', '/images/memories/');
    }
    return `/${url}`;
  };

  return (
    <div className="image-selector">
      <label className="image-selector__label">
        Selecione a Imagem da Memória
      </label>

      {name && <input type="hidden" name={name} value={selectedUrl || ''} />}

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
        {error && <p className="text-red-500 text-sm text-center py-2">{error}</p>}

        <div className="image-selector__grid">
          {!loading && !error &&
            filteredImages.map((file) => (
              <div
                key={file.name}
                onClick={() => handleSelectImage(file.publicUrl)}
                className={`image-selector__item ${
                  selectedUrl === file.publicUrl ? 'is-selected' : ''
                }`}
              >
                {/* Using standard img tag to avoid Next.js Image optimization issues with local files */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={file.publicUrl}
                  alt={file.name}
                  className="image-selector__thumb"
                  loading="lazy"
                />
                <span className="image-selector__name" title={file.name}>
                  {file.name}
                </span>
              </div>
            ))}

          {!loading && !error && filteredImages.length === 0 && (
            <p className="image-selector__empty">
              {searchTerm
                ? `Nenhuma imagem encontrada para "${searchTerm}".`
                : 'Nenhuma imagem encontrada.'}
            </p>
          )}
        </div>
      </div>

      {selectedUrl && (
        <div className="image-selector__preview">
          <p className="image-selector__preview-text">Selecionado:</p>
          <Image
            src={getDisplayUrl(selectedUrl)}
            alt="Preview"
            width={60}
            height={60}
            unoptimized
            className="image-selector__preview-thumb"
            onError={(e) => {
                // Fallback for preview image if it fails
                (e.target as HTMLImageElement).src = "/images/placeholder.png"; 
            }}
          />
        </div>
      )}
    </div>
  );
}
