"use client"; 

import { useState } from 'react';
import { allCharacters, Character, Position } from '../../data/characters'; 
import { CharacterCard } from './components/CharacterCard';
import { TeamCourt } from './components/TeamCourt';
import { PositionFilter } from './components/PositionFilter';
import { Bench } from './components/Bench'; 
import { 
  DndContext, 
  DragEndEvent, 
  DragStartEvent, 
  DragOverlay,
  closestCenter 
} from '@dnd-kit/core';
import { SectionHeader } from './components/SectionHeader';

export type TeamSlots = {
  pos5_ws: Character | null; pos6_mb: Character | null; pos1_op: Character | null; 
  pos4_ws: Character | null; pos3_mb: Character | null; pos2_s: Character | null;  
  libero: Character | null;  
};
const initialTeamState: TeamSlots = {
  pos5_ws: null, pos6_mb: null, pos1_op: null,
  pos4_ws: null, pos3_mb: null, pos2_s: null, libero: null,
};
export type SlotKey = keyof TeamSlots;
type ActiveDragData = {
  character: Character;
  type: 'list' | 'court' | 'bench';
  [key: string]: unknown; 
};
type OverDragData = {
  type: 'court' | 'bench';
  acceptedPosition?: Position;
  [key:string]: unknown; 
};

export default function Home() {
  
  const [team, setTeam] = useState<TeamSlots>(initialTeamState);
  const [bench, setBench] = useState<(Character | null)[]>(Array(6).fill(null));
  const [positionFilter, setPositionFilter] = useState<Position | "ALL">("ALL");
  const [activeDragItem, setActiveDragItem] = useState<Character | null>(null);
  const [isPositionFree, setIsPositionFree] = useState(false);

  const handlePositionModeChange = () => {
    const newMode = !isPositionFree;
    if (isPositionFree === true && newMode === false) {
      setTeam(initialTeamState);
    }
    setIsPositionFree(newMode);
  };
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.character) {
      setActiveDragItem(active.data.current.character);
    }
  };
  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragItem(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const activeData = active.data.current as ActiveDragData;
    const overData = over.data.current as OverDragData;
    const draggedCharacter = activeData.character; 
    if (!draggedCharacter) return; 
    const newTeam = { ...team };
    const newBench = [ ...bench ];
    const allCurrentNames = [
      ...Object.values(newTeam).filter(Boolean).map(c => c!.name),
      ...newBench.filter(Boolean).map(c => c!.name)
    ];
    let charFromTargetSlot: Character | null = null;
    if (overData?.type === 'court') {
      charFromTargetSlot = newTeam[overData.slotKey as SlotKey];
    } else if (overData?.type === 'bench') {
      charFromTargetSlot = newBench[overData.index as number];
    }
    const isSubstituting = charFromTargetSlot?.name === draggedCharacter.name;
    if (allCurrentNames.includes(draggedCharacter.name) && !isSubstituting) {
       alert(`'${draggedCharacter.name}' já está no seu time. Você só pode substituir, arrastando esta versão sobre a que já está em jogo.`);
       return;
    }
    const targetIsCourt = overData?.type === 'court';
    if (targetIsCourt) {
      const targetPosition = overData.acceptedPosition as Position;
      const targetSlotKey = overData.slotKey as SlotKey;
      if (targetSlotKey === 'libero') {
        if (draggedCharacter.position !== 'L') {
          alert('Apenas Líberos (L) podem ir para o slot de Líbero!');
          return;
        }
      } 
      else if (isPositionFree) {
        if (draggedCharacter.position === 'L') {
           alert('Líberos só podem ir para o slot de Líbero!');
           return;
        }
      } 
      else {
        if (draggedCharacter.position !== targetPosition) {
          alert(`Este personagem (${draggedCharacter.position}) não pode ir para um slot de ${targetPosition}! (Modo Global)`);
          return;
        }
      }
    }
    if (overData?.type === 'court') {
      newTeam[overData.slotKey as SlotKey] = draggedCharacter;
    } else if (overData?.type === 'bench') {
      newBench[overData.index as number] = draggedCharacter;
    }
    if (activeData?.type === 'court') {
      newTeam[activeData.slotKey as SlotKey] = isSubstituting ? null : charFromTargetSlot; 
    } else if (activeData?.type === 'bench') {
      newBench[activeData.index as number] = isSubstituting ? null : charFromTargetSlot; 
    }
    setTeam(newTeam);
    setBench(newBench);
  };
  const handleRemoveFromCourt = (slotKey: SlotKey) => { setTeam((prevTeam) => ({ ...prevTeam, [slotKey]: null })); };
  const handleRemoveFromBench = (index: number) => { const newBench = [...bench]; newBench[index] = null; setBench(newBench); };
  const courtCharacterNames = Object.values(team).filter(Boolean).map(char => char!.name);
  const benchCharacterNames = bench.filter(Boolean).map(char => char!.name);
  const teamCharacterNames = [...courtCharacterNames, ...benchCharacterNames];
  const filteredCharacters = allCharacters.filter(character => {
    if (positionFilter === "ALL") return true;
    return character.position === positionFilter;
  });


  return (
    <DndContext 
      collisionDetection={closestCenter} 
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <main className="max-w-full mx-auto p-4 sm:p-8">

        <div className="flex flex-col lg:flex-row lg:gap-8">

          <section className="lg:w-3/5 flex flex-col"> 
            <div className="w-full max-w-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
              <SectionHeader titleBold="Seu" titleRegular="Time" />
              <label htmlFor="positionToggle" className="flex items-center cursor-pointer self-center sm:self-auto">
                <span className="mr-3 text-sm font-medium text-gray-300">Modo JP (Livre)</span>
                <div className="relative">
                  <input 
                    type="checkbox" 
                    id="positionToggle" 
                    className="sr-only" 
                    checked={isPositionFree}
                    onChange={handlePositionModeChange}
                  />
                  <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
                      isPositionFree ? 'translate-x-6 bg-sky-400' : ''
                  }`}></div>
                </div>
              </label>
            </div>
            <TeamCourt 
              team={team} 
              onRemoveCharacter={handleRemoveFromCourt}
              onSlotClick={setPositionFilter} 
              size="small"
              isPositionFree={isPositionFree} 
            />
            <Bench 
              bench={bench}
              onRemoveFromBench={handleRemoveFromBench}
            />
          </section>

          <section className="mt-16 lg:mt-0 lg:w-2/5 lg:top-24 lg:self-start 
                              bg-zinc-950 p-4 rounded-lg shadow-inner border border-gray-700
                              flex flex-col h-[calc(100vh-6rem)]">
            
            <SectionHeader titleBold="Personagens" titleRegular="Disponíveis" />
            
            <div className="flex justify-between items-center gap-6 mb-6">
              <PositionFilter 
                activeFilter={positionFilter}
                onFilterChange={setPositionFilter}
              />
            </div>

            <div className="flex flex-wrap gap-3 justify-between p-2 
                            overflow-y-auto flex-grow
                            custom-scrollbar">
              
              {filteredCharacters.map((char) => {
                const isDisabled = teamCharacterNames.includes(char.name);
                const dragId = `list-${char.id}`;
                return (
                  <CharacterCard 
                    key={dragId} 
                    dragId={dragId} 
                    character={char}
                    isDisabled={isDisabled} 
                    dragData={{ type: 'list', character: char }}
                    size="small"
                  />
                );
              })}
            </div>
          </section>
        </div>
      </main>

      <DragOverlay>
        {activeDragItem ? (
          <CharacterCard 
            character={activeDragItem} 
            dragId="overlay-item"
            dragData={{ type: 'overlay', character: activeDragItem }}
            size="small"
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}