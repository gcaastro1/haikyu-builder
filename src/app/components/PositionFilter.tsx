"use client";

import React from "react";
import { Position } from "@/types";
import "@/styles/components/_position-filter.scss";

type PositionFilterProps = {
  activeFilter: Position | "ALL";
  onFilterChange: (position: Position | "ALL") => void;
  className?: string;
};

const positions: (Position | "ALL")[] = ["ALL", "S", "MB", "WS", "OP", "L"];

export function PositionFilter({
  activeFilter,
  onFilterChange,
  className = "",
}: PositionFilterProps) {
  return (
    <div className={`position-filter ${className}`}>
      {positions.map((pos) => {
        const isActive = pos === activeFilter;

        return (
          <button
            key={pos}
            onClick={() => onFilterChange(pos)}
            className={`position-filter__btn ${
              isActive ? "is-active" : ""
            }`}
          >
            {pos === "ALL" ? "Todos" : pos}
          </button>
        );
      })}
    </div>
  );
}
