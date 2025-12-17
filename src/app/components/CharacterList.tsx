"use client";

import { useCharacterStore } from "@/stores/useCharacterStore";
import { useTeamStore } from "@/stores/useTeamStore";
import { Character, Position, School } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { CharacterCard } from "./CharacterCard";
import { NameSearchInput } from "./NameSearchInput";
import { PositionFilter } from "./PositionFilter";
import { SchoolFilter } from "./SchoolFilter";

type CharacterListProps = {
  className?: string;
};

export function CharacterList({ className = "" }: CharacterListProps) {
  const [positionFilter, setPositionFilter] = useState<Position | "ALL">("ALL");
  const [schoolFilter, setSchoolFilter] = useState<School | "ALL">("ALL");
  const [nameSearch, setNameSearch] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [topOffset, setTopOffset] = useState(0);

  // Constantes de dimensionamento
  const DRAWER_WIDTH = 360;
  const BUTTON_WIDTH = 56;
  const DRAWER_HEIGHT_MOBILE = 280;
  const BUTTON_COLLAPSED_OFFSET = DRAWER_WIDTH - BUTTON_WIDTH;

  // Medir navbar e detectar mobile uma única vez
  useEffect(() => {
    const updateLayout = () => {
      const nav = document.querySelector(".navbar");
      const navHeight = nav ? (nav as HTMLElement).getBoundingClientRect().height : 0;
      setTopOffset(Math.round(navHeight));
      setIsMobile(window.innerWidth < 992);
      document.documentElement.style.setProperty("--navbar-height", `${Math.round(navHeight)}px`);
      document.documentElement.style.setProperty("--drawer-height-mobile", `${DRAWER_HEIGHT_MOBILE}px`);
    };

    updateLayout();
    const resizeObserver = new ResizeObserver(updateLayout);
    const navbar = document.querySelector(".navbar");
    if (navbar) resizeObserver.observe(navbar);
    
    window.addEventListener("resize", updateLayout, { passive: true });
    return () => {
      window.removeEventListener("resize", updateLayout);
      resizeObserver.disconnect();
    };
  }, []);

  const { allCharacters, isLoading } = useCharacterStore(
    useShallow((s) => ({
      allCharacters: s.allCharacters,
      isLoading: s.isLoading,
    }))
  );

  const { team, isJPMode } = useTeamStore(
    useShallow((s) => ({
      team: s.team,
      isJPMode: s.isJPMode,
    }))
  );

  // Cria um Set com os nomes dos personagens já no time
  const teamCharacterNames = useMemo(
    () =>
      new Set(
        Object.values(team)
          .filter(Boolean)
          .map((c) => c!.name)
      ),
    [team]
  );

  // Filtra os personagens
  // Otimização: memoizar searchTerm normalizado
  const normalizedNameSearch = nameSearch.toLowerCase();

  const filteredCharacters = useMemo(() => {
    if (!allCharacters.length) return [];

    return allCharacters.filter((char: Character) => {
      // Filtro de posição
      if (!isJPMode && positionFilter !== "ALL" && char.position !== positionFilter) {
        return false;
      }

      // Filtro de escola
      if (schoolFilter !== "ALL" && char.school !== schoolFilter) {
        return false;
      }

      // Filtro de nome
      if (normalizedNameSearch && !char.name.toLowerCase().includes(normalizedNameSearch)) {
        return false;
      }

      return true;
    });
  }, [allCharacters, positionFilter, schoolFilter, normalizedNameSearch, isJPMode]);

  if (isLoading) {
    return (
      <div className={`character-list ${className}`}>
        <div className="character-list__loading">Carregando personagens...</div>
      </div>
    );
  }

  return (
    <>
      {/* Backdrop semi-transparente quando expandido */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            key="backdrop"
            className="character-list__backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <motion.div
        className={`character-list__drawer ${isMobile ? "character-list__drawer--mobile" : "character-list__drawer--desktop"} ${className}`}
        initial={false}
        animate={isMobile 
          ? { y: isExpanded ? 0 : DRAWER_HEIGHT_MOBILE - BUTTON_WIDTH } 
          : { x: isExpanded ? 0 : BUTTON_COLLAPSED_OFFSET }
        }
        transition={{ duration: 0.32, ease: "easeInOut" }}
      >
      {/* Header com controles */}
      <div className="character-list__header">
        <button
          className={`character-list__toggle ${isMobile ? "character-list__toggle--mobile" : "character-list__toggle--desktop"} ${isExpanded ? "character-list__toggle--expanded" : ""}`}
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? "Recolher lista" : "Expandir lista"}
        >
          <span>
            {isExpanded ? (isMobile ? "▼ Fechar" : "Fechar") : (isMobile ? "▲ Personagens" : "Personagens")}
          </span>
        </button>
      </div>
      {/* Filtros e lista (animação horizontal) */}
      <motion.div
        className={`${isMobile ? "character-list__content character-list__content--mobile" : "character-list__content character-list__content--desktop"} ${
          isExpanded ? "is-interactive" : "is-disabled"
        }`}
        initial={false}
        animate={{ opacity: isExpanded ? 1 : 0, x: isMobile ? 0 : (isExpanded ? 0 : 8) }}
        transition={{ duration: 0.22 }}
      >
        <div className="character-list__filters">
          <div className="character-list__filters-row">
            <NameSearchInput value={nameSearch} onChange={setNameSearch} />
            <SchoolFilter
              activeFilter={schoolFilter}
              onFilterChange={setSchoolFilter}
            />
          </div>
          <div className="character-list__filters-row">
            <PositionFilter
              activeFilter={positionFilter}
              onFilterChange={setPositionFilter}
            />
          </div>
        </div>

        <div 
          className="character-list__grid"
        >
          <AnimatePresence mode="popLayout">
            {filteredCharacters.map((character) => {
              const isDisabled = teamCharacterNames.has(character.name);
              const dragId = `character-list-${character.id}`;
              const dragData = {
                type: "list" as const,
                character,
              };

              return (
                <motion.div
                  key={character.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.15 }}
                  layout
                >
                  <CharacterCard
                    character={character}
                    originType="list"
                    isDisabled={isDisabled}
                    dragId={dragId}
                    dragData={dragData}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
            </div>

            {filteredCharacters.length === 0 && (
              <div className="character-list__empty">
                Nenhum personagem encontrado com esses filtros.
              </div>
            )}
      </motion.div>
      </motion.div>
    </>
  );
}
