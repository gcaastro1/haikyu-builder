"use client";

import { Memory } from "@/types";
import { Check, Search, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import styles from "./MemorySelector.module.scss";

interface MemorySelectorProps {
  memories: Memory[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  maxSelections?: number;
}

export function MemorySelector({ 
  memories, 
  selectedIds, 
  onChange, 
  maxSelections = 3 
}: MemorySelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  
  const handleToggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      if (selectedIds.length < maxSelections) {
        onChange([...selectedIds, id]);
      }
    }
  };

  const filteredMemories = memories.filter(memory => 
    memory.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <div className={styles.selectedSummary}>
        <h4>Selecionadas ({selectedIds.length}/{maxSelections})</h4>
        <div className={styles.summaryGrid}>
          {Array.from({ length: maxSelections }).map((_, index) => {
            const memoryId = selectedIds[index];
            const memory = memoryId ? memories.find(m => m.id === memoryId) : null;
            const isMain = index === 0;

            return (
              <div key={index} className={`${styles.summarySlot} ${!memory ? styles.empty : ''}`}>
                <div className={styles.slotLabel}>
                  {isMain ? "Principal" : `Sugestão ${index}`}
                </div>
                {memory ? (
                  <div className={styles.summaryCard}>
                    <div className={styles.summaryImageWrapper}>
                      <Image 
                        src={memory.image_url} 
                        alt={memory.name} 
                        fill
                        className={styles.summaryImage}
                      />
                      <button 
                        type="button"
                        className={styles.removeButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggle(memory.id);
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <span className={styles.summaryName} title={memory.name}>{memory.name}</span>
                  </div>
                ) : (
                  <div className={styles.emptySlot}>
                    <span>Vazio</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.searchContainer}>
        <Search className={styles.searchIcon} size={20} />
        <input 
          type="text" 
          placeholder="Pesquisar memórias..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.grid}>
        {filteredMemories.map(memory => {
          const isSelected = selectedIds.includes(memory.id);
          const selectionIndex = selectedIds.indexOf(memory.id);
          
          return (
            <div 
              key={memory.id} 
              className={`${styles.card} ${isSelected ? styles.selected : ''}`}
              onClick={() => handleToggle(memory.id)}
            >
              <div className={styles.imageWrapper}>
                <Image 
                  src={memory.image_url} 
                  alt={memory.name} 
                  fill
                  className={styles.image}
                  sizes="(max-width: 768px) 100px, 120px"
                />
                {isSelected && (
                  <div className={styles.selectionBadge}>
                    {selectionIndex === 0 ? "Main" : selectionIndex + 1}
                  </div>
                )}
                {isSelected && (
                    <div className={styles.overlay}>
                        <Check size={24} className="text-white" />
                    </div>
                )}
              </div>
              <div className={styles.name}>{memory.name}</div>
            </div>
          );
        })}
        {filteredMemories.length === 0 && (
            <div className={styles.noResults}>
                Nenhuma memória encontrada.
            </div>
        )}
      </div>
    </div>
  );
}
