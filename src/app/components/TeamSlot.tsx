"use client";

import { useDroppable } from "@dnd-kit/core";
import { motion } from "framer-motion";

type TeamSlotProps = {
  positionName: string;
  dropId: string;
  dropData: Record<string, unknown>;
  onSlotClick?: (slotIdentifier: string) => void;
};

export function TeamSlot({
  positionName,
  dropId,
  dropData,
  onSlotClick,
}: TeamSlotProps) {
  const droppable = useDroppable({ id: dropId, data: dropData });
  const isClickable = !!onSlotClick;
  const isLibero = positionName.toLowerCase().includes("líbero");

  const handleClick = () => {
    if (isClickable) onSlotClick?.(dropId);
  };

  return (
    <motion.div
      ref={droppable.setNodeRef}
      onClick={handleClick}
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={`team-slot ${isClickable ? "clickable" : ""} ${
        isLibero ? "libero" : ""
      }`}
    >
      {isLibero && (
        <div className="team-slot__highlight">
          <div className="team-slot__glow" />
        </div>
      )}

      <span className="team-slot__label">{positionName}</span>
    </motion.div>
  );
}
