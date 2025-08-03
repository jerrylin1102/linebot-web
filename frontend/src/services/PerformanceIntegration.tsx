/**
 * 性能優化整合層 - 將所有性能優化功能整合到現有系統
 */

import React, { useEffect, useState, useCallback } from 'react';
import { globalPerformanceMonitor } from './PerformanceMonitor';
import { globalMemoryManager } from './MemoryManager';
import { globalNetworkOptimizer } from './NetworkOptimizer';
import { globalDragDropManager } from './dragDropManager';
import { globalLoadingManager } from './loadingManager';
import { globalPerformanceTester } from './PerformanceTester';
import { SystemStatus, PerformanceContextValue } from '../hooks/usePerformance';
import { PerformanceContext, usePerformance } from './PerformanceContext';


/**
 * 性能優化提供者 - 全局性能管理
 */
export const PerformanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOptimized, setIsOptimized] = useState(false);
  const [performanceScore, setPerformanceScore] = useState(100);

  const initializePerformanceSystem = useCallback(() => {
    // 啟動所有監控服務
    globalPerformanceMonitor.startMonitoring?.();
    globalMemoryManager.startMonitoring();
    
    // 設置性能回調
    globalPerformanceMonitor.onPerformanceChange?.((report) => {
      setPerformanceScore(report.score);
      
      // 自動啟用性能模式
      if (report.score < 75 && !isOptimized) {
        setIsOptimized(true);
        console.log('啟用性能優化模式 (自動)');
        globalMemoryManager.optimizeMemory();
        globalNetworkOptimizer.clearCache();
      }
    });

    // 初始性能測試
    setTimeout(() => {
      globalPerformanceTester.runTest('page_load_time').catch(console.warn);
    }, 2000);
  }, [isOptimized]);

  const cleanupPerformanceSystem = useCallback(() => {
    globalPerformanceMonitor.stopMonitoring?.();
    globalMemoryManager.stopMonitoring();
    globalDragDropManager.cleanup();
  }, []);

  const updatePerformanceMetrics = useCallback(() => {
    const report = globalPerformanceMonitor.getPerformanceReport();
    setPerformanceScore(report.score);
  }, []);

  const enablePerformanceMode = useCallback(() => {
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
  }, []);

  const disablePerformanceMode = useCallback(() => {
    setIsOptimized(false);
    console.log('關閉性能優化模式');
  }, []);

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
  }, [initializePerformanceSystem, updatePerformanceMetrics, cleanupPerformanceSystem]);

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

  if (!systemStatus) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="text-center text-gray-500">正在載入系統狀態...</div>
      </div>
    );
  }

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

