'use client';

import { useState, useEffect } from 'react';
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
                    const formattedData = data.map(char => ({
                        ...char,
                        styles: Array.isArray(char.styles) ? char.styles : [],
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

    const filteredCharacters = allCharactersData.filter(character => {
        if (positionFilter !== "ALL" && character.position !== positionFilter) return false;
        if (schoolFilter !== "ALL" && character.school !== schoolFilter) return false;
        if (nameSearch && !character.name.toLowerCase().includes(nameSearch.toLowerCase())) return false;
        return true;
    });

    const handleOpenModal = (character: Character) => {
        setSelectedCharacter(character);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCharacter(null); 
    };


    return (
        <main className="container mx-auto p-4 sm:p-8">
            <SectionHeader titleBold="Banco de Dados" titleRegular="de Personagens" />

            <div className="mb-8 p-4 bg-zinc-900 rounded-lg shadow-md border border-zinc-700 flex flex-col gap-4">
                 <div className="flex flex-col sm:flex-row gap-4">
                    <div className="sm:w-1/2"> <NameSearchInput value={nameSearch} onChange={setNameSearch} /> </div>
                    <div className="sm:w-1/2"> <SchoolFilter activeFilter={schoolFilter} onFilterChange={setSchoolFilter} /> </div>
                </div>
                <div> <PositionFilter activeFilter={positionFilter} onFilterChange={setPositionFilter} /> </div>
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
                {loadingCharacters && <p className="text-center text-gray-400 w-full">Carregando personagens...</p>}
                {fetchError && <p className="text-center text-red-500 w-full">{fetchError}</p>}
                {!loadingCharacters && !fetchError && filteredCharacters.length === 0 && (
                    <p className="text-center text-gray-500 w-full">Nenhum personagem encontrado com esses filtros.</p>
                )}

                {!loadingCharacters && !fetchError && filteredCharacters.map((char) => (
                    <CharacterCard
                        key={char.id} 
                        character={char}
                        size="small" 
                        onClick={() => handleOpenModal(char)}
                        dragId={`db-${char.id}`}
                        dragData={{ type: 'database', character: char}}
                        originType="list" 
                    />
                ))}
            </div>

            {/* --- Modal --- */}
            {isModalOpen && selectedCharacter && (
                <CharacterModal
                    character={selectedCharacter}
                    onClose={handleCloseModal}
                />
            )}
        </main>
    );
}