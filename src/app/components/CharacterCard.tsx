"use client";

import Image from "next/image";
import React from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import {
  getRarityBackground,
  getRarityBorderColor,
  getRarityColor,
} from "../lib/rarityBackgrounds";
import { Character, DoubleClickOrigin, SlotKey } from "@/types"


type CharacterCardProps = {
  character: Character;
  onRemoveCharacter?: () => void;
  isDisabled?: boolean;
  dragId?: string;
  dragData?: Record<string, unknown>;
  dropData?: Record<string, unknown>;
  originType: DoubleClickOrigin;
  originKey?: SlotKey;

  onClick?: (slotIdentifier: string) => void;
};

export function CharacterCard({
  character,
  onRemoveCharacter,
  isDisabled = false,
  dragId,
  dragData,
  dropData,
  originType,
  originKey,
  onClick,
}: CharacterCardProps) {
  const isDraggable = !!dragId;
  const draggable = useDraggable({
    id: dragId || `card-${character.id}`,
    data: dragData,
    disabled: isDisabled || !isDraggable,
  });
  const droppable = useDroppable({
    id: dragId || `card-${character.id}`,
    data: dropData || dragData,
    disabled: !isDraggable,
  });

  const style = draggable.transform
    ? {
        transform: `translate3d(${draggable.transform.x}px, ${draggable.transform.y}px, 0)`,
      }
    : undefined;

  const handleRightClick = (e: React.MouseEvent) => {
    if (onRemoveCharacter) {
      e.preventDefault();
      onRemoveCharacter();
    }
  };

const handleClick = () => {
  if (onClick && !isDisabled && (originType === 'court' || originType === 'bench')) {
    if (dragId) {
      onClick(dragId);
    }
  }
};

  const rarityBgUrl = getRarityBackground(character.rarity);
  const rarityBorderColor = getRarityBorderColor(character.rarity);

  let cursorStyle = "cursor-default";
  if (isDisabled) {
    cursorStyle = "cursor-not-allowed";
  } else if (isDraggable) {
    cursorStyle = "cursor-grab";
  } else if (onClick) {
    cursorStyle = "cursor-pointer";
  }

  const visualStyle = isDisabled ? "opacity-40 grayscale" : "";
  const hoverStyle =
    !isDisabled && (onRemoveCharacter || dragData?.type === "list")
      ? "hover:shadow-lg hover:scale-[1.03]"
      : ""; 
      
  const rarityColor = getRarityColor(character.rarity);

  if (draggable.isDragging) {
    return (
      <div
        ref={draggable.setNodeRef}
        style={style}
        className={`border-2 border-dashed rounded-lg bg-gray-800
                         w-24 h-[8rem] sm:w-28 sm:h-[9.5rem]`}
      />
    );
  }

  return (
    <div
      ref={(node) => { draggable.setNodeRef(node); droppable.setNodeRef(node); }}
      style={style}
      className={`
        relative rounded-lg overflow-hidden shadow-md
        flex flex-col
        transition-all duration-200 ${hoverStyle} ${cursorStyle} ${visualStyle}
        ${droppable.isOver ? 'ring-2 ring-orange-500' : ''}
        border-2 ${rarityBorderColor}

        w-24 h-[8rem] sm:w-28 sm:h-[9.5rem]
      `}
      onContextMenu={handleRightClick}
      onClick={handleClick}
      {...(isDraggable ? draggable.listeners : {})}
      {...(isDraggable ? draggable.attributes : {})}
    >
      <Image src={rarityBgUrl} alt={`${character.rarity} Background`} layout="fill" objectFit="cover" className="z-0" priority={true}/>

      <Image src={character.image_url || '/images/placeholder.png'} alt={character.name} layout="fill" objectFit="cover" className="z-10" priority={true}/>

      <div className="absolute top-0.5 left-0.5 right-0.5 flex justify-between items-center z-20 px-0.5">
        <span className={`bg-black/70 ${rarityColor} font-bold rounded px-1 py-0 text-[10px] sm:text-xs shadow-md`}>
            {character.rarity}
        </span>
        <span className="bg-black/70 text-gray-200 text-[10px] sm:text-xs font-semibold rounded-full px-1.5 py-0 shadow-md"> 
            {character.position}
        </span>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/70 via-black/50 to-transparent p-1 sm:p-1.5"> 
        <h3 className={`font-bold truncate text-left text-white text-[10px] sm:text-xs`}> 
            {character.name}
        </h3>
      </div>
    </div>
  );
}
