"use client";
 
import { Character } from "@/types";
import { CharacterCard } from "./CharacterCard";
import { TeamSlot } from "./TeamSlot";

type BenchProps = {
  bench: (Character | null)[];
  onRemoveFromBench: (index: number) => void;
};

export function Bench({ bench, onRemoveFromBench }: BenchProps) {
  return (
    <div className="w-full max-w-xl mt-8"> 
      <h3 className="text-xl font-semibold text-left text-white mb-6 font-bricolage">
        <span className="font-bold">BANCO DE</span>
        <span className="font-normal opacity-80 ml-1">RESERVAS</span>
        <span className="font-normal opacity-80 ml-1">(6)</span>
      </h3>
      
      <div className="flex flex-wrap justify-left gap-4">
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