"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Character } from "@/types";
import { CharacterCard } from "./CharacterCard";

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
  }, [characters]);

  if (isLoading)
    return (
      <p className="text-center text-gray-400 py-10">
        Carregando personagens...
      </p>
    );

  if (fetchError)
    return <p className="text-center text-red-500 py-10">{fetchError}</p>;

  if (characters.length === 0)
    return (
      <p className="text-center text-gray-500 py-10">
        Nenhum personagem encontrado...
      </p>
    );

  const visibleCharacters = characters.slice(0, visibleCount);

  return (
    <div className="flex-grow overflow-y-auto custom-scrollbar px-4 pb-4">
      <div className="text-gray-400 text-sm text-right mb-2 pr-1 select-none">
        Mostrando {visibleCharacters.length} de {characters.length}
      </div>

      <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(theme(width.28),1fr))] place-items-center transition-all duration-200">
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
                onClick={() => onSelect(char)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {visibleCount < characters.length && (
        <div
          ref={loaderRef}
          className="w-full h-10 flex justify-center items-center mt-6"
        >
          <span className="text-gray-500 text-xs animate-pulse">
            Carregando mais...
          </span>
        </div>
      )}
    </div>
  );
}
