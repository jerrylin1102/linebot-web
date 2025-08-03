/**
 * 錯誤日志組件
 * 提供詳細的錯誤日志顯示和篩選功能
 */

import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import ErrorManager from "../../services/ErrorManager";
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Trash2,
  Calendar,
  AlertCircle,
  Eye,
  EyeOff,
  Copy,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { UnifiedError, ErrorSeverity, ErrorCategory } from "../../types/error";

interface ErrorLoggerProps {
  maxEntries?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface FilterOptions {
  severity?: ErrorSeverity;
  category?: ErrorCategory;
  component?: string;
  timeRange?: "1h" | "6h" | "24h" | "7d" | "all";
  searchTerm?: string;
}

const ErrorLogger: React.FC<ErrorLoggerProps> = ({
  maxEntries = 1000,
  autoRefresh = true,
  refreshInterval = 5000,
}) => {
  const [errors, setErrors] = useState<UnifiedError[]>([]);
  const [filteredErrors, setFilteredErrors] = useState<UnifiedError[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [expandedErrors, setExpandedErrors] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const errorManager = ErrorManager.getInstance();

  // 載入錯誤日志
  const loadErrors = async () => {
    setIsLoading(true);
    try {
      const errorHistory = errorManager.getErrorHistory();
      const limitedErrors = errorHistory.slice(-maxEntries);
      setErrors(limitedErrors);
    } catch (error) {
      console.error("Failed to load error logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 篩選錯誤
  const filterErrors = (errors: UnifiedError[], filters: FilterOptions) => {
    let filtered = [...errors];

    // 時間範圍篩選
    if (filters.timeRange && filters.timeRange !== "all") {
      const now = Date.now();
      const timeRanges = {
        "1h": 60 * 60 * 1000,
        "6h": 6 * 60 * 60 * 1000,
        "24h": 24 * 60 * 60 * 1000,
        "7d": 7 * 24 * 60 * 60 * 1000,
      };
      const cutoff = now - timeRanges[filters.timeRange];
      filtered = filtered.filter(error => error.context.timestamp > cutoff);
    }

    // 嚴重程度篩選
    if (filters.severity) {
      filtered = filtered.filter(error => error.severity === filters.severity);
    }

    // 類別篩選
    if (filters.category) {
      filtered = filtered.filter(error => error.category === filters.category);
    }

    // 組件篩選
    if (filters.component) {
      filtered = filtered.filter(error => 
        error.context.component?.toLowerCase().includes(filters.component!.toLowerCase())
      );
    }

    // 搜索詞篩選
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(error => 
        error.message.toLowerCase().includes(term) ||
        error.code.toLowerCase().includes(term) ||
        error.context.component?.toLowerCase().includes(term)
      );
    }

    return filtered.sort((a, b) => b.context.timestamp - a.context.timestamp);
  };

  // 切換錯誤展開狀態
  const toggleErrorExpanded = (errorId: string) => {
    const newExpanded = new Set(expandedErrors);
    if (newExpanded.has(errorId)) {
      newExpanded.delete(errorId);
    } else {
      newExpanded.add(errorId);
    }
    setExpandedErrors(newExpanded);
  };

  // 複製錯誤信息
  const copyErrorInfo = (error: UnifiedError) => {
    const info = {
      id: error.id,
      code: error.code,
      message: error.message,
      severity: error.severity,
      category: error.category,
      timestamp: new Date(error.context.timestamp).toISOString(),
      component: error.context.component,
      context: error.context,
    };

    navigator.clipboard.writeText(JSON.stringify(info, null, 2));
  };

  // 導出錯誤日志
  const exportLogs = () => {
    const exportData = {
      exportTime: new Date().toISOString(),
      filters: filters,
      errors: filteredErrors,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `error-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 清除錯誤日志
  const clearLogs = () => {
    errorManager.clearErrorHistory();
    setErrors([]);
    setFilteredErrors([]);
  };

  // 獲取嚴重程度顏色
  const getSeverityColor = (severity: ErrorSeverity) => {
    const colors = {
      [ErrorSeverity.LOW]: "bg-blue-100 text-blue-800",
      [ErrorSeverity.MEDIUM]: "bg-yellow-100 text-yellow-800",
      [ErrorSeverity.HIGH]: "bg-orange-100 text-orange-800",
      [ErrorSeverity.CRITICAL]: "bg-red-100 text-red-800",
    };
    return colors[severity] || "bg-gray-100 text-gray-800";
  };

  // 獲取類別顏色
  const getCategoryColor = (category: ErrorCategory) => {
    const colors = {
      [ErrorCategory.NETWORK]: "bg-purple-100 text-purple-800",
      [ErrorCategory.API]: "bg-green-100 text-green-800",
      [ErrorCategory.VALIDATION]: "bg-amber-100 text-amber-800",
      [ErrorCategory.AUTHENTICATION]: "bg-red-100 text-red-800",
      [ErrorCategory.BLOCK_LOADING]: "bg-blue-100 text-blue-800",
      [ErrorCategory.BLOCK_CONFIG]: "bg-indigo-100 text-indigo-800",
      [ErrorCategory.BLOCK_OPERATION]: "bg-cyan-100 text-cyan-800",
      [ErrorCategory.PREVIEW]: "bg-pink-100 text-pink-800",
      [ErrorCategory.CODE_GENERATION]: "bg-teal-100 text-teal-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  // 格式化時間
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // 自動刷新
  useEffect(() => {
    loadErrors();
    
    if (autoRefresh) {
      const interval = setInterval(loadErrors, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, maxEntries]);

  // 應用篩選
  useEffect(() => {
    const filtered = filterErrors(errors, filters);
    setFilteredErrors(filtered);
  }, [errors, filters]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            錯誤日志
            {filteredErrors.length !== errors.length && (
              <Badge variant="secondary">
                {filteredErrors.length} / {errors.length}
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportLogs}>
              <Download className="w-4 h-4 mr-2" />
              導出
            </Button>
            <Button variant="outline" size="sm" onClick={clearLogs}>
              <Trash2 className="w-4 h-4 mr-2" />
              清除
            </Button>
          </div>
        </div>

        {/* 篩選器 */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="搜索錯誤..."
              className="pl-10"
              value={filters.searchTerm || ""}
              onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
            />
          </div>

          <Select
            value={filters.severity || ""}
            onValueChange={(value) => setFilters(prev => ({ 
              ...prev, 
              severity: value ? value as ErrorSeverity : undefined 
            }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="嚴重程度" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">全部</SelectItem>
              <SelectItem value={ErrorSeverity.CRITICAL}>致命</SelectItem>
              <SelectItem value={ErrorSeverity.HIGH}>嚴重</SelectItem>
              <SelectItem value={ErrorSeverity.MEDIUM}>中等</SelectItem>
              <SelectItem value={ErrorSeverity.LOW}>輕微</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.category || ""}
            onValueChange={(value) => setFilters(prev => ({ 
              ...prev, 
              category: value ? value as ErrorCategory : undefined 
            }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="錯誤類別" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">全部</SelectItem>
              <SelectItem value={ErrorCategory.NETWORK}>網路</SelectItem>
              <SelectItem value={ErrorCategory.API}>API</SelectItem>
              <SelectItem value={ErrorCategory.BLOCK_LOADING}>積木載入</SelectItem>
              <SelectItem value={ErrorCategory.BLOCK_CONFIG}>積木配置</SelectItem>
              <SelectItem value={ErrorCategory.PREVIEW}>預覽</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.timeRange || "all"}
            onValueChange={(value) => setFilters(prev => ({ 
              ...prev, 
              timeRange: value as FilterOptions["timeRange"]
            }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="時間範圍" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              <SelectItem value="1h">1小時</SelectItem>
              <SelectItem value="6h">6小時</SelectItem>
              <SelectItem value="24h">24小時</SelectItem>
              <SelectItem value="7d">7天</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="組件名稱"
            value={filters.component || ""}
            onChange={(e) => setFilters(prev => ({ ...prev, component: e.target.value }))}
          />
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden">
        <div className="h-full overflow-auto space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">載入中...</div>
            </div>
          ) : filteredErrors.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">無錯誤記錄</div>
            </div>
          ) : (
            filteredErrors.map((error) => {
              const isExpanded = expandedErrors.has(error.id);
              
              return (
                <div
                  key={error.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  {/* 錯誤摘要 */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getSeverityColor(error.severity)}>
                          {error.severity}
                        </Badge>
                        <Badge className={getCategoryColor(error.category)}>
                          {error.category}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {formatTime(error.context.timestamp)}
                        </span>
                      </div>
                      
                      <div className="font-medium text-gray-900 mb-1">
                        {error.code}
                      </div>
                      
                      <div className="text-sm text-gray-700 mb-2">
                        {error.message}
                      </div>
                      
                      {error.context.component && (
                        <div className="text-xs text-gray-500">
                          組件: {error.context.component}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyErrorInfo(error)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleErrorExpanded(error.id)}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* 詳細信息 */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">錯誤詳情</h4>
                          <div className="space-y-1 text-sm">
                            <div><strong>ID:</strong> {error.id}</div>
                            <div><strong>恢復策略:</strong> {error.recovery || "無"}</div>
                            <div><strong>可重試:</strong> {error.isRetryable ? "是" : "否"}</div>
                            {error.retryCount && (
                              <div><strong>重試次數:</strong> {error.retryCount}</div>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">上下文信息</h4>
                          <div className="space-y-1 text-sm">
                            <div><strong>動作:</strong> {error.context.action || "未知"}</div>
                            <div><strong>URL:</strong> {error.context.url || "未知"}</div>
                            {error.context.blockType && (
                              <div><strong>積木類型:</strong> {error.context.blockType}</div>
                            )}
                          </div>
                        </div>
                      </div>

                      {error.suggestions && error.suggestions.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-medium text-gray-900 mb-2">建議</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                            {error.suggestions.map((suggestion, index) => (
                              <li key={index}>{suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {error.stack && (
                        <div className="mt-4">
                          <h4 className="font-medium text-gray-900 mb-2">堆疊追蹤</h4>
                          <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-32">
                            {error.stack}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ErrorLogger;