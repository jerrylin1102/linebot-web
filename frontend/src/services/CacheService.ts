/**
 * 智能快取服務 - 統一管理所有快取機制
 * 提供積木定義快取、Flex Message預覽快取、代碼生成結果快取
 */

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiryTime: number;
  version: string;
  size: number;
  accessCount: number;
  lastAccessed: number;
}

export interface CacheStats {
  totalSize: number;
  entryCount: number;
  hitRate: number;
  missRate: number;
  memoryUsage: number;
  cleanupCount: number;
}

export interface CacheConfig {
  maxSize: number;
  defaultTTL: number;
  maxMemoryUsage: number;
  compressionThreshold: number;
  enableCompression: boolean;
  enablePersistence: boolean;
}

export class IntelligentCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private stats: CacheStats = {
    totalSize: 0,
    entryCount: 0,
    hitRate: 0,
    missRate: 0,
    memoryUsage: 0,
    cleanupCount: 0
  };
  private hits = 0;
  private misses = 0;

  constructor(
    private config: CacheConfig,
    private namespace: string
  ) {
    this.startMemoryMonitoring();
    this.loadFromPersistence();
  }

  /**
   * 設置快取項目
   */
  set(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const expiryTime = now + (ttl || this.config.defaultTTL);
    const size = this.calculateSize(data);

    // 檢查記憶體限制
    if (this.stats.totalSize + size > this.config.maxMemoryUsage) {
      this.cleanup();
    }

    // 壓縮大型數據
    const finalData = this.shouldCompress(size) ? this.compress(data) : data;

    const entry: CacheEntry<T> = {
      data: finalData,
      timestamp: now,
      expiryTime,
      version: this.generateVersion(),
      size,
      accessCount: 0,
      lastAccessed: now
    };

    this.cache.set(key, entry);
    this.stats.totalSize += size;
    this.stats.entryCount++;

    if (this.config.enablePersistence) {
      this.persistEntry(key, entry);
    }
  }

  /**
   * 獲取快取項目
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.misses++;
      this.updateHitRate();
      return null;
    }

    // 檢查過期
    if (Date.now() > entry.expiryTime) {
      this.delete(key);
      this.misses++;
      this.updateHitRate();
      return null;
    }

    // 更新訪問統計
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.hits++;
    this.updateHitRate();

    return this.isCompressed(entry.data) ? this.decompress(entry.data) : entry.data;
  }

  /**
   * 預載快取
   */
  async preload(keys: string[], loader: (key: string) => Promise<T>): Promise<void> {
    const promises = keys.map(async (key) => {
      if (!this.has(key)) {
        try {
          const data = await loader(key);
          this.set(key, data);
        } catch (error) {
          console.warn(`預載快取失敗: ${key}`, error);
        }
      }
    });

    await Promise.all(promises);
  }

  /**
   * 批量獲取
   */
  getBatch(keys: string[]): Map<string, T> {
    const result = new Map<string, T>();
    
    keys.forEach(key => {
      const value = this.get(key);
      if (value !== null) {
        result.set(key, value);
      }
    });

    return result;
  }

  /**
   * 檢查是否存在
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    return entry !== undefined && Date.now() <= entry.expiryTime;
  }

  /**
   * 刪除快取項目
   */
  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (entry) {
      this.stats.totalSize -= entry.size;
      this.stats.entryCount--;
      this.cache.delete(key);
      this.removePersistentEntry(key);
      return true;
    }
    return false;
  }

  /**
   * 清理過期和低頻率訪問的項目
   */
  cleanup(): void {
    const now = Date.now();
    const entriesToRemove: string[] = [];

    // 收集過期項目
    this.cache.forEach((entry, key) => {
      if (now > entry.expiryTime) {
        entriesToRemove.push(key);
      }
    });

    // 如果記憶體仍然不足，移除最少訪問的項目
    if (this.stats.totalSize > this.config.maxMemoryUsage * 0.8) {
      const sortedEntries = Array.from(this.cache.entries())
        .sort((a, b) => {
          const scoreA = this.calculateAccessScore(a[1]);
          const scoreB = this.calculateAccessScore(b[1]);
          return scoreA - scoreB;
        });

      const removeCount = Math.ceil(sortedEntries.length * 0.2);
      for (let i = 0; i < removeCount; i++) {
        entriesToRemove.push(sortedEntries[i][0]);
      }
    }

    // 執行移除
    entriesToRemove.forEach(key => this.delete(key));
    this.stats.cleanupCount++;
  }

  /**
   * 獲取快取統計
   */
  getStats(): CacheStats {
    this.stats.memoryUsage = this.stats.totalSize;
    return { ...this.stats };
  }

  /**
   * 清空快取
   */
  clear(): void {
    this.cache.clear();
    this.stats = {
      totalSize: 0,
      entryCount: 0,
      hitRate: 0,
      missRate: 0,
      memoryUsage: 0,
      cleanupCount: 0
    };
    this.hits = 0;
    this.misses = 0;
    this.clearPersistence();
  }

  private calculateSize(data: T): number {
    try {
      return new Blob([JSON.stringify(data)]).size;
    } catch {
      return 1024; // 默認大小
    }
  }

  private shouldCompress(size: number): boolean {
    return this.config.enableCompression && size > this.config.compressionThreshold;
  }

  private compress(data: T): T {
    // 簡單的壓縮邏輯（實際應用中可以使用更高效的壓縮算法）
    try {
      const jsonString = JSON.stringify(data);
      const compressed = btoa(jsonString);
      return { __compressed: true, data: compressed } as T;
    } catch {
      return data;
    }
  }

  private decompress(data: T): T {
    try {
      if (this.isCompressed(data)) {
        const compressed = data as any;
        const jsonString = atob(compressed.data);
        return JSON.parse(jsonString);
      }
      return data;
    } catch {
      return data;
    }
  }

  private isCompressed(data: T): boolean {
    return typeof data === 'object' && data !== null && (data as any).__compressed === true;
  }

  private calculateAccessScore(entry: CacheEntry<T>): number {
    const now = Date.now();
    const age = now - entry.timestamp;
    const timeSinceAccess = now - entry.lastAccessed;
    
    // 訪問頻率越高，最近訪問越近，分數越高
    return entry.accessCount / (age + timeSinceAccess + 1);
  }

  private generateVersion(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private updateHitRate(): void {
    const total = this.hits + this.misses;
    this.stats.hitRate = total > 0 ? this.hits / total : 0;
    this.stats.missRate = total > 0 ? this.misses / total : 0;
  }

  private startMemoryMonitoring(): void {
    setInterval(() => {
      if (this.stats.totalSize > this.config.maxMemoryUsage * 0.9) {
        this.cleanup();
      }
    }, 30000); // 每30秒檢查一次
  }

  private persistEntry(key: string, entry: CacheEntry<T>): void {
    if (!this.config.enablePersistence) return;
    
    try {
      const persistKey = `cache_${this.namespace}_${key}`;
      localStorage.setItem(persistKey, JSON.stringify(entry));
    } catch (error) {
      console.warn('快取持久化失敗:', error);
    }
  }

  private loadFromPersistence(): void {
    if (!this.config.enablePersistence) return;

    try {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith(`cache_${this.namespace}_`)
      );

      keys.forEach(persistKey => {
        try {
          const entry = JSON.parse(localStorage.getItem(persistKey) || '');
          const cacheKey = persistKey.replace(`cache_${this.namespace}_`, '');
          
          // 檢查是否過期
          if (Date.now() <= entry.expiryTime) {
            this.cache.set(cacheKey, entry);
            this.stats.totalSize += entry.size;
            this.stats.entryCount++;
          } else {
            localStorage.removeItem(persistKey);
          }
        } catch (error) {
          localStorage.removeItem(persistKey);
        }
      });
    } catch (error) {
      console.warn('從持久化存儲載入快取失敗:', error);
    }
  }

  private removePersistentEntry(key: string): void {
    if (!this.config.enablePersistence) return;
    
    try {
      const persistKey = `cache_${this.namespace}_${key}`;
      localStorage.removeItem(persistKey);
    } catch (error) {
      console.warn('移除持久化快取失敗:', error);
    }
  }

  private clearPersistence(): void {
    if (!this.config.enablePersistence) return;

    try {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith(`cache_${this.namespace}_`)
      );
      keys.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('清除持久化快取失敗:', error);
    }
  }
}

/**
 * 快取管理器 - 管理多個快取實例
 */
export class CacheManager {
  private caches = new Map<string, IntelligentCache<any>>();
  private defaultConfig: CacheConfig = {
    maxSize: 1000,
    defaultTTL: 300000, // 5分鐘
    maxMemoryUsage: 50 * 1024 * 1024, // 50MB
    compressionThreshold: 1024, // 1KB
    enableCompression: true,
    enablePersistence: true
  };

  /**
   * 獲取或創建快取實例
   */
  getCache<T>(namespace: string, config?: Partial<CacheConfig>): IntelligentCache<T> {
    if (!this.caches.has(namespace)) {
      const finalConfig = { ...this.defaultConfig, ...config };
      this.caches.set(namespace, new IntelligentCache<T>(finalConfig, namespace));
    }
    return this.caches.get(namespace)!;
  }

  /**
   * 獲取所有快取統計
   */
  getAllStats(): Record<string, CacheStats> {
    const stats: Record<string, CacheStats> = {};
    this.caches.forEach((cache, namespace) => {
      stats[namespace] = cache.getStats();
    });
    return stats;
  }

  /**
   * 清理所有快取
   */
  clearAll(): void {
    this.caches.forEach(cache => cache.clear());
  }

  /**
   * 全局清理
   */
  globalCleanup(): void {
    this.caches.forEach(cache => cache.cleanup());
  }
}

// 全局快取管理器實例
export const globalCacheManager = new CacheManager();

// 特定用途的快取實例
export const blockDefinitionCache = globalCacheManager.getCache('block_definitions', {
  defaultTTL: 3600000, // 1小時
  maxSize: 500
});

export const flexMessagePreviewCache = globalCacheManager.getCache('flex_preview', {
  defaultTTL: 1800000, // 30分鐘
  maxSize: 200
});

export const codeGenerationCache = globalCacheManager.getCache('code_generation', {
  defaultTTL: 1800000, // 30分鐘
  maxSize: 100
});

export const resourceCache = globalCacheManager.getCache('resources', {
  defaultTTL: 7200000, // 2小時
  maxSize: 1000
});