import { useTeamStore } from "@/stores/useTeamStore";
import { useUIStore } from "@/stores/useUIStore";
import { Character, Position, SlotKey, TeamSlots } from "@/types";
import { DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/core";
import { useCallback, useRef, useState } from "react";

type ActiveDragData = {
  character: Character;
  type: "list" | "court";
  [key: string]: any;
};

type OverDragData = {
  type: "court" | "list";
  acceptedPosition?: Position;
  slotKey?: SlotKey;
  [key: string]: any;
};

export function useDragHandlers(
  team: TeamSlots,
  teamCharacterNames: Set<string>,
  isPositionFree: boolean
) {
  const [activeDragItem, setActiveDragItem] = useState<Character | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  
  const teamRef = useRef(team);
  const isPositionFreeRef = useRef(isPositionFree);
  const teamCharacterNamesRef = useRef(teamCharacterNames);

  teamRef.current = team;
  isPositionFreeRef.current = isPositionFree;
  teamCharacterNamesRef.current = teamCharacterNames;

  const setTeam = useTeamStore((s) => s.setTeam);
  const showFeedback = useUIStore((s) => s.showFeedback);

  const isValidDrop = useCallback((draggedCharacter: Character, overData: OverDragData): boolean => {
    if (!overData) return false;

    if (overData.type === "court") {
      const targetSlotKey = overData.slotKey as SlotKey;
      const targetPosition = overData.acceptedPosition as Position;

      if (targetSlotKey === "libero") {
        return draggedCharacter.position === "L";
      }

      if (draggedCharacter.position === "L") {
        return false;
      }

      return true;
    }

    return false;
  }, []);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.character) {
      setActiveDragItem(active.data.current.character as Character);
      setOverId(null);
    }
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || !active.data.current?.character) {
      setOverId(null);
      return;
    }

    const draggedCharacter = active.data.current.character as Character;
    const overData = over.data.current as OverDragData;

    if (isValidDrop(draggedCharacter, overData)) {
      setOverId(over.id as string);
    } else {
      setOverId(null);
    }
  }, [isValidDrop]);

  const handleDragCancel = useCallback(() => {
    setActiveDragItem(null);
    setOverId(null);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveDragItem(null);
      setOverId(null);
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const activeData = active.data.current as ActiveDragData;
      const overData = over.data.current as OverDragData;
      const draggedCharacter = activeData.character;
      if (!draggedCharacter) return;

      const currentTeam = teamRef.current;
      
      const currentIsPositionFree = isPositionFreeRef.current;
      const currentTeamCharacterNames = teamCharacterNamesRef.current;

      const newTeam = { ...currentTeam };
      

      let charFromTargetSlot: Character | null = null;
      if (overData?.type === "court")
        charFromTargetSlot = currentTeam[overData.slotKey as SlotKey];

      const isSubstituting = charFromTargetSlot?.name === draggedCharacter.name;

      if (currentTeamCharacterNames.has(draggedCharacter.name) && !isSubstituting) {
        showFeedback(
          `'${draggedCharacter.name}' já está no time. Só pode substituir.`,
          "error"
        );
        return;
      }

      if (overData?.type === "court") {
        const targetPosition = overData.acceptedPosition as Position;
        const targetSlotKey = overData.slotKey as SlotKey;

        if (targetSlotKey === "libero" && draggedCharacter.position !== "L") {
          showFeedback(
            "Apenas Líberos (L) podem ir para o slot de Líbero!",
            "error"
          );
          return;
        }
        if (
          targetSlotKey !== "libero" &&
          draggedCharacter.position === "L"
        ) {
          showFeedback("Líberos só podem ir para o slot de Líbero!", "error");
          return;
        }
      }

      if (overData?.type === "court")
        newTeam[overData.slotKey as SlotKey] = draggedCharacter;
      

      if (activeData?.type === "court")
        newTeam[activeData.slotKey as SlotKey] = isSubstituting
          ? null
          : charFromTargetSlot;
      

      setTeam(newTeam);
    },
    [showFeedback, setTeam] 
  );

  return {
    activeDragItem,
    overId,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
    isValidDrop,
  };
}
