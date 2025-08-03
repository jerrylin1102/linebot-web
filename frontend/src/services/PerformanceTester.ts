/**
 * 性能測試和基準測試系統 - 自動化性能測試、回歸檢測、基準建立
 */

import { globalPerformanceMonitor } from './PerformanceMonitor';
import { globalMemoryManager } from './MemoryManager';
import { globalCacheManager } from './CacheService';
import { globalNetworkOptimizer } from './NetworkOptimizer';

export interface PerformanceTest {
  id: string;
  name: string;
  description: string;
  category: 'load' | 'runtime' | 'memory' | 'network' | 'user-interaction';
  setup?: () => Promise<void>;
  execute: () => Promise<PerformanceTestResult>;
  cleanup?: () => Promise<void>;
  timeout?: number;
  iterations?: number;
}

export interface PerformanceTestResult {
  testId: string;
  success: boolean;
  duration: number;
  metrics: Record<string, number>;
  errors: string[];
  timestamp: number;
  environment: PerformanceEnvironment;
}

export interface PerformanceEnvironment {
  userAgent: string;
  platform: string;
  memory: number;
  cores: number;
  connection: string;
  viewport: { width: number; height: number };
}

export interface BenchmarkResult {
  testId: string;
  baseline: PerformanceTestResult;
  current: PerformanceTestResult;
  regression: boolean;
  regressionDetails: RegressionDetail[];
  improvementPercent: number;
}

export interface RegressionDetail {
  metric: string;
  baseline: number;
  current: number;
  changePercent: number;
  threshold: number;
  severity: 'minor' | 'moderate' | 'critical';
}

export interface TestSuite {
  id: string;
  name: string;
  tests: PerformanceTest[];
  thresholds: Record<string, number>;
}

export class PerformanceTester {
  private testSuites = new Map<string, TestSuite>();
  private baselines = new Map<string, PerformanceTestResult>();
  private testHistory: PerformanceTestResult[] = [];
  private isRunning = false;

  private readonly defaultThresholds = {
    loadTime: 3000, // 3秒
    firstContentfulPaint: 1500, // 1.5秒
    largestContentfulPaint: 2500, // 2.5秒
    firstInputDelay: 100, // 100ms
    cumulativeLayoutShift: 0.1,
    memoryUsage: 50 * 1024 * 1024, // 50MB
    renderTime: 16, // 16ms (60fps)
    networkResponseTime: 500 // 500ms
  };

  constructor() {
    this.setupDefaultTests();
    this.loadBaselines();
  }

  /**
   * 註冊測試套件
   */
  registerTestSuite(suite: TestSuite): void {
    this.testSuites.set(suite.id, suite);
  }

  /**
   * 執行單個測試
   */
  async runTest(testId: string): Promise<PerformanceTestResult> {
    const test = this.findTest(testId);
    if (!test) {
      throw new Error(`找不到測試: ${testId}`);
    }

    console.log(`開始執行性能測試: ${test.name}`);
    
    const environment = this.getEnvironment();
    const startTime = performance.now();
    let result: PerformanceTestResult;

    try {
      // 執行設置
      if (test.setup) {
        await test.setup();
      }

      // 執行測試（可能多次迭代）
      const iterations = test.iterations || 1;
      const results: PerformanceTestResult[] = [];

      for (let i = 0; i < iterations; i++) {
        const iterationResult = await this.executeTestIteration(test);
        results.push(iterationResult);
      }

      // 聚合結果
      result = this.aggregateResults(test.id, results, environment);

    } catch (error) {
      const duration = performance.now() - startTime;
      result = {
        testId: test.id,
        success: false,
        duration,
        metrics: {},
        errors: [error instanceof Error ? error.message : String(error)],
        timestamp: Date.now(),
        environment
      };
    } finally {
      // 執行清理
      if (test.cleanup) {
        try {
          await test.cleanup();
        } catch (cleanupError) {
          console.warn(`測試清理失敗: ${test.id}`, cleanupError);
        }
      }
    }

    this.testHistory.push(result);
    this.saveTestHistory();

    return result;
  }

  /**
   * 執行測試套件
   */
  async runTestSuite(suiteId: string): Promise<PerformanceTestResult[]> {
    const suite = this.testSuites.get(suiteId);
    if (!suite) {
      throw new Error(`找不到測試套件: ${suiteId}`);
    }

    if (this.isRunning) {
      throw new Error('已有測試正在執行');
    }

    this.isRunning = true;
    const results: PerformanceTestResult[] = [];

    try {
      console.log(`開始執行測試套件: ${suite.name}`);
      
      for (const test of suite.tests) {
        try {
          const result = await this.runTest(test.id);
          results.push(result);
        } catch (error) {
          console.error(`測試執行失敗: ${test.id}`, error);
          results.push({
            testId: test.id,
            success: false,
            duration: 0,
            metrics: {},
            errors: [error instanceof Error ? error.message : String(error)],
            timestamp: Date.now(),
            environment: this.getEnvironment()
          });
        }
      }
    } finally {
      this.isRunning = false;
    }

    return results;
  }

  /**
   * 執行所有測試
   */
  async runAllTests(): Promise<Map<string, PerformanceTestResult[]>> {
    const allResults = new Map<string, PerformanceTestResult[]>();

    for (const [suiteId] of this.testSuites) {
      try {
        const results = await this.runTestSuite(suiteId);
        allResults.set(suiteId, results);
      } catch (error) {
        console.error(`測試套件執行失敗: ${suiteId}`, error);
      }
    }

    return allResults;
  }

  /**
   * 設置基準線
   */
  setBaseline(testId: string, result: PerformanceTestResult): void {
    this.baselines.set(testId, result);
    this.saveBaselines();
  }

  /**
   * 執行回歸檢測
   */
  async runRegressionTests(): Promise<BenchmarkResult[]> {
    const regressionResults: BenchmarkResult[] = [];

    for (const [testId, baseline] of this.baselines) {
      try {
        const currentResult = await this.runTest(testId);
        const benchmarkResult = this.compareToBenchmark(testId, baseline, currentResult);
        regressionResults.push(benchmarkResult);
      } catch (error) {
        console.error(`回歸測試失敗: ${testId}`, error);
      }
    }

    return regressionResults;
  }

  /**
   * 比較性能結果
   */
  compareToBenchmark(testId: string, baseline: PerformanceTestResult, current: PerformanceTestResult): BenchmarkResult {
    const regressionDetails: RegressionDetail[] = [];
    let hasRegression = false;
    let totalImprovement = 0;
    let metricCount = 0;

    // 比較各項指標
    for (const [metric, currentValue] of Object.entries(current.metrics)) {
      const baselineValue = baseline.metrics[metric];
      if (baselineValue !== undefined) {
        const changePercent = ((currentValue - baselineValue) / baselineValue) * 100;
        const threshold = this.getThreshold(metric);
        const isRegression = this.isMetricRegression(metric, changePercent, threshold);

        if (isRegression) {
          hasRegression = true;
        }

        regressionDetails.push({
          metric,
          baseline: baselineValue,
          current: currentValue,
          changePercent,
          threshold,
          severity: this.getRegressionSeverity(changePercent, threshold)
        });

        totalImprovement += changePercent;
        metricCount++;
      }
    }

    const improvementPercent = metricCount > 0 ? totalImprovement / metricCount : 0;

    return {
      testId,
      baseline,
      current,
      regression: hasRegression,
      regressionDetails,
      improvementPercent
    };
  }

  /**
   * 獲取測試歷史
   */
  getTestHistory(testId?: string, limit?: number): PerformanceTestResult[] {
    let history = testId 
      ? this.testHistory.filter(result => result.testId === testId)
      : this.testHistory;

    if (limit) {
      history = history.slice(-limit);
    }

    return history.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * 獲取性能趨勢
   */
  getPerformanceTrends(testId: string, metric: string, days: number = 30): {
    data: { timestamp: number; value: number }[];
    trend: 'improving' | 'stable' | 'degrading';
    trendPercent: number;
  } {
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    const relevantResults = this.testHistory
      .filter(result => result.testId === testId && result.timestamp >= cutoff)
      .sort((a, b) => a.timestamp - b.timestamp);

    const data = relevantResults
      .map(result => ({
        timestamp: result.timestamp,
        value: result.metrics[metric] || 0
      }))
      .filter(point => point.value > 0);

    if (data.length < 2) {
      return { data, trend: 'stable', trendPercent: 0 };
    }

    // 計算趨勢
    const firstValue = data[0].value;
    const lastValue = data[data.length - 1].value;
    const trendPercent = ((lastValue - firstValue) / firstValue) * 100;

    let trend: 'improving' | 'stable' | 'degrading';
    if (Math.abs(trendPercent) < 5) {
      trend = 'stable';
    } else if (this.isImprovementMetric(metric)) {
      trend = trendPercent > 0 ? 'improving' : 'degrading';
    } else {
      trend = trendPercent < 0 ? 'improving' : 'degrading';
    }

    return { data, trend, trendPercent };
  }

  /**
   * 清理舊的測試記錄
   */
  cleanupOldResults(daysToKeep: number = 30): number {
    const cutoff = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
    const initialLength = this.testHistory.length;
    
    this.testHistory = this.testHistory.filter(result => result.timestamp >= cutoff);
    
    const removed = initialLength - this.testHistory.length;
    this.saveTestHistory();
    
    return removed;
  }

  private async executeTestIteration(test: PerformanceTest): Promise<PerformanceTestResult> {
    const timeout = test.timeout || 30000; // 30秒默認超時
    
    return Promise.race([
      test.execute(),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('測試超時')), timeout);
      })
    ]);
  }

  private aggregateResults(testId: string, results: PerformanceTestResult[], environment: PerformanceEnvironment): PerformanceTestResult {
    if (results.length === 1) {
      return results[0];
    }

    const successfulResults = results.filter(r => r.success);
    if (successfulResults.length === 0) {
      return {
        testId,
        success: false,
        duration: 0,
        metrics: {},
        errors: results.flatMap(r => r.errors),
        timestamp: Date.now(),
        environment
      };
    }

    // 計算平均值
    const aggregatedMetrics: Record<string, number> = {};
    const allMetrics = new Set<string>();
    
    successfulResults.forEach(result => {
      Object.keys(result.metrics).forEach(metric => allMetrics.add(metric));
    });

    allMetrics.forEach(metric => {
      const values = successfulResults
        .map(result => result.metrics[metric])
        .filter(value => value !== undefined);
      
      if (values.length > 0) {
        aggregatedMetrics[metric] = values.reduce((a, b) => a + b, 0) / values.length;
      }
    });

    return {
      testId,
      success: true,
      duration: successfulResults.reduce((sum, r) => sum + r.duration, 0) / successfulResults.length,
      metrics: aggregatedMetrics,
      errors: [],
      timestamp: Date.now(),
      environment
    };
  }

  private findTest(testId: string): PerformanceTest | undefined {
    for (const suite of this.testSuites.values()) {
      const test = suite.tests.find(t => t.id === testId);
      if (test) return test;
    }
    return undefined;
  }

  private getEnvironment(): PerformanceEnvironment {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      memory: (navigator as any).deviceMemory || 0,
      cores: navigator.hardwareConcurrency || 0,
      connection: (navigator as any).connection?.effectiveType || 'unknown',
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };
  }

  private getThreshold(metric: string): number {
    return this.defaultThresholds[metric as keyof typeof this.defaultThresholds] || 10; // 10% 默認閾值
  }

  private isMetricRegression(metric: string, changePercent: number, threshold: number): boolean {
    // 對於性能指標，增加通常是退化
    const performanceMetrics = [
      'loadTime', 'firstContentfulPaint', 'largestContentfulPaint', 
      'firstInputDelay', 'renderTime', 'networkResponseTime', 'memoryUsage'
    ];
    
    if (performanceMetrics.includes(metric)) {
      return changePercent > threshold;
    }
    
    // 對於效率指標，減少通常是退化
    const efficiencyMetrics = ['cacheHitRate', 'fps'];
    if (efficiencyMetrics.includes(metric)) {
      return changePercent < -threshold;
    }
    
    return Math.abs(changePercent) > threshold;
  }

  private isImprovementMetric(metric: string): boolean {
    const improvementMetrics = ['cacheHitRate', 'fps'];
    return improvementMetrics.includes(metric);
  }

  private getRegressionSeverity(changePercent: number, threshold: number): 'minor' | 'moderate' | 'critical' {
    const absChange = Math.abs(changePercent);
    
    if (absChange >= threshold * 3) return 'critical';
    if (absChange >= threshold * 2) return 'moderate';
    return 'minor';
  }

  private setupDefaultTests(): void {
    // 頁面載入性能測試
    const loadPerformanceTests: PerformanceTest[] = [
      {
        id: 'page_load_time',
        name: '頁面載入時間',
        description: '測量完整頁面載入時間',
        category: 'load',
        execute: async () => {
          const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
          const entry = navigationEntries[0];
          
          return {
            testId: 'page_load_time',
            success: true,
            duration: entry.loadEventEnd - entry.navigationStart,
            metrics: {
              loadTime: entry.loadEventEnd - entry.navigationStart,
              domContentLoaded: entry.domContentLoadedEventEnd - entry.navigationStart,
              firstByte: entry.responseStart - entry.navigationStart
            },
            errors: [],
            timestamp: Date.now(),
            environment: this.getEnvironment()
          };
        }
      },
      {
        id: 'memory_usage',
        name: '記憶體使用測試',
        description: '測量當前記憶體使用情況',
        category: 'memory',
        execute: async () => {
          const memoryReport = globalMemoryManager.getMemoryReport();
          
          return {
            testId: 'memory_usage',
            success: true,
            duration: 0,
            metrics: {
              memoryUsage: memoryReport.current.usedJSHeapSize,
              totalMemory: memoryReport.current.totalJSHeapSize,
              memoryLimit: memoryReport.current.jsHeapSizeLimit,
              componentCount: Array.from(memoryReport.current.components.values()).reduce((a, b) => a + b, 0)
            },
            errors: [],
            timestamp: Date.now(),
            environment: this.getEnvironment()
          };
        }
      },
      {
        id: 'cache_performance',
        name: '快取性能測試',
        description: '測量快取命中率和響應時間',
        category: 'network',
        execute: async () => {
          const networkStats = globalNetworkOptimizer.getStats();
          const cacheStats = globalCacheManager.getAllStats();
          
          const totalCacheSize = Object.values(cacheStats).reduce((sum: number, stats: any) => sum + stats.totalSize, 0);
          const totalEntries = Object.values(cacheStats).reduce((sum: number, stats: any) => sum + stats.entryCount, 0);
          
          return {
            testId: 'cache_performance',
            success: true,
            duration: 0,
            metrics: {
              cacheHitRate: (networkStats.cacheHits / (networkStats.cacheHits + networkStats.cacheMisses) || 0) * 100,
              averageResponseTime: networkStats.averageResponseTime,
              cacheSize: totalCacheSize,
              cacheEntries: totalEntries,
              networkRequests: networkStats.totalRequests
            },
            errors: [],
            timestamp: Date.now(),
            environment: this.getEnvironment()
          };
        }
      }
    ];

    this.registerTestSuite({
      id: 'default_performance',
      name: '默認性能測試',
      tests: loadPerformanceTests,
      thresholds: this.defaultThresholds
    });
  }

  private saveBaselines(): void {
    try {
      const baselineData = Object.fromEntries(this.baselines.entries());
      localStorage.setItem('performance_baselines', JSON.stringify(baselineData));
    } catch (error) {
      console.warn('保存基準線失敗:', error);
    }
  }

  private loadBaselines(): void {
    try {
      const saved = localStorage.getItem('performance_baselines');
      if (saved) {
        const baselineData = JSON.parse(saved);
        this.baselines = new Map(Object.entries(baselineData));
      }
    } catch (error) {
      console.warn('載入基準線失敗:', error);
    }
  }

  private saveTestHistory(): void {
    try {
      // 只保存最近的1000條記錄
      const historyToSave = this.testHistory.slice(-1000);
      localStorage.setItem('performance_test_history', JSON.stringify(historyToSave));
    } catch (error) {
      console.warn('保存測試歷史失敗:', error);
    }
  }

  private loadTestHistory(): void {
    try {
      const saved = localStorage.getItem('performance_test_history');
      if (saved) {
        this.testHistory = JSON.parse(saved);
      }
    } catch (error) {
      console.warn('載入測試歷史失敗:', error);
    }
  }
}

// 全局性能測試器實例
export const globalPerformanceTester = new PerformanceTester();

// React Hook for performance testing
export const usePerformanceTesting = () => {
  const [isRunning, setIsRunning] = React.useState(false);
  const [results, setResults] = React.useState<PerformanceTestResult[]>([]);

  const runTest = React.useCallback(async (testId: string) => {
    setIsRunning(true);
    try {
      const result = await globalPerformanceTester.runTest(testId);
      setResults(prev => [result, ...prev.slice(0, 19)]); // 保持最近20個結果
      return result;
    } finally {
      setIsRunning(false);
    }
  }, []);

  const runTestSuite = React.useCallback(async (suiteId: string) => {
    setIsRunning(true);
    try {
      const suiteResults = await globalPerformanceTester.runTestSuite(suiteId);
      setResults(prev => [...suiteResults, ...prev.slice(0, 19 - suiteResults.length)]);
      return suiteResults;
    } finally {
      setIsRunning(false);
    }
  }, []);

  const runRegressionTests = React.useCallback(async () => {
    setIsRunning(true);
    try {
      return await globalPerformanceTester.runRegressionTests();
    } finally {
      setIsRunning(false);
    }
  }, []);

  return {
    isRunning,
    results,
    runTest,
    runTestSuite,
    runRegressionTests,
    getTestHistory: globalPerformanceTester.getTestHistory.bind(globalPerformanceTester),
    getPerformanceTrends: globalPerformanceTester.getPerformanceTrends.bind(globalPerformanceTester)
  };
};