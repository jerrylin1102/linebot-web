/**
 * 優化渲染 Hook
 */

import React, { useRef } from 'react';
import { globalPerformanceMonitor } from '../services/PerformanceMonitor';

/**
 * 優化的渲染鉤子
 */
export const useOptimizedRender = <T,>(
  dependencies: T[],
  renderFn: () => React.ReactElement,
  options?: {
    throttle?: number;
    skipEqual?: boolean;
  }
) => {
  const lastDependencies = useRef<T[]>();
  const lastResult = useRef<React.ReactElement>();
  const throttleTimer = useRef<NodeJS.Timeout>();

  const shouldUpdate = React.useMemo(() => {
    if (!lastDependencies.current) return true;
    
    if (options?.skipEqual) {
      return !dependencies.every((dep, index) => 
        dep === lastDependencies.current![index]
      );
    }
    
    return true;
  }, [dependencies, options?.skipEqual]);

  const render = React.useCallback(() => {
    if (shouldUpdate) {
      const startTime = performance.now();
      const result = renderFn();
      const renderTime = performance.now() - startTime;
      
      globalPerformanceMonitor.recordMetric('optimized_render', renderTime, 'render');
      
      lastDependencies.current = [...dependencies];
      lastResult.current = result;
      
      return result;
    }
    
    return lastResult.current!;
  }, [shouldUpdate, renderFn, dependencies]);

  const throttledRender = React.useMemo(() => {
    if (options?.throttle) {
      if (throttleTimer.current) {
        clearTimeout(throttleTimer.current);
      }
      
      throttleTimer.current = setTimeout(() => {
        // 這裡可以實現節流邏輯
      }, options.throttle);
      
      return render();
    }
    
    return render();
  }, [render, options?.throttle]);

  return throttledRender;
};