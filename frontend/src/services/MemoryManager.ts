/**
 * 記憶體管理服務 - 檢測記憶體洩漏、監控使用情況、提供優化建議
 */

export interface MemorySnapshot {
  timestamp: number;
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  components: Map<string, number>;
  listeners: Map<string, number>;
  timers: number;
  cacheSize: number;
}

export interface MemoryAlert {
  id: string;
  type: 'warning' | 'critical';
  message: string;
  recommendation: string;
  timestamp: number;
  memoryUsage: number;
  threshold: number;
}

export interface LeakDetection {
  suspected: boolean;
  component?: string;
  growthRate: number;
  samples: number;
  confidence: number;
}

export interface MemoryOptimization {
  target: string;
  action: 'cleanup' | 'optimize' | 'lazy-load' | 'cache-clear';
  priority: 'high' | 'medium' | 'low';
  estimatedSaving: number;
  description: string;
}

export class MemoryManager {
  private snapshots: MemorySnapshot[] = [];
  private alerts: MemoryAlert[] = [];
  private componentRegistry = new Map<string, WeakRef<any>>();
  private listenerRegistry = new Map<string, Set<() => void>>();
  private timerRegistry = new Set<NodeJS.Timeout>();
  private observedComponents = new Map<string, number>();
  
  private readonly thresholds = {
    warning: 50 * 1024 * 1024, // 50MB
    critical: 100 * 1024 * 1024, // 100MB
    growthRate: 5 * 1024 * 1024 // 5MB/minute
  };

  private monitoringInterval?: NodeJS.Timeout;
  private isMonitoring = false;

  constructor() {
    this.startMonitoring();
    this.setupCleanupListeners();
  }

  /**
   * 開始記憶體監控
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(() => {
      this.takeSnapshot();
      this.analyzeMemoryTrends();
      this.detectMemoryLeaks();
      this.suggestOptimizations();
    }, 30000); // 每30秒檢查一次

    // 立即執行一次
    this.takeSnapshot();
  }

  /**
   * 停止記憶體監控
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
    this.isMonitoring = false;
  }

  /**
   * 註冊組件
   */
  registerComponent(name: string, component: any): void {
    this.componentRegistry.set(name, new WeakRef(component));
    this.observedComponents.set(name, (this.observedComponents.get(name) || 0) + 1);
  }

  /**
   * 取消註冊組件
   */
  unregisterComponent(name: string): void {
    const current = this.observedComponents.get(name) || 0;
    if (current > 0) {
      this.observedComponents.set(name, current - 1);
    }
    
    if (current <= 1) {
      this.componentRegistry.delete(name);
      this.observedComponents.delete(name);
    }
  }

  /**
   * 註冊事件監聽器
   */
  registerListener(component: string, cleanup: () => void): void {
    if (!this.listenerRegistry.has(component)) {
      this.listenerRegistry.set(component, new Set());
    }
    this.listenerRegistry.get(component)!.add(cleanup);
  }

  /**
   * 清理組件監聽器
   */
  cleanupListeners(component: string): void {
    const listeners = this.listenerRegistry.get(component);
    if (listeners) {
      listeners.forEach(cleanup => {
        try {
          cleanup();
        } catch (error) {
          console.warn(`清理監聽器失敗 (${component}):`, error);
        }
      });
      this.listenerRegistry.delete(component);
    }
  }

  /**
   * 註冊計時器
   */
  registerTimer(timer: NodeJS.Timeout): void {
    this.timerRegistry.add(timer);
  }

  /**
   * 清理計時器
   */
  clearTimer(timer: NodeJS.Timeout): void {
    clearTimeout(timer);
    this.timerRegistry.delete(timer);
  }

  /**
   * 清理所有計時器
   */
  clearAllTimers(): void {
    this.timerRegistry.forEach(timer => clearTimeout(timer));
    this.timerRegistry.clear();
  }

  /**
   * 強制垃圾回收（開發環境）
   */
  forceGarbageCollection(): void {
    if (window.gc && typeof window.gc === 'function') {
      window.gc();
      console.log('手動垃圾回收完成');
    } else {
      // 在開發環境中靜默處理，避免過多警告
      if (process.env.NODE_ENV === 'development') {
        // 開發環境不輸出警告，避免日誌污染
        return;
      }
      console.warn('垃圾回收不可用，需要在開發環境中啟用 --expose-gc 標誌');
    }
  }

  /**
   * 獲取當前記憶體快照
   */
  takeSnapshot(): MemorySnapshot {
    const memoryInfo = this.getMemoryInfo();
    const snapshot: MemorySnapshot = {
      timestamp: Date.now(),
      usedJSHeapSize: memoryInfo.usedJSHeapSize,
      totalJSHeapSize: memoryInfo.totalJSHeapSize,
      jsHeapSizeLimit: memoryInfo.jsHeapSizeLimit,
      components: new Map(this.observedComponents),
      listeners: new Map(Array.from(this.listenerRegistry.entries()).map(([k, v]) => [k, v.size])),
      timers: this.timerRegistry.size,
      cacheSize: this.estimateCacheSize()
    };

    this.snapshots.push(snapshot);

    // 保持最近100個快照
    if (this.snapshots.length > 100) {
      this.snapshots = this.snapshots.slice(-100);
    }

    return snapshot;
  }

  /**
   * 檢測記憶體洩漏
   */
  detectMemoryLeaks(): LeakDetection[] {
    if (this.snapshots.length < 5) {
      return [];
    }

    const leaks: LeakDetection[] = [];
    const recentSnapshots = this.snapshots.slice(-5);

    // 檢測整體記憶體增長
    const memoryGrowth = this.calculateMemoryGrowthRate(recentSnapshots);
    if (memoryGrowth > this.thresholds.growthRate) {
      leaks.push({
        suspected: true,
        growthRate: memoryGrowth,
        samples: recentSnapshots.length,
        confidence: 0.8
      });
    }

    // 檢測組件記憶體洩漏
    const componentLeaks = this.detectComponentLeaks(recentSnapshots);
    leaks.push(...componentLeaks);

    // 檢測監聽器洩漏
    const listenerLeaks = this.detectListenerLeaks(recentSnapshots);
    leaks.push(...listenerLeaks);

    return leaks;
  }

  /**
   * 獲取記憶體使用報告
   */
  getMemoryReport(): {
    current: MemorySnapshot;
    alerts: MemoryAlert[];
    leaks: LeakDetection[];
    optimizations: MemoryOptimization[];
    recommendations: string[];
  } {
    const current = this.snapshots[this.snapshots.length - 1] || this.takeSnapshot();
    const leaks = this.detectMemoryLeaks();
    const optimizations = this.suggestOptimizations();

    return {
      current,
      alerts: [...this.alerts],
      leaks,
      optimizations,
      recommendations: this.generateRecommendations(current, leaks, optimizations)
    };
  }

  /**
   * 清理未使用的組件
   */
  cleanupUnusedComponents(): number {
    let cleanedCount = 0;

    this.componentRegistry.forEach((weakRef, name) => {
      const component = weakRef.deref();
      if (!component) {
        this.componentRegistry.delete(name);
        this.observedComponents.delete(name);
        this.cleanupListeners(name);
        cleanedCount++;
      }
    });

    return cleanedCount;
  }

  /**
   * 優化記憶體使用
   */
  optimizeMemory(): {
    cleaned: number;
    optimized: string[];
    savings: number;
  } {
    const initialUsage = this.getMemoryInfo().usedJSHeapSize;

    // 清理未使用的組件
    const cleaned = this.cleanupUnusedComponents();

    // 清理過期快取
    const optimized: string[] = [];
    
    // 這裡可以添加更多優化邏輯
    if (cleaned > 0) {
      optimized.push(`清理了 ${cleaned} 個未使用的組件`);
    }

    // 強制垃圾回收
    this.forceGarbageCollection();

    const finalUsage = this.getMemoryInfo().usedJSHeapSize;
    const savings = Math.max(0, initialUsage - finalUsage);

    return {
      cleaned,
      optimized,
      savings
    };
  }

  private getMemoryInfo(): { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } {
    if ('memory' in performance) {
      return (performance as any).memory;
    }
    return { usedJSHeapSize: 0, totalJSHeapSize: 0, jsHeapSizeLimit: 0 };
  }

  private estimateCacheSize(): number {
    // 估算快取大小（簡化實現）
    let size = 0;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('cache_')) {
          const value = localStorage.getItem(key);
          if (value) {
            size += new Blob([value]).size;
          }
        }
      }
    } catch (error) {
      // localStorage 不可用
    }
    return size;
  }

  private calculateMemoryGrowthRate(snapshots: MemorySnapshot[]): number {
    if (snapshots.length < 2) return 0;

    const first = snapshots[0];
    const last = snapshots[snapshots.length - 1];
    const timeDiff = last.timestamp - first.timestamp;
    const memoryDiff = last.usedJSHeapSize - first.usedJSHeapSize;

    // 轉換為每分鐘的增長率
    return (memoryDiff / timeDiff) * 60000;
  }

  private detectComponentLeaks(snapshots: MemorySnapshot[]): LeakDetection[] {
    const leaks: LeakDetection[] = [];

    // 檢查每個組件的實例數量增長
    const componentCounts = new Map<string, number[]>();

    snapshots.forEach(snapshot => {
      snapshot.components.forEach((count, component) => {
        if (!componentCounts.has(component)) {
          componentCounts.set(component, []);
        }
        componentCounts.get(component)!.push(count);
      });
    });

    componentCounts.forEach((counts, component) => {
      if (counts.length >= 3) {
        const growth = counts[counts.length - 1] - counts[0];
        const avgGrowth = growth / counts.length;

        if (avgGrowth > 2) { // 平均每個快照增長超過2個實例
          leaks.push({
            suspected: true,
            component,
            growthRate: avgGrowth,
            samples: counts.length,
            confidence: Math.min(0.9, 0.5 + (avgGrowth / 10))
          });
        }
      }
    });

    return leaks;
  }

  private detectListenerLeaks(snapshots: MemorySnapshot[]): LeakDetection[] {
    const leaks: LeakDetection[] = [];

    if (snapshots.length >= 3) {
      const listenerCounts = snapshots.map(s => 
        Array.from(s.listeners.values()).reduce((sum, count) => sum + count, 0)
      );

      const growth = listenerCounts[listenerCounts.length - 1] - listenerCounts[0];
      const avgGrowth = growth / listenerCounts.length;

      if (avgGrowth > 5) { // 平均每個快照增長超過5個監聽器
        leaks.push({
          suspected: true,
          component: 'EventListeners',
          growthRate: avgGrowth,
          samples: listenerCounts.length,
          confidence: Math.min(0.8, 0.4 + (avgGrowth / 20))
        });
      }
    }

    return leaks;
  }

  private analyzeMemoryTrends(): void {
    const current = this.snapshots[this.snapshots.length - 1];
    if (!current) return;

    // 檢查記憶體使用是否超過閾值
    if (current.usedJSHeapSize > this.thresholds.critical) {
      this.addAlert('critical', '記憶體使用超過臨界值', '建議立即進行記憶體優化和清理', current.usedJSHeapSize, this.thresholds.critical);
    } else if (current.usedJSHeapSize > this.thresholds.warning) {
      this.addAlert('warning', '記憶體使用接近警告值', '建議檢查記憶體使用情況並進行適當清理', current.usedJSHeapSize, this.thresholds.warning);
    }

    // 檢查記憶體增長趨勢
    if (this.snapshots.length >= 3) {
      const growthRate = this.calculateMemoryGrowthRate(this.snapshots.slice(-3));
      if (growthRate > this.thresholds.growthRate) {
        this.addAlert('warning', '記憶體增長過快', '檢測到記憶體快速增長，可能存在記憶體洩漏', growthRate, this.thresholds.growthRate);
      }
    }
  }

  private addAlert(type: 'warning' | 'critical', message: string, recommendation: string, memoryUsage: number, threshold: number): void {
    const alert: MemoryAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      message,
      recommendation,
      timestamp: Date.now(),
      memoryUsage,
      threshold
    };

    this.alerts.push(alert);

    // 保持最近50個警告
    if (this.alerts.length > 50) {
      this.alerts = this.alerts.slice(-50);
    }
  }

  private suggestOptimizations(): MemoryOptimization[] {
    const optimizations: MemoryOptimization[] = [];
    const current = this.snapshots[this.snapshots.length - 1];

    if (!current) return optimizations;

    // 檢查組件數量
    const totalComponents = Array.from(current.components.values()).reduce((sum, count) => sum + count, 0);
    if (totalComponents > 100) {
      optimizations.push({
        target: 'Components',
        action: 'lazy-load',
        priority: 'medium',
        estimatedSaving: totalComponents * 1024, // 假設每個組件1KB
        description: `檢測到 ${totalComponents} 個組件實例，建議實施懒加載`
      });
    }

    // 檢查監聽器數量
    const totalListeners = Array.from(current.listeners.values()).reduce((sum, count) => sum + count, 0);
    if (totalListeners > 200) {
      optimizations.push({
        target: 'EventListeners',
        action: 'cleanup',
        priority: 'high',
        estimatedSaving: totalListeners * 100, // 假設每個監聽器100bytes
        description: `檢測到 ${totalListeners} 個事件監聽器，建議清理未使用的監聽器`
      });
    }

    // 檢查快取大小
    if (current.cacheSize > 10 * 1024 * 1024) { // 10MB
      optimizations.push({
        target: 'Cache',
        action: 'cache-clear',
        priority: 'medium',
        estimatedSaving: current.cacheSize * 0.5, // 假設可以清理50%
        description: `快取大小 ${Math.round(current.cacheSize / 1024 / 1024)}MB，建議清理過期快取`
      });
    }

    // 檢查計時器數量
    if (current.timers > 50) {
      optimizations.push({
        target: 'Timers',
        action: 'cleanup',
        priority: 'high',
        estimatedSaving: current.timers * 50, // 假設每個計時器50bytes
        description: `檢測到 ${current.timers} 個活動計時器，建議清理未使用的計時器`
      });
    }

    return optimizations.sort((a, b) => {
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      return priorityWeight[b.priority] - priorityWeight[a.priority];
    });
  }

  private generateRecommendations(
    current: MemorySnapshot,
    leaks: LeakDetection[],
    optimizations: MemoryOptimization[]
  ): string[] {
    const recommendations: string[] = [];

    // 基於記憶體使用情況的建議
    const memoryUsagePercent = (current.usedJSHeapSize / current.jsHeapSizeLimit) * 100;
    
    if (memoryUsagePercent > 80) {
      recommendations.push('記憶體使用率超過80%，建議立即進行優化');
    } else if (memoryUsagePercent > 60) {
      recommendations.push('記憶體使用率較高，建議定期清理');
    }

    // 基於記憶體洩漏的建議
    if (leaks.length > 0) {
      recommendations.push(`檢測到 ${leaks.length} 個潛在記憶體洩漏，請檢查相關組件`);
      
      leaks.forEach(leak => {
        if (leak.component) {
          recommendations.push(`組件 ${leak.component} 可能存在記憶體洩漏，信心度 ${Math.round(leak.confidence * 100)}%`);
        }
      });
    }

    // 基於優化建議
    if (optimizations.length > 0) {
      recommendations.push('建議執行以下優化操作：');
      optimizations.slice(0, 3).forEach(opt => {
        recommendations.push(`- ${opt.description}`);
      });
    }

    if (recommendations.length === 0) {
      recommendations.push('記憶體使用情況良好，繼續保持良好的編程習慣');
    }

    return recommendations;
  }

  private setupCleanupListeners(): void {
    // 頁面卸載時清理資源
    window.addEventListener('beforeunload', () => {
      this.stopMonitoring();
      this.clearAllTimers();
    });

    // Visibility API - 頁面隱藏時進行清理
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.optimizeMemory();
      }
    });
  }
}

// 全局記憶體管理器實例
export const globalMemoryManager = new MemoryManager();

// React Hook for memory management
export const useMemoryManager = (componentName: string) => {
  const memoryManager = globalMemoryManager;

  React.useEffect(() => {
    // 註冊組件
    memoryManager.registerComponent(componentName, {});

    return () => {
      // 清理組件
      memoryManager.unregisterComponent(componentName);
      memoryManager.cleanupListeners(componentName);
    };
  }, [componentName, memoryManager]);

  const registerListener = React.useCallback((cleanup: () => void) => {
    memoryManager.registerListener(componentName, cleanup);
  }, [componentName, memoryManager]);

  const registerTimer = React.useCallback((timer: NodeJS.Timeout) => {
    memoryManager.registerTimer(timer);
    return timer;
  }, [memoryManager]);

  return {
    registerListener,
    registerTimer,
    forceCleanup: () => memoryManager.cleanupListeners(componentName),
    getReport: () => memoryManager.getMemoryReport()
  };
};