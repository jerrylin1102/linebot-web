/**
 * 積木初始化管理系統
 * 提供可靠、高效的積木載入和初始化機制
 */

import { BlockDefinition } from "./types";
import { blockRegistry } from "./registry";

/**
 * 初始化狀態枚舉
 */
export enum InitializationState {
  IDLE = 'idle',
  LOADING = 'loading',
  RESOLVING_DEPENDENCIES = 'resolving_dependencies',
  REGISTERING_BLOCKS = 'registering_blocks',
  VALIDATING = 'validating',
  READY = 'ready',
  ERROR = 'error',
  RETRYING = 'retrying'
}

/**
 * 初始化錯誤類型
 */
export enum InitializationErrorType {
  MODULE_LOAD_FAILED = 'module_load_failed',
  DEPENDENCY_RESOLUTION_FAILED = 'dependency_resolution_failed',
  BLOCK_REGISTRATION_FAILED = 'block_registration_failed',
  VALIDATION_FAILED = 'validation_failed',
  TIMEOUT = 'timeout',
  UNKNOWN = 'unknown'
}

/**
 * 初始化錯誤類
 */
export class InitializationError extends Error {
  constructor(
    public type: InitializationErrorType,
    message: string,
    public blockId?: string,
    public retryable = true,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'InitializationError';
  }
}

/**
 * 初始化進度介面
 */
export interface InitializationProgress {
  state: InitializationState;
  completed: number;
  total: number;
  percentage: number;
  currentOperation: string;
  startTime: Date;
  estimatedTimeRemaining?: number;
  errors: InitializationError[];
  warnings: string[];
}

/**
 * 初始化配置介面
 */
export interface InitializationConfig {
  timeout: number; // 初始化超時時間（毫秒）
  maxRetries: number; // 最大重試次數
  retryDelay: number; // 重試延遲時間（毫秒）
  enableCache: boolean; // 是否啟用快取
  progressCallback?: (progress: InitializationProgress) => void;
  errorCallback?: (error: InitializationError) => void;
  enableDiagnostics: boolean; // 是否啟用診斷模式
}

/**
 * 積木依賴關係介面
 */
export interface BlockDependency {
  blockId: string;
  dependencies: string[];
  optional: boolean;
}

/**
 * 初始化結果介面
 */
export interface InitializationResult {
  success: boolean;
  state: InitializationState;
  blocksLoaded: number;
  totalTime: number;
  errors: InitializationError[];
  warnings: string[];
  cache: {
    hits: number;
    misses: number;
    efficiency: number;
  };
}

/**
 * 積木快取項目介面
 */
export interface BlockCacheItem {
  definition: BlockDefinition;
  timestamp: Date;
  version: string;
  checksum: string;
}

/**
 * 快取配置介面
 */
export interface CacheConfig {
  maxAge: number; // 快取最大存活時間（毫秒）
  maxSize: number; // 快取最大項目數
  enableCompression: boolean; // 是否啟用壓縮
}

/**
 * 初始化事件類型
 */
export type InitializationEventType = 
  | 'state-changed'
  | 'progress-updated'
  | 'error-occurred'
  | 'block-loaded'
  | 'dependencies-resolved'
  | 'initialization-completed'
  | 'cache-updated';

/**
 * 初始化事件介面
 */
export interface InitializationEvent {
  type: InitializationEventType;
  timestamp: Date;
  data?: unknown;
  blockId?: string;
}

/**
 * 事件監聽器類型
 */
export type InitializationEventListener = (event: InitializationEvent) => void;

/**
 * 預設初始化配置
 */
export const DEFAULT_INITIALIZATION_CONFIG: InitializationConfig = {
  timeout: 10000, // 10秒超時
  maxRetries: 3,
  retryDelay: 1000, // 1秒重試延遲
  enableCache: true,
  enableDiagnostics: false
};

/**
 * 預設快取配置
 */
export const DEFAULT_CACHE_CONFIG: CacheConfig = {
  maxAge: 24 * 60 * 60 * 1000, // 24小時
  maxSize: 1000, // 最多1000個項目
  enableCompression: true
};

/**
 * 積木初始化管理器
 * 提供完整的積木載入、依賴解析、快取和錯誤處理功能
 */
export class BlockInitializationManager {
  private static instance: BlockInitializationManager;
  
  private state: InitializationState = InitializationState.IDLE;
  private initializationPromise: Promise<InitializationResult> | null = null;
  private config: InitializationConfig;
  private cacheConfig: CacheConfig;
  
  private progress: InitializationProgress;
  private eventListeners: Map<InitializationEventType, Set<InitializationEventListener>> = new Map();
  private cache: Map<string, BlockCacheItem> = new Map();
  private dependencies: Map<string, BlockDependency> = new Map();
  
  // 診斷資訊
  private diagnostics = {
    initializationCount: 0,
    totalInitializationTime: 0,
    cacheHits: 0,
    cacheMisses: 0,
    errorCount: 0,
    retryCount: 0
  };

  /**
   * 獲取單例實例
   */
  static getInstance(): BlockInitializationManager {
    if (!BlockInitializationManager.instance) {
      BlockInitializationManager.instance = new BlockInitializationManager();
    }
    return BlockInitializationManager.instance;
  }

  /**
   * 私有建構函數
   */
  private constructor() {
    this.config = { ...DEFAULT_INITIALIZATION_CONFIG };
    this.cacheConfig = { ...DEFAULT_CACHE_CONFIG };
    this.progress = this.createInitialProgress();
    
    // 初始化事件監聽器映射
    Object.values([
      'state-changed',
      'progress-updated', 
      'error-occurred',
      'block-loaded',
      'dependencies-resolved',
      'initialization-completed',
      'cache-updated'
    ] as InitializationEventType[]).forEach(eventType => {
      this.eventListeners.set(eventType, new Set());
    });

    // 啟動快取清理定時器
    if (this.config.enableCache) {
      this.startCacheCleanup();
    }
  }

  /**
   * 配置初始化設定
   */
  configure(config: Partial<InitializationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 配置快取設定
   */
  configureCaching(config: Partial<CacheConfig>): void {
    this.cacheConfig = { ...this.cacheConfig, ...config };
  }

  /**
   * 初始化積木系統
   */
  async initialize(): Promise<InitializationResult> {
    // 如果已經在初始化中，返回現有的Promise
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    // 如果已經初始化完成且沒有錯誤，返回快取結果
    if (this.state === InitializationState.READY) {
      return this.createSuccessResult();
    }

    this.initializationPromise = this.performInitialization();
    return this.initializationPromise;
  }

  /**
   * 重新初始化積木系統
   */
  async reinitialize(): Promise<InitializationResult> {
    this.reset();
    return this.initialize();
  }

  /**
   * 重置初始化狀態
   */
  reset(): void {
    this.initializationPromise = null;
    this.state = InitializationState.IDLE;
    this.progress = this.createInitialProgress();
    this.cache.clear();
    this.dependencies.clear();
    blockRegistry.reset();
  }

  /**
   * 獲取當前初始化狀態
   */
  getState(): InitializationState {
    return this.state;
  }

  /**
   * 獲取初始化進度
   */
  getProgress(): InitializationProgress {
    return { ...this.progress };
  }

  /**
   * 檢查是否已準備就緒
   */
  isReady(): boolean {
    return this.state === InitializationState.READY;
  }

  /**
   * 獲取診斷資訊
   */
  getDiagnostics() {
    return {
      ...this.diagnostics,
      cacheSize: this.cache.size,
      cacheEfficiency: this.diagnostics.cacheHits / (this.diagnostics.cacheHits + this.diagnostics.cacheMisses) || 0,
      averageInitializationTime: this.diagnostics.totalInitializationTime / this.diagnostics.initializationCount || 0
    };
  }

  /**
   * 添加事件監聽器
   */
  addEventListener(eventType: InitializationEventType, listener: InitializationEventListener): () => void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
    return () => {};
  }

  /**
   * 等待初始化完成
   */
  async waitForReady(): Promise<void> {
    if (this.isReady()) {
      return;
    }
    
    if (this.initializationPromise) {
      await this.initializationPromise;
      return;
    }
    
    await this.initialize();
  }

  /**
   * 執行實際的初始化過程
   */
  private async performInitialization(): Promise<InitializationResult> {
    const startTime = Date.now();
    this.diagnostics.initializationCount++;
    
    let retryCount = 0;
    
    while (retryCount <= this.config.maxRetries) {
      try {
        if (retryCount > 0) {
          this.updateState(InitializationState.RETRYING);
          this.updateProgress(0, 5, `重試初始化 (第 ${retryCount} 次)`);
          this.diagnostics.retryCount++;
          
          // 重試前的延遲
          await this.delay(this.config.retryDelay * retryCount);
        }
        
        this.updateState(InitializationState.LOADING);
        this.updateProgress(0, 5, "開始初始化積木系統");

        // 第1步：載入積木模組
        const definitions = await this.withTimeout(
          this.loadBlockModules(),
          this.config.timeout / 5,
          "載入積木模組超時"
        );
        this.updateProgress(1, 5, "載入積木模組完成");

        // 第2步：解析依賴關係
        this.updateState(InitializationState.RESOLVING_DEPENDENCIES);
        const sortedDefinitions = await this.withTimeout(
          this.resolveDependencies(definitions),
          this.config.timeout / 5,
          "解析依賴關係超時"
        );
        this.updateProgress(2, 5, "解析依賴關係完成");

        // 第3步：註冊積木
        this.updateState(InitializationState.REGISTERING_BLOCKS);
        await this.withTimeout(
          this.registerBlocks(sortedDefinitions),
          this.config.timeout / 2,
          "註冊積木超時"
        );
        this.updateProgress(3, 5, "註冊積木完成");

        // 第4步：驗證積木
        this.updateState(InitializationState.VALIDATING);
        await this.withTimeout(
          this.validateBlocks(),
          this.config.timeout / 5,
          "驗證積木超時"
        );
        this.updateProgress(4, 5, "驗證積木完成");

        // 第5步：完成初始化
        this.updateState(InitializationState.READY);
        this.updateProgress(5, 5, "積木系統初始化完成");

        const totalTime = Date.now() - startTime;
        this.diagnostics.totalInitializationTime += totalTime;

        const result = this.createSuccessResult(totalTime);
        this.emitEvent('initialization-completed', { result });
        
        return result;

      } catch (error) {
        retryCount++;
        this.diagnostics.errorCount++;
        
        const initError = error instanceof InitializationError 
          ? error 
          : new InitializationError(
              InitializationErrorType.UNKNOWN,
              `初始化失敗: ${error instanceof Error ? error.message : '未知錯誤'}`,
              undefined,
              true,
              error instanceof Error ? error : undefined
            );

        this.progress.errors.push(initError);
        this.config.errorCallback?.(initError);
        this.emitEvent('error-occurred', { error: initError });

        // 如果是不可重試的錯誤或達到最大重試次數，停止重試
        if (!initError.retryable || retryCount > this.config.maxRetries) {
          this.updateState(InitializationState.ERROR);
          return this.createErrorResult(initError, Date.now() - startTime);
        }
        
        console.warn(`初始化失敗，準備重試 (${retryCount}/${this.config.maxRetries}):`, initError.message);
      }
    }
    
    // 這行應該不會執行到，但為了 TypeScript 類型檢查
    this.updateState(InitializationState.ERROR);
    const finalError = new InitializationError(
      InitializationErrorType.UNKNOWN,
      "初始化失敗且重試次數已用盡"
    );
    return this.createErrorResult(finalError, Date.now() - startTime);
  }

  /**
   * 為異步操作添加超時控制
   */
  private async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    timeoutMessage: string
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new InitializationError(
          InitializationErrorType.TIMEOUT,
          timeoutMessage,
          undefined,
          true
        ));
      }, timeoutMs);

      promise
        .then(result => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }

  /**
   * 延遲函數
   */
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 載入積木模組
   */
  private async loadBlockModules(): Promise<BlockDefinition[]> {
    console.log("📦 載入積木模組...");
    
    const allDefinitions: BlockDefinition[] = [];
    const _moduleLoadPromises: Promise<unknown>[] = [];

    try {
      // 載入所有積木模組
      const modules = [
        () => import("./event"),
        () => import("./reply"),
        () => import("./control"),
        () => import("./setting"),
        () => import("./flex-container"),
        () => import("./flex-content"),
        () => import("./flex-layout"),
        () => import("./actions")
      ];

      // 並行載入所有模組
      const loadedModules = await Promise.all(
        modules.map(async (moduleLoader, index) => {
          try {
            const module = await moduleLoader();
            return { module, index };
          } catch (error) {
            const loadError = new InitializationError(
              InitializationErrorType.MODULE_LOAD_FAILED,
              `載入積木模組 ${index} 失敗: ${error instanceof Error ? error.message : '未知錯誤'}`,
              undefined,
              true,
              error instanceof Error ? error : undefined
            );
            this.progress.errors.push(loadError);
            this.emitEvent('error-occurred', { error: loadError });
            return null;
          }
        })
      );

      // 收集所有積木定義
      loadedModules.forEach((result) => {
        if (result && result.module) {
          Object.values(result.module).forEach((exportedItem) => {
            if (
              exportedItem &&
              typeof exportedItem === "object" &&
              "id" in exportedItem &&
              "blockType" in exportedItem
            ) {
              allDefinitions.push(exportedItem as BlockDefinition);
            }
          });
        }
      });

      console.log(`📦 成功載入 ${allDefinitions.length} 個積木定義`);
      return allDefinitions;

    } catch (error) {
      throw new InitializationError(
        InitializationErrorType.MODULE_LOAD_FAILED,
        `積木模組載入失敗: ${error instanceof Error ? error.message : '未知錯誤'}`,
        undefined,
        true,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * 解析依賴關係
   */
  private async resolveDependencies(definitions: BlockDefinition[]): Promise<BlockDefinition[]> {
    console.log("🔗 解析積木依賴關係...");
    
    // 分析積木間的依賴關係
    const dependencyGraph = new Map<string, Set<string>>();
    const reverseDependencyGraph = new Map<string, Set<string>>();
    
    // 構建依賴圖
    definitions.forEach(def => {
      dependencyGraph.set(def.id, new Set());
      reverseDependencyGraph.set(def.id, new Set());
      
      // 檢查是否有依賴配置
      if (def.dependencies) {
        def.dependencies.forEach(depId => {
          dependencyGraph.get(def.id)?.add(depId);
          if (!reverseDependencyGraph.has(depId)) {
            reverseDependencyGraph.set(depId, new Set());
          }
          reverseDependencyGraph.get(depId)?.add(def.id);
        });
      }
    });

    // 拓撲排序以解決依賴順序
    const sortedDefinitions = this.topologicalSort(definitions, dependencyGraph);
    
    console.log(`🔗 依賴關係解析完成，排序後有 ${sortedDefinitions.length} 個積木`);
    this.emitEvent('dependencies-resolved', { 
      dependencies: Array.from(this.dependencies.values()),
      sortedOrder: sortedDefinitions.map(d => d.id)
    });
    
    return sortedDefinitions;
  }

  /**
   * 拓撲排序算法
   */
  private topologicalSort(definitions: BlockDefinition[], dependencyGraph: Map<string, Set<string>>): BlockDefinition[] {
    const result: BlockDefinition[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const definitionMap = new Map(definitions.map(def => [def.id, def]));

    const visit = (blockId: string): void => {
      if (visited.has(blockId)) return;
      
      if (visiting.has(blockId)) {
        throw new InitializationError(
          InitializationErrorType.DEPENDENCY_RESOLUTION_FAILED,
          `檢測到循環依賴: ${blockId}`,
          blockId
        );
      }

      visiting.add(blockId);
      
      const dependencies = dependencyGraph.get(blockId) || new Set();
      dependencies.forEach(depId => {
        if (definitionMap.has(depId)) {
          visit(depId);
        }
      });
      
      visiting.delete(blockId);
      visited.add(blockId);
      
      const definition = definitionMap.get(blockId);
      if (definition) {
        result.push(definition);
      }
    };

    definitions.forEach(def => {
      if (!visited.has(def.id)) {
        visit(def.id);
      }
    });

    return result;
  }

  /**
   * 註冊積木
   */
  private async registerBlocks(definitions: BlockDefinition[]): Promise<void> {
    console.log("📝 註冊積木...");
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const definition of definitions) {
      try {
        // 檢查快取
        const cacheKey = this.generateCacheKey(definition);
        if (this.config.enableCache && this.cache.has(cacheKey)) {
          this.diagnostics.cacheHits++;
          console.log(`💾 從快取載入積木: ${definition.id}`);
        } else {
          this.diagnostics.cacheMisses++;
          
          // 註冊積木
          blockRegistry.register(definition);
          
          // 快取積木定義
          if (this.config.enableCache) {
            this.cache.set(cacheKey, {
              definition,
              timestamp: new Date(),
              version: "1.0", // 可以從定義中獲取版本
              checksum: cacheKey
            });
          }
        }
        
        successCount++;
        this.emitEvent('block-loaded', { blockId: definition.id, definition });
        
      } catch (error) {
        errorCount++;
        const regError = new InitializationError(
          InitializationErrorType.BLOCK_REGISTRATION_FAILED,
          `積木註冊失敗 ${definition.id}: ${error instanceof Error ? error.message : '未知錯誤'}`,
          definition.id,
          true,
          error instanceof Error ? error : undefined
        );
        
        this.progress.errors.push(regError);
        this.emitEvent('error-occurred', { error: regError });
        
        // 如果是關鍵積木註冊失敗，可能需要拋出錯誤
        if (!definition.optional) {
          console.error(`❌ 關鍵積木註冊失敗: ${definition.id}`, error);
        }
      }
    }
    
    console.log(`📝 積木註冊完成: 成功 ${successCount}，失敗 ${errorCount}`);
    
    if (errorCount > 0 && successCount === 0) {
      throw new InitializationError(
        InitializationErrorType.BLOCK_REGISTRATION_FAILED,
        `所有積木註冊都失敗了`
      );
    }
  }

  /**
   * 驗證積木
   */
  private async validateBlocks(): Promise<void> {
    console.log("✅ 驗證積木...");
    
    const stats = blockRegistry.getStatistics();
    const allBlocks = blockRegistry.getAllBlocks();
    
    // 基本驗證
    if (allBlocks.length === 0) {
      throw new InitializationError(
        InitializationErrorType.VALIDATION_FAILED,
        "沒有成功載入任何積木"
      );
    }
    
    // 驗證每個類別至少有一個積木
    const requiredCategories = ['EVENT', 'REPLY', 'CONTROL'];
    const missingCategories = requiredCategories.filter(
      category => !stats.categoryStats[category as keyof typeof stats.categoryStats] || 
                  stats.categoryStats[category as keyof typeof stats.categoryStats] === 0
    );
    
    if (missingCategories.length > 0) {
      this.progress.warnings.push(`缺少必要類別的積木: ${missingCategories.join(', ')}`);
    }
    
    // 驗證積木的完整性
    const invalidBlocks: string[] = [];
    allBlocks.forEach(item => {
      const def = item.definition;
      if (!def.id || !def.blockType || !def.displayName) {
        invalidBlocks.push(def.id || 'unknown');
      }
    });
    
    if (invalidBlocks.length > 0) {
      this.progress.warnings.push(`發現不完整的積木定義: ${invalidBlocks.join(', ')}`);
    }
    
    console.log(`✅ 積木驗證完成: 總計 ${allBlocks.length} 個積木，${this.progress.warnings.length} 個警告`);
  }

  /**
   * 生成快取鍵值
   */
  private generateCacheKey(definition: BlockDefinition): string {
    // 使用積木ID和關鍵屬性生成快取鍵值
    const keyData = {
      id: definition.id,
      blockType: definition.blockType,
      version: definition.version || "1.0"
    };
    return btoa(JSON.stringify(keyData));
  }

  /**
   * 更新初始化狀態
   */
  private updateState(newState: InitializationState): void {
    if (this.state !== newState) {
      this.state = newState;
      this.progress.state = newState;
      this.emitEvent('state-changed', { state: newState });
    }
  }

  /**
   * 更新初始化進度
   */
  private updateProgress(completed: number, total: number, operation: string): void {
    this.progress.completed = completed;
    this.progress.total = total;
    this.progress.percentage = Math.round((completed / total) * 100);
    this.progress.currentOperation = operation;
    
    const elapsed = Date.now() - this.progress.startTime.getTime();
    if (completed > 0) {
      this.progress.estimatedTimeRemaining = Math.round((elapsed / completed) * (total - completed));
    }

    this.config.progressCallback?.(this.progress);
    this.emitEvent('progress-updated', { progress: this.progress });
  }

  /**
   * 發出事件
   */
  private emitEvent(eventType: InitializationEventType, data?: unknown): void {
    const event: InitializationEvent = {
      type: eventType,
      timestamp: new Date(),
      data
    };

    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error(`初始化事件監聽器錯誤 (${eventType}):`, error);
        }
      });
    }
  }

  /**
   * 建立初始進度物件
   */
  private createInitialProgress(): InitializationProgress {
    return {
      state: InitializationState.IDLE,
      completed: 0,
      total: 0,
      percentage: 0,
      currentOperation: "等待初始化",
      startTime: new Date(),
      errors: [],
      warnings: []
    };
  }

  /**
   * 建立成功結果
   */
  private createSuccessResult(totalTime = 0): InitializationResult {
    return {
      success: true,
      state: this.state,
      blocksLoaded: blockRegistry.getAllBlocks().length,
      totalTime,
      errors: [],
      warnings: this.progress.warnings,
      cache: {
        hits: this.diagnostics.cacheHits,
        misses: this.diagnostics.cacheMisses,
        efficiency: this.diagnostics.cacheHits / (this.diagnostics.cacheHits + this.diagnostics.cacheMisses) || 0
      }
    };
  }

  /**
   * 建立錯誤結果
   */
  private createErrorResult(error: InitializationError, totalTime: number): InitializationResult {
    return {
      success: false,
      state: this.state,
      blocksLoaded: blockRegistry.getAllBlocks().length,
      totalTime,
      errors: [error],
      warnings: this.progress.warnings,
      cache: {
        hits: this.diagnostics.cacheHits,
        misses: this.diagnostics.cacheMisses,
        efficiency: this.diagnostics.cacheHits / (this.diagnostics.cacheHits + this.diagnostics.cacheMisses) || 0
      }
    };
  }

  /**
   * 啟動快取清理定時器
   */
  private startCacheCleanup(): void {
    setInterval(() => {
      this.cleanExpiredCache();
    }, 60000); // 每分鐘清理一次
  }

  /**
   * 清理過期快取
   */
  private cleanExpiredCache(): void {
    const now = Date.now();
    const maxAge = this.cacheConfig.maxAge;
    
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp.getTime() > maxAge) {
        this.cache.delete(key);
      }
    }
    
    // 如果快取超過最大大小，移除最舊的項目
    if (this.cache.size > this.cacheConfig.maxSize) {
      const entries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp.getTime() - b[1].timestamp.getTime());
      
      const toRemove = entries.slice(0, this.cache.size - this.cacheConfig.maxSize);
      toRemove.forEach(([key]) => this.cache.delete(key));
    }
  }
}

// 導出單例實例
export const blockInitializationManager = BlockInitializationManager.getInstance();