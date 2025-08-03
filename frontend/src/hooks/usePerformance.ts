/**
 * 性能優化相關 Hooks
 */

import { useContext } from 'react';
import React from 'react';
import { globalPerformanceMonitor } from '../services/PerformanceMonitor';

export interface PerformanceContextValue {
  isOptimized: boolean;
  performanceScore: number;
  enablePerformanceMode: () => void;
  disablePerformanceMode: () => void;
  getSystemStatus: () => SystemStatus;
}

export interface SystemStatus {
  performance: {
    score: number;
    status: 'excellent' | 'good' | 'needs-improvement' | 'poor';
  };
  memory: {
    usage: number;
    alerts: number;
    leaks: number;
  };
  network: {
    hitRate: number;
    responseTime: number;
    failedRequests: number;
  };
  cache: {
    size: number;
    entries: number;
  };
}

export const PerformanceContext = React.createContext<PerformanceContextValue | null>(null);

export const usePerformance = () => {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within PerformanceProvider');
  }
  return context;
};

/**
 * 性能優化鉤子 - 為功能添加性能監控
 */
export const usePerformanceMonitoring = (operationName: string) => {
  const measureOperation = React.useCallback(
    <T,>(operation: () => T): T => {
      return globalPerformanceMonitor.measureFunction(operationName, operation);
    },
    [operationName]
  );

  const measureAsyncOperation = React.useCallback(
    async <T,>(operation: () => Promise<T>): Promise<T> => {
      return globalPerformanceMonitor.measureAsyncFunction(operationName, operation);
    },
    [operationName]
  );

  return {
    measureOperation,
    measureAsyncOperation
  };
};