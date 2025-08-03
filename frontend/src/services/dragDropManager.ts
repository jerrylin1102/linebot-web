/**
 * 拖拽管理器和相關hook
 */

import { useState, useEffect } from 'react';
import { OptimizedDragDropManager, DragState } from '../components/visual-editor/OptimizedDragDrop';

// 全局拖拽管理器實例
export const globalDragDropManager = new OptimizedDragDropManager();

// React Hook for drag and drop
export const useDragDrop = () => {
  const [dragState, setDragState] = useState<DragState>(globalDragDropManager.getState());

  useEffect(() => {
    return globalDragDropManager.subscribe(setDragState);
  }, []);

  return {
    dragState,
    startDrag: globalDragDropManager.startDrag.bind(globalDragDropManager),
    updateDrag: globalDragDropManager.updateDrag.bind(globalDragDropManager),
    endDrag: globalDragDropManager.endDrag.bind(globalDragDropManager),
    cancelDrag: globalDragDropManager.cancelDrag.bind(globalDragDropManager),
    setPreferences: globalDragDropManager.setPreferences.bind(globalDragDropManager),
    getPreferences: globalDragDropManager.getPreferences.bind(globalDragDropManager),
    subscribe: globalDragDropManager.subscribe.bind(globalDragDropManager),
    getPerformanceMetrics: globalDragDropManager.getPerformanceMetrics.bind(globalDragDropManager),
    clearMetrics: globalDragDropManager.clearMetrics.bind(globalDragDropManager)
  };
};