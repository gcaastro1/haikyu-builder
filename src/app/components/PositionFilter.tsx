"use client";

import { Position } from "../../../data/characters";

// Define os botões
const positions: (Position | "ALL")[] = ["ALL", "WS", "MB", "S", "OP", "L"];

type PositionFilterProps = {
  activeFilter: Position | "ALL";
  onFilterChange: (position: Position | "ALL") => void;
};

export function PositionFilter({ activeFilter, onFilterChange }: PositionFilterProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2 mb-6">
      {positions.map((pos) => {
        const isActive = activeFilter === pos;

        return (
          <button
            key={pos}
            onClick={() => onFilterChange(pos)}
            className={`py-2 px-4 rounded-full text-sm font-semibold transition-all
              ${
                isActive
                  ? "bg-orange-500 text-white" 
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600" 
              }
            `}
          >
            {pos === "ALL" ? "Todos" : pos}
          </button>
        );
      })}
    </div>
  );
}