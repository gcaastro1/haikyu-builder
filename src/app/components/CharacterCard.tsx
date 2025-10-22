// /src/app/components/CharacterCard.tsx
"use client"; 

import Image from 'next/image';
import { Character } from '../../../data/characters'; 
import React from 'react'; 
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { getTeamBorderColor } from '../lib/teamColors';
// 🌟 Importar os novos helpers 🌟
import { getRarityBackground, getRarityColor } from '../lib/rarityBackgrounds';

type CharacterCardProps = {
  character: Character;
  onRemoveCharacter?: () => void; 
  isDisabled?: boolean; 
  size?: 'normal' | 'small';
  dragId: string; 
  dragData: Record<string, unknown>; 
  dropData?: Record<string, unknown>; 
};

export function CharacterCard({ 
  character, 
  onRemoveCharacter, 
  isDisabled = false,
  size = 'normal',
  dragId,
  dragData, 
  dropData 
}: CharacterCardProps) {

  const draggable = useDraggable({ id: dragId, data: dragData, disabled: isDisabled });
  const droppable = useDroppable({ id: dragId, data: dropData || dragData });
  const style = draggable.transform ? { transform: `translate3d(${draggable.transform.x}px, ${draggable.transform.y}px, 0)` } : undefined;
  
  const handleRightClick = (e: React.MouseEvent) => { if (onRemoveCharacter) { e.preventDefault(); onRemoveCharacter(); } };

  const isSmall = size === 'small';
  const teamBorderColor = getTeamBorderColor(character.school);
  const rarityBgUrl = getRarityBackground(character.rarity);
  const rarityColor = getRarityColor(character.rarity);

  const cursorStyle = isDisabled ? 'cursor-not-allowed' : (onRemoveCharacter ? 'cursor-pointer' : 'cursor-grab');
  const visualStyle = isDisabled ? 'opacity-40 grayscale' : ''; 
  const hoverStyle = !isDisabled && (onRemoveCharacter || dragData?.type === 'list') ? 'hover:shadow-lg hover:scale-[1.03]' : ''; // Efeito de scale no hover
  
  if (draggable.isDragging) {
    return ( <div ref={draggable.setNodeRef} style={style} className={`rounded-lg bg-gray-800 ${isSmall ? 'w-28 h-[9.5rem]' : 'w-36 h-[12rem]'}`} /> );
  }

  return (
    <div 
      ref={(node) => { draggable.setNodeRef(node); droppable.setNodeRef(node); }}
      style={style}
      className={`
        relative rounded-lg overflow-hidden shadow-md 
        transition-all duration-200 ${hoverStyle} ${cursorStyle} ${visualStyle}
        ${isSmall ? 'w-28 h-[9.5rem]' : 'w-36 h-[12rem]'} 
        ${droppable.isOver ? 'ring-2 ring-orange-500' : ''} 
        ${teamBorderColor} border-b-4 
      `}
      onContextMenu={handleRightClick} 
      {...draggable.listeners} 
      {...draggable.attributes} 
    >
      
      <Image 
        src={rarityBgUrl} 
        alt={`${character.rarity} Background`} 
        layout="fill" 
        objectFit="cover" 
        className="z-0"
      />

      <div className={`absolute z-10 
                      ${isSmall ? 'bottom-[-10px] left-[-15px] w-[130px] h-[130px]' : 'bottom-[-15px] left-[-20px] w-[170px] h-[170px]'}`}> 
        <Image 
          src={character.imageUrl} 
          alt={character.name} 
          layout="fill" 
          objectFit="contain" 
        />
      </div>

      <div className="absolute top-1 left-1 right-1 flex justify-between items-center z-20 px-1">

        <span className={`bg-black/70 ${rarityColor} font-bold rounded px-1.5 py-0.5 text-xs shadow-md`}>
          {character.rarity}
        </span>
        <span className="bg-black/70 text-gray-200 text-xs font-semibold rounded-full px-2 py-0.5 shadow-md">
          {character.position}
        </span>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-20 p-1 bg-gradient-to-t from-black/70 via-black/50 to-transparent">
        <h3 className={`font-bold truncate text-left text-white ${isSmall ? 'text-xs' : 'text-sm'}`}>
          {character.name}
        </h3>
      </div>
    </div>
  );
}