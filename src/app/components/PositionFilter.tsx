"use client";

import React from "react";
import { Position } from "@/types";

type PositionFilterProps = {
  activeFilter: Position | "ALL";
  onFilterChange: (position: Position | "ALL") => void;
  className?: string; 
};

const positions: (Position | "ALL")[] = [
  "ALL",
  "S", 
  "MB", 
  "WS", 
  "OP", 
  "L",  
];

export function PositionFilter({
  activeFilter,
  onFilterChange,
  className = "",
}: PositionFilterProps) {
  return (
    <div className={`flex flex-wrap justify-center sm:justify-start gap-2 ${className}`}>
      {positions.map((pos) => {
        const isActive = pos === activeFilter;

        return (
          <button
            key={pos}
            onClick={() => onFilterChange(pos)}
            className={`
              px-3 py-1.5 text-sm rounded-md border transition-colors duration-150
              ${
                isActive
                  ? "bg-orange-500 text-white border-orange-600 shadow-md"
                  : "bg-zinc-800 text-zinc-300 border-zinc-700 hover:border-orange-400 hover:text-white"
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
