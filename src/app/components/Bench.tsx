"use client";

import { Character } from "../../../data/characters";
import { CharacterCard } from "./CharacterCard";
import { TeamSlot } from "./TeamSlot";

type BenchProps = {
  bench: (Character | null)[];
  onRemoveFromBench: (index: number) => void;
};

export function Bench({ bench, onRemoveFromBench }: BenchProps) {
  return (
    <div className="w-full max-w-5xl mt-8">
      <h3 className="text-xl font-semibold text-center text-white mb-6">
        Banco de Reservas (6)
      </h3>
      <div className="flex flex-wrap justify-center gap-4">
        {bench.map((character, index) => {
          const dndId = `bench-${index}`;
          const dndData = { type: 'bench', index };

          return (
            <div key={dndId}>
              {character ? (
                <CharacterCard
                  character={character}
                  onRemoveCharacter={() => onRemoveFromBench(index)}
                  size="small"
                  dragId={dndId}
                  dragData={{ ...dndData, character }}
                  dropData={dndData}
                />
              ) : (
                <TeamSlot
                  positionName="Reserva"
                  size="small"
                  dropId={dndId}
                  dropData={dndData}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}