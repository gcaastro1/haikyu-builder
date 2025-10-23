import { useDroppable } from '@dnd-kit/core';

type TeamSlotProps = {
  positionName: string;
  onSlotClick?: () => void;
  dropId: string;
  dropData: Record<string, any>;
};

export function TeamSlot({
  positionName,
  onSlotClick,
  dropId,
  dropData
}: TeamSlotProps) {

  const droppable = useDroppable({ id: dropId, data: dropData });
  const isClickable = !!onSlotClick;

  return (
    <div
      ref={droppable.setNodeRef}
      onClick={onSlotClick}
      className={`
        bg-gray-800 shadow-md rounded-lg
        flex flex-col items-center justify-center
        transition-all
        ${isClickable ? "cursor-pointer hover:bg-gray-700 hover:border-sky-500" : ""}
        ${droppable.isOver ? 'bg-sky-500/30 border-sky-500' : 'border-gray-600'}

        border-2

        w-24 h-[8rem] sm:w-28 sm:h-[9.5rem]
      `}
    >
      <span className="text-gray-400 font-semibold text-center text-xs sm:text-sm px-1"> 
        {positionName}
      </span>
    </div>
  );
}