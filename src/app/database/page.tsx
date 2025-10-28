"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "../lib/supabaseClient";
import { CharacterCard } from "../components/CharacterCard";
import { PositionFilter } from "../components/PositionFilter";
import { NameSearchInput } from "../components/NameSearchInput";
import { SchoolFilter } from "../components/SchoolFilter";
import { SectionHeader } from "../components/SectionHeader";
import { CharacterModal } from "../components/CharacterModal";
import { Character, Position, School } from "@/types";


export default function DatabasePage() {
  const [allCharactersData, setAllCharactersData] = useState<Character[]>([]);
  const [loadingCharacters, setLoadingCharacters] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [positionFilter, setPositionFilter] = useState<Position | "ALL">("ALL");
  const [schoolFilter, setSchoolFilter] = useState<School | "ALL">("ALL");
  const [nameSearch, setNameSearch] = useState<string>("");

  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchCharacters = async () => {
      setLoadingCharacters(true);
      setFetchError(null);
      try {
        const { data, error } = await supabase
          .from("Characters")
          .select("*")
          .order("name", { ascending: true });

        if (error) throw error;

        if (data) {
          const formattedData = data.map((char: Character) => ({
            ...char,
            styles: Array.isArray(char.styles)
              ? char.styles
              : typeof char.styles === "string"
              ? JSON.parse(char.styles)
              : [],
          })) as Character[];
          setAllCharactersData(formattedData);
        } else {
          setAllCharactersData([]);
        }
      } catch (error: any) {
        console.error("Erro ao buscar personagens:", error);
        setFetchError(
          `Erro ao carregar: ${error.message || "Erro desconhecido"}`
        );
        setAllCharactersData([]);
      } finally {
        setLoadingCharacters(false);
      }
    };
    fetchCharacters();
  }, []);

  const filteredCharacters = useMemo(() => {
    return allCharactersData.filter((character) => {
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
  }, [allCharactersData, positionFilter, schoolFilter, nameSearch]);

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
      <SectionHeader titleBold="Banco de Dados" titleRegular="de Personagens" />

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
        {loadingCharacters && (
          <p className="database-page__status database-page__status--loading">
            Carregando personagens...
          </p>
        )}

        {fetchError && (
          <p className="database-page__status database-page__status--error">
            {fetchError}
          </p>
        )}

        {!loadingCharacters &&
          !fetchError &&
          filteredCharacters.length === 0 && (
            <p className="database-page__status database-page__status--empty">
              Nenhum personagem encontrado com esses filtros.
            </p>
          )}

        {!loadingCharacters &&
          !fetchError &&
          filteredCharacters.map((char) => (
            <CharacterCard
              key={char.id}
              character={char}
              onClick={() => handleOpenModal(char)}
              originType={"list"}
            />
          ))}
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
