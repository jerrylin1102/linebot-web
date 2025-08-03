/**
 * 資料快取服務
 * 解決 visual-editor 頁面重複讀取資料庫的問題
 */

import VisualEditorApi, {
  LogicTemplate,
  LogicTemplateSummary,
  FlexMessage,
  FlexMessageSummary,
  BotSummary
} from './visualEditorApi';

// 快取項目介面
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expireTime: number;
}

// 快取配置
const CACHE_CONFIG = {
  // 快取過期時間（毫秒）
  BOT_SUMMARY_TTL: 5 * 60 * 1000, // 5分鐘
  LOGIC_TEMPLATES_TTL: 3 * 60 * 1000, // 3分鐘
  LOGIC_TEMPLATE_TTL: 2 * 60 * 1000, // 2分鐘
  FLEX_MESSAGES_TTL: 3 * 60 * 1000, // 3分鐘
  FLEX_MESSAGE_SUMMARY_TTL: 2 * 60 * 1000, // 2分鐘
  
  // 請求去重時間（毫秒）
  REQUEST_DEDUPE_TIME: 1000, // 1秒內的重複請求會被去重
} as const;

// 進行中的請求追蹤
interface PendingRequest<T> {
  promise: Promise<T>;
  timestamp: number;
}

export class DataCacheService {
  private static instance: DataCacheService;
  
  // 各種資料的快取存儲
  private botSummaryCache: CacheItem<BotSummary[]> | null = null;
  private logicTemplatesCache = new Map<string, CacheItem<LogicTemplateSummary[]>>();
  private logicTemplateCache = new Map<string, CacheItem<LogicTemplate>>();
  private flexMessagesCache: CacheItem<FlexMessage[]> | null = null;
  private flexMessageSummaryCache: CacheItem<FlexMessageSummary[]> | null = null;
  
  // 進行中的請求追蹤，避免重複請求
  private pendingRequests = new Map<string, PendingRequest<any>>();
  
  private constructor() {
    // 每5分鐘清理一次過期快取
    setInterval(() => this.cleanExpiredCache(), 5 * 60 * 1000);
  }
  
  static getInstance(): DataCacheService {
    if (!DataCacheService.instance) {
      DataCacheService.instance = new DataCacheService();
    }
    return DataCacheService.instance;
  }
  
  /**
   * 清理過期的快取項目
   */
  private cleanExpiredCache(): void {
    const now = Date.now();
    
    // 清理過期的邏輯模板快取
    for (const [key, item] of this.logicTemplatesCache.entries()) {
      if (now > item.expireTime) {
        this.logicTemplatesCache.delete(key);
      }
    }
    
    for (const [key, item] of this.logicTemplateCache.entries()) {
      if (now > item.expireTime) {
        this.logicTemplateCache.delete(key);
      }
    }
    
    // 清理過期的其他快取
    if (this.botSummaryCache && now > this.botSummaryCache.expireTime) {
      this.botSummaryCache = null;
    }
    
    if (this.flexMessagesCache && now > this.flexMessagesCache.expireTime) {
      this.flexMessagesCache = null;
    }
    
    if (this.flexMessageSummaryCache && now > this.flexMessageSummaryCache.expireTime) {
      this.flexMessageSummaryCache = null;
    }
  }
  
  /**
   * 檢查快取是否有效
   */
  private isCacheValid<T>(cache: CacheItem<T> | null | undefined): boolean {
    return cache !== null && cache !== undefined && Date.now() < cache.expireTime;
  }
  
  /**
   * 創建快取項目
   */
  private createCacheItem<T>(data: T, ttl: number): CacheItem<T> {
    const now = Date.now();
    return {
      data,
      timestamp: now,
      expireTime: now + ttl
    };
  }
  
  /**
   * 請求去重處理
   */
  private async withRequestDeduplication<T>(
    key: string,
    requestFn: () => Promise<T>
  ): Promise<T> {
    const now = Date.now();
    const pending = this.pendingRequests.get(key);
    
    // 如果有進行中的請求且時間在去重範圍內，直接返回該請求
    if (pending && (now - pending.timestamp) < CACHE_CONFIG.REQUEST_DEDUPE_TIME) {
      console.log(`[DataCache] 請求去重: ${key}`);
      return pending.promise;
    }
    
    // 創建新的請求
    const promise = requestFn().finally(() => {
      // 請求完成後清理追蹤
      this.pendingRequests.delete(key);
    });
    
    this.pendingRequests.set(key, { promise, timestamp: now });
    return promise;
  }
  
  /**
   * 取得用戶Bot摘要列表
   */
  async getUserBotsSummary(): Promise<BotSummary[]> {
    // 檢查快取
    if (this.isCacheValid(this.botSummaryCache)) {
      console.log('[DataCache] 使用快取: Bot摘要列表');
      return this.botSummaryCache!.data;
    }
    
    // 使用請求去重
    return this.withRequestDeduplication('bot-summary', async () => {
      console.log('[DataCache] API請求: Bot摘要列表');
      const data = await VisualEditorApi.getUserBotsSummary();
      this.botSummaryCache = this.createCacheItem(data, CACHE_CONFIG.BOT_SUMMARY_TTL);
      return data;
    });
  }
  
  /**
   * 取得Bot的邏輯模板摘要列表
   */
  async getBotLogicTemplatesSummary(botId: string): Promise<LogicTemplateSummary[]> {
    const cacheKey = `logic-templates-${botId}`;
    const cached = this.logicTemplatesCache.get(cacheKey);
    
    // 檢查快取
    if (this.isCacheValid(cached)) {
      console.log(`[DataCache] 使用快取: 邏輯模板摘要 (Bot: ${botId})`);
      return cached!.data;
    }
    
    // 使用請求去重
    return this.withRequestDeduplication(cacheKey, async () => {
      console.log(`[DataCache] API請求: 邏輯模板摘要 (Bot: ${botId})`);
      const data = await VisualEditorApi.getBotLogicTemplatesSummary(botId);
      this.logicTemplatesCache.set(cacheKey, this.createCacheItem(data, CACHE_CONFIG.LOGIC_TEMPLATES_TTL));
      return data;
    });
  }
  
  /**
   * 取得特定邏輯模板
   */
  async getLogicTemplate(templateId: string): Promise<LogicTemplate> {
    const cached = this.logicTemplateCache.get(templateId);
    
    // 檢查快取
    if (this.isCacheValid(cached)) {
      console.log(`[DataCache] 使用快取: 邏輯模板 (${templateId})`);
      return cached!.data;
    }
    
    // 使用請求去重
    return this.withRequestDeduplication(`logic-template-${templateId}`, async () => {
      console.log(`[DataCache] API請求: 邏輯模板 (${templateId})`);
      const data = await VisualEditorApi.getLogicTemplate(templateId);
      this.logicTemplateCache.set(templateId, this.createCacheItem(data, CACHE_CONFIG.LOGIC_TEMPLATE_TTL));
      return data;
    });
  }
  
  /**
   * 取得用戶的FLEX訊息列表
   */
  async getUserFlexMessages(): Promise<FlexMessage[]> {
    // 檢查快取
    if (this.isCacheValid(this.flexMessagesCache)) {
      console.log('[DataCache] 使用快取: FLEX訊息列表');
      return this.flexMessagesCache!.data;
    }
    
    // 使用請求去重
    return this.withRequestDeduplication('flex-messages', async () => {
      console.log('[DataCache] API請求: FLEX訊息列表');
      const data = await VisualEditorApi.getUserFlexMessages();
      this.flexMessagesCache = this.createCacheItem(data, CACHE_CONFIG.FLEX_MESSAGES_TTL);
      return data;
    });
  }
  
  /**
   * 取得用戶FLEX訊息摘要列表
   */
  async getUserFlexMessagesSummary(): Promise<FlexMessageSummary[]> {
    // 檢查快取
    if (this.isCacheValid(this.flexMessageSummaryCache)) {
      console.log('[DataCache] 使用快取: FLEX訊息摘要列表');
      return this.flexMessageSummaryCache!.data;
    }
    
    // 使用請求去重
    return this.withRequestDeduplication('flex-message-summary', async () => {
      console.log('[DataCache] API請求: FLEX訊息摘要列表');
      const data = await VisualEditorApi.getUserFlexMessagesSummary();
      this.flexMessageSummaryCache = this.createCacheItem(data, CACHE_CONFIG.FLEX_MESSAGE_SUMMARY_TTL);
      return data;
    });
  }
  
  /**
   * 創建新的邏輯模板（會更新相關快取）
   */
  async createLogicTemplate(botId: string, data: any): Promise<LogicTemplate> {
    const result = await VisualEditorApi.createLogicTemplate(botId, data);
    
    // 清理相關快取，強制下次重新載入
    this.invalidateLogicTemplatesCache(botId);
    this.logicTemplateCache.set(result.id, this.createCacheItem(result, CACHE_CONFIG.LOGIC_TEMPLATE_TTL));
    
    console.log(`[DataCache] 創建邏輯模板並更新快取: ${result.id}`);
    return result;
  }
  
  /**
   * 更新邏輯模板（會更新相關快取）
   */
  async updateLogicTemplate(templateId: string, data: any): Promise<LogicTemplate> {
    const result = await VisualEditorApi.updateLogicTemplate(templateId, data);
    
    // 更新快取
    this.logicTemplateCache.set(templateId, this.createCacheItem(result, CACHE_CONFIG.LOGIC_TEMPLATE_TTL));
    
    console.log(`[DataCache] 更新邏輯模板並更新快取: ${templateId}`);
    return result;
  }
  
  /**
   * 創建新的FLEX訊息（會更新相關快取）
   */
  async createFlexMessage(data: any): Promise<FlexMessage> {
    const result = await VisualEditorApi.createFlexMessage(data);
    
    // 清理相關快取，強制下次重新載入
    this.invalidateFlexMessagesCache();
    
    console.log(`[DataCache] 創建FLEX訊息並清理快取: ${result.id}`);
    return result;
  }
  
  /**
   * 更新FLEX訊息（會更新相關快取）
   */
  async updateFlexMessage(messageId: string, data: any): Promise<FlexMessage> {
    const result = await VisualEditorApi.updateFlexMessage(messageId, data);
    
    // 清理相關快取，強制下次重新載入
    this.invalidateFlexMessagesCache();
    
    console.log(`[DataCache] 更新FLEX訊息並清理快取: ${messageId}`);
    return result;
  }
  
  /**
   * 使邏輯模板快取失效
   */
  invalidateLogicTemplatesCache(botId: string): void {
    const cacheKey = `logic-templates-${botId}`;
    this.logicTemplatesCache.delete(cacheKey);
    console.log(`[DataCache] 清理邏輯模板快取: Bot ${botId}`);
  }
  
  /**
   * 使特定邏輯模板快取失效
   */
  invalidateLogicTemplateCache(templateId: string): void {
    this.logicTemplateCache.delete(templateId);
    console.log(`[DataCache] 清理邏輯模板快取: ${templateId}`);
  }
  
  /**
   * 使FLEX訊息快取失效
   */
  invalidateFlexMessagesCache(): void {
    this.flexMessagesCache = null;
    this.flexMessageSummaryCache = null;
    console.log('[DataCache] 清理FLEX訊息快取');
  }
  
  /**
   * 清空所有快取
   */
  clearAllCache(): void {
    this.botSummaryCache = null;
    this.logicTemplatesCache.clear();
    this.logicTemplateCache.clear();
    this.flexMessagesCache = null;
    this.flexMessageSummaryCache = null;
    this.pendingRequests.clear();
    console.log('[DataCache] 清空所有快取');
  }
  
  /**
   * 取得快取統計資訊
   */
  getCacheStats(): {
    botSummary: boolean;
    logicTemplatesCount: number;
    logicTemplateCount: number;
    flexMessages: boolean;
    flexMessageSummary: boolean;
    pendingRequestsCount: number;
  } {
    return {
      botSummary: this.isCacheValid(this.botSummaryCache),
      logicTemplatesCount: this.logicTemplatesCache.size,
      logicTemplateCount: this.logicTemplateCache.size,
      flexMessages: this.isCacheValid(this.flexMessagesCache),
      flexMessageSummary: this.isCacheValid(this.flexMessageSummaryCache),
      pendingRequestsCount: this.pendingRequests.size
    };
  }
}

export default DataCacheService;