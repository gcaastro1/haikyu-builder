import { TeamSlots, SlotKey } from '../page'; 
import { CharacterCard } from './CharacterCard';
import { TeamSlot } from './TeamSlot';
import { Position } from '../../../data/characters'; 

type TeamCourtProps = {
  team: TeamSlots;
  onRemoveCharacter: (slotKey: SlotKey) => void;
  onSlotClick: (position: Position | "ALL") => void; 
  size?: 'normal' | 'small';
  isPositionFree?: boolean; 
}

export function TeamCourt({ 
  team, 
  onRemoveCharacter, 
  onSlotClick, 
  size = 'normal',
  isPositionFree = false 
}: TeamCourtProps) {
  
  const originalPositionNames: Record<SlotKey, string> = {
    pos2_s: "Pos 2 (S)", pos3_mb: "Pos 3 (MB)", pos4_ws: "Pos 4 (WS)",
    pos5_ws: "Pos 5 (WS)", pos6_mb: "Pos 6 (MB)", pos1_op: "Pos 1 (OP)",
    libero: "Líbero (L)",
  };

  const acceptedPositions: Record<SlotKey, Position> = {
    pos2_s: "S", pos3_mb: "MB", pos4_ws: "WS",
    pos5_ws: "WS", pos6_mb: "MB", pos1_op: "OP", libero: "L",
  };
  
  const renderSlot = (slotKey: SlotKey) => {
    const character = team[slotKey];
    const dndId = `court-${slotKey}`;
    const acceptedPosition = acceptedPositions[slotKey];
    const dndData = { type: 'court', slotKey, acceptedPosition };

    let slotDisplayName: string;
    if (slotKey === 'libero') {
      slotDisplayName = "Líbero (L)"; 
    } else if (isPositionFree) {
      const posNumber = slotKey.charAt(3); 
      slotDisplayName = `Posição ${posNumber}`;
    } else {
      slotDisplayName = originalPositionNames[slotKey];
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
          size={size}
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
          size={size}
        />
      );
    }
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-inner 
                    border border-gray-700 w-full max-w-xl mx-auto">
    
      <div className="grid grid-cols-4 gap-x-3">
        
        <div></div> 
        
        {renderSlot('pos2_s')}
        {renderSlot('pos3_mb')}
        {renderSlot('pos4_ws')}
      </div>

      <div className="h-px bg-gray-600 my-4"></div>

      <div className="grid grid-cols-4 gap-x-3">
        {renderSlot('pos5_ws')}
        {renderSlot('pos6_mb')}
        {renderSlot('pos1_op')}
        {renderSlot('libero')} 
      </div>
    </div>
  );
}