"use client";

import { Character } from "@/types";
import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  }, [characters.length]);

  const visibleCharacters = useMemo(
    () => characters.slice(0, visibleCount),
    [characters, visibleCount]
  );

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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  };

  return (
    <div className="database-character-grid">
      <div className="database-character-grid__counter">
        Mostrando {visibleCharacters.length} de {characters.length}
      </div>

      <motion.div
        className="database-character-grid__wrapper"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {visibleCharacters.map((char, index) => (
          <motion.div
            key={char.id}
            className="database-character-grid__item"
            variants={itemVariants}
          >
            <CharacterCard
              character={char}
              isSelected={currentTeamNames.has(char.name)}
              onClick={() => handleSelect(char)}
            />
          </motion.div>
        ))}
        {visibleCount < characters.length && (
          <div ref={loaderRef} style={{ height: "20px", width: "100%" }} />
        )}
      </motion.div>
    </div>
  );
}
