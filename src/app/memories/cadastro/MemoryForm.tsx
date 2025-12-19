"use client";

import { StorageFile } from "@/app/actions/getMemoryImages";
import { saveMemoryToJson } from "@/app/actions/saveMemory";
import { MemoryImageSelector } from "@/app/components/MemoryImageSelector";
import { SectionHeader } from "@/app/components/SectionHeader";
import { useAuthStore } from "@/stores/useAuthStore";
import { useCharacterStore } from "@/stores/useCharacterStore";
import { Memory } from "@/types";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";

const POSITIONS = ["OP", "MB", "WS", "S", "L"];
const STATS = ["Serve", "Spike", "Set", "Receive", "Block", "Save"];

type MemoryFormProps = {
  initialImages: StorageFile[];
  loadError: string | null;
};

export function MemoryForm({ initialImages, loadError }: MemoryFormProps) {
  const { allMemories, fetchInitialData, hasLoadedData, isLoading } = useCharacterStore(
    useShallow((s) => ({
      allMemories: s.allMemories,
      fetchInitialData: s.fetchInitialData,
      hasLoadedData: s.hasLoadedData,
      isLoading: s.isLoading,
    }))
  );
  
  const { isAdmin } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const [formData, setFormData] = useState<Memory>({
    id: "",
    name: "",
    positions: [],
    desc: "",
    image_url: "",
    bonus: {}
  });

  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!isAdmin) {
      router.push("/memories");
    }
  }, [isAdmin, router]);

  useEffect(() => {
    if (!hasLoadedData && !isLoading) fetchInitialData();
  }, [hasLoadedData, isLoading, fetchInitialData]);

  useEffect(() => {
    if (editId && allMemories.length > 0) {
      const memory = allMemories.find(m => m.id === editId);
      if (memory) {
        setFormData(memory);
      }
    }
  }, [editId, allMemories]);

  const handleChange = (field: keyof Memory, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePositionToggle = (pos: string) => {
    setFormData(prev => {
      const current = prev.positions || [];
      if (current.includes(pos)) {
        return { ...prev, positions: current.filter(p => p !== pos) };
      } else {
        return { ...prev, positions: [...current, pos] };
      }
    });
  };

  const handleBonusChange = (stat: string, type: "flat" | "pct", value: string) => {
    const numValue = value === "" ? undefined : parseFloat(value);
    setFormData(prev => {
      const currentBonus = prev.bonus || {};
      const statBonus = currentBonus[stat] || {};
      
      const newStatBonus = { ...statBonus, [type]: numValue };
      
      // Clean up empty objects
      if (newStatBonus.flat === undefined && newStatBonus.pct === undefined) {
         const { [stat]: _, ...rest } = currentBonus;
         return { ...prev, bonus: rest };
      }

      return {
        ...prev,
        bonus: {
          ...currentBonus,
          [stat]: newStatBonus
        }
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("saving");
    
    try {
        const result = await saveMemoryToJson(formData);
        if (result.success) {
            setStatus("success");
            setMessage(result.message);
            // Reload data to reflect changes
            fetchInitialData(true);
            setTimeout(() => {
                router.push("/memories");
            }, 1500);
        } else {
            setStatus("error");
            setMessage(result.message);
        }
    } catch (err: any) {
        setStatus("error");
        setMessage(err.message);
    }
  };

  return (
    <main className="min-h-screen p-8 pb-24 bg-zinc-950 text-white">
        <SectionHeader title={editId ? "Editar Memória" : "Nova Memória"} />
        
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
            
            <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
                <h3 className="text-xl font-bold mb-4 border-b border-zinc-700 pb-2">Informações Básicas</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1">ID (Opcional, gerado automaticamente se vazio)</label>
                            <input 
                                type="text" 
                                value={formData.id} 
                                onChange={e => handleChange("id", e.target.value)}
                                className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 focus:border-orange-500 outline-none"
                                disabled={!!editId} // Disable ID editing if updating
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1">Nome *</label>
                            <input 
                                type="text" 
                                required
                                value={formData.name} 
                                onChange={e => handleChange("name", e.target.value)}
                                className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 focus:border-orange-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1">Posições *</label>
                            <div className="flex flex-wrap gap-3">
                                {POSITIONS.map(pos => (
                                    <label key={pos} className="flex items-center gap-2 cursor-pointer bg-zinc-800 px-3 py-1 rounded hover:bg-zinc-700">
                                        <input 
                                            type="checkbox"
                                            checked={formData.positions.includes(pos)}
                                            onChange={() => handlePositionToggle(pos)}
                                            className="rounded border-zinc-600 text-orange-500 focus:ring-orange-500"
                                        />
                                        <span>{pos}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div>
                         <MemoryImageSelector 
                            initialValue={formData.image_url}
                            onChange={(url) => handleChange("image_url", url)}
                            images={initialImages}
                            loadError={loadError}
                         />
                    </div>
                </div>

                <div className="mt-4">
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Descrição *</label>
                    <textarea 
                        required
                        value={formData.desc} 
                        onChange={e => handleChange("desc", e.target.value)}
                        rows={4}
                        className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 focus:border-orange-500 outline-none"
                    />
                </div>
            </div>

            <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
                <h3 className="text-xl font-bold mb-4 border-b border-zinc-700 pb-2">Bônus de Atributos</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {STATS.map(stat => (
                        <div key={stat} className="bg-zinc-950 p-4 rounded border border-zinc-800">
                            <h4 className="font-semibold text-orange-400 mb-3">{stat}</h4>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs text-zinc-500 mb-1">Flat (+)</label>
                                    <input 
                                        type="number" 
                                        placeholder="0"
                                        value={formData.bonus?.[stat]?.flat ?? ""}
                                        onChange={e => handleBonusChange(stat, "flat", e.target.value)}
                                        className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-zinc-500 mb-1">Percentual (%)</label>
                                    <input 
                                        type="number" 
                                        placeholder="0"
                                        step="0.1"
                                        value={formData.bonus?.[stat]?.pct ?? ""}
                                        onChange={e => handleBonusChange(stat, "pct", e.target.value)}
                                        className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="fixed bottom-0 left-0 w-full bg-zinc-950 border-t border-zinc-800 p-4 z-50 flex items-center justify-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.3)]">
                <div className="w-full max-w-4xl flex items-center justify-between">
                    <button 
                        type="button"
                        onClick={() => router.push("/memories")}
                        className="px-6 py-2 rounded bg-zinc-700 hover:bg-zinc-600 transition-colors"
                    >
                        Cancelar
                    </button>
                    
                    <button 
                        type="submit"
                        disabled={status === "saving"}
                        className="px-8 py-2 rounded bg-orange-500 hover:bg-orange-600 text-white font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {status === "saving" ? "Salvando..." : "Salvar Memória"}
                    </button>
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded ${status === "success" ? "bg-green-500/20 text-green-400 border border-green-500/50" : "bg-red-500/20 text-red-400 border border-red-500/50"}`}>
                    {message}
                </div>
            )}

        </form>
    </main>
  );
}
