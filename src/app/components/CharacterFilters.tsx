"use client";

import React from "react";
import { Position, School } from "@/types";
import { NameSearchInput } from "./NameSearchInput";
import { SchoolFilter } from "./SchoolFilter";
import { PositionFilter } from "./PositionFilter";
import { Info, Filter } from "lucide-react";

type CharacterFiltersProps = {
  nameSearch: string;
  setNameSearch: (value: string) => void;
  schoolFilter: School | "ALL";
  setSchoolFilter: (value: School | "ALL") => void;
  positionFilter: Position | "ALL";
  setPositionFilter: (value: Position | "ALL") => void;
  rarityFilter: string | "ALL";
  setRarityFilter: (value: string | "ALL") => void;
};

export function CharacterFilters({
  nameSearch,
  setNameSearch,
  schoolFilter,
  setSchoolFilter,
  positionFilter,
  setPositionFilter,
  rarityFilter,
  setRarityFilter,
}: CharacterFiltersProps) {
  const rarities = ["ALL", "UR", "SSR", "SR", "R"];

  return (
    <div className="p-4 border-b border-zinc-700 bg-zinc-900/40 flex flex-col gap-5 rounded-b-md">

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="flex items-center text-zinc-400 text-xs uppercase tracking-wide gap-1">
            <span title="Filtros">
              <Filter
                size={12}
                className="text-orange-400"
                aria-label="Filtros"
              />
            </span>
            Buscar por nome
            <span title="Procure por personagens pelo nome. A busca aceita pequenos erros de digitação (ex: 'Hinatta' → Hinata).">
              <Info size={12} className="text-zinc-500 ml-1" aria-hidden />
            </span>
          </label>
          <NameSearchInput
            value={nameSearch}
            onChange={setNameSearch}
            className="w-full h-[42px]"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="flex items-center text-zinc-400 text-xs uppercase tracking-wide gap-1">
            <span title="Filtros">
              <Filter
                size={12}
                className="text-orange-400"
                aria-label="Filtros"
              />
            </span>
            Escola
            <span title="Filtra os personagens por escola (ex: Karasuno, Nekoma, Shiratorizawa...).">
              <Info size={12} className="text-zinc-500 ml-1" aria-hidden />
            </span>
          </label>
          <SchoolFilter
            activeFilter={schoolFilter}
            onFilterChange={setSchoolFilter}
            className="w-full h-[42px]"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1 flex-1 sm:mr-3">
          <label className="flex items-center text-zinc-400 text-xs uppercase tracking-wide gap-1">
            <span title="Filtros">
              <Filter
                size={12}
                className="text-orange-400"
                aria-label="Filtros"
              />
            </span>
            Posição
            <span title="Filtra personagens por posição em quadra (S, MB, WS, OP, L).">
              <Info size={12} className="text-zinc-500 ml-1" aria-hidden />
            </span>
          </label>
          <PositionFilter
            activeFilter={positionFilter}
            onFilterChange={setPositionFilter}
            className="flex-1"
          />
        </div>

        <div className="flex flex-col gap-1 flex-1 sm:items-end">
          <label className="flex items-center text-zinc-400 text-xs uppercase tracking-wide gap-1">
            <span title="Filtros">
              <Filter
                size={12}
                className="text-orange-400"
                aria-label="Filtros"
              />
            </span>
            Raridade
            <span title="Filtra por raridade das cartas (UR, SSR, SR, R).">
              <Info size={12} className="text-zinc-500 ml-1" aria-hidden />
            </span>
          </label>
          <div className="flex flex-wrap justify-center sm:justify-end gap-2 mt-1">
            {rarities.map((rarity) => {
              const isActive = rarityFilter === rarity;
              return (
                <button
                  key={rarity}
                  onClick={() => setRarityFilter(rarity)}
                  className={`px-3 py-1.5 text-sm rounded-md border transition-colors duration-150
                    ${
                      isActive
                        ? "bg-orange-500 text-white border-orange-600 shadow-md"
                        : "bg-zinc-800 text-zinc-300 border-zinc-700 hover:border-orange-400 hover:text-white"
                    }`}
                  title={
                    rarity === "ALL"
                      ? "Mostrar todas as raridades"
                      : `Mostrar apenas personagens ${rarity}`
                  }
                >
                  {rarity}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
