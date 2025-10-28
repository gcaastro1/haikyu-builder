"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { motion } from "framer-motion";
import { Info } from "lucide-react";
import {
  getRarityBackground,
  getRarityBorderColor,
  getRarityColor,
} from "@/app/lib/rarityBackgrounds";
import { Character, DoubleClickOrigin, SlotKey } from "@/types";

type CharacterCardProps = {
  character: Character;
  onRemoveCharacter?: () => void;
  onClick?: (slotIdentifier: string) => void;
  isDisabled?: boolean;
  dragId?: string;
  dragData?: Record<string, unknown>;
  dropData?: Record<string, unknown>;
  originType: DoubleClickOrigin;
  originKey?: SlotKey;
  onAddToTeam?: (character: Character) => void;
};

export function CharacterCard({
  character,
  onRemoveCharacter,
  onClick,
  isDisabled = false,
  dragId,
  dragData,
  dropData,
  originType,
}: CharacterCardProps) {
  const [flipped, setFlipped] = useState(false);

  const draggable = useDraggable({
    id: dragId || `card-${character.id}`,
    data: dragData,
    disabled: isDisabled || !dragId,
  });

  const droppable = useDroppable({
    id: dragId || `card-${character.id}`,
    data: dropData || dragData,
    disabled: !dragId,
  });

  const style = draggable.transform
    ? {
        transform: `translate3d(${draggable.transform.x}px, ${draggable.transform.y}px, 0)`,
      }
    : undefined;

  const handleClick = () => {
    if (flipped) return;
    if (
      onClick &&
      !isDisabled &&
      (originType === "court" || originType === "bench")
    ) {
      if (dragId) onClick(dragId);
    }
  };

  const handleRightClick = (e: React.MouseEvent) => {
    if (onRemoveCharacter) {
      e.preventDefault();
      onRemoveCharacter();
    }
  };

  const handleFlip = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setFlipped(!flipped);
  };

  const rarityBg = getRarityBackground(character.rarity);
  const rarityBorder = getRarityBorderColor(character.rarity);
  const rarityColor = getRarityColor(character.rarity);
  const cursorClass = isDisabled
    ? "disabled"
    : dragId
    ? "draggable"
    : "clickable";

  return (
    <motion.div
      ref={(node) => {
        draggable.setNodeRef(node);
        droppable.setNodeRef(node);
      }}
      style={{ ...style, perspective: 1000 }}
      onContextMenu={handleRightClick}
      onClick={handleClick}
      onDoubleClick={handleFlip}
      className={`character-card ${cursorClass} ${
        droppable.isOver ? "character-card--over" : ""
      }`}
      {...(dragId ? draggable.listeners : {})}
      {...(dragId ? draggable.attributes : {})}
    >
      <motion.div
        className="character-card__inner"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* FRONT */}
        <motion.div
          className="character-card__front"
          style={{ backfaceVisibility: "hidden" }}
        >
          <Image
            src={rarityBg}
            alt=""
            fill
            className="character-card__background"
          />
          <Image
            src={character.image_url || "/images/placeholder.png"}
            alt={character.name}
            fill
            className="character-card__image"
          />

          <div className="character-card__overlay" />

          <div className="character-card__header">
            <button
              onClick={handleFlip}
              className="character-card__info"
              title="Ver detalhes"
            >
              <Info size={12} />
            </button>
          </div>

          <div className="character-card__footer">
            <div
              className={`character-card__position-badge character-card__position-badge--${character.rarity.toLowerCase()}`}
            >
              <span>{character.position}</span>
            </div>
            <h3 className="character-card__name">{character.name}</h3>
          </div>
        </motion.div>

        {/* BACK */}
        <motion.div
          className="character-card__back"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="character-card__back-content">
            <h4 className="character-card__section-title">Potenciais</h4>
            <div className="character-card__potentials">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="character-card__potential-slot" />
              ))}
            </div>

            <h4 className="character-card__section-title">Memória</h4>
            <div className="character-card__memory-slot" />
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
