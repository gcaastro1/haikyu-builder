"use client";

import { getRarityBackground } from "@/app/lib/rarityBackgrounds";
import { Character } from "@/types";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { motion } from "framer-motion";
import Image from "next/image";
import React from "react";

type CharacterCardSmallProps = {
  character: Character;
  onRemoveCharacter?: () => void;
  isDisabled?: boolean;
  dragId?: string;
  dragData?: Record<string, unknown>;
  dropData?: Record<string, unknown>;
};

export const CharacterCardSmall = React.memo(function CharacterCardSmall({
  character,
  onRemoveCharacter,
  isDisabled = false,
  dragId,
  dragData,
  dropData,
}: CharacterCardSmallProps) {
  const dragIdMemo = React.useMemo(() => dragId || `card-small-${character.id}`, [dragId, character.id]);

  const draggable = useDraggable({
    id: dragIdMemo,
    data: dragData,
    disabled: isDisabled || !dragId,
  });

  const droppable = useDroppable({
    id: dragIdMemo,
    data: dropData || dragData,
    disabled: !dragId,
  });

  const style = draggable.transform
    ? {
        transform: `translate3d(${draggable.transform.x}px, ${draggable.transform.y}px, 0)`,
        willChange: "transform",
      }
    : undefined;

  const handleRightClick = (e: React.MouseEvent) => {
    if (onRemoveCharacter) {
      e.preventDefault();
      onRemoveCharacter();
    }
  };

  const rarityBg = getRarityBackground(character.rarity!);
  const cursorClass = isDisabled
    ? "disabled"
    : dragId
    ? "draggable"
    : "clickable";

  const setNodeRef = React.useCallback((node: HTMLElement | null) => {
    draggable.setNodeRef(node);
    droppable.setNodeRef(node);
  }, [draggable, droppable]);

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      onContextMenu={handleRightClick}
      className={`character-card-small ${cursorClass} ${
        droppable.isOver ? "character-card-small--over" : ""
      }`}
      {...(dragId ? draggable.listeners : {})}
      {...(dragId ? draggable.attributes : {})}
      whileHover={!isDisabled ? { scale: 1.03, y: -2 } : {}}
      whileTap={!isDisabled ? { scale: 0.95 } : {}}
      layout={false}
    >
      <div className="character-card-small__inner">
        <div className="character-card-small__front">
          <Image
            src={rarityBg}
            alt=""
            fill
            className="character-card-small__background"
            sizes="(max-width: 640px) 26vw, (max-width: 1024px) 14vw, 10vw"
            unoptimized
          />
          <Image
            src={character.image_url || "/images/placeholder.png"}
            alt={character.name}
            fill
            className="character-card-small__image"
            sizes="(max-width: 640px) 26vw, (max-width: 1024px) 14vw, 10vw"
            unoptimized
          />

          <div className="character-card-small__overlay" />

          <div className="character-card-small__footer">
            <div
              className={`character-card-small__position-badge ${
                character.rarity
                  ? `character-card-small__position-badge--${character.rarity.toLowerCase()}`
                  : ""
              }`}
            >
              <span>{character.position}</span>
            </div>
            <h3 className="character-card-small__name" title={character.name}>
              {character.name}
            </h3>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

