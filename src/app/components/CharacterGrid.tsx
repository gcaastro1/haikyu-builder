"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Character } from "@/types";
import { CharacterCard } from "./CharacterCard";

import "@/styles/components/character-grid.scss";

type CharacterGridProps = {
  isLoading: boolean;
  fetchError: string | null;
  characters: Character[];
  currentTeamNames: Set<string>;
  onSelect: (character: Character) => void;
};

const BATCH_SIZE = 20;

export function CharacterGrid({
  isLoading,
  fetchError,
  characters,
  currentTeamNames,
  onSelect,
}: CharacterGridProps) {
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting) {
        setVisibleCount((prev) =>
          Math.min(prev + BATCH_SIZE, characters.length)
        );
      }
    },
    [characters.length]
  );

  useEffect(() => {
    if (!loaderRef.current) return;
    const observer = new IntersectionObserver(handleIntersect, {
      rootMargin: "100px",
    });
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [handleIntersect]);

  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [characters.length]); // ✅ Otimização: depende apenas do length

  // ✅ Otimização: Memoiza lista visível para evitar recálculos
  const visibleCharacters = useMemo(
    () => characters.slice(0, visibleCount),
    [characters, visibleCount]
  );

  // ✅ Otimização: Memoiza callback para evitar re-renders
  const handleSelect = useCallback(
    (character: Character) => {
      onSelect(character);
    },
    [onSelect]
  );

  if (isLoading)
    return (
      <p className="database-character-grid__status database-character-grid__status--loading">
        Carregando personagens...
      </p>
    );

  if (fetchError)
    return (
      <p className="database-character-grid__status database-character-grid__status--error">
        {fetchError}
      </p>
    );

  if (characters.length === 0)
    return (
      <p className="database-character-grid__status database-character-grid__status--empty">
        Nenhum personagem encontrado...
      </p>
    );

  return (
    <div className="database-character-grid">
      <div className="database-character-grid__counter">
        Mostrando {visibleCharacters.length} de {characters.length}
      </div>

      <div className="database-character-grid__wrapper">
        <AnimatePresence>
          {visibleCharacters.map((char, index) => (
            <motion.div
              key={char.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, delay: index * 0.015 }}
            >
              <CharacterCard
                character={char}
                isDisabled={currentTeamNames.has(char.name)}
                originType="list"
                onClick={() => handleSelect(char)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {visibleCount < characters.length && (
        <div ref={loaderRef} className="database-character-grid__loader">
          <span className="database-character-grid__loader-text">
            Carregando mais...
          </span>
        </div>
      )}
    </div>
  );
}
