"use client";

import { Character } from "@/types";
import { CharacterCard } from "./CharacterCard";
import { TeamSlot } from "./TeamSlot";
import { useUIStore } from "@/stores/useUIStore";

type BenchProps = {
  bench: (Character | null)[];
  onRemoveFromBench: (index: number) => void;
};

export function Bench({ bench, onRemoveFromBench }: BenchProps) {
  const openSelectionModal = useUIStore((s) => s.openSelectionModal);

  const filledSlots = bench.filter((b) => b !== null).length;

  return (
    <div className="bench">
      {/* === TÍTULO === */}
      <h3 className="bench__title">
        <span className="bench__title--bold">BANCO DE</span>{" "}
        <span className="bench__title--light">RESERVAS</span>
        <span className="bench__count">
          ({filledSlots}/{bench.length})
        </span>
      </h3>

      {/* === GRID DE RESERVAS === */}
      <div className="bench__grid">
        {bench.map((character, index) => {
          const dndId = `bench-${index}`;
          const dndData = { type: "bench", index };

          return (
            <div key={dndId} className="bench__slot">
              {character ? (
                <CharacterCard
                  character={character}
                  onRemoveCharacter={() => onRemoveFromBench(index)}
                  dragId={dndId}
                  dragData={{ ...dndData, character }}
                  dropData={dndData}
                  originType="bench"
                />
              ) : (
                <TeamSlot
                  positionName="Reserva"
                  dropId={dndId}
                  dropData={dndData}
                  onSlotClick={openSelectionModal}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
