'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import { CharacterCard } from '../components/CharacterCard';
import { PositionFilter } from '../components/PositionFilter';
import { NameSearchInput } from '../components/NameSearchInput';
import { SchoolFilter } from '../components/SchoolFilter';
import { SectionHeader } from '../components/SectionHeader';
import { CharacterModal } from '../components/CharacterModal';
import { Character, Position, School } from '@/types';


export default function DatabasePage() {
    // --- Estados ---
    const [allCharactersData, setAllCharactersData] = useState<Character[]>([]);
    const [loadingCharacters, setLoadingCharacters] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    // Filtros
    const [positionFilter, setPositionFilter] = useState<Position | "ALL">("ALL");
    const [schoolFilter, setSchoolFilter] = useState<School | "ALL">("ALL");
    const [nameSearch, setNameSearch] = useState<string>("");
    // Modal
    const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchCharacters = async () => {
            setLoadingCharacters(true);
            setFetchError(null);
            try {
                const { data, error } = await supabase
                    .from('Characters') 
                    .select('*')
                    .order('name', { ascending: true });

                if (error) throw error;

                if (data) {
                     const formattedData = data.map((char: Character) => ({
                         ...char,
                         styles: Array.isArray(char.styles) ? char.styles : (typeof char.styles === 'string' ? JSON.parse(char.styles) : []),
                     })) as Character[];
                    setAllCharactersData(formattedData);
                } else {
                    setAllCharactersData([]);
                }
            } catch (error: any) {
                console.error("Erro ao buscar personagens:", error);
                setFetchError(`Erro ao carregar: ${error.message || 'Erro desconhecido'}`);
                setAllCharactersData([]);
            } finally {
                setLoadingCharacters(false);
            }
        };
        fetchCharacters();
    }, []);

    const filteredCharacters = useMemo(() => {
        return allCharactersData.filter(character => {
            if (positionFilter !== "ALL" && character.position !== positionFilter) return false;
            if (schoolFilter !== "ALL" && character.school !== schoolFilter) return false;
            if (nameSearch && !character.name.toLowerCase().includes(nameSearch.toLowerCase())) return false;
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
        <main className="container mx-auto p-4 sm:p-8">
            <SectionHeader titleBold="Banco de Dados" titleRegular="de Personagens" />

            <div className="mb-8 p-4 bg-zinc-900 rounded-lg shadow-md border border-zinc-700 flex flex-col gap-4">
                 <div className="flex flex-col sm:flex-row gap-4">
                    <div className="sm:w-1/2">
                        <NameSearchInput value={nameSearch} onChange={setNameSearch} />
                    </div>
                    <div className="sm:w-1/2">
                        <SchoolFilter activeFilter={schoolFilter} onFilterChange={setSchoolFilter} />
                    </div>
                </div>
                <div>
                    <PositionFilter activeFilter={positionFilter} onFilterChange={setPositionFilter} />
                </div>
            </div>

            <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(theme(width.36),1fr))]
                           place-items-center">

                {loadingCharacters && (
                    <p className="col-span-full text-center text-gray-400 w-full py-10">
                        Carregando personagens...
                    </p>
                )}
                {fetchError && (
                    <p className="col-span-full text-center text-red-500 w-full py-10">
                        {fetchError}
                    </p>
                )}
                {!loadingCharacters && !fetchError && filteredCharacters.length === 0 && (
                    <p className="col-span-full text-center text-gray-500 w-full py-10">
                        Nenhum personagem encontrado com esses filtros.
                    </p>
                )}

                {!loadingCharacters && !fetchError && filteredCharacters.map((char) => (
                    <CharacterCard
                        key={char.id} 
                        character={char}
                        onClick={() => handleOpenModal(char)}
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