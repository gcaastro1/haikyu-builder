"use client";

import { sortCharacters } from "@/app/lib/characterUtils";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuthStore } from "@/stores/useAuthStore";
import { useCharacterStore } from "@/stores/useCharacterStore";
import { Character, Position, School } from "@/types";
import { Edit } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { CharacterCard } from "../components/CharacterCard";
import { CharacterModal } from "../components/CharacterModal";
import { NameSearchInput } from "../components/NameSearchInput";
import { PositionFilter } from "../components/PositionFilter";
import { SchoolFilter } from "../components/SchoolFilter";
import { SectionHeader } from "../components/SectionHeader";
export default function DatabasePage() {
  const { allCharacters, isLoading, fetchError, fetchInitialData, hasLoadedData } = useCharacterStore(
    useShallow((s) => ({
      allCharacters: s.allCharacters,
      isLoading: s.isLoading,
      fetchError: s.fetchError,
      fetchInitialData: s.fetchInitialData,
      hasLoadedData: s.hasLoadedData,
    }))
  );

  const { isAdmin } = useAuthStore();
  const t = useTranslation();

  const [positionFilter, setPositionFilter] = useState<Position | "ALL">("ALL");
  const [schoolFilter, setSchoolFilter] = useState<School | "ALL">("ALL");
  const [nameSearch, setNameSearch] = useState<string>("");

  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(32);
  const [batchSize, setBatchSize] = useState(32);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasLoadedData && !isLoading) fetchInitialData();
  }, [hasLoadedData, isLoading, fetchInitialData]);

  const filteredCharacters = useMemo(() => {
    const filtered = allCharacters.filter((character) => {
      if (positionFilter !== "ALL" && character.position !== positionFilter)
        return false;
      if (schoolFilter !== "ALL" && character.school !== schoolFilter)
        return false;
      if (
        nameSearch &&
        !character.name.toLowerCase().includes(nameSearch.toLowerCase())
      )
        return false;
      return true;
    });

    return filtered.sort(sortCharacters);
  }, [allCharacters, positionFilter, schoolFilter, nameSearch]);

  const handleIntersect = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    if (entry.isIntersecting) {
      setVisibleCount((prev) => Math.min(prev + batchSize, filteredCharacters.length));
    }
  }, [filteredCharacters.length, batchSize]);

  useEffect(() => {
    const w = typeof window !== "undefined" ? window.innerWidth : 1024;
    const size = w <= 640 ? 24 : w <= 1024 ? 32 : 36;
    setBatchSize(size);
    setVisibleCount(size);
  }, [filteredCharacters]);

  useEffect(() => {
    if (!loaderRef.current) return;
    const observer = new IntersectionObserver(handleIntersect, { rootMargin: "200px" });
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [handleIntersect]);


  const handleOpenModal = (character: Character) => {
    setSelectedCharacter(character);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedCharacter(null), 300);
  };

  return (
    <main className="database-page">
      <SectionHeader title={t.database.title}/>

      {isAdmin && (
        <div style={{ padding: "0 2rem" }}>
          <Link href="/cadastro" className="btn btn--confirm" style={{ padding: "8px 16px", borderRadius: "4px", textDecoration: "none", display: "inline-block", marginBottom: "1rem" }}>
            {t.database.new_character}
          </Link>
        </div>
      )}

      <div className="database-page__filters">
        <div className="database-page__filters-row">
          <div className="database-page__filters-col">
            <NameSearchInput value={nameSearch} onChange={setNameSearch} />
          </div>
          <div className="database-page__filters-col">
            <SchoolFilter
              activeFilter={schoolFilter}
              onFilterChange={setSchoolFilter}
            />
          </div>
        </div>

        <div className="database-page__filters-row">
          <PositionFilter
            activeFilter={positionFilter}
            onFilterChange={setPositionFilter}
          />
        </div>
      </div>

      <div className="database-page__grid">
        {isLoading && (
          <p className="database-page__status database-page__status--loading">
            Carregando personagens...
          </p>
        )}

        {fetchError && (
          <p className="database-page__status database-page__status--error">
            {fetchError}
          </p>
        )}

        {!isLoading &&
          !fetchError &&
          filteredCharacters.length === 0 && (
            <p className="database-page__status database-page__status--empty">
              {t.database.no_characters_found}
            </p>
          )}

        {!isLoading &&
          !fetchError &&
          filteredCharacters.slice(0, visibleCount).map((char) => (
            <div key={char.id} style={{ position: 'relative' }}>
                <CharacterCard
                character={char}
                onClick={() => handleOpenModal(char)}
                originType={"list"}
                />
                {isAdmin && (
                    <Link
                        href={`/cadastro?id=${char.id}`}
                        style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            background: '#e65100',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            zIndex: 10,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.5)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Edit size={16} />
                    </Link>
                )}
            </div>
          ))}

        {!isLoading && visibleCount < filteredCharacters.length && (
          <div ref={loaderRef} className="database-page__loader">Carregando mais...</div>
        )}
      </div>

      {isModalOpen && selectedCharacter && (
        <CharacterModal
          character={selectedCharacter}
          onClose={handleCloseModal}
        />
      )}
    </main>
  );
}
