"use client";

import { useTeamStore } from "@/stores/useTeamStore";
import { useUIStore } from "@/stores/useUIStore";
import type { Position, SlotKey, TeamSlots } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import { CharacterCard } from "./CharacterCard";
import { TeamSlot } from "./TeamSlot";

const label = (slotKey: SlotKey) => {
  switch (slotKey) {
    case "pos1_s": return "1";
    case "pos2_mb": return "2";
    case "pos3_ws": return "3";
    case "pos4_op": return "4";
    case "pos5_mb": return "5";
    case "pos6_ws": return "6";
    case "libero":  return "L";
    default:        return "";
  }
};

export function TeamCourt({
  team,
  onRemoveCharacter,
  isPositionFree: _isPositionFree,
}: {
  team: TeamSlots;
  onRemoveCharacter: (key: keyof TeamSlots) => void;
  isPositionFree: boolean;
}) {
  const openSelectionModal = useUIStore((s) => s.openSelectionModal);
  const slotOrder = useTeamStore((s) => s.slotOrder);
  const isRotating = useTeamStore((s) => s.isRotating);

  const handleSlotClick = (slotKey: SlotKey) => {
    let position: Position | "ALL" = "ALL";
    if (slotKey === "libero") position = "L";

    openSelectionModal(`court-${slotKey}`, position);
  };


  const renderSlot = (slotKey: SlotKey) => {
    const character = team[slotKey];
    const dndId = `court-${slotKey}`;
    const position = label(slotKey);
    const dndData = { 
      type: "court", 
      slotKey,
      acceptedPosition: position as Position,
    };

    return (
      <AnimatePresence mode="wait" key={slotKey}>
        {character ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 0 }}
            whileHover={{ y: -6, scale: 1.03 }} 
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <CharacterCard
              character={character}
              originType="court"
              onRemoveCharacter={() => onRemoveCharacter(slotKey)}
              dragId={dndId}
              dragData={{ ...dndData, character }}
              dropData={dndData}
            />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18 }}
          >
            <TeamSlot
              positionName={label(slotKey)}
              dropId={dndId}
              dropData={dndData}
              onSlotClick={() => handleSlotClick(slotKey)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  const top = [slotOrder[0], slotOrder[5], slotOrder[4]] as SlotKey[]; 
  const bottom = ["libero" as SlotKey, slotOrder[1], slotOrder[2], slotOrder[3]]; 

  return (
    <motion.div
      className="court"
      animate={
        isRotating
          ? { rotate: [0, 6, -6, 0], scale: [1, 0.98, 1] }
          : { rotate: 0, scale: 1 }
      }
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      <div className="court__base" />

      <div className="court__lanes">
        <div className="court__row court__row--top">
          {top.map(renderSlot)}
        </div>
        <div className="court__row court__row--bottom">
          {bottom.map(renderSlot)}
        </div>
      </div>
    </motion.div>
  );
}
