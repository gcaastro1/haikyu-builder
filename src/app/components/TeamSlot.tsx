import { useDroppable } from '@dnd-kit/core';

type TeamSlotProps = {
  positionName: string;
  dropId: string; 
  dropData: Record<string, unknown>;
  onOpenSelector: (slotIdentifier: string) => void;
};

export function TeamSlot({
  positionName,
  dropId,
  dropData,
  onOpenSelector
}: TeamSlotProps) {

  const droppable = useDroppable({ id: dropId, data: dropData });
  const isClickable = !!onOpenSelector;

  return (
    <div
      ref={droppable.setNodeRef}
      onClick={() => { if(isClickable) onOpenSelector(dropId) }}
      className={`
        bg-zinc-800 shadow-md rounded-lg
        flex flex-col items-center justify-center
        border-2 ${droppable.isOver ? 'border-sky-500 bg-sky-500/10' : 'border-gray-600 border-dashed'}
        transition-all
        w-24 h-[8rem] sm:w-28 sm:h-[9.5rem] {/* Tamanhos responsivos */}
        ${isClickable ? "cursor-pointer hover:bg-zinc-700 hover:border-sky-500" : ""}
      `}
    >
      <span className="text-gray-400 font-semibold text-center text-xs sm:text-sm px-1">
        {positionName}
      </span>
    </div>
  );
}