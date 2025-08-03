/**
 * 性能優化工具集合
 */

import { PerformanceProvider, PerformanceSettings } from '../services/PerformanceIntegration';
import { withPerformanceMonitoring } from '../components/hoc/withPerformanceMonitoring';
import { usePerformance, usePerformanceMonitoring } from '../hooks/usePerformance';
import { useOptimizedCache } from '../hooks/useOptimizedCache';
import { useOptimizedRender } from '../hooks/useOptimizedRender';

// 導出整合的性能優化系統
export const PerformanceOptimization = {
  Provider: PerformanceProvider,
  Settings: PerformanceSettings,
  withMonitoring: withPerformanceMonitoring,
  useMonitoring: usePerformanceMonitoring,
  useCache: useOptimizedCache,
  useRender: useOptimizedRender,
  usePerformance
};