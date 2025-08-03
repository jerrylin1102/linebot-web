/**
 * 虛擬化積木列表 Hook
 */

import { useState, useCallback, useEffect } from 'react';
import { globalPerformanceMonitor } from '../services/PerformanceMonitor';
import { UnifiedBlock as Block } from '../types/block';

export const useVirtualizedBlockList = (
  blocks: Block[],
  options: {
    searchTerm?: string;
    categoryFilter?: string;
    pageSize?: number;
  } = {}
) => {
  const [visibleBlocks, setVisibleBlocks] = useState<Block[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const pageSize = options.pageSize || 50;

  const loadMoreBlocks = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    
    try {
      await globalPerformanceMonitor.measureAsyncFunction('load_more_blocks', async () => {
        // 模擬異步載入
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const currentLength = visibleBlocks.length;
        const nextBlocks = blocks.slice(currentLength, currentLength + pageSize);
        
        if (nextBlocks.length > 0) {
          setVisibleBlocks(prev => [...prev, ...nextBlocks]);
        }
        
        setHasMore(currentLength + nextBlocks.length < blocks.length);
      });
    } finally {
      setLoading(false);
    }
  }, [blocks, loading, hasMore, visibleBlocks.length, pageSize]);

  // 重置可見積木
  const resetBlocks = useCallback(() => {
    const initialBlocks = blocks.slice(0, pageSize);
    setVisibleBlocks(initialBlocks);
    setHasMore(blocks.length > pageSize);
  }, [blocks, pageSize]);

  // 當積木或過濾條件變化時重置
  useEffect(() => {
    resetBlocks();
  }, [resetBlocks, options.searchTerm, options.categoryFilter]);

  return {
    visibleBlocks,
    hasMore,
    loading,
    loadMoreBlocks,
    resetBlocks
  };
};