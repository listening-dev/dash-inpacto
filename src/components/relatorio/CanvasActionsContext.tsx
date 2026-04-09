import React, { createContext, useContext } from 'react';

export interface CanvasActions {
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleColuna: (id: string, current: 0 | 1 | 2) => void;
  onUpdateText: (id: string, content: string) => void;
}

const CanvasActionsContext = createContext<CanvasActions | null>(null);

export const CanvasActionsProvider = CanvasActionsContext.Provider;

export function useCanvasActions(): CanvasActions {
  const ctx = useContext(CanvasActionsContext);
  if (!ctx) throw new Error('useCanvasActions deve ser usado dentro de CanvasActionsProvider');
  return ctx;
}
