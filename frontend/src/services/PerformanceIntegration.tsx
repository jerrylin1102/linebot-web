/**
 * 性能優化整合層 - 將所有性能優化功能整合到現有系統
 */

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { globalPerformanceMonitor } from './PerformanceMonitor';
import { globalMemoryManager } from './MemoryManager';
import { globalNetworkOptimizer } from './NetworkOptimizer';
import { globalDragDropManager } from '../components/visual-editor/OptimizedDragDrop';
import { globalLoadingManager } from '../components/ui/LoadingSystem';
import { globalPerformanceTester } from './PerformanceTester';

interface PerformanceContextValue {
  isOptimized: boolean;
  performanceScore: number;
  enablePerformanceMode: () => void;
  disablePerformanceMode: () => void;
  getSystemStatus: () => SystemStatus;
}

interface SystemStatus {
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

const PerformanceContext = createContext<PerformanceContextValue | null>(null);

export const usePerformance = () => {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within PerformanceProvider');
  }
  return context;
};

/**
 * 性能優化提供者 - 全局性能管理
 */
export const PerformanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOptimized, setIsOptimized] = useState(false);
  const [performanceScore, setPerformanceScore] = useState(100);

  useEffect(() => {
    // 初始化性能監控
    initializePerformanceSystem();

    // 設置定期更新
    const updateInterval = setInterval(updatePerformanceMetrics, 5000);

    // 清理函數
    return () => {
      clearInterval(updateInterval);
      cleanupPerformanceSystem();
    };
  }, []);

  const initializePerformanceSystem = () => {
    // 啟動所有監控服務
    globalPerformanceMonitor.startMonitoring?.();
    globalMemoryManager.startMonitoring();
    
    // 設置性能回調
    globalPerformanceMonitor.onPerformanceChange?.((report) => {
      setPerformanceScore(report.score);
      
      // 自動啟用性能模式
      if (report.score < 75 && !isOptimized) {
        enablePerformanceMode();
      }
    });

    // 初始性能測試
    setTimeout(() => {
      globalPerformanceTester.runTest('page_load_time').catch(console.warn);
    }, 2000);
  };

  const cleanupPerformanceSystem = () => {
    globalPerformanceMonitor.stopMonitoring?.();
    globalMemoryManager.stopMonitoring();
    globalDragDropManager.cleanup();
  };

  const updatePerformanceMetrics = () => {
    const report = globalPerformanceMonitor.getPerformanceReport();
    setPerformanceScore(report.score);
  };

  const enablePerformanceMode = () => {
    setIsOptimized(true);
    
    // 啟用各種優化
    console.log('啟用性能優化模式');
    
    // 記憶體優化
    globalMemoryManager.optimizeMemory();
    
    // 清理過期快取
    globalNetworkOptimizer.clearCache();
    
    // 顯示載入提示
    globalLoadingManager.show('performance_optimization', {
      message: '正在優化系統性能...',
      type: 'spinner',
      overlay: false
    });

    setTimeout(() => {
      globalLoadingManager.hide('performance_optimization');
    }, 2000);
  };

  const disablePerformanceMode = () => {
    setIsOptimized(false);
    console.log('關閉性能優化模式');
  };

  const getSystemStatus = (): SystemStatus => {
    const performanceReport = globalPerformanceMonitor.getPerformanceReport();
    const memoryReport = globalMemoryManager.getMemoryReport();
    const networkStats = globalNetworkOptimizer.getStats();
    const cacheStatus = globalNetworkOptimizer.getCacheStatus();

    return {
      performance: {
        score: performanceReport.score,
        status: performanceReport.overall
      },
      memory: {
        usage: memoryReport.current.usedJSHeapSize,
        alerts: memoryReport.alerts.length,
        leaks: memoryReport.leaks.length
      },
      network: {
        hitRate: (networkStats.cacheHits / (networkStats.cacheHits + networkStats.cacheMisses) || 0) * 100,
        responseTime: networkStats.averageResponseTime,
        failedRequests: networkStats.failedRequests
      },
      cache: {
        size: cacheStatus.size,
        entries: cacheStatus.entries
      }
    };
  };

  const contextValue: PerformanceContextValue = {
    isOptimized,
    performanceScore,
    enablePerformanceMode,
    disablePerformanceMode,
    getSystemStatus
  };

  return (
    <PerformanceContext.Provider value={contextValue}>
      {children}
    </PerformanceContext.Provider>
  );
};

/**
 * 性能優化 HOC - 為組件添加性能監控
 */
export const withPerformanceMonitoring = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) => {
  return React.memo((props: P) => {
    const [renderCount, setRenderCount] = useState(0);
    const renderStartTime = useRef<number>(0);

    useEffect(() => {
      renderStartTime.current = performance.now();
      setRenderCount(prev => prev + 1);
    });

    useEffect(() => {
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
        const cached = globalNetworkOptimizer.getCacheStatus();
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
  }, dependencies);

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

  if (options?.throttle) {
    return React.useMemo(() => {
      if (throttleTimer.current) {
        clearTimeout(throttleTimer.current);
      }
      
      throttleTimer.current = setTimeout(() => {
        // 這裡可以實現節流邏輯
      }, options.throttle);
      
      return render();
    }, [render, options.throttle]);
  }

  return render();
};

/**
 * 效能優化設定組件
 */
export const PerformanceSettings: React.FC = () => {
  const { isOptimized, performanceScore, enablePerformanceMode, disablePerformanceMode, getSystemStatus } = usePerformance();
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [autoOptimize, setAutoOptimize] = useState(true);

  useEffect(() => {
    const updateStatus = () => {
      setSystemStatus(getSystemStatus());
    };

    updateStatus();
    const interval = setInterval(updateStatus, 3000);
    return () => clearInterval(interval);
  }, [getSystemStatus]);

  useEffect(() => {
    // 自動優化邏輯
    if (autoOptimize && performanceScore < 70 && !isOptimized) {
      enablePerformanceMode();
    }
  }, [autoOptimize, performanceScore, isOptimized, enablePerformanceMode]);

  if (!systemStatus) return null;

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">性能優化設定</h3>
      
      {/* 性能分數 */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">整體性能分數</span>
          <span className={`text-lg font-bold ${
            performanceScore >= 90 ? 'text-green-600' :
            performanceScore >= 75 ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {performanceScore}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              performanceScore >= 90 ? 'bg-green-600' :
              performanceScore >= 75 ? 'bg-yellow-600' :
              'bg-red-600'
            }`}
            style={{ width: `${performanceScore}%` }}
          />
        </div>
      </div>

      {/* 系統狀態 */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-sm">
          <div className="font-medium">記憶體使用</div>
          <div className="text-gray-600">
            {Math.round(systemStatus.memory.usage / 1024 / 1024)} MB
          </div>
        </div>
        <div className="text-sm">
          <div className="font-medium">快取命中率</div>
          <div className="text-gray-600">
            {systemStatus.network.hitRate.toFixed(1)}%
          </div>
        </div>
        <div className="text-sm">
          <div className="font-medium">網路回應</div>
          <div className="text-gray-600">
            {Math.round(systemStatus.network.responseTime)} ms
          </div>
        </div>
        <div className="text-sm">
          <div className="font-medium">快取大小</div>
          <div className="text-gray-600">
            {Math.round(systemStatus.cache.size / 1024)} KB
          </div>
        </div>
      </div>

      {/* 控制選項 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">效能優化模式</span>
          <button
            onClick={isOptimized ? disablePerformanceMode : enablePerformanceMode}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              isOptimized
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {isOptimized ? '已啟用' : '啟用'}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">自動優化</span>
          <button
            onClick={() => setAutoOptimize(!autoOptimize)}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              autoOptimize
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {autoOptimize ? '開啟' : '關閉'}
          </button>
        </div>
      </div>

      {/* 警告和建議 */}
      {systemStatus.memory.alerts > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <div className="text-sm text-yellow-800">
            檢測到 {systemStatus.memory.alerts} 個記憶體警告
          </div>
        </div>
      )}

      {systemStatus.memory.leaks > 0 && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded">
          <div className="text-sm text-red-800">
            檢測到 {systemStatus.memory.leaks} 個潛在記憶體洩漏
          </div>
        </div>
      )}
    </div>
  );
};

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