/**
 * React Hook for managing data cache
 * 為 visual-editor 提供快取狀態管理和自動更新機制
 */

import { useState, useEffect, useCallback } from 'react';
import DataCacheService from '../services/DataCacheService';
import {
  BotSummary,
  LogicTemplate,
  LogicTemplateSummary,
  FlexMessage,
  FlexMessageSummary
} from '../services/visualEditorApi';

// Hook 回傳的介面
interface UseDataCacheReturn {
  // Bot 相關
  getBotsSummary: () => Promise<BotSummary[]>;
  
  // 邏輯模板相關
  getLogicTemplatesSummary: (botId: string) => Promise<LogicTemplateSummary[]>;
  getLogicTemplate: (templateId: string) => Promise<LogicTemplate>;
  createLogicTemplate: (botId: string, data: unknown) => Promise<LogicTemplate>;
  updateLogicTemplate: (templateId: string, data: unknown) => Promise<LogicTemplate>;
  
  // FlexMessage 相關
  getFlexMessages: () => Promise<FlexMessage[]>;
  getFlexMessagesSummary: () => Promise<FlexMessageSummary[]>;
  createFlexMessage: (data: unknown) => Promise<FlexMessage>;
  updateFlexMessage: (messageId: string, data: unknown) => Promise<FlexMessage>;
  
  // 快取管理
  invalidateCache: (type: 'bot' | 'logic' | 'flex' | 'all', key?: string) => void;
  getCacheStats: () => unknown;
  
  // 狀態
  loading: boolean;
  error: string | null;
}

/**
 * 資料快取 Hook
 * 提供統一的資料存取介面，自動處理快取邏輯
 */
export const useDataCache = (): UseDataCacheReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const dataCache = DataCacheService.getInstance();
  
  // 統一的錯誤處理和 loading 狀態管理
  const withLoadingAndError = useCallback(async <T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> => {
    try {
      setLoading(true);
      setError(null);
      console.log(`[useDataCache] 開始執行: ${operationName}`);
      
      const result = await operation();
      
      console.log(`[useDataCache] 成功完成: ${operationName}`);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `${operationName} 失敗`;
      console.error(`[useDataCache] 錯誤 ${operationName}:`, err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Bot 相關方法
  const getBotsSummary = useCallback(async (): Promise<BotSummary[]> => {
    return withLoadingAndError(
      () => dataCache.getUserBotsSummary(),
      'getBotsSummary'
    );
  }, [dataCache, withLoadingAndError]);
  
  // 邏輯模板相關方法
  const getLogicTemplatesSummary = useCallback(async (botId: string): Promise<LogicTemplateSummary[]> => {
    return withLoadingAndError(
      () => dataCache.getBotLogicTemplatesSummary(botId),
      `getLogicTemplatesSummary(${botId})`
    );
  }, [dataCache, withLoadingAndError]);
  
  const getLogicTemplate = useCallback(async (templateId: string): Promise<LogicTemplate> => {
    return withLoadingAndError(
      () => dataCache.getLogicTemplate(templateId),
      `getLogicTemplate(${templateId})`
    );
  }, [dataCache, withLoadingAndError]);
  
  const createLogicTemplate = useCallback(async (botId: string, data: unknown): Promise<LogicTemplate> => {
    return withLoadingAndError(
      () => dataCache.createLogicTemplate(botId, data),
      `createLogicTemplate(${botId})`
    );
  }, [dataCache, withLoadingAndError]);
  
  const updateLogicTemplate = useCallback(async (templateId: string, data: unknown): Promise<LogicTemplate> => {
    return withLoadingAndError(
      () => dataCache.updateLogicTemplate(templateId, data),
      `updateLogicTemplate(${templateId})`
    );
  }, [dataCache, withLoadingAndError]);
  
  // FlexMessage 相關方法
  const getFlexMessages = useCallback(async (): Promise<FlexMessage[]> => {
    return withLoadingAndError(
      () => dataCache.getUserFlexMessages(),
      'getFlexMessages'
    );
  }, [dataCache, withLoadingAndError]);
  
  const getFlexMessagesSummary = useCallback(async (): Promise<FlexMessageSummary[]> => {
    return withLoadingAndError(
      () => dataCache.getUserFlexMessagesSummary(),
      'getFlexMessagesSummary'
    );
  }, [dataCache, withLoadingAndError]);
  
  const createFlexMessage = useCallback(async (data: unknown): Promise<FlexMessage> => {
    return withLoadingAndError(
      () => dataCache.createFlexMessage(data),
      'createFlexMessage'
    );
  }, [dataCache, withLoadingAndError]);
  
  const updateFlexMessage = useCallback(async (messageId: string, data: unknown): Promise<FlexMessage> => {
    return withLoadingAndError(
      () => dataCache.updateFlexMessage(messageId, data),
      `updateFlexMessage(${messageId})`
    );
  }, [dataCache, withLoadingAndError]);
  
  // 快取管理方法
  const invalidateCache = useCallback((type: 'bot' | 'logic' | 'flex' | 'all', key?: string) => {
    console.log(`[useDataCache] 清理快取: ${type}${key ? ` (${key})` : ''}`);
    
    switch (type) {
      case 'bot':
        // Bot 快取沒有特定的清理方法，使用 clearAllCache 的部分功能
        console.log('[useDataCache] Bot 快取將在下次請求時自動更新');
        break;
        
      case 'logic':
        if (key) {
          if (key.startsWith('bot-')) {
            // 清理特定 Bot 的邏輯模板快取
            const botId = key.replace('bot-', '');
            dataCache.invalidateLogicTemplatesCache(botId);
          } else {
            // 清理特定邏輯模板快取
            dataCache.invalidateLogicTemplateCache(key);
          }
        } else {
          console.warn('[useDataCache] 清理邏輯模板快取需要提供 key');
        }
        break;
        
      case 'flex':
        dataCache.invalidateFlexMessagesCache();
        break;
        
      case 'all':
        dataCache.clearAllCache();
        break;
        
      default:
        console.warn(`[useDataCache] 未知的快取類型: ${type}`);
    }
  }, [dataCache]);
  
  const getCacheStats = useCallback(() => {
    return dataCache.getCacheStats();
  }, [dataCache]);
  
  // 自動清理錯誤狀態
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000); // 5秒後自動清理錯誤
      
      return () => clearTimeout(timer);
    }
  }, [error]);
  
  return {
    // Bot 相關
    getBotsSummary,
    
    // 邏輯模板相關
    getLogicTemplatesSummary,
    getLogicTemplate,
    createLogicTemplate,
    updateLogicTemplate,
    
    // FlexMessage 相關
    getFlexMessages,
    getFlexMessagesSummary,
    createFlexMessage,
    updateFlexMessage,
    
    // 快取管理
    invalidateCache,
    getCacheStats,
    
    // 狀態
    loading,
    error,
  };
};

export default useDataCache;