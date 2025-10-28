import { useCallback, useState } from "react";
import { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { Character, Position, SlotKey, TeamSlots } from "@/types";
import { useTeamStore } from "@/stores/useTeamStore";
import { useUIStore } from "@/stores/useUIStore";

type ActiveDragData = {
  character: Character;
  type: "list" | "court" | "bench";
  [key: string]: any;
};

type OverDragData = {
  type: "court" | "bench" | "list";
  acceptedPosition?: Position;
  slotKey?: SlotKey;
  index?: number;
  [key: string]: any;
};

export function useDragHandlers(
  team: TeamSlots,
  bench: (Character | null)[],
  teamCharacterNames: Set<string>,
  isPositionFree: boolean
) {
  const [activeDragItem, setActiveDragItem] = useState<Character | null>(null);

  const setTeam = useTeamStore((s) => s.setTeam);
  const setBench = useTeamStore((s) => s.setBench);
  const showFeedback = useUIStore((s) => s.showFeedback);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.character) {
      setActiveDragItem(active.data.current.character as Character);
    }
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveDragItem(null);
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const activeData = active.data.current as ActiveDragData;
      const overData = over.data.current as OverDragData;
      const draggedCharacter = activeData.character;
      if (!draggedCharacter) return;

      const newTeam = { ...team };
      const newBench = [...bench];

      let charFromTargetSlot: Character | null = null;
      if (overData?.type === "court")
        charFromTargetSlot = team[overData.slotKey as SlotKey];
      else if (overData?.type === "bench")
        charFromTargetSlot = bench[overData.index as number];

      const isSubstituting = charFromTargetSlot?.name === draggedCharacter.name;

      if (teamCharacterNames.has(draggedCharacter.name) && !isSubstituting) {
        showFeedback(
          `'${draggedCharacter.name}' já está no time. Só pode substituir.`,
          "error"
        );
        return;
      }

      // === Validação de posição ===
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
          isPositionFree &&
          targetSlotKey !== "libero" &&
          draggedCharacter.position === "L"
        ) {
          showFeedback("Líberos só podem ir para o slot de Líbero!", "error");
          return;
        }
        if (
          !isPositionFree &&
          targetSlotKey !== "libero" &&
          draggedCharacter.position !== targetPosition
        ) {
          showFeedback(
            `Personagem (${draggedCharacter.position}) não pode ir para slot ${targetPosition}! (Modo Global)`,
            "error"
          );
          return;
        }
      }

      // === Atualização de estado ===
      if (overData?.type === "court")
        newTeam[overData.slotKey as SlotKey] = draggedCharacter;
      else if (overData?.type === "bench")
        newBench[overData.index as number] = draggedCharacter;

      if (activeData?.type === "court")
        newTeam[activeData.slotKey as SlotKey] = isSubstituting
          ? null
          : charFromTargetSlot;
      else if (activeData?.type === "bench")
        newBench[activeData.index as number] = isSubstituting
          ? null
          : charFromTargetSlot;

      setTeam(newTeam);
      setBench(newBench);
    },
    [team, bench, isPositionFree, showFeedback, teamCharacterNames, setTeam, setBench]
  );

  return {
    activeDragItem,
    handleDragStart,
    handleDragEnd,
  };
}
