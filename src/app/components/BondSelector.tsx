'use client';

import React, { useState, useEffect } from 'react';
import { getBonds, Bond } from '../lib/actions'; 
import { Search } from 'lucide-react';

type BondSelectorProps = {
    initialSelectedIds?: number[]; 
    onChange: (selectedIds: number[]) => void; 
};

export function BondSelector({ initialSelectedIds = [], onChange }: BondSelectorProps) {
    const [allBonds, setAllBonds] = useState<Bond[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>(initialSelectedIds);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const loadBonds = async () => {
            setLoading(true);
            const { bonds } = await getBonds();
            if (bonds) {
                setAllBonds(bonds);
            }
            setLoading(false);
        };
        loadBonds();
    }, []);

    useEffect(() => {
        setSelectedIds(initialSelectedIds);
    }, [initialSelectedIds]);


    const handleToggleBond = (bondId: number) => {
        const newSelectedIds = selectedIds.includes(bondId)
            ? selectedIds.filter(id => id !== bondId)
            : [...selectedIds, bondId];
        
        setSelectedIds(newSelectedIds);
        onChange(newSelectedIds);     
    };

    const filteredBonds = allBonds.filter(bond => 
        bond.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <p className="text-sm text-zinc-400">Carregando vínculos...</p>;
    }

    return (
        <div className="flex flex-col gap-3">
             <div className="relative">
                <input
                    type="text"
                    placeholder="Buscar vínculo pelo nome..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-zinc-700 border border-zinc-600 rounded-md py-1.5 px-3 text-sm text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
                 <Search
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400"
                    size={16}
                />
            </div>
            <div className="flex flex-wrap gap-2 p-2 bg-zinc-800 rounded-lg border border-zinc-700">
                {filteredBonds.map(bond => {
                    const isSelected = selectedIds.includes(bond.id);
                    return (
                        <button
                            key={bond.id}
                            type="button"
                            onClick={() => handleToggleBond(bond.id)}
                            className={`
                                py-1.5 px-3 text-xs font-semibold rounded-full transition-colors
                                ${isSelected
                                    ? 'bg-orange-600 text-white shadow-md'
                                    : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                                }
                            `}
                            title={bond.description || bond.name}
                        >
                            {bond.name}
                        </button>
                    );
                })}
                {filteredBonds.length === 0 && (
                     <p className="text-zinc-500 text-xs text-center w-full py-2">
                        {searchTerm ? `Nenhum vínculo encontrado para "${searchTerm}".` : (allBonds.length === 0 ? 'Nenhum vínculo cadastrado.' : 'Nenhum vínculo corresponde à busca.')}
                     </p>
                )}
            </div>
        </div>
    );
}