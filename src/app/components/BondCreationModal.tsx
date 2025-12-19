"use client";

import { useCharacterStore } from "@/stores/useCharacterStore";
import { Bond } from "@/types";
import { X } from "lucide-react";
import { useState } from "react";
import { saveBond } from "../actions/saveBond";

interface BondCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newBond: Bond) => void;
}

export function BondCreationModal({ isOpen, onClose, onSuccess }: BondCreationModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>([]);
  const { fetchInitialData, allCharacters } = useCharacterStore();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const result = await saveBond({
        name,
        description,
      }, selectedParticipants);

      if (result.success && result.bond) {
        await fetchInitialData(); 
        onSuccess(result.bond);
        onClose();
        setName("");
        setDescription("");
        setSelectedParticipants([]);
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message || "Erro desconhecido");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleParticipant = (id: number) => {
    setSelectedParticipants(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-zinc-700 bg-zinc-800 shrink-0">
          <h3 className="text-lg font-bold text-white">Criar Novo Vínculo</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-200 p-3 rounded text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-300">Nome do Vínculo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-300">Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[100px]"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Participantes (Opcional)</label>
            <div className="border border-zinc-700 rounded bg-zinc-800 max-h-40 overflow-y-auto p-2 grid grid-cols-2 gap-2">
              {allCharacters.map(char => (
                <label key={char.id} className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer hover:bg-zinc-700 p-1 rounded">
                  <input 
                    type="checkbox" 
                    checked={selectedParticipants.includes(char.id)}
                    onChange={() => toggleParticipant(char.id)}
                    className="accent-orange-500"
                  />
                  <div className="flex items-center gap-1 overflow-hidden">
                    <div className="w-5 h-5 rounded-full bg-zinc-600 shrink-0 overflow-hidden">
                        {char.image_url && (
                            <img src={char.image_url} alt={char.name} className="w-full h-full object-cover" />
                        )}
                    </div>
                    <span className="truncate">{char.name}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 mr-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded font-medium text-sm transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                 <>
                   <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                   Salvando...
                 </>
              ) : (
                "Criar Vínculo"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
