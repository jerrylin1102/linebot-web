/**
 * 優化快取 Hook
 */

import React, { useState, useEffect } from 'react';
import { globalPerformanceMonitor } from '../services/PerformanceMonitor';
import { globalNetworkOptimizer } from '../services/NetworkOptimizer';

/**
 * 快取輔助鉤子
 */
export const useOptimizedCache = <T,>(
  key: string,
  loader: () => Promise<T>,
  options?: {
    ttl?: number;
    refreshOnMount?: boolean;
  }
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadData = React.useCallback(async (force = false) => {
    setLoading(true);
    setError(null);

    try {
      // 檢查快取
      if (!force) {
        const _cached = globalNetworkOptimizer.getCacheStatus();
        // 這裡可以實現快取檢查邏輯
      }

      const result = await globalPerformanceMonitor.measureAsyncFunction(
        `cache_load_${key}`,
        loader
      );

      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [key, loader]);

  useEffect(() => {
    if (options?.refreshOnMount !== false) {
      loadData();
    }
  }, [loadData, options?.refreshOnMount]);

  return {
    data,
    loading,
    error,
    reload: () => loadData(true)
  };
};