'use client';

import React from 'react';
import type { SavedTeam } from '@/types';
import { Upload, Trash2, X, Copy } from 'lucide-react';

type SavedTeamsModalProps = {
    isOpen: boolean;
    onClose: () => void;
    savedTeams: SavedTeam[];
    onLoadTeam: (team: SavedTeam) => void;
    onDeleteTeam: (index: number) => void;
    onExportTeam: (team: SavedTeam) => void;
    importKey: string;
    setImportKey: (key: string) => void;
    onImportTeam: () => void; 
    feedbackMessage: { type: 'success' | 'error'; text: string } | null; 
};

export function SavedTeamsModal({
    isOpen,
    onClose,
    savedTeams,
    onLoadTeam,
    onDeleteTeam,
    onExportTeam,
    importKey,
    setImportKey,
    onImportTeam,
    feedbackMessage,
}: SavedTeamsModalProps) {

    if (!isOpen) return null;

    const handleModalContentClick = (e: React.MouseEvent) => e.stopPropagation();

    const handleCopyToClipboard = async (key: string) => {
        try {
            await navigator.clipboard.writeText(key);
            alert('Chave copiada para a área de transferência!'); 
        } catch (err) {
            console.error('Falha ao copiar:', err);
            alert('Erro ao copiar a chave.');
        }
    };

     const exportAndCopy = (team: SavedTeam) => {
         const key = onExportTeam(team); 
        
         if (key) {
             handleCopyToClipboard(key);
         }
     };

    return (

        <div
            className="fixed inset-0 z-[70] bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-zinc-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] border border-zinc-700 flex flex-col overflow-hidden"
                onClick={handleModalContentClick}
            >
                <div className="flex-shrink-0 p-4 border-b border-zinc-700 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white font-bricolage">
                         Gerenciar Times Salvos
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-zinc-400 hover:text-white transition-colors"
                        aria-label="Fechar modal"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto custom-scrollbar p-6 space-y-6">
                     {feedbackMessage && (
                        <p className={`p-2 rounded text-white text-sm text-center ${feedbackMessage.type === 'error' ? 'bg-red-700/80' : 'bg-green-700/80'}`}>
                            {feedbackMessage.text}
                        </p>
                     )}

                     <div className="mb-6">
                        <h4 className="text-md font-semibold text-zinc-300 mb-2">Times Salvos:</h4>
                        {savedTeams.length === 0 ? (
                            <p className="text-sm text-zinc-500 italic">Nenhum time salvo ainda.</p>
                        ) : (
                            <ul className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2 border border-zinc-700 rounded-md p-2 bg-zinc-800/50">
                                {savedTeams.map((savedTeam, index) => (
                                    <li key={index} className="flex flex-col sm:flex-row justify-between items-center bg-zinc-700/50 p-2 rounded gap-2">
                                        <div className='flex-grow'>
                                            <span className="font-semibold text-white">{savedTeam.name}</span>
                                            <span className="text-xs text-zinc-400 ml-2"> (Salvo em: {new Date(savedTeam.savedAt).toLocaleDateString()})</span>
                                        </div>
                                        <div className="flex gap-2 flex-shrink-0">
                                            <button onClick={() => onLoadTeam(savedTeam)} title="Carregar" className="p-1.5 bg-sky-600 hover:bg-sky-700 rounded text-white"><Upload size={16}/></button>
                                            <button onClick={() => exportAndCopy(savedTeam)} title="Copiar Chave de Exportação" className="p-1.5 bg-yellow-600 hover:bg-yellow-700 rounded text-white"><Copy size={16}/></button>
                                            <button onClick={() => onDeleteTeam(index)} title="Excluir" className="p-1.5 bg-red-600 hover:bg-red-700 rounded text-white"><Trash2 size={16}/></button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                     </div>

                     <div>
                        <h4 className="text-md font-semibold text-zinc-300 mb-2">Importar Time por Chave:</h4>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={importKey}
                                onChange={(e) => setImportKey(e.target.value)}
                                placeholder="Cole a chave aqui..."
                                className="flex-grow bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                            />
                            <button
                                onClick={onImportTeam}
                                className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-1 px-3 text-sm rounded transition-colors"
                            >
                                Importar
                            </button>
                        </div>
                     </div>
                </div> 
            </div> 
        </div>
    );
}