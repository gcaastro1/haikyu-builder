// src/app/components/CharacterSelectionModal.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Character, Position, School } from '@/types';
import { CharacterCard } from './CharacterCard';
import { PositionFilter } from './PositionFilter';
import { NameSearchInput } from './NameSearchInput';
import { SchoolFilter } from './SchoolFilter';
import { X } from 'lucide-react';

type CharacterSelectionModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSelectCharacter: (character: Character) => void;
    currentTeamNames?: Set<string>;
};

export function CharacterSelectionModal({
    isOpen,
    onClose,
    onSelectCharacter,
    currentTeamNames = new Set(),
}: CharacterSelectionModalProps) {

    const [allCharactersData, setAllCharactersData] = useState<Character[]>([]);
    const [loadingCharacters, setLoadingCharacters] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [positionFilter, setPositionFilter] = useState<Position | "ALL">("ALL");
    const [schoolFilter, setSchoolFilter] = useState<School | "ALL">("ALL");
    const [nameSearch, setNameSearch] = useState<string>("");

    useEffect(() => {
        if (isOpen && allCharactersData.length === 0) {
            const fetchCharacters = async () => {
                setLoadingCharacters(true);
                setFetchError(null);
                try {
                    const { data, error } = await supabase
                        .from('Characters')
                        .select('*').order('name', { ascending: true });
                    if (error) throw error;
                    if (data) {
                        const formattedData = data.map((char: any) => ({
                             ...char,
                             styles: Array.isArray(char.styles) ? char.styles : (typeof char.styles === 'string' ? JSON.parse(char.styles) : []),
                         })) as Character[];
                        setAllCharactersData(formattedData);
                    } else { setAllCharactersData([]); }
                } catch (error: any) { setFetchError(`Erro: ${error.message}`); setAllCharactersData([]); }
                finally { setLoadingCharacters(false); }
            };
            fetchCharacters();
        }
    }, [isOpen, allCharactersData.length]);

    const filteredCharacters = useMemo(() => {
        return allCharactersData.filter(character => {
            if (positionFilter !== "ALL" && character.position !== positionFilter) return false;
            if (schoolFilter !== "ALL" && character.school !== schoolFilter) return false;
            if (nameSearch && !character.name.toLowerCase().includes(nameSearch.toLowerCase())) return false;
            return true;
        });
    }, [allCharactersData, positionFilter, schoolFilter, nameSearch]);

    const handleSelect = (character: Character) => {
        if (currentTeamNames.has(character.name)) {
            alert(`${character.name} já está no seu time ou banco.`);
            return;
        }
        onSelectCharacter(character);
        onClose();
    };

    if (!isOpen) return null;

    const handleModalContentClick = (e: React.MouseEvent) => e.stopPropagation();

    return (
        <div className="fixed inset-0 z-[70] bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-zinc-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] border border-zinc-700 flex flex-col overflow-hidden" onClick={handleModalContentClick}>
                <div className="flex-shrink-0 p-4 border-b border-zinc-700 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white font-bricolage">Selecionar Personagem</h3>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white"><X size={24} /></button>
                </div>
                <div className="flex-grow flex flex-col overflow-y-hidden p-4 gap-4">
                     <div className="flex-shrink-0 flex flex-col gap-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="sm:w-1/2"> <NameSearchInput value={nameSearch} onChange={setNameSearch} /> </div>
                            <div className="sm:w-1/2"> <SchoolFilter activeFilter={schoolFilter} onFilterChange={setSchoolFilter} /> </div>
                        </div>
                        <div> <PositionFilter activeFilter={positionFilter} onFilterChange={setPositionFilter} /> </div>
                    </div>
                     <div className="flex-grow overflow-y-auto custom-scrollbar -mr-2 pr-2">
                        {loadingCharacters && <p className="text-center text-gray-400 py-10">Carregando...</p>}
                        {fetchError && <p className="text-center text-red-500 py-10">{fetchError}</p>}
                        {!loadingCharacters && !fetchError && filteredCharacters.length === 0 && ( <p className="text-center text-gray-500 py-10">Nenhum personagem encontrado...</p> )}
                        <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(theme(width.28),1fr))] place-items-center">
                            {!loadingCharacters && !fetchError && filteredCharacters.map((char) => {
                                const isDisabled = currentTeamNames.has(char.name);
                                return (
                                    <CharacterCard
                                        key={char.id}
                                        character={char}
                                        isDisabled={isDisabled}
                                        originType="list"
                                        onClick={() => handleSelect(char)}
                                    />
                                );
                            })}
                        </div>
                     </div>
                </div>
            </div>
        </div>
    );
}