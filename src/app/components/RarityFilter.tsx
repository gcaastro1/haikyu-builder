"use client";

import "@/styles/components/_rarity-filter.scss";
import { Rarity } from "@/types";

type RarityFilterProps = {
  activeFilter: Rarity | "ALL";
  onFilterChange: (rarity: Rarity | "ALL") => void;
  className?: string;
};

const rarities: (Rarity | "ALL")[] = ["ALL", "SP", "UR", "SSR", "SR"];

export function RarityFilter({
  activeFilter,
  onFilterChange,
  className = "",
}: RarityFilterProps) {
  return (
    <div className={`rarity-filter ${className}`}>
      {rarities.map((rarity) => {
        const isActive = rarity === activeFilter;

        return (
          <button
            key={rarity}
            onClick={() => onFilterChange(rarity)}
            className={`rarity-filter__btn ${isActive ? "is-active" : ""}`}
            type="button"
          >
            {rarity === "ALL" ? "Todos" : rarity}
          </button>
        );
      })}
    </div>
  );
}
