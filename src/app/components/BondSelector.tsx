"use client";

import React, { useState, useEffect } from "react";
import { getBonds } from "../lib/actions";
import { Search } from "lucide-react";
import { Bond } from "@/types";

type BondSelectorProps = {
  initialSelectedIds?: number[];
  onChange: (selectedIds: number[]) => void;
};

export function BondSelector({
  initialSelectedIds = [],
  onChange,
}: BondSelectorProps) {
  const [allBonds, setAllBonds] = useState<Bond[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>(initialSelectedIds);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadBonds = async () => {
      setLoading(true);
      const { bonds } = await getBonds();
      if (bonds) setAllBonds(bonds);
      setLoading(false);
    };
    loadBonds();
  }, []);

  useEffect(() => {
    setSelectedIds(initialSelectedIds);
  }, [initialSelectedIds]);

  const handleToggleBond = (bondId: number) => {
    const newSelectedIds = selectedIds.includes(bondId)
      ? selectedIds.filter((id) => id !== bondId)
      : [...selectedIds, bondId];

    setSelectedIds(newSelectedIds);
    onChange(newSelectedIds);
  };

  const filteredBonds = allBonds.filter((bond) =>
    bond.name!.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <p className="database-bond-selector__loading">
        Carregando vínculos...
      </p>
    );
  }

  return (
    <div className="database-bond-selector">
      <div className="database-bond-selector__search">
        <input
          type="text"
          placeholder="Buscar vínculo pelo nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="database-bond-selector__input"
        />
        <Search className="database-bond-selector__icon" size={16} />
      </div>

      <div className="database-bond-selector__list">
        {filteredBonds.map((bond) => {
          const isSelected = selectedIds.includes(bond.id);
          return (
            <button
              key={bond.id}
              type="button"
              onClick={() => handleToggleBond(bond.id)}
              className={`database-bond-selector__item ${
                isSelected ? "active" : ""
              }`}
              title={bond.description || bond.name!}
            >
              {bond.name}
            </button>
          );
        })}

        {filteredBonds.length === 0 && (
          <p className="database-bond-selector__empty">
            {searchTerm
              ? `Nenhum vínculo encontrado para "${searchTerm}".`
              : allBonds.length === 0
              ? "Nenhum vínculo cadastrado."
              : "Nenhum vínculo corresponde à busca."}
          </p>
        )}
      </div>
    </div>
  );
}
