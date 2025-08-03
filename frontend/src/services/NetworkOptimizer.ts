/**
 * 網路請求優化服務 - 實施請求快取、合併、離線模式、資源預載
 */

import { globalCacheManager } from './CacheService';
import { globalPerformanceMonitor } from './PerformanceMonitor';

export interface RequestConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  cache?: boolean;
  cacheTTL?: number;
  priority?: 'low' | 'normal' | 'high';
  offline?: boolean;
}

export interface BatchRequest {
  id: string;
  config: RequestConfig;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

export interface NetworkStats {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  failedRequests: number;
  averageResponseTime: number;
  bytesTransferred: number;
  offlineRequests: number;
}

export interface OfflineQueueItem {
  id: string;
  config: RequestConfig;
  timestamp: number;
  retries: number;
}

export class NetworkOptimizer {
  private requestCache = globalCacheManager.getCache('network_requests', {
    defaultTTL: 300000, // 5分鐘
    maxSize: 500
  });

  private batchQueue: BatchRequest[] = [];
  private batchTimer?: NodeJS.Timeout;
  private offlineQueue: OfflineQueueItem[] = [];
  private preloadQueue: Set<string> = new Set();
  
  private stats: NetworkStats = {
    totalRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    bytesTransferred: 0,
    offlineRequests: 0
  };

  private responseTimes: number[] = [];
  private isOnline = navigator.onLine;
  private retryDelays = [1000, 2000, 4000, 8000]; // 指數退避

  constructor() {
    this.setupNetworkListeners();
    this.loadOfflineQueue();
  }

  /**
   * 發送優化後的請求
   */
  async request<T>(config: RequestConfig): Promise<T> {
    this.stats.totalRequests++;

    // 檢查快取
    if (config.cache !== false && config.method === 'GET') {
      const cacheKey = this.generateCacheKey(config);
      const cached = this.requestCache.get(cacheKey);
      
      if (cached) {
        this.stats.cacheHits++;
        return cached;
      }
      this.stats.cacheMisses++;
    }

    // 離線處理
    if (!this.isOnline && config.offline !== false) {
      return this.handleOfflineRequest(config);
    }

    try {
      const response = await this.executeRequest<T>(config);
      
      // 快取響應
      if (config.cache !== false && config.method === 'GET') {
        const cacheKey = this.generateCacheKey(config);
        this.requestCache.set(cacheKey, response, config.cacheTTL);
      }

      return response;
    } catch (error) {
      this.stats.failedRequests++;
      
      // 重試邏輯
      if (config.retries && config.retries > 0) {
        const delay = this.retryDelays[Math.min(config.retries - 1, this.retryDelays.length - 1)];
        await this.delay(delay);
        
        return this.request({
          ...config,
          retries: config.retries - 1
        });
      }

      throw error;
    }
  }

  /**
   * 批量請求
   */
  async batchRequest<T>(configs: RequestConfig[]): Promise<T[]> {
    return Promise.all(configs.map(config => this.request<T>(config)));
  }

  /**
   * 添加到批處理隊列
   */
  addToBatch<T>(config: RequestConfig): Promise<T> {
    return new Promise((resolve, reject) => {
      const batchRequest: BatchRequest = {
        id: this.generateRequestId(),
        config,
        resolve,
        reject
      };

      this.batchQueue.push(batchRequest);
      this.scheduleBatchExecution();
    });
  }

  /**
   * 預載資源
   */
  async preload(urls: string[], priority: 'low' | 'normal' | 'high' = 'low'): Promise<void> {
    const preloadPromises = urls
      .filter(url => !this.preloadQueue.has(url))
      .map(async (url) => {
        this.preloadQueue.add(url);
        
        try {
          await this.request({
            url,
            method: 'GET',
            cache: true,
            priority,
            cacheTTL: 3600000 // 1小時
          });
        } catch (error) {
          console.warn(`預載失敗: ${url}`, error);
        } finally {
          this.preloadQueue.delete(url);
        }
      });

    await Promise.all(preloadPromises);
  }

  /**
   * 智能預載 - 基於用戶行為預測
   */
  async smartPreload(currentPath: string, userHistory: string[]): Promise<void> {
    const predictions = this.predictNextResources(currentPath, userHistory);
    
    if (predictions.length > 0) {
      await this.preload(predictions, 'low');
    }
  }

  /**
   * 設置離線模式
   */
  setOfflineMode(enabled: boolean): void {
    this.isOnline = !enabled;
    
    if (this.isOnline && this.offlineQueue.length > 0) {
      this.processOfflineQueue();
    }
  }

  /**
   * 清除快取
   */
  clearCache(pattern?: string): void {
    if (pattern) {
      // 清除匹配模式的快取
      // 這裡需要實現模式匹配清除邏輯
    } else {
      this.requestCache.clear();
    }
  }

  /**
   * 獲取網路統計
   */
  getStats(): NetworkStats {
    const avgResponseTime = this.responseTimes.length > 0
      ? this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length
      : 0;

    return {
      ...this.stats,
      averageResponseTime: avgResponseTime
    };
  }

  /**
   * 重置統計
   */
  resetStats(): void {
    this.stats = {
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      bytesTransferred: 0,
      offlineRequests: 0
    };
    this.responseTimes = [];
  }

  /**
   * 獲取快取狀態
   */
  getCacheStatus(): {
    size: number;
    hitRate: number;
    entries: number;
  } {
    const cacheStats = this.requestCache.getStats();
    return {
      size: cacheStats.totalSize,
      hitRate: cacheStats.hitRate,
      entries: cacheStats.entryCount
    };
  }

  private async executeRequest<T>(config: RequestConfig): Promise<T> {
    const startTime = performance.now();

    const requestConfig: RequestInit = {
      method: config.method,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers
      },
      body: config.body ? JSON.stringify(config.body) : undefined
    };

    // 設置超時
    const controller = new AbortController();
    if (config.timeout) {
      setTimeout(() => controller.abort(), config.timeout);
    }
    requestConfig.signal = controller.signal;

    const response = await fetch(config.url, requestConfig);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // 記錄性能指標
    const responseTime = performance.now() - startTime;
    this.responseTimes.push(responseTime);
    
    if (this.responseTimes.length > 100) {
      this.responseTimes = this.responseTimes.slice(-100);
    }

    // 估算傳輸字節數
    const contentLength = response.headers.get('content-length');
    if (contentLength) {
      this.stats.bytesTransferred += parseInt(contentLength, 10);
    }

    globalPerformanceMonitor.recordMetric('network_request', responseTime, 'network');

    return data;
  }

  private generateCacheKey(config: RequestConfig): string {
    const keyData = {
      url: config.url,
      method: config.method,
      body: config.body
    };
    return btoa(JSON.stringify(keyData));
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private scheduleBatchExecution(): void {
    if (this.batchTimer) return;

    this.batchTimer = setTimeout(() => {
      this.executeBatch();
    }, 50); // 50ms 批處理延遲
  }

  private async executeBatch(): Promise<void> {
    const currentBatch = [...this.batchQueue];
    this.batchQueue = [];
    this.batchTimer = undefined;

    // 按優先級排序
    currentBatch.sort((a, b) => {
      const priorityWeight = { high: 3, normal: 2, low: 1 };
      const priorityA = priorityWeight[a.config.priority || 'normal'];
      const priorityB = priorityWeight[b.config.priority || 'normal'];
      return priorityB - priorityA;
    });

    // 並行執行高優先級請求
    const highPriorityRequests = currentBatch.filter(req => req.config.priority === 'high');
    const normalRequests = currentBatch.filter(req => req.config.priority !== 'high');

    // 執行高優先級請求
    await Promise.all(highPriorityRequests.map(req => this.executeBatchRequest(req)));

    // 限制並發數量執行普通請求
    const concurrencyLimit = 3;
    for (let i = 0; i < normalRequests.length; i += concurrencyLimit) {
      const chunk = normalRequests.slice(i, i + concurrencyLimit);
      await Promise.all(chunk.map(req => this.executeBatchRequest(req)));
    }
  }

  private async executeBatchRequest(batchRequest: BatchRequest): Promise<void> {
    try {
      const result = await this.request(batchRequest.config);
      batchRequest.resolve(result);
    } catch (error) {
      batchRequest.reject(error);
    }
  }

  private async handleOfflineRequest<T>(config: RequestConfig): Promise<T> {
    // 檢查快取
    if (config.method === 'GET') {
      const cacheKey = this.generateCacheKey(config);
      const cached = this.requestCache.get(cacheKey);
      
      if (cached) {
        return cached;
      }
    }

    // 添加到離線隊列
    const queueItem: OfflineQueueItem = {
      id: this.generateRequestId(),
      config,
      timestamp: Date.now(),
      retries: 0
    };

    this.offlineQueue.push(queueItem);
    this.saveOfflineQueue();
    this.stats.offlineRequests++;

    throw new Error('離線模式：請求已加入隊列，將在網路恢復後重試');
  }

  private async processOfflineQueue(): Promise<void> {
    const queue = [...this.offlineQueue];
    this.offlineQueue = [];

    for (const item of queue) {
      try {
        await this.request(item.config);
      } catch (error) {
        // 重試邏輯
        if (item.retries < 3) {
          item.retries++;
          this.offlineQueue.push(item);
        }
      }
    }

    this.saveOfflineQueue();
  }

  private predictNextResources(currentPath: string, userHistory: string[]): string[] {
    // 簡化的預測邏輯
    const predictions: string[] = [];
    
    // 基於歷史記錄預測
    const commonPaths = this.analyzeCommonPaths(userHistory);
    const currentIndex = commonPaths.indexOf(currentPath);
    
    if (currentIndex !== -1 && currentIndex < commonPaths.length - 1) {
      const nextPath = commonPaths[currentIndex + 1];
      predictions.push(nextPath);
    }

    // 預載相關資源
    if (currentPath.includes('/bot/')) {
      predictions.push('/api/bot/templates');
      predictions.push('/api/blocks/definitions');
    }

    return predictions;
  }

  private analyzeCommonPaths(history: string[]): string[] {
    const pathFrequency = new Map<string, number>();
    
    history.forEach(path => {
      pathFrequency.set(path, (pathFrequency.get(path) || 0) + 1);
    });

    return Array.from(pathFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([path]) => path);
  }

  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      if (this.offlineQueue.length > 0) {
        this.processOfflineQueue();
      }
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  private saveOfflineQueue(): void {
    try {
      localStorage.setItem('offline_queue', JSON.stringify(this.offlineQueue));
    } catch (error) {
      console.warn('保存離線隊列失敗:', error);
    }
  }

  private loadOfflineQueue(): void {
    try {
      const saved = localStorage.getItem('offline_queue');
      if (saved) {
        this.offlineQueue = JSON.parse(saved);
      }
    } catch (error) {
      console.warn('載入離線隊列失敗:', error);
      this.offlineQueue = [];
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * 請求攔截器 - 自動應用網路優化
 */
export class RequestInterceptor {
  private optimizer: NetworkOptimizer;

  constructor(optimizer: NetworkOptimizer) {
    this.optimizer = optimizer;
  }

  /**
   * 攔截 fetch 請求
   */
  interceptFetch(): void {
    const originalFetch = window.fetch;

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const url = typeof input === 'string' ? input : input.toString();
      const method = init?.method || 'GET';

      // 轉換為 NetworkOptimizer 配置
      const config: RequestConfig = {
        url,
        method: method as RequestConfig['method'],
        headers: init?.headers as Record<string, string>,
        body: init?.body,
        cache: true, // 默認啟用快取
        priority: 'normal'
      };

      try {
        const result = await this.optimizer.request(config);
        
        // 創建 Response 對象
        return new Response(JSON.stringify(result), {
          status: 200,
          statusText: 'OK',
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        // 回退到原始 fetch
        return originalFetch(input, init);
      }
    };
  }

  /**
   * 攔截 XMLHttpRequest
   */
  interceptXHR(): void {
    const originalXHR = window.XMLHttpRequest;

    window.XMLHttpRequest = class extends originalXHR {
      private _url?: string;
      private _method?: string;

      open(method: string, url: string | URL, async?: boolean, user?: string | null, password?: string | null): void {
        this._method = method;
        this._url = url.toString();
        return super.open(method, url, async, user, password);
      }

      send(body?: Document | XMLHttpRequestBodyInit | null): void {
        if (this._url && this._method) {
          const config: RequestConfig = {
            url: this._url,
            method: this._method as RequestConfig['method'],
            body,
            cache: this._method === 'GET',
            priority: 'normal'
          };

          // 嘗試使用優化器
          this.optimizer.request(config)
            .then(result => {
              // 模擬 XHR 響應
              Object.defineProperty(this, 'readyState', { value: 4 });
              Object.defineProperty(this, 'status', { value: 200 });
              Object.defineProperty(this, 'responseText', { value: JSON.stringify(result) });
              
              if (this.onreadystatechange) {
                this.onreadystatechange(new Event('readystatechange'));
              }
            })
            .catch(() => {
              // 回退到原始請求
              super.send(body);
            });
        } else {
          super.send(body);
        }
      }
    };
  }
}

// 全局網路優化器實例
export const globalNetworkOptimizer = new NetworkOptimizer();

// 自動應用攔截器
const interceptor = new RequestInterceptor(globalNetworkOptimizer);
interceptor.interceptFetch();

// React Hook for network optimization
export const useNetworkOptimizer = () => {
  const optimizer = globalNetworkOptimizer;

  const optimizedRequest = React.useCallback(async <T>(config: RequestConfig): Promise<T> => {
    return optimizer.request<T>(config);
  }, [optimizer]);

  const preloadResources = React.useCallback((urls: string[]) => {
    return optimizer.preload(urls);
  }, [optimizer]);

  const getNetworkStats = React.useCallback(() => {
    return optimizer.getStats();
  }, [optimizer]);

  return {
    request: optimizedRequest,
    preload: preloadResources,
    getStats: getNetworkStats,
    clearCache: () => optimizer.clearCache(),
    setOfflineMode: (enabled: boolean) => optimizer.setOfflineMode(enabled)
  };
};