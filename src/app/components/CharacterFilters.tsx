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
    <div className="database-character-filters">
      <div className="database-character-filters__grid">
        <div className="database-character-filters__field">
          <label className="database-character-filters__label">
            <Filter size={12} className="database-character-filters__icon--filter" />
            Buscar por nome
            <Info size={12} className="database-character-filters__icon--info" />
          </label>
          <NameSearchInput
            value={nameSearch}
            onChange={setNameSearch}
            className="database-character-filters__input"
          />
        </div>

        <div className="database-character-filters__field">
          <label className="database-character-filters__label">
            <Filter size={12} className="database-character-filters__icon--filter" />
            Escola
            <Info size={12} className="database-character-filters__icon--info" />
          </label>
          <SchoolFilter
            activeFilter={schoolFilter}
            onFilterChange={setSchoolFilter}
            className="database-character-filters__input"
          />
        </div>
      </div>

      <div className="database-character-filters__bottom">
        <div className="database-character-filters__field database-character-filters__field--wide">
          <label className="database-character-filters__label">
            <Filter size={12} className="database-character-filters__icon--filter" />
            Posição
            <Info size={12} className="database-character-filters__icon--info" />
          </label>
          <PositionFilter
            activeFilter={positionFilter}
            onFilterChange={setPositionFilter}
            className="database-character-filters__input"
          />
        </div>

        <div className="database-character-filters__rarity">
          <label className="database-character-filters__label">
            <Filter size={12} className="database-character-filters__icon--filter" />
            Raridade
            <Info size={12} className="database-character-filters__icon--info" />
          </label>

          <div className="database-character-filters__rarity-buttons">
            {rarities.map((rarity) => {
              const isActive = rarityFilter === rarity;
              return (
                <button
                  key={rarity}
                  onClick={() => setRarityFilter(rarity)}
                  className={`database-character-filters__rarity-btn ${
                    isActive ? "active" : ""
                  }`}
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
