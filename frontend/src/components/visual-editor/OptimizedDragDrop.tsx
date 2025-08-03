/**
 * 優化後的拖拽系統 - 提升拖拽性能，減少重渲染，優化大量元素拖拽
 */

import React, { useCallback, useEffect } from 'react';
import { globalPerformanceMonitor } from '../../services/PerformanceMonitor';
import { globalMemoryManager } from '../../services/MemoryManager';
import { Block } from '../../types/block';

export interface DragState {
  isDragging: boolean;
  draggedItem: Block | null;
  dragPreview: HTMLElement | null;
  initialPosition: { x: number; y: number };
  currentPosition: { x: number; y: number };
  dropZone: string | null;
}

export interface DropZoneConfig {
  id: string;
  accepts: string[];
  multiple: boolean;
  onDrop: (item: Block, position?: { x: number; y: number }) => void;
  onDragOver?: (item: Block) => boolean;
  onDragEnter?: (item: Block) => void;
  onDragLeave?: () => void;
}

export interface DragItemConfig {
  id: string;
  type: string;
  data: Block;
  onDragStart?: (item: Block) => void;
  onDragEnd?: (item: Block, success: boolean) => void;
  onDrag?: (position: { x: number; y: number }) => void;
  disabled?: boolean;
}

const DRAG_THRESHOLD = 5; // 最小拖拽距離
const SCROLL_THRESHOLD = 50; // 自動滾動觸發距離
const SCROLL_SPEED = 10; // 滾動速度

export class OptimizedDragDropManager {
  private dragState: DragState = {
    isDragging: false,
    draggedItem: null,
    dragPreview: null,
    initialPosition: { x: 0, y: 0 },
    currentPosition: { x: 0, y: 0 },
    dropZone: null
  };

  private dropZones = new Map<string, DropZoneConfig>();
  private dragItems = new Map<string, DragItemConfig>();
  private listeners = new Set<(state: DragState) => void>();
  
  private animationFrame?: number;
  private scrollInterval?: NodeJS.Timeout;
  private dragStartTimer?: NodeJS.Timeout;
  
  private readonly performanceTracker = {
    dragStartTime: 0,
    frameCount: 0,
    droppedFrames: 0
  };

  constructor() {
    this.setupGlobalListeners();
    globalMemoryManager.registerComponent('DragDropManager', this);
  }

  /**
   * 註冊拖拽項目
   */
  registerDragItem(config: DragItemConfig): () => void {
    this.dragItems.set(config.id, config);
    
    return () => {
      this.dragItems.delete(config.id);
    };
  }

  /**
   * 註冊放置區域
   */
  registerDropZone(config: DropZoneConfig): () => void {
    this.dropZones.set(config.id, config);
    
    return () => {
      this.dropZones.delete(config.id);
    };
  }

  /**
   * 開始拖拽
   */
  startDrag(itemId: string, event: MouseEvent | TouchEvent): boolean {
    const dragItem = this.dragItems.get(itemId);
    if (!dragItem || dragItem.disabled) return false;

    // 記錄性能指標
    this.performanceTracker.dragStartTime = performance.now();
    this.performanceTracker.frameCount = 0;
    this.performanceTracker.droppedFrames = 0;

    const clientPosition = this.getClientPosition(event);
    
    this.dragState = {
      isDragging: true,
      draggedItem: dragItem.data,
      dragPreview: null,
      initialPosition: clientPosition,
      currentPosition: clientPosition,
      dropZone: null
    };

    // 創建拖拽預覽
    this.createDragPreview(dragItem.data, clientPosition);
    
    // 延遲觸發拖拽開始事件，避免意外拖拽
    this.dragStartTimer = setTimeout(() => {
      dragItem.onDragStart?.(dragItem.data);
      this.notifyListeners();
    }, 100);

    return true;
  }

  /**
   * 更新拖拽位置
   */
  updateDrag(event: MouseEvent | TouchEvent): void {
    if (!this.dragState.isDragging) return;

    const clientPosition = this.getClientPosition(event);
    
    // 檢查拖拽閾值
    const distance = Math.sqrt(
      Math.pow(clientPosition.x - this.dragState.initialPosition.x, 2) +
      Math.pow(clientPosition.y - this.dragState.initialPosition.y, 2)
    );

    if (distance < DRAG_THRESHOLD) return;

    // 使用 requestAnimationFrame 優化性能
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    this.animationFrame = requestAnimationFrame(() => {
      this.performanceTracker.frameCount++;
      
      const frameStart = performance.now();
      
      this.dragState.currentPosition = clientPosition;
      
      // 更新預覽位置
      if (this.dragState.dragPreview) {
        this.updatePreviewPosition(this.dragState.dragPreview, clientPosition);
      }

      // 檢查放置區域
      this.updateDropZone(clientPosition);
      
      // 自動滾動
      this.handleAutoScroll(clientPosition);
      
      // 觸發拖拽回調
      const dragItem = this.findDragItemByData(this.dragState.draggedItem);
      dragItem?.onDrag?.(clientPosition);
      
      this.notifyListeners();

      // 性能監控
      const frameTime = performance.now() - frameStart;
      if (frameTime > 16) { // 超過16ms表示掉幀
        this.performanceTracker.droppedFrames++;
      }
    });
  }

  /**
   * 結束拖拽
   */
  endDrag(_event?: MouseEvent | TouchEvent): void {
    if (!this.dragState.isDragging) return;

    // 清理計時器
    if (this.dragStartTimer) {
      clearTimeout(this.dragStartTimer);
      this.dragStartTimer = undefined;
    }

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = undefined;
    }

    if (this.scrollInterval) {
      clearInterval(this.scrollInterval);
      this.scrollInterval = undefined;
    }

    const draggedItem = this.dragState.draggedItem;
    const dropZone = this.dragState.dropZone;
    let success = false;

    // 執行放置
    if (dropZone && draggedItem) {
      const dropZoneConfig = this.dropZones.get(dropZone);
      if (dropZoneConfig) {
        dropZoneConfig.onDrop(draggedItem, this.dragState.currentPosition);
        success = true;
      }
    }

    // 清理拖拽預覽
    if (this.dragState.dragPreview) {
      this.cleanupPreview(this.dragState.dragPreview);
    }

    // 觸發拖拽結束回調
    const dragItem = this.findDragItemByData(draggedItem);
    dragItem?.onDragEnd?.(draggedItem!, success);

    // 記錄性能指標
    const totalTime = performance.now() - this.performanceTracker.dragStartTime;
    const avgFrameTime = totalTime / this.performanceTracker.frameCount;
    
    globalPerformanceMonitor.recordMetric('drag_duration', totalTime, 'user');
    globalPerformanceMonitor.recordMetric('drag_frame_rate', 1000 / avgFrameTime, 'render');
    globalPerformanceMonitor.recordMetric('drag_dropped_frames', this.performanceTracker.droppedFrames, 'render');

    // 重置狀態
    this.dragState = {
      isDragging: false,
      draggedItem: null,
      dragPreview: null,
      initialPosition: { x: 0, y: 0 },
      currentPosition: { x: 0, y: 0 },
      dropZone: null
    };

    this.notifyListeners();
  }

  /**
   * 監聽狀態變化
   */
  subscribe(listener: (state: DragState) => void): () => void {
    this.listeners.add(listener);
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * 獲取當前拖拽狀態
   */
  getState(): DragState {
    return { ...this.dragState };
  }

  /**
   * 清理資源
   */
  cleanup(): void {
    this.endDrag();
    this.dropZones.clear();
    this.dragItems.clear();
    this.listeners.clear();
    
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    
    if (this.scrollInterval) {
      clearInterval(this.scrollInterval);
    }
  }

  private setupGlobalListeners(): void {
    document.addEventListener('mousemove', (e) => this.updateDrag(e), { passive: true });
    document.addEventListener('mouseup', (e) => this.endDrag(e));
    document.addEventListener('touchmove', (e) => this.updateDrag(e), { passive: false });
    document.addEventListener('touchend', (e) => this.endDrag(e));
    document.addEventListener('touchcancel', (e) => this.endDrag(e));
    
    // 防止拖拽時選中文字
    document.addEventListener('selectstart', (e) => {
      if (this.dragState.isDragging) {
        e.preventDefault();
      }
    });

    globalMemoryManager.registerListener('DragDropManager', () => {
      this.cleanup();
    });
  }

  private getClientPosition(event: MouseEvent | TouchEvent): { x: number; y: number } {
    if ('touches' in event) {
      const touch = event.touches[0] || event.changedTouches[0];
      return { x: touch.clientX, y: touch.clientY };
    }
    return { x: event.clientX, y: event.clientY };
  }

  private createDragPreview(item: Block, position: { x: number; y: number }): void {
    const preview = document.createElement('div');
    preview.className = 'drag-preview fixed pointer-events-none z-50 opacity-80 transform -translate-x-1/2 -translate-y-1/2';
    preview.style.left = position.x + 'px';
    preview.style.top = position.y + 'px';
    
    // 創建預覽內容
    preview.innerHTML = `
      <div class="bg-white border-2 border-blue-400 rounded-lg shadow-lg p-3 min-w-32">
        <div class="text-sm font-medium">${item.name}</div>
        <div class="text-xs text-gray-500">${item.type}</div>
      </div>
    `;

    document.body.appendChild(preview);
    this.dragState.dragPreview = preview;
  }

  private updatePreviewPosition(preview: HTMLElement, position: { x: number; y: number }): void {
    // 使用 transform 而不是修改 left/top 屬性以獲得更好的性能
    preview.style.transform = `translate(${position.x}px, ${position.y}px) translate(-50%, -50%)`;
  }

  private cleanupPreview(preview: HTMLElement): void {
    // 添加消失動畫
    preview.style.transition = 'opacity 0.2s ease-out';
    preview.style.opacity = '0';
    
    setTimeout(() => {
      if (preview.parentNode) {
        preview.parentNode.removeChild(preview);
      }
    }, 200);
  }

  private updateDropZone(position: { x: number; y: number }): void {
    const elementUnderCursor = document.elementFromPoint(position.x, position.y);
    let newDropZone: string | null = null;

    if (elementUnderCursor) {
      // 向上查找放置區域
      let element: Element | null = elementUnderCursor;
      while (element && !newDropZone) {
        const dropZoneId = element.getAttribute('data-drop-zone');
        if (dropZoneId && this.dropZones.has(dropZoneId)) {
          const dropZoneConfig = this.dropZones.get(dropZoneId)!;
          
          // 檢查是否接受當前拖拽項目
          if (this.dragState.draggedItem && 
              dropZoneConfig.accepts.includes(this.dragState.draggedItem.type)) {
            
            // 檢查自定義驗證
            const canDrop = dropZoneConfig.onDragOver?.(this.dragState.draggedItem) !== false;
            if (canDrop) {
              newDropZone = dropZoneId;
            }
          }
        }
        element = element.parentElement;
      }
    }

    // 處理放置區域變化
    if (newDropZone !== this.dragState.dropZone) {
      // 離開舊區域
      if (this.dragState.dropZone) {
        const oldDropZone = this.dropZones.get(this.dragState.dropZone);
        oldDropZone?.onDragLeave?.();
      }

      // 進入新區域
      if (newDropZone && this.dragState.draggedItem) {
        const newDropZoneConfig = this.dropZones.get(newDropZone);
        newDropZoneConfig?.onDragEnter?.(this.dragState.draggedItem);
      }

      this.dragState.dropZone = newDropZone;
    }
  }

  private handleAutoScroll(position: { x: number; y: number }): void {
    const { innerWidth, innerHeight } = window;
    const scrollContainer = document.scrollingElement || document.documentElement;

    let scrollX = 0;
    let scrollY = 0;

    // 檢查水平滾動
    if (position.x < SCROLL_THRESHOLD) {
      scrollX = -SCROLL_SPEED;
    } else if (position.x > innerWidth - SCROLL_THRESHOLD) {
      scrollX = SCROLL_SPEED;
    }

    // 檢查垂直滾動
    if (position.y < SCROLL_THRESHOLD) {
      scrollY = -SCROLL_SPEED;
    } else if (position.y > innerHeight - SCROLL_THRESHOLD) {
      scrollY = SCROLL_SPEED;
    }

    // 執行滾動
    if (scrollX !== 0 || scrollY !== 0) {
      if (!this.scrollInterval) {
        this.scrollInterval = setInterval(() => {
          scrollContainer.scrollBy(scrollX, scrollY);
        }, 16); // 60fps
      }
    } else if (this.scrollInterval) {
      clearInterval(this.scrollInterval);
      this.scrollInterval = undefined;
    }
  }

  private findDragItemByData(data: Block | null): DragItemConfig | undefined {
    if (!data) return undefined;
    
    for (const item of this.dragItems.values()) {
      if (item.data.id === data.id) {
        return item;
      }
    }
    return undefined;
  }

  private notifyListeners(): void {
    const state = this.getState();
    this.listeners.forEach(listener => {
      try {
        listener(state);
      } catch (error) {
        console.error('拖拽狀態監聽器錯誤:', error);
      }
    });
  }
}


// Optimized Draggable Component
export interface DraggableProps {
  id: string;
  type: string;
  data: Block;
  children: React.ReactNode;
  onDragStart?: (item: Block) => void;
  onDragEnd?: (item: Block, success: boolean) => void;
  onDrag?: (position: { x: number; y: number }) => void;
  disabled?: boolean;
  className?: string;
}

export const OptimizedDraggable: React.FC<DraggableProps> = React.memo(({
  id,
  type,
  data,
  children,
  onDragStart,
  onDragEnd,
  onDrag,
  disabled = false,
  className = ''
}) => {
  const { registerDragItem, startDrag, dragState } = useDragDrop();

  useEffect(() => {
    return registerDragItem({
      id,
      type,
      data,
      onDragStart,
      onDragEnd,
      onDrag,
      disabled
    });
  }, [id, type, data, onDragStart, onDragEnd, onDrag, disabled, registerDragItem]);

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (disabled) return;
    
    event.preventDefault();
    startDrag(id, event.nativeEvent);
  }, [id, disabled, startDrag]);

  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    if (disabled) return;
    
    event.preventDefault();
    startDrag(id, event.nativeEvent);
  }, [id, disabled, startDrag]);

  const isDragging = dragState.isDragging && dragState.draggedItem?.id === data.id;

  return (
    <div
      className={`${className} ${isDragging ? 'opacity-50' : ''} ${disabled ? 'cursor-not-allowed' : 'cursor-grab'}`}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      style={{
        userSelect: 'none',
        touchAction: 'none'
      }}
    >
      {children}
    </div>
  );
});

// Optimized Droppable Component
export interface DroppableProps {
  id: string;
  accepts: string[];
  multiple?: boolean;
  onDrop: (item: Block, position?: { x: number; y: number }) => void;
  onDragOver?: (item: Block) => boolean;
  onDragEnter?: (item: Block) => void;
  onDragLeave?: () => void;
  children: React.ReactNode;
  className?: string;
}

export const OptimizedDroppable: React.FC<DroppableProps> = React.memo(({
  id,
  accepts,
  multiple = false,
  onDrop,
  onDragOver,
  onDragEnter,
  onDragLeave,
  children,
  className = ''
}) => {
  const { registerDropZone, dragState } = useDragDrop();

  useEffect(() => {
    return registerDropZone({
      id,
      accepts,
      multiple,
      onDrop,
      onDragOver,
      onDragEnter,
      onDragLeave
    });
  }, [id, accepts, multiple, onDrop, onDragOver, onDragEnter, onDragLeave, registerDropZone]);

  const isValidDropTarget = dragState.isDragging && 
    dragState.draggedItem && 
    accepts.includes(dragState.draggedItem.type);
  
  const isActiveDropZone = dragState.dropZone === id;

  return (
    <div
      className={`${className} ${isActiveDropZone ? 'ring-2 ring-blue-400 bg-blue-50' : ''} ${isValidDropTarget ? 'border-dashed border-2 border-blue-300' : ''}`}
      data-drop-zone={id}
    >
      {children}
    </div>
  );
});