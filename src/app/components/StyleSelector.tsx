'use client';

import React, { useState, useEffect } from 'react';

const ALL_STYLES = [
  "Potente", "Saque", "Levantador", "Rápido", "Recepção", "Bloqueio"
];

type StyleSelectorProps = {
  name: string; 
  initialStyles?: string[]; 
};

export function StyleSelector({ name, initialStyles = [] }: StyleSelectorProps) {
  const [selectedStyles, setSelectedStyles] = useState<string[]>(initialStyles);

  const handleToggleStyle = (style: string) => {
    setSelectedStyles(prevStyles => {
      if (prevStyles.includes(style)) {
        return prevStyles.filter(s => s !== style);
      } else {
        return [...prevStyles, style];
      }
    });
  };

  const styleString = selectedStyles.join(', ');

  return (
    <div className="flex flex-col gap-2">
      <label className="block text-sm font-medium">Estilos Selecionados</label>
      
      <input type="hidden" name={name} value={styleString} />

      <div className="flex flex-wrap gap-2 p-2 bg-zinc-800 rounded-lg border border-zinc-700">
        {ALL_STYLES.map(style => {
          const isSelected = selectedStyles.includes(style);
          return (
            <button
              key={style}
              type="button" 
              onClick={() => handleToggleStyle(style)}
              className={`
                py-1.5 px-3 text-xs font-semibold rounded-full transition-colors
                ${isSelected
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                }
              `}
            >
              {style}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-zinc-400 mt-1">
        Ativo: {selectedStyles.length > 0 ? selectedStyles.join(', ') : 'Nenhum estilo selecionado'}
      </p>
    </div>
  );
}