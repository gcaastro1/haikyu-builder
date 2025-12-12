"use client";

import { createContext, useContext } from "react";

type DragContextType = {
  activeDragItem: { id: number; position: string } | null;
  overId: string | null;
};

const DragContext = createContext<DragContextType>({
  activeDragItem: null,
  overId: null,
});

export function useDragContext() {
  return useContext(DragContext);
}

export const DragContextProvider = DragContext.Provider;


