"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { motion } from "framer-motion";
import { useDragContext } from "@/contexts/DragContext";
import { useTeamStore } from "@/stores/useTeamStore";
import { Position } from "@/types";

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
  const { activeDragItem, overId } = useDragContext();
  const isClickable = !!onSlotClick;
  const isLibero = positionName.toLowerCase().includes("líbero");

  const isPositionFree = useTeamStore((s) => s.isPositionFree);

  // ✅ Verifica se este slot é válido para o personagem sendo arrastado
  const isValidDrop = React.useMemo(() => {
    if (!activeDragItem) return false;

    const acceptedPosition = dropData.acceptedPosition as Position | undefined;
    const slotKey = dropData.slotKey as string | undefined;

    // Slot de líbero
    if (slotKey === "libero") {
      return activeDragItem.position === "L";
    }

    // Líberos só podem ir para slot de líbero
    if (activeDragItem.position === "L") {
      return false;
    }

    // Se não tem posição aceita definida, aceita (bench)
    if (!acceptedPosition) {
      return true;
    }

    // Modo posição livre: aceita qualquer posição exceto L
    if (isPositionFree) {
      return true;
    }

    // Modo restrito: valida posição
    return activeDragItem.position === acceptedPosition;
  }, [activeDragItem, dropData, isPositionFree]);

  // ✅ Determina se deve mostrar feedback visual
  const showValidFeedback = overId === dropId && isValidDrop && activeDragItem !== null;
  const showInvalidFeedback = overId === dropId && !isValidDrop && activeDragItem !== null;

  const handleClick = () => {
    if (isClickable) onSlotClick?.(dropId);
  };

  return (
    <motion.div
      ref={droppable.setNodeRef}
      onClick={handleClick}
      whileHover={!activeDragItem ? { scale: 1.05, y: -4 } : {}}
      whileTap={{ scale: 0.98 }}
      animate={
        showValidFeedback
          ? {
              scale: 1.1,
              boxShadow: "0 0 20px rgba(125, 211, 252, 0.6)",
              borderColor: "rgba(125, 211, 252, 0.8)",
            }
          : showInvalidFeedback
          ? {
              scale: 1.05,
              boxShadow: "0 0 20px rgba(239, 68, 68, 0.4)",
              borderColor: "rgba(239, 68, 68, 0.6)",
            }
          : {}
      }
      transition={{ duration: 0.2 }}
      className={`team-slot ${isClickable ? "clickable" : ""} ${
        isLibero ? "libero" : ""
      } ${showValidFeedback ? "team-slot--valid" : ""} ${
        showInvalidFeedback ? "team-slot--invalid" : ""
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
