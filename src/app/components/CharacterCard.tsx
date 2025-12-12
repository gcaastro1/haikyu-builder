"use client";

import { getRarityBackground } from "@/app/lib/rarityBackgrounds";
import { useCharacterStore } from "@/stores/useCharacterStore";
import { Character, DoubleClickOrigin, SlotKey } from "@/types";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { motion } from "framer-motion";
import { Info } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

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

export const CharacterCard = React.memo(function CharacterCard({
  character,
  onRemoveCharacter,
  onClick,
  isDisabled = false,
  dragId,
  dragData,
  dropData,
  originType,
}: CharacterCardProps) {
  const PLACEHOLDER =
    "data:image/svg+xml;charset=utf-8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='420'><rect width='100%' height='100%' fill='black'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='16'>Sem imagem</text></svg>";
  const [flipped, setFlipped] = useState(false);
  const [memoryError, setMemoryError] = useState(false);

  // ✅ Otimização: Memoiza o ID do drag para evitar recriação
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

  // ✅ Usa transform seguro mesmo quando não há drag para evitar erros de runtime
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

  const handleFlip = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setFlipped(!flipped);
  };

  const rarityBg = getRarityBackground(character.rarity!);
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

  const memorySrc = React.useMemo(() => {
    const rarity = (character.rarity || "SSR").toString().toUpperCase();
    const nameNorm = (character.name || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^A-Za-z\s]/g, "");
    const tokens = nameNorm.trim().split(/\s+/);
    const first = tokens[0] || "";
    const last = tokens[tokens.length - 1] || "";
    const toKey = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "");
    const knownKeys = [
      "Akaashi","Azumane","Aone","Atsumu","Bokuto","Daichi","Futakuchi","Ginjima","Goshiki","Haruki",
      "Hinata","Hirugami","Hoshiumi","Iwaizumi","Kageyama","Kenma","Kentaro","Kita","Koganegawa","Komori",
      "Konoha","Kunimi","Kuro","Lev","Nishinoya","Ohira","Oikawa","Osamu","Oshiro","Rintaro","Sakusa",
      "Sasaya","Semi","Shirabu","Sugawara","Tanaka","Tatsuo","Tendo","Terushima","Tsuki","Ushijima",
      "Yaku","Yamagata","Yui"
    ];
    const found = knownKeys.find((k) => new RegExp(k, "i").test(nameNorm));
    const preferred = found || toKey(last) || toKey(first) || "";
    return preferred ? `/images/memories/Memo${preferred}${rarity}.png` : `/images/memories/Memo${character.position}.png`;
  }, [character.name, character.rarity, character.position]);

  // ✅ Otimização: Memoiza o callback de ref para evitar recriação
  const setNodeRef = React.useCallback((node: HTMLElement | null) => {
    draggable.setNodeRef(node);
    droppable.setNodeRef(node);
  }, [draggable, droppable]);

  const allPotentials = useCharacterStore((s) => s.allPotentials);
  const potentialSlots = React.useMemo(() => {
    const fourId = character.potential?.["4slots"] ?? null;
    const twoId = character.potential?.["2slots"] ?? null;
    const findPot = (id: number | null) =>
      id ? allPotentials.find((p) => p.id === id) ?? null : null;
    const four = findPot(fourId);
    const two = findPot(twoId);
    const arr: (string | null)[] = [];
    for (let i = 0; i < 4; i++) arr.push(four?.image_url ?? null);
    for (let i = 0; i < 2; i++) arr.push(two?.image_url ?? null);
    return arr;
  }, [character.potential, allPotentials]);

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      onContextMenu={handleRightClick}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      className={`character-card ${cursorClass} character-card--school-${(character.school || "")
        .toString()
        .toLowerCase()
        .replace(/\s+/g, "-")} ${
        droppable.isOver ? "character-card--over" : ""
      }`}
      {...(dragId ? draggable.listeners : {})}
      {...(dragId ? draggable.attributes : {})}
      // ✅ Otimização: Desabilita animações durante drag para melhor performance
      layout={false}
    >
      <motion.div
        className="character-card__inner"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        {/* FRONT */}
        <motion.div
          className="character-card__front"
        >
          {/** Fallback de imagem local em caso de erro */}
          {/** Usa estado para alternar para placeholder caso a imagem local não exista */}
          <Image
            src={rarityBg}
            alt=""
            fill
            className="character-card__background"
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 25vw"
            unoptimized
          />
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

          <div className="character-card__header">
            <button
              onClick={handleFlip}
              className="character-card__info"
              title="Ver detalhes"
            >
              <Info size={12} />
            </button>
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

          <div className="character-card__footer">
            <div
              className={`character-card__position-badge ${
                character.position
                  ? `character-card__position-badge--${String(character.position).toLowerCase()}`
                  : ""
              }`}
            >
              <span>{character.position}</span>
            </div>
            <h3 className="character-card__name">{character.name}</h3>
          </div>
        </motion.div>

        {/* BACK */}
        <motion.div
          className="character-card__back"
        >
          <div className="character-card__header">
            <button
              onClick={handleFlip}
              className="character-card__info"
              title="Voltar"
            >
              <Info size={12} />
            </button>
          </div>
          <div className="character-card__back-content">
            <div className="character-card__potentials">
              {potentialSlots.map((src, i) =>
                src ? (
                  <Image
                    key={i}
                    src={src}
                    alt="Potencial"
                    width={11}
                    height={11}
                    className="character-card__potential-slot"
                    unoptimized
                  />
                ) : (
                  <div key={i} className="character-card__potential-slot" />
                )
              )}
            </div>

            <div className="character-card__memory">
              <Image
                src={memoryError ? `/images/memories/Memo${character.position}.png` : memorySrc}
                alt={`Memória de ${character.name}`}
                width={160}
                height={28}
                className="character-card__memory-img"
                unoptimized
                onError={() => setMemoryError(true)}
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
});
