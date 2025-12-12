"use client";

import { useCharacterStore } from "@/stores/useCharacterStore";
import { useTeamStore } from "@/stores/useTeamStore";
import { useUIStore } from "@/stores/useUIStore";
import type { Character, Position, School } from "@/types";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { CharacterCard } from "./CharacterCard";
import { NameSearchInput } from "./NameSearchInput";
import { SchoolFilter } from "./SchoolFilter";

export function CharacterSelectionModal() {
  const { 
    isSelectionModalOpen, 
    targetSlotIdentifier, 
    modalPosition, 
    closeModals, 
    showFeedback 
  } = useUIStore(
    useShallow((s) => ({
      isSelectionModalOpen: s.isSelectionModalOpen,
      targetSlotIdentifier: s.targetSlotIdentifier,
      modalPosition: s.modalPosition,
      closeModals: s.closeModals,
      showFeedback: s.showFeedback,
    }))
  );

  const { setCharacterInSlot, team } = useTeamStore(
    useShallow((s) => ({
      setCharacterInSlot: s.setCharacterInSlot,
      team: s.team,
    }))
  );

  // ✅ Otimização: Usa dados do store ao invés de fetch duplicado
  const { allCharacters, isLoading, fetchError, fetchInitialData, hasLoadedData } = useCharacterStore(
    useShallow((s) => ({
      allCharacters: s.allCharacters,
      isLoading: s.isLoading,
      fetchError: s.fetchError,
      fetchInitialData: s.fetchInitialData,
      hasLoadedData: s.hasLoadedData,
    }))
  );

  useEffect(() => {
    if (!hasLoadedData && !isLoading) fetchInitialData();
  }, [hasLoadedData, isLoading, fetchInitialData]);

  const [schoolFilter, setSchoolFilter] = useState<School | "ALL">("ALL");
  const [nameSearch, setNameSearch] = useState<string>("");
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [visibleCount, setVisibleCount] = useState(24);
  const [batchSize, setBatchSize] = useState(24);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const autoPosition = useMemo(() => {
    return modalPosition as Position | "ALL";
  }, [modalPosition]);

  const positionNames: Record<string, string> = {
    S: "Levantador",
    WS: "Ponta",
    MB: "Central",
    OP: "Oposto",
    L: "Líbero",
    ALL: "Todos",
  };
  const positionTitle = positionNames[autoPosition] || "Todos";

  const isJPMode = useTeamStore((s) => s.isJPMode);

  // Otimização: memoizar searchTerm normalizado
  const normalizedNameSearch = nameSearch.toLowerCase();

  const filteredCharacters = useMemo(() => {
    return allCharacters.filter((c) => {
      if (!isJPMode && autoPosition !== "ALL" && c.position !== autoPosition) return false;
      if (schoolFilter !== "ALL" && c.school !== schoolFilter) return false;
      if (nameSearch && !c.name.toLowerCase().includes(normalizedNameSearch)) return false;
      return true;
    });
  }, [allCharacters, autoPosition, schoolFilter, nameSearch, normalizedNameSearch, isJPMode]);

  const handleIntersect = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    if (entry.isIntersecting) {
      setVisibleCount((prev) => Math.min(prev + batchSize, filteredCharacters.length));
    }
  }, [filteredCharacters.length, batchSize]);

  useEffect(() => {
    const w = typeof window !== "undefined" ? window.innerWidth : 1024;
    const size = w <= 640 ? 18 : w <= 1024 ? 24 : 30;
    setBatchSize(size);
    setVisibleCount(size);
  }, [filteredCharacters]);

  useEffect(() => {
    if (!loaderRef.current) return;
    const observer = new IntersectionObserver(handleIntersect, { rootMargin: "200px" });
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [handleIntersect]);

  // === NOVO: cria um set de nomes que já estão na quadra ===
  const inCourtNames = useMemo(() => {
    return new Set(
      Object.values(team)
        .filter(Boolean)
        .map((c) => c!.name)
    );
  }, [team]);

  const handleConfirm = () => {
    if (!selectedCharacter || !targetSlotIdentifier) return;

    const currentNames = new Set(
      Object.values(team)
        .filter(Boolean)
        .map((c) => c!.name)
    );

    if (currentNames.has(selectedCharacter.name)) {
      showFeedback(`${selectedCharacter.name} já está no seu time.`, "error");
      return;
    }

    setCharacterInSlot(targetSlotIdentifier, selectedCharacter);
    showFeedback(`${selectedCharacter.name} adicionado com sucesso!`, "success");
    setSelectedCharacter(null);
    closeModals();
  };

  const handleCardClick = (char: Character) => {
    if (inCourtNames.has(char.name)) return; // 🔒 não deixa clicar em bloqueado
    setSelectedCharacter((prev) => (prev?.id === char.id ? null : char));
  };

  const modalVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.25, ease: "easeOut" },
    },
    exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.2 } },
  };

  return (
    <AnimatePresence>
      {isSelectionModalOpen && (
        <motion.div
          key="overlay"
          className="character-modal__overlay"
          onClick={closeModals}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            key="modal"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="character-modal"
          >
            <header className="character-modal__header">
              <h3>{`Selecionar ${positionTitle}`}</h3>
              <button onClick={closeModals} aria-label="Fechar">
                <X size={24} />
              </button>
            </header>

            <section className="character-modal__filters">
              <NameSearchInput value={nameSearch} onChange={setNameSearch} />
              <SchoolFilter
                activeFilter={schoolFilter}
                onFilterChange={setSchoolFilter}
              />
            </section>

            <main className="character-modal__list">
              {isLoading && <p>Carregando...</p>}
              {fetchError && <p className="error">{fetchError}</p>}
              {!isLoading && !fetchError && filteredCharacters.length === 0 && (
                <p className="empty">Nenhum personagem encontrado.</p>
              )}

              <div className="character-modal__grid">
                {filteredCharacters.slice(0, visibleCount).map((char) => {
                  const isSelected = selectedCharacter?.id === char.id;
                  const isDisabled = inCourtNames.has(char.name); // 🔒 bloqueado se já está na quadra
                  return (
                    <motion.div
                      key={char.id}
                      onClick={() => handleCardClick(char)}
                      whileHover={!isDisabled ? { scale: 1.03 } : {}}
                      whileTap={!isDisabled ? { scale: 0.97 } : {}}
                      className={`character-modal__card ${
                        isSelected ? "selected" : ""
                      } ${isDisabled ? "disabled" : ""}`}
                    >
                      <CharacterCard
                        character={char}
                        originType="list"
                        isDisabled={isDisabled}
                      />
                    </motion.div>
                  );
                })}
                {visibleCount < filteredCharacters.length && (
                  <div ref={loaderRef} className="list-loader">Carregando mais...</div>
                )}
              </div>
            </main>

            <footer className="character-modal__footer">
              <motion.button
                whileTap={{ scale: 0.97 }}
                disabled={!selectedCharacter}
                onClick={handleConfirm}
                className={`confirm-button ${
                  selectedCharacter ? "active" : "disabled"
                }`}
              >
                {selectedCharacter
                  ? `Adicionar ${selectedCharacter.name}`
                  : "Selecione um personagem"}
              </motion.button>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
