"use client";

import React, { useMemo } from "react";
import { useTeamStore } from "@/stores/useTeamStore";
import { useCharacterStore } from "@/stores/useCharacterStore";
import {
  TeamType,
  RelevantStyleDisplay,
  dbStyleToTeamTypeMap,
  teamTypeStyles,
} from "@/types";

const displayOrder: RelevantStyleDisplay[] = [
  "Ataque Rápido",
  "Potente",
  "Bloqueio",
  "Recepção",
];

const activationThreshold: Record<RelevantStyleDisplay, number> = {
  "Ataque Rápido": 4,
  Potente: 4,
  Bloqueio: 4,
  Recepção: 5,
};

export function TeamTypeDisplay() {
  const team = useTeamStore((s) => s.team);
  const allCharacters = useCharacterStore((s) => s.allCharacters);

  const { teamType, styleCounts } = useMemo(() => {
    const counts: Record<RelevantStyleDisplay, number> = {
      "Ataque Rápido": 0,
      Potente: 0,
      Bloqueio: 0,
      Recepção: 0,
    };

    Object.values(team)
      .filter(Boolean)
      .forEach((member) => {
        const found = allCharacters.find((c) => c.id === member?.id);
        if (found && Array.isArray(found.styles)) {
          found.styles.forEach((style: string) => {
            const translated =
              dbStyleToTeamTypeMap[
                style as keyof typeof dbStyleToTeamTypeMap
              ];
            if (translated) counts[translated] += 1;
          });
        }
      });

    let mainType: TeamType = "Nenhum";
    let maxCount = 0;

    for (const style of displayOrder) {
      const count = counts[style];
      const minRequired = activationThreshold[style];

      if (count >= minRequired && count > maxCount) {
        mainType = style;
        maxCount = count;
      }
    }

    return { teamType: mainType, styleCounts: counts };
  }, [team, allCharacters]);

  const mainStyle = teamTypeStyles[teamType] ?? teamTypeStyles["Nenhum"];

  return (
    <div className="team-type-display">
      <div className="team-type-display__header">
        <span className="label">Tipo de Time:</span>
        <span className={`value ${mainStyle.className}`}>{teamType}</span>
      </div>

      <div className="team-type-display__styles">
        {displayOrder.map((styleName) => {
          const count = styleCounts[styleName];
          const countStyle = teamTypeStyles[styleName];
          const threshold = activationThreshold[styleName];
          const isActive = count >= threshold;

          return (
            <div
              key={styleName}
              className={`team-type-display__style ${
                isActive ? "active" : "inactive"
              }`}
            >
              <span className={`name ${countStyle.className}`}>{styleName}:</span>
              <span className="count">
                {count} / {threshold}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
