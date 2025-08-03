/**
 * 虛擬化積木列表組件 - 優化大量積木的渲染性能
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { FixedSizeList as List, VariableSizeList, areEqual } from 'react-window';
import { blockDefinitionCache } from '../../services/CacheService';
import { globalPerformanceMonitor } from '../../services/PerformanceMonitor';
import { UnifiedBlock as Block } from '../../types/block';

interface VirtualizedBlockListProps {
  blocks: Block[];
  itemHeight?: number;
  containerHeight: number;
  onBlockSelect?: (block: Block) => void;
  onBlockDrag?: (block: Block, event: React.DragEvent) => void;
  renderBlock?: (block: Block, index: number, style: React.CSSProperties) => React.ReactNode;
  searchTerm?: string;
  categoryFilter?: string;
  enableVirtualization?: boolean;
  overscan?: number;
}

interface BlockItemProps {
  index: number;
  style: React.CSSProperties;
  data: {
    blocks: Block[];
    onBlockSelect?: (block: Block) => void;
    onBlockDrag?: (block: Block, event: React.DragEvent) => void;
    renderBlock?: (block: Block, index: number, style: React.CSSProperties) => React.ReactNode;
  };
}

// 記憶化的積木項目組件
const BlockItem = React.memo<BlockItemProps>(({ index, style, data }) => {
  const { blocks, onBlockSelect, onBlockDrag, renderBlock } = data;
  const block = blocks[index];

  const handleClick = useCallback(() => {
    onBlockSelect?.(block);
  }, [block, onBlockSelect]);

  const handleDragStart = useCallback((event: React.DragEvent) => {
    onBlockDrag?.(block, event);
  }, [block, onBlockDrag]);

  if (renderBlock) {
    return <div style={style}>{renderBlock(block, index, style)}</div>;
  }

  return (
    <div
      style={style}
      className="block-item p-2 border rounded cursor-pointer hover:bg-gray-100 transition-colors"
      onClick={handleClick}
      draggable
      onDragStart={handleDragStart}
    >
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white text-xs">
          {block.type.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="font-medium text-sm">{block.name}</div>
          <div className="text-xs text-gray-500">{block.type}</div>
        </div>
      </div>
    </div>
  );
}, areEqual);

// 可變高度積木項目組件
const VariableBlockItem = React.memo<BlockItemProps>(({ index, style, data }) => {
  const { blocks, onBlockSelect, onBlockDrag, renderBlock } = data;
  const block = blocks[index];
  const itemRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback(() => {
    onBlockSelect?.(block);
  }, [block, onBlockSelect]);

  const handleDragStart = useCallback((event: React.DragEvent) => {
    onBlockDrag?.(block, event);
  }, [block, onBlockDrag]);

  // 測量實際高度並更新虛擬列表
  useEffect(() => {
    if (itemRef.current) {
      const _height = itemRef.current.offsetHeight;
      // 這裡可以通知父組件更新高度快取
    }
  }, []);

  if (renderBlock) {
    return (
      <div ref={itemRef} style={style}>
        {renderBlock(block, index, style)}
      </div>
    );
  }

  return (
    <div
      ref={itemRef}
      style={style}
      className="block-item p-3 border rounded cursor-pointer hover:bg-gray-100 transition-colors"
      onClick={handleClick}
      draggable
      onDragStart={handleDragStart}
    >
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white">
          {block.type.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="font-medium">{block.name}</div>
          <div className="text-sm text-gray-500">{block.type}</div>
          {block.description && (
            <div className="text-xs text-gray-400 mt-1 line-clamp-2">
              {block.description}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}, areEqual);

export const VirtualizedBlockList: React.FC<VirtualizedBlockListProps> = ({
  blocks,
  itemHeight = 80,
  containerHeight,
  onBlockSelect,
  onBlockDrag,
  renderBlock,
  searchTerm = '',
  categoryFilter = '',
  enableVirtualization = true,
  overscan = 5
}) => {
  const [filteredBlocks, setFilteredBlocks] = useState<Block[]>([]);
  const [isVariableHeight, _setIsVariableHeight] = useState(false);
  const listRef = useRef<List | VariableSizeList | null>(null);
  const heightCache = useRef<Map<number, number>>(new Map());

  // 過濾和搜索積木
  const processedBlocks = useMemo(() => {
    return globalPerformanceMonitor.measureFunction('filter_blocks', () => {
      let result = blocks;

      // 類別過濾
      if (categoryFilter) {
        result = result.filter(block => 
          block.category?.toLowerCase().includes(categoryFilter.toLowerCase())
        );
      }

      // 搜索過濾
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        result = result.filter(block =>
          block.name.toLowerCase().includes(term) ||
          block.type.toLowerCase().includes(term) ||
          block.description?.toLowerCase().includes(term)
        );
      }

      return result;
    });
  }, [blocks, searchTerm, categoryFilter]);

  // 快取過濾結果
  useEffect(() => {
    const cacheKey = `filtered_blocks_${searchTerm}_${categoryFilter}_${blocks.length}`;
    const cached = blockDefinitionCache.get(cacheKey);
    
    if (cached) {
      setFilteredBlocks(cached);
    } else {
      setFilteredBlocks(processedBlocks);
      blockDefinitionCache.set(cacheKey, processedBlocks, 300000); // 5分鐘快取
    }
  }, [processedBlocks, searchTerm, categoryFilter, blocks.length]);

  // 準備虛擬列表數據
  const listData = useMemo(() => ({
    blocks: filteredBlocks,
    onBlockSelect,
    onBlockDrag,
    renderBlock
  }), [filteredBlocks, onBlockSelect, onBlockDrag, renderBlock]);

  // 獲取項目高度（可變高度列表使用）
  const getItemHeight = useCallback((index: number) => {
    const cached = heightCache.current.get(index);
    if (cached) return cached;
    
    // 根據積木內容預估高度
    const block = filteredBlocks[index];
    let estimatedHeight = itemHeight;
    
    if (block.description) {
      estimatedHeight += Math.ceil(block.description.length / 50) * 20; // 根據描述長度估算
    }
    
    heightCache.current.set(index, estimatedHeight);
    return estimatedHeight;
  }, [filteredBlocks, itemHeight]);

  // 重置高度快取
  const resetHeightCache = useCallback(() => {
    heightCache.current.clear();
    if (listRef.current) {
      listRef.current.resetAfterIndex(0);
    }
  }, []);

  // 當積木列表變化時重置快取
  useEffect(() => {
    resetHeightCache();
  }, [filteredBlocks, resetHeightCache]);

  // 滾動到指定項目
  const _scrollToItem = useCallback((index: number) => {
    if (listRef.current) {
      listRef.current.scrollToItem(index, 'center');
    }
  }, []);

  // 如果不啟用虛擬化或項目較少，使用普通渲染
  if (!enableVirtualization || filteredBlocks.length < 20) {
    return (
      <div 
        className="block-list"
        style={{ height: containerHeight, overflowY: 'auto' }}
      >
        {filteredBlocks.map((block, index) => (
          <div
            key={`${block.id}-${index}`}
            className="block-item p-2 border-b"
          >
            {renderBlock ? (
              renderBlock(block, index, {})
            ) : (
              <BlockItem
                index={index}
                style={{}}
                data={listData}
              />
            )}
          </div>
        ))}
      </div>
    );
  }

  // 使用虛擬化渲染
  if (isVariableHeight) {
    return (
      <VariableSizeList
        ref={listRef}
        height={containerHeight}
        itemCount={filteredBlocks.length}
        itemData={listData}
        itemSize={getItemHeight}
        overscanCount={overscan}
        className="block-list-virtualized"
      >
        {VariableBlockItem}
      </VariableSizeList>
    );
  }

  return (
    <List
      ref={listRef}
      height={containerHeight}
      itemCount={filteredBlocks.length}
      itemSize={itemHeight}
      itemData={listData}
      overscanCount={overscan}
      className="block-list-virtualized"
    >
      {BlockItem}
    </List>
  );
};


export default VirtualizedBlockList;