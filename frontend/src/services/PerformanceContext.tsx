/**
 * 性能優化 Context - 分離的 context 和 hook
 */

import { createContext, useContext } from 'react';
import { PerformanceContextValue } from '../hooks/usePerformance';

export const PerformanceContext = createContext<PerformanceContextValue | null>(null);

export const usePerformance = () => {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within PerformanceProvider');
  }
  return context;
};