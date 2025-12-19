"use client";

import { getRarityBackground } from "@/app/lib/rarityBackgrounds";
import { CharacterCardProps } from "@/types/components";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { motion } from "framer-motion";
import Image from "next/image";
import React, { useState } from "react";

export const CharacterCard = React.memo(function CharacterCard({
  character,
  onRemoveCharacter,
  onClick,
  isDisabled = false,
  dragId,
  dragData,
  dropData,
  originType,
  className = "",
  variant = "default",
}: CharacterCardProps) {
  const PLACEHOLDER =
    "data:image/svg+xml;charset=utf-8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='420'><rect width='100%' height='100%' fill='black'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='16'>Sem imagem</text></svg>";
  const [flipped, setFlipped] = useState(false);
  const [memoryError, setMemoryError] = useState(false);

  const dragIdMemo = React.useMemo(() => dragId || `card-${character.id}`, [dragId, character.id]);

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

  const style = React.useMemo(() => {
    const t = draggable.transform || { x: 0, y: 0 };
    const x = Number.isFinite(t.x) ? t.x : 0;
    const y = Number.isFinite(t.y) ? t.y : 0;
    return {
      transform: `translate3d(${x}px, ${y}px, 0)`,
      willChange: "transform",
    } as React.CSSProperties;
  }, [draggable.transform]);

  const handleClick = () => {
    if (flipped) return;
    if (onClick && !isDisabled && originType === "court") {
      if (dragId) onClick(dragId);
    }
  };

  const handleDoubleClick = () => {
    if (onClick && !isDisabled && originType !== "court") {
      const id = dragId || `card-${character.id}`;
      onClick(id);
    }
  };

  const handleRightClick = (e: React.MouseEvent) => {
    if (onRemoveCharacter) {
      e.preventDefault();
      onRemoveCharacter();
    }
  };

  const rarityBg = getRarityBackground(character.rarity);
  const [imgError, setImgError] = useState(false);
  const cursorClass = isDisabled
    ? "disabled"
    : dragId
    ? "draggable"
    : "clickable";

  const styleKeys: string[] = React.useMemo(() => {
    const keys = Array.isArray(character.styles) ? character.styles : [];
    const addSetter = character.position === "S" && !keys.includes("setter");
    return addSetter ? [...keys, "setter"] : keys;
  }, [character.styles, character.position]);

  const setNodeRef = React.useCallback((node: HTMLElement | null) => {
    draggable.setNodeRef(node);
    droppable.setNodeRef(node);
  }, [draggable, droppable]);

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      onContextMenu={handleRightClick}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      className={`character-card ${cursorClass} character-card--${variant} character-card--school-${(character.school || "")
        .toString()
        .toLowerCase()
        .replace(/\s+/g, "-")} character-card--rarity-${(character.rarity || "").toString().toLowerCase()} ${
        droppable.isOver ? "character-card--over" : ""
      } ${className}`}
      {...(dragId ? draggable.listeners : {})}
      {...(dragId ? draggable.attributes : {})}
      layout={false}
    >
      <motion.div
        className="character-card__inner"
      >
        <motion.div
          className="character-card__front"
        >
          <div className="character-card__frame">
            <Image
              src={rarityBg}
              alt=""
              fill
              className="character-card__background"
              sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 25vw"
              unoptimized
            />
          </div>
          <Image
            src={imgError ? PLACEHOLDER : character.image_url || PLACEHOLDER}
            alt={character.name}
            fill
            className="character-card__image"
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 25vw"
            unoptimized
            onError={() => setImgError(true)}
          />

          <div className="character-card__overlay" />

          <div className="character-card__position-badge-container">
            <div
              className={`character-card__position-badge ${
                character.position
                  ? `character-card__position-badge--${String(character.position).toLowerCase()}`
                  : ""
              }`}
            >
              {character.position && (
                <Image
                  src={`/images/positions/${String(character.position).toLowerCase()}.png`}
                  alt={String(character.position)}
                  fill
                  sizes="24px"
                  className="character-card__position-icon"
                  unoptimized
                />
              )}
            </div>
          </div>

          <div className="character-card__info-container">
            <h3 className="character-card__name">{character.name}</h3>
            {styleKeys.length ? (
              <div className="character-card__styles">
                {styleKeys.map((styleKey: string) => (
                  <Image
                    key={styleKey}
                    src={`/images/styles/${styleKey}.png`}
                    alt={String(styleKey)}
                    width={16}
                    height={16}
                    className="character-card__style-icon"
                    unoptimized
                  />
                ))}
              </div>
            ) : null}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
});
