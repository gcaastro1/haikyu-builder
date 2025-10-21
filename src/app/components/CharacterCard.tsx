// /app/components/CharacterCard.tsx
"use client"; 

import Image from 'next/image';
import { Character } from '../../../data/characters'; 
import React from 'react'; 
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { getTeamBorderColor } from '../lib/teamColors';

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
  const draggable = useDraggable({
    id: dragId,
    data: dragData,
    disabled: isDisabled, 
  });
  const droppable = useDroppable({
    id: dragId, 
    data: dropData || dragData, 
  });

  const style = draggable.transform ? {
    transform: `translate3d(${draggable.transform.x}px, ${draggable.transform.y}px, 0)`,
  } : undefined;

  const handleRightClick = (e: React.MouseEvent) => {
    if (onRemoveCharacter) {
      e.preventDefault(); 
      onRemoveCharacter();
    }
  };

  const isSmall = size === 'small';
  const teamBorderColor = getTeamBorderColor(character.school);

  let cursorStyle = 'cursor-default';
  let hoverStyle = '';
  let visualStyle = ''; 
  if (onRemoveCharacter) { 
    cursorStyle = 'cursor-pointer'; 
    hoverStyle = 'hover:shadow-lg'; 
  } else if (!isDisabled) {
    cursorStyle = 'cursor-grab';
    hoverStyle = 'hover:shadow-lg';
  } else {
    cursorStyle = 'cursor-not-allowed';
    visualStyle = 'opacity-40 grayscale';
  }
  
  if (draggable.isDragging) { 
    return (
      <div 
        ref={draggable.setNodeRef} 
        style={style}
        className={`border-2 border-dashed rounded-lg bg-gray-800
                   ${isSmall ? 'w-28 h-[9.5rem]' : 'w-36 h-[12rem]'}`}
      />
    );
  }

  return (
    <div 
      ref={(node) => { 
        draggable.setNodeRef(node); 
        droppable.setNodeRef(node);
      }}
      style={style}
      className={`
        bg-gray-800 shadow-md rounded-lg
        flex flex-col 
        overflow-hidden 
        transition-all ${hoverStyle} ${cursorStyle} ${visualStyle}
        ${isSmall ? 'w-28 h-[9.5rem]' : 'w-36 h-[12rem]'}
        ${droppable.isOver ? 'ring-2 ring-sky-500' : ''} 
        ${teamBorderColor} border-b-4 
      `}
      onContextMenu={handleRightClick} 
      {...draggable.listeners} 
      {...draggable.attributes} 
    >
      
      <div className={`p-2 ${isSmall ? 'p-1.5' : 'p-2'}`}>
        <h3 className={`font-bold truncate text-left ${isSmall ? 'text-xs' : 'text-sm'}`}>
          {character.name}
        </h3>
        <div className="flex justify-between items-center mt-1">
          <span className={`text-xs font-semibold ${
              character.rarity === 'UR' ? 'text-orange-400' : 'text-purple-400'
          }`}>
            {character.rarity}
          </span>
          <span className="bg-gray-600 text-gray-200 text-xs font-semibold 
                         rounded-full px-2 py-0.5 whitespace-nowrap">
            {character.position}
          </span>
        </div>
      </div>
      
      <div className="flex-grow w-full h-full relative">
        <Image 
          src={character.imageUrl} 
          alt={character.name} 
          layout="fill" 
          objectFit="cover" 
          className="bg-gray-600"
        />
      </div>
    </div>
  );
}