'use client';

import React, { useState } from 'react';

// 💡 Você pode ajustar a lista livremente
const ALL_STYLES = [
  "Potente",
  "Saque",
  "Levantador",
  "Rápido",
  "Recepção",
  "Bloqueio",
];

type StyleSelectorProps = {
  name: string;             // nome do campo oculto enviado no form
  initialStyles?: string[]; // valores iniciais (opcional)
};

import "@/styles/components/_style-selector.scss"; // opção A: importar local

export function StyleSelector({ name, initialStyles = [] }: StyleSelectorProps) {
  const [selectedStyles, setSelectedStyles] = useState<string[]>(initialStyles);

  const handleToggleStyle = (style: string) => {
    setSelectedStyles(prev => (
      prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]
    ));
  };

  const styleString = selectedStyles.join(', ');

  return (
    <div className="style-selector">
      <label className="style-selector__label">Estilos Selecionados</label>

      {/* Campo enviado no form */}
      <input type="hidden" name={name} value={styleString} />

      <div className="style-selector__chips">
        {ALL_STYLES.map((style) => {
          const isSelected = selectedStyles.includes(style);
          return (
            <button
              key={style}
              type="button"
              onClick={() => handleToggleStyle(style)}
              className={`style-chip ${isSelected ? "is-selected" : ""}`}
              aria-pressed={isSelected}
            >
              {style}
            </button>
          );
        })}
      </div>

      <p className="style-selector__hint">
        Ativo: {selectedStyles.length > 0 ? selectedStyles.join(', ') : 'Nenhum estilo selecionado'}
      </p>
    </div>
  );
}
