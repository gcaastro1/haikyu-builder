"use client";

import "@/styles/components/_position-filter.scss";
import { Position } from "@/types";
import Image from "next/image";

type PositionFilterProps = {
  activeFilter: Position | "ALL";
  onFilterChange: (position: Position | "ALL") => void;
  className?: string;
  variant?: "text" | "icon";
  hideLibero?: boolean;
};

const allPositions: (Position | "ALL")[] = ["ALL", "S", "MB", "WS", "OP", "L"];

export function PositionFilter({
  activeFilter,
  onFilterChange,
  className = "",
  variant = "text",
  hideLibero = false,
}: PositionFilterProps) {
  const positions = hideLibero
    ? allPositions.filter((p) => p !== "L")
    : allPositions;

  return (
    <div className={`position-filter position-filter--${variant} ${className}`}>
      {positions.map((pos) => {
        const isActive = pos === activeFilter;

        return (
          <button
            key={pos}
            onClick={() => onFilterChange(pos)}
            className={`position-filter__btn ${isActive ? "is-active" : ""}`}
            title={pos === "ALL" ? "Todos" : pos}
          >
            {variant === "icon" && pos !== "ALL" ? (
              <div className="position-filter__icon-wrapper">
                <Image
                  src={`/images/positions/${pos.toLowerCase()}.png`}
                  alt={pos}
                  width={24}
                  height={24}
                  className="position-filter__icon"
                  unoptimized
                />
              </div>
            ) : (
              <span>{pos === "ALL" ? "Todos" : pos}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
