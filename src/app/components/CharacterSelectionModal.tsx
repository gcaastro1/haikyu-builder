"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { supabase } from "../lib/supabaseClient";
import type { Character, Position, School } from "@/types";
import { CharacterCard } from "./CharacterCard";
import { NameSearchInput } from "./NameSearchInput";
import { SchoolFilter } from "./SchoolFilter";
import { X } from "lucide-react";
import { useUIStore } from "@/stores/useUIStore";
import { useTeamStore } from "@/stores/useTeamStore";

export function CharacterSelectionModal() {
  const isSelectionModalOpen = useUIStore((s) => s.isSelectionModalOpen);
  const targetSlotIdentifier = useUIStore((s) => s.targetSlotIdentifier);
  const modalPosition = useUIStore((s) => s.modalPosition);
  const closeModals = useUIStore((s) => s.closeModals);
  const showFeedback = useUIStore((s) => s.showFeedback);

  const setCharacterInSlot = useTeamStore((s) => s.setCharacterInSlot);
  const team = useTeamStore((s) => s.team);
  const bench = useTeamStore((s) => s.bench);

  const [allCharacters, setAllCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [schoolFilter, setSchoolFilter] = useState<School | "ALL">("ALL");
  const [nameSearch, setNameSearch] = useState<string>("");
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

  useEffect(() => {
    if (isSelectionModalOpen && allCharacters.length === 0) {
      const fetchCharacters = async () => {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from("Characters")
            .select("*")
            .order("name", { ascending: true });

          if (error) throw error;

          const formatted = data.map((char) => ({
            ...char,
            styles: Array.isArray(char.styles)
              ? char.styles
              : typeof char.styles === "string"
              ? JSON.parse(char.styles)
              : [],
          }));

          setAllCharacters(formatted);
        } catch (err: any) {
          console.error("Erro ao buscar personagens:", err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchCharacters();
    }
  }, [isSelectionModalOpen, allCharacters.length]);

  const clickedFromBench = targetSlotIdentifier?.startsWith("bench");
  const autoPosition = useMemo(() => {
    if (clickedFromBench) return "ALL";
    return modalPosition as Position | "ALL";
  }, [modalPosition, clickedFromBench]);

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

  const filteredCharacters = useMemo(() => {
    return allCharacters.filter((c) => {
      if (!isJPMode && autoPosition !== "ALL" && c.position !== autoPosition) return false;
      if (schoolFilter !== "ALL" && c.school !== schoolFilter) return false;
      if (nameSearch && !c.name.toLowerCase().includes(nameSearch.toLowerCase())) return false;
      return true;
    });
  }, [allCharacters, autoPosition, schoolFilter, nameSearch, isJPMode]);

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

    const currentNames = new Set([
      ...Object.values(team)
        .filter(Boolean)
        .map((c) => c!.name),
      ...bench.filter(Boolean).map((c) => c!.name),
    ]);

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
              <h3>
                {clickedFromBench
                  ? "Selecionar Personagem para o Banco"
                  : `Selecionar ${positionTitle}`}
              </h3>
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
              {loading && <p>Carregando...</p>}
              {error && <p className="error">{error}</p>}
              {!loading && !error && filteredCharacters.length === 0 && (
                <p className="empty">Nenhum personagem encontrado.</p>
              )}

              <div className="character-modal__grid">
                {filteredCharacters.map((char) => {
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
