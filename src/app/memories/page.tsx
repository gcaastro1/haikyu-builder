"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { useAuthStore } from "@/stores/useAuthStore";
import { useCharacterStore } from "@/stores/useCharacterStore";
import { Edit, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { SectionHeader } from "../components/SectionHeader";

export default function MemoriesPage() {
  const { allMemories, isLoading, fetchInitialData, hasLoadedData } = useCharacterStore(
    useShallow((s) => ({
      allMemories: s.allMemories,
      isLoading: s.isLoading,
      fetchInitialData: s.fetchInitialData,
      hasLoadedData: s.hasLoadedData,
    }))
  );

  const { isAdmin } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");
  const t = useTranslation();

  useEffect(() => {
    if (!hasLoadedData && !isLoading) fetchInitialData();
  }, [hasLoadedData, isLoading, fetchInitialData]);

  const filteredMemories = allMemories.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen p-8 bg-zinc-950 text-white">
      <SectionHeader title={t.memories.title} />

      {isAdmin && (
         <div className="mb-8 flex justify-end">
            <Link 
              href="/memories/cadastro" 
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors"
            >
              <Plus size={20} />
              {t.memories.new_memory}
            </Link>
         </div>
      )}

      <div className="mb-8">
        <input 
          type="text" 
          placeholder={t.memories.search_placeholder} 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 rounded bg-zinc-900 text-white border border-zinc-800 focus:border-orange-500 focus:outline-none transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredMemories.map((memory) => (
          <div key={memory.id} className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden flex flex-col relative group hover:border-zinc-700 transition-colors">
             {isAdmin && (
                <Link 
                  href={`/memories/cadastro?id=${memory.id}`}
                  className="absolute top-2 right-2 p-2 bg-zinc-800/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-orange-500 z-10"
                >
                  <Edit size={16} className="text-white" />
                </Link>
             )}
            <div className="relative h-48 w-full bg-zinc-950 flex items-center justify-center p-4">
              {/* Using standard img tag for simplicity */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={memory.image_url} 
                alt={memory.name} 
                className="max-h-full max-w-full object-contain"
                onError={(e) => {
                    (e.target as HTMLImageElement).src = "/images/placeholder.png";
                }}
              />
            </div>
            <div className="p-4 flex flex-col flex-1 border-t border-zinc-800">
              <h3 className="text-lg font-bold text-white mb-2">{memory.name}</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {memory.positions.map(p => (
                    <span key={p} className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded border border-zinc-700">
                        {t.positions[p as keyof typeof t.positions] || p}
                    </span>
                ))}
              </div>
              <p className="text-sm text-zinc-400 line-clamp-4 leading-relaxed" title={memory.desc}>{memory.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
