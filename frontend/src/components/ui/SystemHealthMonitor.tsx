/**
 * 系統健康狀態監控組件
 * 提供系統錯誤統計和健康狀態顯示
 */

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "./button";
import { Card, CardHeader, CardTitle, CardContent } from "./card";
import { Badge } from "./badge";
import ErrorManager from "../../services/ErrorManager";
import BlockErrorHandler from "../../services/BlockErrorHandler";
import PreviewErrorHandler from "../../services/PreviewErrorHandler";
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  Trash2,
  BarChart3,
  RefreshCw,
  Download
} from "lucide-react";
import { ErrorSeverity, ErrorCategory } from "../../types/error";

interface SystemHealthStats {
  overall: {
    status: "healthy" | "warning" | "critical";
    score: number;
    totalErrors: number;
    criticalErrors: number;
    recentErrors: number;
    errorRate: number;
  };
  blocks: {
    loadFailures: number;
    configErrors: number;
    dropErrors: number;
  };
  preview: {
    renderFailures: number;
    codeGenFailures: number;
    networkErrors: number;
  };
  categories: {
    [key in ErrorCategory]: number;
  };
  severities: {
    [key in ErrorSeverity]: number;
  };
}

interface SystemHealthMonitorProps {
  isOpen: boolean;
  onClose: () => void;
  refreshInterval?: number;
}

const SystemHealthMonitor: React.FC<SystemHealthMonitorProps> = ({
  isOpen,
  onClose,
  refreshInterval = 30000, // 30秒
}) => {
  const [stats, setStats] = useState<SystemHealthStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const errorManager = ErrorManager.getInstance();
  const blockErrorHandler = BlockErrorHandler.getInstance();
  const previewErrorHandler = PreviewErrorHandler.getInstance();

  // 獲取系統健康統計
  const fetchHealthStats = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const generalHealth = errorManager.getHealthStatus();
      const blockStats = blockErrorHandler.getErrorStatistics();
      const previewStats = previewErrorHandler.getErrorStatistics();
      const errorHistory = errorManager.getErrorHistory();

      // 計算類別統計
      const categories = Object.values(ErrorCategory).reduce((acc, category) => {
        acc[category] = errorHistory.filter(e => e.category === category).length;
        return acc;
      }, {} as { [key in ErrorCategory]: number });

      // 計算嚴重程度統計
      const severities = Object.values(ErrorSeverity).reduce((acc, severity) => {
        acc[severity] = errorHistory.filter(e => e.severity === severity).length;
        return acc;
      }, {} as { [key in ErrorSeverity]: number });

      // 計算整體健康狀態
      const score = calculateHealthScore(generalHealth, blockStats, previewStats);
      const status = getHealthStatus(score, generalHealth.criticalErrors);

      const healthStats: SystemHealthStats = {
        overall: {
          status,
          score,
          totalErrors: generalHealth.totalErrors,
          criticalErrors: generalHealth.criticalErrors,
          recentErrors: generalHealth.recentErrors,
          errorRate: generalHealth.errorRate,
        },
        blocks: {
          loadFailures: Array.from(blockStats.loadFailures.values()).reduce((a, b) => a + b, 0),
          configErrors: errorHistory.filter(e => e.category === ErrorCategory.BLOCK_CONFIG).length,
          dropErrors: errorHistory.filter(e => e.category === ErrorCategory.BLOCK_OPERATION).length,
        },
        preview: {
          renderFailures: Array.from(previewStats.previewFailures.values()).reduce((a, b) => a + b, 0),
          codeGenFailures: Array.from(previewStats.codeGenFailures.values()).reduce((a, b) => a + b, 0),
          networkErrors: errorHistory.filter(e => e.category === ErrorCategory.NETWORK).length,
        },
        categories,
        severities,
      };

      setStats(healthStats);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch health stats:", error);
    } finally {
      setIsLoading(false);
    }
  }, [errorManager, blockErrorHandler, previewErrorHandler]);

  // 計算健康評分 (0-100)
  const calculateHealthScore = (
    general: { criticalErrors: number; errorRate: number; recentErrors: number },
    block: { loadFailures: number; configErrors: number; dropErrors: number },
    preview: { renderFailures: number; codeGenFailures: number; networkErrors: number }
  ): number => {
    let score = 100;

    // 扣除致命錯誤
    score -= general.criticalErrors * 20;
    
    // 扣除錯誤率
    score -= Math.min(general.errorRate * 10, 30);
    
    // 扣除最近錯誤
    score -= Math.min(general.recentErrors * 2, 20);
    
    // 扣除積木錯誤
    const blockErrors = Array.from(block.loadFailures.values()).reduce((a: number, b: number) => a + b, 0);
    score -= Math.min(blockErrors * 5, 15);
    
    // 扣除預覽錯誤
    const previewErrors = Array.from(preview.previewFailures.values()).reduce((a: number, b: number) => a + b, 0);
    score -= Math.min(previewErrors * 3, 10);

    return Math.max(0, Math.round(score));
  };

  // 獲取健康狀態
  const getHealthStatus = (score: number, criticalErrors: number): "healthy" | "warning" | "critical" => {
    if (criticalErrors > 0 || score < 50) {
      return "critical";
    }
    if (score < 80) {
      return "warning";
    }
    return "healthy";
  };

  // 清除錯誤歷史
  const handleClearErrors = () => {
    errorManager.clearErrorHistory();
    blockErrorHandler.resetLoadFailures();
    previewErrorHandler.resetErrorCounts();
    fetchHealthStats();
  };

  // 導出錯誤報告
  const handleExportReport = () => {
    if (!stats) return;

    const report = {
      timestamp: new Date().toISOString(),
      stats,
      errorHistory: errorManager.getErrorHistory(),
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `system-health-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 自動刷新
  useEffect(() => {
    if (isOpen) {
      fetchHealthStats();
      
      const interval = setInterval(fetchHealthStats, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [isOpen, refreshInterval, fetchHealthStats]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* 標題欄 */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">系統健康監控</h2>
            {lastUpdated && (
              <span className="text-sm text-gray-500">
                最後更新: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchHealthStats}
              disabled={isLoading}
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportReport}
              disabled={!stats}
            >
              <Download className="w-4 h-4 mr-2" />
              導出報告
            </Button>
            
            <Button variant="outline" onClick={onClose}>
              關閉
            </Button>
          </div>
        </div>

        {/* 內容區域 */}
        <div className="p-6 overflow-auto max-h-[calc(90vh-120px)]">
          {isLoading && !stats ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">載入健康統計中...</span>
            </div>
          ) : stats ? (
            <div className="space-y-6">
              {/* 整體健康狀態 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {stats.overall.status === "healthy" ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : stats.overall.status === "warning" ? (
                      <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    )}
                    整體健康狀態
                    <Badge
                      variant={
                        stats.overall.status === "healthy" ? "default" :
                        stats.overall.status === "warning" ? "secondary" : "destructive"
                      }
                    >
                      {stats.overall.status === "healthy" ? "健康" :
                       stats.overall.status === "warning" ? "警告" : "危險"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {stats.overall.score}
                      </div>
                      <div className="text-sm text-gray-600">健康評分</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {stats.overall.totalErrors}
                      </div>
                      <div className="text-sm text-gray-600">總錯誤數</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {stats.overall.criticalErrors}
                      </div>
                      <div className="text-sm text-gray-600">致命錯誤</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {stats.overall.recentErrors}
                      </div>
                      <div className="text-sm text-gray-600">最近錯誤</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 模塊統計 */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* 積木模塊 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      積木模塊
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>載入失敗</span>
                        <Badge variant={stats.blocks.loadFailures > 0 ? "destructive" : "default"}>
                          {stats.blocks.loadFailures}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>配置錯誤</span>
                        <Badge variant={stats.blocks.configErrors > 0 ? "destructive" : "default"}>
                          {stats.blocks.configErrors}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>操作錯誤</span>
                        <Badge variant={stats.blocks.dropErrors > 0 ? "destructive" : "default"}>
                          {stats.blocks.dropErrors}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 預覽模塊 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      預覽模塊
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>渲染失敗</span>
                        <Badge variant={stats.preview.renderFailures > 0 ? "destructive" : "default"}>
                          {stats.preview.renderFailures}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>代碼生成失敗</span>
                        <Badge variant={stats.preview.codeGenFailures > 0 ? "destructive" : "default"}>
                          {stats.preview.codeGenFailures}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>網路錯誤</span>
                        <Badge variant={stats.preview.networkErrors > 0 ? "destructive" : "default"}>
                          {stats.preview.networkErrors}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 錯誤分類統計 */}
              <Card>
                <CardHeader>
                  <CardTitle>錯誤分類統計</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(stats.categories).map(([category, count]) => (
                      <div key={category} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">{getCategoryName(category as ErrorCategory)}</span>
                        <Badge variant={count > 0 ? "secondary" : "default"}>
                          {count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 嚴重程度統計 */}
              <Card>
                <CardHeader>
                  <CardTitle>錯誤嚴重程度統計</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-3">
                    {Object.entries(stats.severities).map(([severity, count]) => (
                      <div key={severity} className="text-center p-3 border rounded">
                        <div className={`text-2xl font-bold ${getSeverityColor(severity as ErrorSeverity)}`}>
                          {count}
                        </div>
                        <div className="text-sm text-gray-600">
                          {getSeverityName(severity as ErrorSeverity)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 操作按鈕 */}
              <div className="flex justify-center gap-4 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handleClearErrors}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  清除錯誤歷史
                </Button>
                
                <Button
                  variant="outline"
                  onClick={fetchHealthStats}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  刷新統計
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-600">
              無法載入健康統計數據
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 輔助函數
function getCategoryName(category: ErrorCategory): string {
  const names = {
    [ErrorCategory.NETWORK]: "網路",
    [ErrorCategory.API]: "API",
    [ErrorCategory.VALIDATION]: "驗證",
    [ErrorCategory.AUTHENTICATION]: "認證",
    [ErrorCategory.PERMISSION]: "權限",
    [ErrorCategory.BLOCK_LOADING]: "積木載入",
    [ErrorCategory.BLOCK_CONFIG]: "積木配置",
    [ErrorCategory.BLOCK_OPERATION]: "積木操作",
    [ErrorCategory.PREVIEW]: "預覽",
    [ErrorCategory.CODE_GENERATION]: "代碼生成",
    [ErrorCategory.FILE_SYSTEM]: "文件系統",
    [ErrorCategory.UI_RENDER]: "界面渲染",
    [ErrorCategory.UNEXPECTED]: "未預期",
  };
  return names[category] || category;
}

function getSeverityName(severity: ErrorSeverity): string {
  const names = {
    [ErrorSeverity.LOW]: "輕微",
    [ErrorSeverity.MEDIUM]: "中等",
    [ErrorSeverity.HIGH]: "嚴重",
    [ErrorSeverity.CRITICAL]: "致命",
  };
  return names[severity] || severity;
}

function getSeverityColor(severity: ErrorSeverity): string {
  const colors = {
    [ErrorSeverity.LOW]: "text-blue-600",
    [ErrorSeverity.MEDIUM]: "text-yellow-600",
    [ErrorSeverity.HIGH]: "text-orange-600",
    [ErrorSeverity.CRITICAL]: "text-red-600",
  };
  return colors[severity] || "text-gray-600";
}

export default SystemHealthMonitor;