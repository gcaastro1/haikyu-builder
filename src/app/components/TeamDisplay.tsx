import React from 'react';
import type { TeamType, RelevantStyleDisplay, StyleCounts } from '@/types'; 
import { teamTypeStyles } from '@/types'; 

type TeamTypeDisplayProps = {
    teamType: TeamType;
    styleCounts: StyleCounts; 
};

const displayOrder: RelevantStyleDisplay[] = ["Ataque Rápido", "Potente", "Bloqueio", "Recepção"];

export function TeamTypeDisplay({ teamType, styleCounts }: TeamTypeDisplayProps) {
    const mainStyle = teamTypeStyles[teamType] || teamTypeStyles["Nenhum"];

    return (
        <div className="w-full max-w-xl mx-auto mb-4 p-3 bg-zinc-950 rounded-lg border border-zinc-700 flex flex-col items-center gap-2"> {/* Adicionado mb-4 */}

            <div className="flex items-center justify-center gap-2">
                <span className="text-sm font-semibold text-zinc-400">Tipo de Time:</span>
                <span className={`font-bold text-sm ${mainStyle.color}`}>
                    {teamType}
                </span>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 border-t border-zinc-700 pt-2 w-full">
                {displayOrder.map(styleName => {
                    const count = styleCounts[styleName];
                    const countStyle = teamTypeStyles[styleName]; 
                    const opacityClass = count > 0 ? 'opacity-100' : 'opacity-40';

                    return (
                        <div key={styleName} className={`flex items-center gap-1 text-xs transition-opacity ${opacityClass}`}>
                             <span className={`font-semibold ${countStyle.color}`}>{styleName}:</span>
                             <span className="text-zinc-200 font-medium">{count}</span>
                        </div>
                    );
                 })}
            </div>
        </div>
    );
}