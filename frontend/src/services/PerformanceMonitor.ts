/**
 * 性能監控服務 - 監控應用性能指標和資源使用
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  category: 'memory' | 'timing' | 'network' | 'render' | 'user';
  unit: string;
  threshold?: number;
}

export interface PerformanceAlert {
  id: string;
  type: 'warning' | 'critical';
  message: string;
  metric: PerformanceMetric;
  timestamp: number;
  resolved: boolean;
}

export interface PerformanceBudget {
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  memoryUsage: number;
  bundleSize: number;
}

interface WebVitalsData {
  lcp?: number;
  fid?: number;
  cls?: number;
  fcp?: number;
}

interface MemoryData {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface PerformanceEntryExtended extends PerformanceEntry {
  processingStart?: number;
  value?: number;
  hadRecentInput?: boolean;
}

export interface PerformanceReport {
  overall: 'excellent' | 'good' | 'needs-improvement' | 'poor';
  score: number;
  metrics: PerformanceMetric[];
  alerts: PerformanceAlert[];
  recommendations: string[];
  budget: PerformanceBudget;
  budgetViolations: string[];
}

export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private alerts: PerformanceAlert[] = [];
  private observers: PerformanceObserver[] = [];
  private intervals: NodeJS.Timeout[] = [];
  
  private readonly budget: PerformanceBudget = {
    loadTime: 3000, // 3秒
    firstContentfulPaint: 1500, // 1.5秒
    largestContentfulPaint: 2500, // 2.5秒
    firstInputDelay: 100, // 100ms
    cumulativeLayoutShift: 0.1,
    memoryUsage: 50 * 1024 * 1024, // 50MB
    bundleSize: 2 * 1024 * 1024 // 2MB
  };

  private callbacks: ((report: PerformanceReport) => void)[] = [];

  constructor() {
    this.initializeMonitoring();
  }

  /**
   * 開始監控
   */
  startMonitoring(): void {
    this.setupPerformanceObservers();
    this.startMemoryMonitoring();
    this.startUserInteractionMonitoring();
    this.startNetworkMonitoring();
  }

  /**
   * 停止監控
   */
  stopMonitoring(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.intervals.forEach(interval => clearInterval(interval));
    this.observers = [];
    this.intervals = [];
  }

  /**
   * 記錄自定義指標
   */
  recordMetric(name: string, value: number, category: PerformanceMetric['category'], unit: string = 'ms', threshold?: number): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      category,
      unit,
      threshold
    };

    this.metrics.push(metric);
    this.checkThreshold(metric);
    this.triggerCallbacks();

    // 保持最近1000個指標
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  /**
   * 測量函數執行時間
   */
  measureFunction<T>(name: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;
    
    this.recordMetric(`function_${name}`, duration, 'timing');
    return result;
  }

  /**
   * 測量異步函數執行時間
   */
  async measureAsyncFunction<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    
    this.recordMetric(`async_${name}`, duration, 'timing');
    return result;
  }

  /**
   * 測量組件渲染時間
   */
  measureRender(componentName: string, renderFn: () => void): void {
    const start = performance.now();
    renderFn();
    const duration = performance.now() - start;
    
    this.recordMetric(`render_${componentName}`, duration, 'render');
  }

  /**
   * 記錄用戶交互
   */
  recordUserInteraction(action: string, target: string): void {
    const timestamp = Date.now();
    this.recordMetric(`interaction_${action}_${target}`, timestamp, 'user', 'timestamp');
  }

  /**
   * 獲取性能報告
   */
  getPerformanceReport(): PerformanceReport {
    const coreWebVitals = this.getCoreWebVitals();
    const memoryUsage = this.getMemoryUsage();
    const budgetViolations = this.checkBudgetViolations(coreWebVitals, memoryUsage);
    const score = this.calculateOverallScore(coreWebVitals, memoryUsage, budgetViolations);
    const overall = this.getOverallRating(score);

    return {
      overall,
      score,
      metrics: [...this.metrics],
      alerts: [...this.alerts],
      recommendations: this.getRecommendations(coreWebVitals, memoryUsage, budgetViolations),
      budget: this.budget,
      budgetViolations
    };
  }

  /**
   * 註冊性能變化回調
   */
  onPerformanceChange(callback: (report: PerformanceReport) => void): void {
    this.callbacks.push(callback);
  }

  /**
   * 清除歷史數據
   */
  clearHistory(): void {
    this.metrics = [];
    this.alerts = [];
  }

  /**
   * 獲取指標統計
   */
  getMetricStats(metricName: string, timeWindow: number = 300000): {
    avg: number;
    min: number;
    max: number;
    count: number;
  } {
    const cutoff = Date.now() - timeWindow;
    const relevantMetrics = this.metrics.filter(
      m => m.name === metricName && m.timestamp >= cutoff
    );

    if (relevantMetrics.length === 0) {
      return { avg: 0, min: 0, max: 0, count: 0 };
    }

    const values = relevantMetrics.map(m => m.value);
    return {
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length
    };
  }

  private initializeMonitoring(): void {
    // 等待頁面載入完成後開始監控
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.startMonitoring());
    } else {
      this.startMonitoring();
    }
  }

  private setupPerformanceObservers(): void {
    // 監控導航時間
    if ('PerformanceObserver' in window) {
      const navObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            this.recordMetric('load_time', navEntry.loadEventEnd - navEntry.navigationStart, 'timing');
            this.recordMetric('dom_content_loaded', navEntry.domContentLoadedEventEnd - navEntry.navigationStart, 'timing');
          }
        });
      });
      navObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(navObserver);

      // 監控Paint時間
      const paintObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            this.recordMetric('first_contentful_paint', entry.startTime, 'timing', 'ms', this.budget.firstContentfulPaint);
          }
        });
      });
      paintObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(paintObserver);

      // 監控LCP
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.recordMetric('largest_contentful_paint', lastEntry.startTime, 'timing', 'ms', this.budget.largestContentfulPaint);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);

      // 監控FID
      const fidObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          const fidEntry = entry as PerformanceEntryExtended;
          this.recordMetric('first_input_delay', fidEntry.processingStart - fidEntry.startTime, 'timing', 'ms', this.budget.firstInputDelay);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);

      // 監控CLS
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          const clsEntry = entry as PerformanceEntryExtended;
          if (!clsEntry.hadRecentInput) {
            clsValue += clsEntry.value;
            this.recordMetric('cumulative_layout_shift', clsValue, 'render', 'score', this.budget.cumulativeLayoutShift);
          }
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);
    }
  }

  private startMemoryMonitoring(): void {
    const checkMemory = () => {
      const memoryInfo = this.getMemoryUsage();
      this.recordMetric('memory_used', memoryInfo.usedJSHeapSize, 'memory', 'bytes', this.budget.memoryUsage);
      this.recordMetric('memory_total', memoryInfo.totalJSHeapSize, 'memory', 'bytes');
      this.recordMetric('memory_limit', memoryInfo.jsHeapSizeLimit, 'memory', 'bytes');
    };

    checkMemory();
    const memoryInterval = setInterval(checkMemory, 10000); // 每10秒檢查一次
    this.intervals.push(memoryInterval);
  }

  private startUserInteractionMonitoring(): void {
    const interactionEvents = ['click', 'scroll', 'keydown', 'touchstart'];
    
    interactionEvents.forEach(eventType => {
      document.addEventListener(eventType, (event) => {
        const target = (event.target as Element)?.tagName || 'unknown';
        this.recordUserInteraction(eventType, target.toLowerCase());
      }, { passive: true });
    });
  }

  private startNetworkMonitoring(): void {
    if ('PerformanceObserver' in window) {
      const resourceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          const resourceEntry = entry as PerformanceResourceTiming;
          const loadTime = resourceEntry.responseEnd - resourceEntry.requestStart;
          const resourceType = resourceEntry.initiatorType || 'unknown';
          
          this.recordMetric(`network_${resourceType}`, loadTime, 'network');
          this.recordMetric(`resource_size_${resourceType}`, resourceEntry.transferSize || 0, 'network', 'bytes');
        });
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.push(resourceObserver);
    }
  }

  private getMemoryUsage(): { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } {
    if ('memory' in performance) {
      return (performance as Performance & { memory: MemoryData }).memory;
    }
    return { usedJSHeapSize: 0, totalJSHeapSize: 0, jsHeapSizeLimit: 0 };
  }

  private getCoreWebVitals() {
    const recentMetrics = this.metrics.filter(m => Date.now() - m.timestamp < 60000); // 最近1分鐘
    
    return {
      fcp: recentMetrics.find(m => m.name === 'first_contentful_paint')?.value || 0,
      lcp: recentMetrics.find(m => m.name === 'largest_contentful_paint')?.value || 0,
      fid: recentMetrics.find(m => m.name === 'first_input_delay')?.value || 0,
      cls: recentMetrics.find(m => m.name === 'cumulative_layout_shift')?.value || 0,
      loadTime: recentMetrics.find(m => m.name === 'load_time')?.value || 0
    };
  }

  private checkBudgetViolations(coreWebVitals: WebVitalsData, memoryUsage: MemoryData): string[] {
    const violations: string[] = [];

    if (coreWebVitals.fcp > this.budget.firstContentfulPaint) {
      violations.push(`首次內容繪製超出預算 (${coreWebVitals.fcp}ms > ${this.budget.firstContentfulPaint}ms)`);
    }

    if (coreWebVitals.lcp > this.budget.largestContentfulPaint) {
      violations.push(`最大內容繪製超出預算 (${coreWebVitals.lcp}ms > ${this.budget.largestContentfulPaint}ms)`);
    }

    if (coreWebVitals.fid > this.budget.firstInputDelay) {
      violations.push(`首次輸入延遲超出預算 (${coreWebVitals.fid}ms > ${this.budget.firstInputDelay}ms)`);
    }

    if (coreWebVitals.cls > this.budget.cumulativeLayoutShift) {
      violations.push(`累積版面位移超出預算 (${coreWebVitals.cls} > ${this.budget.cumulativeLayoutShift})`);
    }

    if (coreWebVitals.loadTime > this.budget.loadTime) {
      violations.push(`載入時間超出預算 (${coreWebVitals.loadTime}ms > ${this.budget.loadTime}ms)`);
    }

    if (memoryUsage.usedJSHeapSize > this.budget.memoryUsage) {
      violations.push(`記憶體使用超出預算 (${Math.round(memoryUsage.usedJSHeapSize / 1024 / 1024)}MB > ${Math.round(this.budget.memoryUsage / 1024 / 1024)}MB)`);
    }

    return violations;
  }

  private calculateOverallScore(coreWebVitals: WebVitalsData, memoryUsage: MemoryData, _violations: string[]): number {
    let score = 100;

    // FCP 評分
    if (coreWebVitals.fcp > this.budget.firstContentfulPaint) {
      score -= 15;
    } else if (coreWebVitals.fcp > this.budget.firstContentfulPaint * 0.8) {
      score -= 5;
    }

    // LCP 評分
    if (coreWebVitals.lcp > this.budget.largestContentfulPaint) {
      score -= 20;
    } else if (coreWebVitals.lcp > this.budget.largestContentfulPaint * 0.8) {
      score -= 10;
    }

    // FID 評分
    if (coreWebVitals.fid > this.budget.firstInputDelay) {
      score -= 15;
    } else if (coreWebVitals.fid > this.budget.firstInputDelay * 0.8) {
      score -= 5;
    }

    // CLS 評分
    if (coreWebVitals.cls > this.budget.cumulativeLayoutShift) {
      score -= 15;
    } else if (coreWebVitals.cls > this.budget.cumulativeLayoutShift * 0.8) {
      score -= 5;
    }

    // 記憶體評分
    const memoryUsagePercentage = memoryUsage.usedJSHeapSize / this.budget.memoryUsage;
    if (memoryUsagePercentage > 1) {
      score -= 20;
    } else if (memoryUsagePercentage > 0.8) {
      score -= 10;
    }

    return Math.max(0, score);
  }

  private getOverallRating(score: number): 'excellent' | 'good' | 'needs-improvement' | 'poor' {
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 50) return 'needs-improvement';
    return 'poor';
  }

  private getRecommendations(coreWebVitals: WebVitalsData, memoryUsage: MemoryData, violations: string[]): string[] {
    const recommendations: string[] = [];

    if (coreWebVitals.fcp > this.budget.firstContentfulPaint) {
      recommendations.push('優化首次內容繪製：考慮減少CSS阻塞、使用內聯關鍵CSS、優化字體載入');
    }

    if (coreWebVitals.lcp > this.budget.largestContentfulPaint) {
      recommendations.push('優化最大內容繪製：優化圖片載入、減少伺服器回應時間、移除未使用的CSS');
    }

    if (coreWebVitals.fid > this.budget.firstInputDelay) {
      recommendations.push('改善首次輸入延遲：分割長任務、優化JavaScript執行、使用Web Workers');
    }

    if (coreWebVitals.cls > this.budget.cumulativeLayoutShift) {
      recommendations.push('減少累積版面位移：為圖片設定尺寸、避免在現有內容上方插入內容');
    }

    if (memoryUsage.usedJSHeapSize > this.budget.memoryUsage) {
      recommendations.push('優化記憶體使用：檢查記憶體洩漏、優化圖片大小、清理未使用的組件');
    }

    if (violations.length === 0 && recommendations.length === 0) {
      recommendations.push('性能表現良好！繼續保持當前的優化策略');
    }

    return recommendations;
  }

  private checkThreshold(metric: PerformanceMetric): void {
    if (metric.threshold && metric.value > metric.threshold) {
      const alert: PerformanceAlert = {
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: metric.value > metric.threshold * 1.5 ? 'critical' : 'warning',
        message: `${metric.name} 超出閾值：${metric.value}${metric.unit} > ${metric.threshold}${metric.unit}`,
        metric,
        timestamp: Date.now(),
        resolved: false
      };

      this.alerts.push(alert);

      // 保持最近100個警告
      if (this.alerts.length > 100) {
        this.alerts = this.alerts.slice(-100);
      }
    }
  }

  private triggerCallbacks(): void {
    const report = this.getPerformanceReport();
    this.callbacks.forEach(callback => {
      try {
        callback(report);
      } catch (error) {
        console.error('性能監控回調執行失敗:', error);
      }
    });
  }
}

// 全局性能監控實例
export const globalPerformanceMonitor = new PerformanceMonitor();