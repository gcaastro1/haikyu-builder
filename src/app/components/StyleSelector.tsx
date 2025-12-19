'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const ALL_STYLES = [
  { label: "Potente", value: "power", icon: "/images/styles/power.png" },
  { label: "Saque", value: "serve", icon: "/images/styles/serve.png" },
  { label: "Levantador", value: "setter", icon: "/images/styles/setter.png" },
  { label: "Rápido", value: "quick", icon: "/images/styles/quick.png" },
  { label: "Recepção", value: "receive", icon: "/images/styles/receive.png" },
  { label: "Bloqueio", value: "block", icon: "/images/styles/block.png" },
];

// Helper to normalize legacy Portuguese values to English keys
const normalizeStyle = (style: string): string => {
  const normalized = style.toLowerCase().trim();
  const map: Record<string, string> = {
    'potente': 'power',
    'saque': 'serve',
    'levantador': 'setter',
    'rápido': 'quick',
    'rapido': 'quick',
    'recepção': 'receive',
    'recepcao': 'receive',
    'bloqueio': 'block'
  };
  return map[normalized] || normalized;
};

type StyleSelectorProps = {
  name: string;             // nome do campo oculto enviado no form
  initialStyles?: string[]; // valores iniciais (opcional)
};

import "@/styles/components/_style-selector.scss"; // opção A: importar local

export function StyleSelector({ name, initialStyles = [] }: StyleSelectorProps) {
  // Initialize with normalized values
  const [selectedStyles, setSelectedStyles] = useState<string[]>(() => 
    initialStyles.map(normalizeStyle)
  );

  // Ensure we update if initialStyles changes (e.g. data load)
  useEffect(() => {
    setSelectedStyles(initialStyles.map(normalizeStyle));
  }, [initialStyles]);

  const handleToggleStyle = (value: string) => {
    setSelectedStyles(prev => (
      prev.includes(value) ? prev.filter(s => s !== value) : [...prev, value]
    ));
  };

  const styleString = selectedStyles.join(', ');

  // Get labels for display in the hint
  const selectedLabels = selectedStyles.map(val => 
    ALL_STYLES.find(s => s.value === val)?.label || val
  );

  return (
    <div className="style-selector">
      <label className="style-selector__label">Estilos Selecionados</label>

      {/* Campo enviado no form */}
      <input type="hidden" name={name} value={styleString} />

      <div className="style-selector__chips">
        {ALL_STYLES.map((style) => {
          const isSelected = selectedStyles.includes(style.value);
          return (
            <button
              key={style.value}
              type="button"
              onClick={() => handleToggleStyle(style.value)}
              className={`style-chip ${isSelected ? "is-selected" : ""}`}
              aria-pressed={isSelected}
            >
              <div className="style-chip__icon">
                <Image 
                  src={style.icon} 
                  alt={style.label} 
                  width={24} 
                  height={24} 
                  unoptimized
                />
              </div>
              <span className="style-chip__label">{style.label}</span>
            </button>
          );
        })}
      </div>

      <p className="style-selector__hint">
        Ativo: {selectedLabels.length > 0 ? selectedLabels.join(', ') : 'Nenhum estilo selecionado'}
      </p>
    </div>
  );
}
