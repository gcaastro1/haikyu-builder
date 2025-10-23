// /src/app/components/TeamCourt.tsx
import { Position } from '@/types';
import { TeamSlots, SlotKey } from '../page';
import { CharacterCard } from './CharacterCard';
import { TeamSlot } from './TeamSlot';

type TeamCourtProps = {
  team: TeamSlots;
  onRemoveCharacter: (slotKey: SlotKey) => void;
  onSlotClick: (position: Position | "ALL") => void;
  isPositionFree?: boolean;
}

export function TeamCourt({
  team,
  onRemoveCharacter,
  onSlotClick,
  isPositionFree = false
}: TeamCourtProps) {

  const acceptedPositions: Record<Exclude<SlotKey, 'libero'>, Position> = {
    pos2_s: "S", pos3_mb: "MB", pos4_ws: "WS",
    pos1_op: "OP", pos6_mb: "MB", pos5_ws: "WS",
  };

  const positionNumbers: Record<Exclude<SlotKey, 'libero'>, number> = {
      pos2_s: 1, 
      pos3_mb: 2, 
      pos4_ws: 3,
      pos1_op: 4,
      pos6_mb: 5,
      pos5_ws: 6, 
  };


  const renderSlot = (slotKey: SlotKey) => {
    const character = team[slotKey];
    const dndId = `court-${slotKey}`;

    const acceptedPosition = slotKey === 'libero' ? 'L' : acceptedPositions[slotKey];
    const dndData = { type: 'court', slotKey, acceptedPosition };

    let slotDisplayName: string;
    if (slotKey === 'libero') {
      slotDisplayName = "Líbero (L)";
    } else if (isPositionFree) {
      slotDisplayName = `Posição ${positionNumbers[slotKey]}`;
    } else {
      slotDisplayName = `Pos ${positionNumbers[slotKey]} (${acceptedPosition})`;
    }


    if (character) {
      return (
        <CharacterCard
          key={dndId}
          character={character}
          onRemoveCharacter={() => onRemoveCharacter(slotKey)}
          dragId={dndId}
          dragData={{ ...dndData, character }}
          dropData={dndData}
          originType="court"
        />
      );
    } else {
      return (
        <TeamSlot
          key={dndId}
          positionName={slotDisplayName} 
          onSlotClick={() => onSlotClick(acceptedPosition)}
          dropId={dndId}
          dropData={dndData}
        />
      );
    }
  };

  return (
    <div className="flex flex-col lg:flex-row justify-center gap-4 w-full max-w-xl">
      <div className="bg-zinc-950 p-3 sm:p-4 rounded-lg shadow-inner border border-zinc-800 w-full lg:w-auto mx-auto flex flex-col">
        <div className="flex flex-grow items-center justify-center">
          {renderSlot('libero')}
        </div>
      </div>
      <div className="bg-zinc-950 p-3 sm:p-4 rounded-lg shadow-inner border border-zinc-800 w-full">
        <div className="grid grid-cols-3 gap-x-2 sm:gap-x-3 justify-items-center">
          {renderSlot('pos2_s')}
          {renderSlot('pos3_mb')}
          {renderSlot('pos4_ws')}
        </div>
        <div className="h-px bg-zinc-700 my-3 sm:my-4"></div>
        <div className="grid grid-cols-3 gap-x-2 sm:gap-x-3 justify-items-center">
          {renderSlot('pos5_ws')}
          {renderSlot('pos6_mb')}
          {renderSlot('pos1_op')}
        </div>
      </div>
    </div>
  );
}