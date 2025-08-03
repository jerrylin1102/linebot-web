/**
 * 性能監控 HOC
 */

import React, { useEffect, useRef } from 'react';
import { globalPerformanceMonitor } from '../../services/PerformanceMonitor';
import { globalMemoryManager } from '../../services/MemoryManager';

/**
 * 性能優化 HOC - 為組件添加性能監控
 */
export const withPerformanceMonitoring = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) => {
  return React.memo((props: P) => {
    const renderCount = useRef(0);
    const renderStartTime = useRef<number>(0);

    // 在渲染開始時記錄時間
    renderStartTime.current = performance.now();
    renderCount.current += 1;

    useEffect(() => {
      // 在渲染完成後計算渲染時間
      const renderTime = performance.now() - renderStartTime.current;
      globalPerformanceMonitor.recordMetric(
        `component_render_${componentName}`,
        renderTime,
        'render'
      );
    });

    // 記憶體管理
    useEffect(() => {
      globalMemoryManager.registerComponent(componentName, {});
      return () => {
        globalMemoryManager.unregisterComponent(componentName);
      };
    }, []);

    return <WrappedComponent {...props} />;
  });
};