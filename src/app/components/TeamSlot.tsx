import { useDroppable } from '@dnd-kit/core'; 

type TeamSlotProps = {
  positionName: string; 
  onSlotClick?: () => void; 
  size?: 'normal' | 'small';
  dropId: string; 
  dropData: Record<string, unknown>;
};

export function TeamSlot({ 
  positionName, 
  onSlotClick, 
  size = 'normal',
  dropId,
  dropData
}: TeamSlotProps) {
  
  const droppable = useDroppable({
    id: dropId,
    data: dropData,
  });

  const isClickable = !!onSlotClick;
  const isSmall = size === 'small';

  return (
    <div 
      ref={droppable.setNodeRef} 
      onClick={onSlotClick} 
      className={`
        bg-gray-800 shadow-md rounded-lg
        flex flex-col items-center justify-center 
        border-2 border-dashed border-gray-600
        transition-all
        ${isSmall ? 'w-28 h-[9.5rem]' : 'w-36 h-[12rem]'} 
        ${isClickable ? 
          "cursor-pointer hover:bg-gray-700 hover:border-sky-500" : 
          ""
        }
        ${droppable.isOver ? 'bg-sky-500/30 border-sky-500' : ''} // <-- Usamos a nova variável
      `}
    >
      <span className="text-gray-400 font-semibold text-center px-2">
        {positionName}
      </span>
    </div>
  );
}