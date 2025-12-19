"use client";

import { getRarityBackground } from "@/app/lib/rarityBackgrounds";
import { DragContextProvider } from "@/contexts/DragContext";
import { useDragHandlers } from "@/hooks/useDragHandlers";
import { useTeamStore } from "@/stores/useTeamStore";
import { DndContext, DragOverlay, DropAnimation, PointerSensor, defaultDropAnimationSideEffects, rectIntersection, useSensor, useSensors } from "@dnd-kit/core";
import Image from "next/image";
import React, { useCallback, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

type DragDropProviderProps = {
  children: React.ReactNode;
};

const dropAnimationConfig: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.5",
      },
    },
  }),
  duration: 200,
  easing: "ease-out",
};

export function DragDropProvider({ children }: DragDropProviderProps) {
  const { team, isPositionFree } = useTeamStore(
    useShallow((s) => ({
      team: s.team,
      isPositionFree: s.isPositionFree,
    }))
  );

  const teamCharacterNames = useMemo(
    () =>
      new Set(
        Object.values(team)
          .filter(Boolean)
          .map((c) => c!.name)
      ),
    [team]
  );

  const { 
    activeDragItem, 
    overId,
    handleDragStart, 
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  } = useDragHandlers(team, teamCharacterNames, isPositionFree);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
        delay: 100,
      },
    })
  );

  const renderDragOverlay = useCallback(() => {
    if (!activeDragItem) return null;

    const rarityBg = getRarityBackground(activeDragItem.rarity!);

    return (
      <div className="drag-overlay__container">
        <Image
          src={rarityBg}
          alt=""
          fill
          className="drag-overlay__image"
          sizes="120px"
          priority
        />
        <Image
          src={activeDragItem.image_url || "/images/placeholder.png"}
          alt={activeDragItem.name}
          fill
          className="drag-overlay__image"
          sizes="120px"
          priority
        />
        <div className="drag-overlay__label">
          <div className="drag-overlay__name">
            {activeDragItem.name}
          </div>
        </div>
      </div>
    );
  }, [activeDragItem]);

  const dragContextValue = useMemo(
    () => ({
      activeDragItem: activeDragItem
        ? { id: activeDragItem.id, position: activeDragItem.position || "" }
        : null,
      overId,
    }),
    [activeDragItem, overId]
  );

  return (
    <DragContextProvider value={dragContextValue}>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
        collisionDetection={rectIntersection}
      >
        {children}
        <DragOverlay dropAnimation={dropAnimationConfig}>
          {renderDragOverlay()}
        </DragOverlay>
      </DndContext>
    </DragContextProvider>
  );
}

