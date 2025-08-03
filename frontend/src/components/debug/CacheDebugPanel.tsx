/**
 * 快取除錯面板
 * 用於開發環境監控快取狀態和性能
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { RefreshCw, Trash2, BarChart3 } from 'lucide-react';
import DataCacheService from '../../services/DataCacheService';

interface CacheStats {
  botSummary: boolean;
  logicTemplatesCount: number;
  logicTemplateCount: number;
  flexMessages: boolean;
  flexMessageSummary: boolean;
  pendingRequestsCount: number;
}

interface CacheDebugPanelProps {
  isVisible?: boolean;
  onToggle?: () => void;
}

const CacheDebugPanel: React.FC<CacheDebugPanelProps> = ({
  isVisible = false,
  onToggle
}) => {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  
  const dataCache = DataCacheService.getInstance();
  
  // 更新快取統計
  const updateStats = useCallback(() => {
    const newStats = dataCache.getCacheStats();
    setStats(newStats);
  }, [dataCache]);
  
  // 清理所有快取
  const clearAllCache = () => {
    dataCache.clearAllCache();
    updateStats();
    console.log('[CacheDebugPanel] 已清理所有快取');
  };
  
  // 清理特定類型的快取
  const clearSpecificCache = (type: string) => {
    switch (type) {
      case 'flex':
        dataCache.invalidateFlexMessagesCache();
        break;
      default:
        console.warn(`[CacheDebugPanel] 未知的快取類型: ${type}`);
    }
    updateStats();
  };
  
  // 開始/停止自動刷新
  const toggleAutoRefresh = () => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    } else {
      const interval = setInterval(updateStats, 1000);
      setRefreshInterval(interval);
    }
  };
  
  // 組件掛載時更新統計
  useEffect(() => {
    if (isVisible) {
      updateStats();
    }
  }, [isVisible, updateStats]);
  
  // 組件卸載時清理定時器
  useEffect(() => {
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [refreshInterval]);
  
  if (!isVisible) {
    return null;
  }
  
  return (
    <div className="fixed top-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50 w-80">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center">
          <BarChart3 className="w-4 h-4 mr-2" />
          快取狀態監控
        </h3>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleAutoRefresh}
            className={`text-xs ${refreshInterval ? 'bg-green-50 text-green-700' : ''}`}
          >
            <RefreshCw className={`w-3 h-3 mr-1 ${refreshInterval ? 'animate-spin' : ''}`} />
            {refreshInterval ? '停止' : '自動'}
          </Button>
          {onToggle && (
            <Button
              variant="outline"
              size="sm"
              onClick={onToggle}
              className="text-xs"
            >
              ×
            </Button>
          )}
        </div>
      </div>
      
      {stats && (
        <div className="space-y-3">
          {/* 快取狀態統計 */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gray-50 p-2 rounded">
              <div className="font-medium text-gray-600">Bot 摘要</div>
              <div className={`${stats.botSummary ? 'text-green-600' : 'text-red-600'}`}>
                {stats.botSummary ? '已快取' : '未快取'}
              </div>
            </div>
            
            <div className="bg-gray-50 p-2 rounded">
              <div className="font-medium text-gray-600">FLEX 訊息</div>
              <div className={`${stats.flexMessages ? 'text-green-600' : 'text-red-600'}`}>
                {stats.flexMessages ? '已快取' : '未快取'}
              </div>
            </div>
            
            <div className="bg-gray-50 p-2 rounded">
              <div className="font-medium text-gray-600">邏輯模板摘要</div>
              <div className="text-blue-600">{stats.logicTemplatesCount} 個</div>
            </div>
            
            <div className="bg-gray-50 p-2 rounded">
              <div className="font-medium text-gray-600">邏輯模板詳情</div>
              <div className="text-blue-600">{stats.logicTemplateCount} 個</div>
            </div>
            
            <div className="bg-gray-50 p-2 rounded">
              <div className="font-medium text-gray-600">FLEX 摘要</div>
              <div className={`${stats.flexMessageSummary ? 'text-green-600' : 'text-red-600'}`}>
                {stats.flexMessageSummary ? '已快取' : '未快取'}
              </div>
            </div>
            
            <div className="bg-gray-50 p-2 rounded">
              <div className="font-medium text-gray-600">進行中請求</div>
              <div className={`${stats.pendingRequestsCount > 0 ? 'text-orange-600' : 'text-gray-600'}`}>
                {stats.pendingRequestsCount} 個
              </div>
            </div>
          </div>
          
          {/* 操作按鈕 */}
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={updateStats}
              className="text-xs flex-1"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              刷新
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => clearSpecificCache('flex')}
              className="text-xs flex-1"
            >
              清理 FLEX
            </Button>
            
            <Button
              variant="destructive"
              size="sm"
              onClick={clearAllCache}
              className="text-xs flex-1"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              全部清理
            </Button>
          </div>
          
          {/* 性能提示 */}
          <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
            💡 快取命中可減少 90%+ 的 API 請求，大幅提升頁面切換速度
          </div>
        </div>
      )}
    </div>
  );
};

export default CacheDebugPanel;