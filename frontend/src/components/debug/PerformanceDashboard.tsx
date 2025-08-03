/**
 * 性能監控儀表板 - 顯示實時性能指標、記憶體使用、快取狀態等
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { globalPerformanceMonitor } from '../../services/PerformanceMonitor';
import { globalCacheManager } from '../../services/CacheService';
import { globalMemoryManager } from '../../services/MemoryManager';
import { globalNetworkOptimizer } from '../../services/NetworkOptimizer';

interface PerformanceDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChartData {
  timestamp: number;
  value: number;
  label: string;
}

interface PerformanceReport {
  score: number;
  overall: string;
  budgetViolations: unknown[];
  metrics: Array<{ name: string; value: number }>;
  alerts: Array<{ type: string; message: string; recommendation?: string; timestamp: number }>;
  recommendations: string[];
}

interface MemoryReport {
  current: {
    usedJSHeapSize: number;
    components: Map<string, number>;
    listeners: Map<string, number>;
  };
  alerts: unknown[];
  leaks: Array<{
    component?: string;
    growthRate: number;
    confidence: number;
  }>;
  recommendations: string[];
}

interface NetworkStats {
  averageResponseTime: number;
  cacheHits: number;
  cacheMisses: number;
  totalRequests: number;
  failedRequests: number;
}

interface CacheStats {
  [key: string]: {
    entryCount: number;
    totalSize: number;
  };
}

interface OptimizationResult {
  type: string;
  timestamp: number;
  result: {
    message?: string;
    cleaned?: number;
    savings?: number;
  };
}

const MetricChart: React.FC<{
  data: ChartData[];
  color: string;
  label: string;
  unit: string;
}> = ({ data, color, label, unit }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    // 設置樣式
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.fillStyle = color + '20';

    // 計算縮放
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const valueRange = maxValue - minValue || 1;

    const xStep = width / (data.length - 1 || 1);
    const yScale = height / valueRange;

    // 繪製面積
    ctx.beginPath();
    ctx.moveTo(0, height);
    data.forEach((point, index) => {
      const x = index * xStep;
      const y = height - ((point.value - minValue) * yScale);
      if (index === 0) {
        ctx.lineTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.lineTo(width, height);
    ctx.fill();

    // 繪製線條
    ctx.beginPath();
    data.forEach((point, index) => {
      const x = index * xStep;
      const y = height - ((point.value - minValue) * yScale);
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
  }, [data, color]);

  const latestValue = data[data.length - 1]?.value || 0;

  return (
    <div className="metric-chart">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-lg font-bold">
          {latestValue.toFixed(1)} {unit}
        </span>
      </div>
      <canvas
        ref={canvasRef}
        width={300}
        height={80}
        className="w-full h-20 border rounded"
      />
    </div>
  );
};

const PerformanceOverview: React.FC = () => {
  const [performanceReport, setPerformanceReport] = useState<PerformanceReport | null>(null);
  const [memoryReport, setMemoryReport] = useState<MemoryReport | null>(null);
  const [networkStats, setNetworkStats] = useState<NetworkStats | null>(null);
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);

  useEffect(() => {
    const updateReports = () => {
      setPerformanceReport(globalPerformanceMonitor.getPerformanceReport());
      setMemoryReport(globalMemoryManager.getMemoryReport());
      setNetworkStats(globalNetworkOptimizer.getStats());
      setCacheStats(globalCacheManager.getAllStats());
    };

    updateReports();
    const interval = setInterval(updateReports, 2000);
    return () => clearInterval(interval);
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getOverallBadgeVariant = (overall: string) => {
    switch (overall) {
      case 'excellent': return 'default';
      case 'good': return 'secondary';
      case 'needs-improvement': return 'destructive';
      case 'poor': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 整體性能 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">整體性能</CardTitle>
        </CardHeader>
        <CardContent>
          {performanceReport && (
            <>
              <div className={`text-2xl font-bold ${getScoreColor(performanceReport.score)}`}>
                {performanceReport.score}
              </div>
              <Badge variant={getOverallBadgeVariant(performanceReport.overall)} className="mt-1">
                {performanceReport.overall}
              </Badge>
              <div className="text-xs text-gray-500 mt-2">
                預算違規: {performanceReport.budgetViolations.length}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* 記憶體使用 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">記憶體使用</CardTitle>
        </CardHeader>
        <CardContent>
          {memoryReport && (
            <>
              <div className="text-2xl font-bold">
                {Math.round(memoryReport.current.usedJSHeapSize / 1024 / 1024)} MB
              </div>
              <div className="text-xs text-gray-500">
                組件: {Array.from(memoryReport.current.components.values()).reduce((a, b) => a + b, 0)}
              </div>
              <div className="text-xs text-gray-500">
                監聽器: {Array.from(memoryReport.current.listeners.values()).reduce((a, b) => a + b, 0)}
              </div>
              {memoryReport.alerts.length > 0 && (
                <Badge variant="destructive" className="mt-1 text-xs">
                  {memoryReport.alerts.length} 警告
                </Badge>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* 網路性能 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">網路性能</CardTitle>
        </CardHeader>
        <CardContent>
          {networkStats && (
            <>
              <div className="text-2xl font-bold">
                {Math.round(networkStats.averageResponseTime)} ms
              </div>
              <div className="text-xs text-gray-500">
                快取命中率: {Math.round((networkStats.cacheHits / (networkStats.cacheHits + networkStats.cacheMisses) || 0) * 100)}%
              </div>
              <div className="text-xs text-gray-500">
                總請求: {networkStats.totalRequests}
              </div>
              {networkStats.failedRequests > 0 && (
                <Badge variant="destructive" className="mt-1 text-xs">
                  {networkStats.failedRequests} 失敗
                </Badge>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* 快取狀態 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">快取狀態</CardTitle>
        </CardHeader>
        <CardContent>
          {cacheStats && (
            <>
              <div className="text-2xl font-bold">
                {Object.keys(cacheStats).length}
              </div>
              <div className="text-xs text-gray-500">
                活動快取
              </div>
              <div className="text-xs text-gray-500">
                總條目: {Object.values(cacheStats).reduce((sum: number, stats) => sum + stats.entryCount, 0)}
              </div>
              <div className="text-xs text-gray-500">
                總大小: {Math.round(Object.values(cacheStats).reduce((sum: number, stats) => sum + stats.totalSize, 0) / 1024)} KB
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const PerformanceMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<ChartData[][]>([[], [], [], []]);

  useEffect(() => {
    const updateMetrics = () => {
      const report = globalPerformanceMonitor.getPerformanceReport();
      const memoryReport = globalMemoryManager.getMemoryReport();
      const networkStats = globalNetworkOptimizer.getStats();
      const timestamp = Date.now();

      setMetrics(prev => {
        const newMetrics = [...prev];
        
        // FCP
        const fcp = report.metrics.find(m => m.name === 'first_contentful_paint')?.value || 0;
        newMetrics[0] = [...newMetrics[0].slice(-29), { timestamp, value: fcp, label: 'FCP' }];
        
        // 記憶體
        const memory = memoryReport.current.usedJSHeapSize / 1024 / 1024;
        newMetrics[1] = [...newMetrics[1].slice(-29), { timestamp, value: memory, label: 'Memory' }];
        
        // 網路回應時間
        newMetrics[2] = [...newMetrics[2].slice(-29), { timestamp, value: networkStats.averageResponseTime, label: 'Network' }];
        
        // 快取命中率
        const hitRate = (networkStats.cacheHits / (networkStats.cacheHits + networkStats.cacheMisses) || 0) * 100;
        newMetrics[3] = [...newMetrics[3].slice(-29), { timestamp, value: hitRate, label: 'Cache' }];
        
        return newMetrics;
      });
    };

    const interval = setInterval(updateMetrics, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">首次內容繪製 (FCP)</CardTitle>
        </CardHeader>
        <CardContent>
          <MetricChart data={metrics[0]} color="#3b82f6" label="FCP" unit="ms" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">記憶體使用</CardTitle>
        </CardHeader>
        <CardContent>
          <MetricChart data={metrics[1]} color="#ef4444" label="Memory" unit="MB" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">網路回應時間</CardTitle>
        </CardHeader>
        <CardContent>
          <MetricChart data={metrics[2]} color="#10b981" label="Network" unit="ms" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">快取命中率</CardTitle>
        </CardHeader>
        <CardContent>
          <MetricChart data={metrics[3]} color="#f59e0b" label="Cache" unit="%" />
        </CardContent>
      </Card>
    </div>
  );
};

const AlertsAndRecommendations: React.FC = () => {
  const [performanceReport, setPerformanceReport] = useState<PerformanceReport | null>(null);
  const [memoryReport, setMemoryReport] = useState<MemoryReport | null>(null);

  useEffect(() => {
    const updateReports = () => {
      setPerformanceReport(globalPerformanceMonitor.getPerformanceReport());
      setMemoryReport(globalMemoryManager.getMemoryReport());
    };

    updateReports();
    const interval = setInterval(updateReports, 5000);
    return () => clearInterval(interval);
  }, []);

  const allAlerts = [
    ...(performanceReport?.alerts || []),
    ...(memoryReport?.alerts || [])
  ].sort((a, b) => b.timestamp - a.timestamp);

  const allRecommendations = [
    ...(performanceReport?.recommendations || []),
    ...(memoryReport?.recommendations || [])
  ];

  return (
    <div className="space-y-4">
      {/* 警告 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">性能警告</CardTitle>
        </CardHeader>
        <CardContent>
          {allAlerts.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              目前沒有性能警告
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {allAlerts.map((alert, index) => (
                <Alert key={index} variant={alert.type === 'critical' ? 'destructive' : 'default'}>
                  <AlertDescription>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{alert.message}</div>
                        {alert.recommendation && (
                          <div className="text-xs mt-1 text-gray-600">
                            {alert.recommendation}
                          </div>
                        )}
                      </div>
                      <Badge variant={alert.type === 'critical' ? 'destructive' : 'secondary'}>
                        {alert.type}
                      </Badge>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 優化建議 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">優化建議</CardTitle>
        </CardHeader>
        <CardContent>
          {allRecommendations.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              性能表現良好，暫無優化建議
            </div>
          ) : (
            <div className="space-y-2">
              {allRecommendations.map((recommendation, index) => (
                <div key={index} className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                  <div className="text-sm text-blue-800">{recommendation}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 記憶體洩漏檢測 */}
      {memoryReport?.leaks && memoryReport.leaks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-red-600">記憶體洩漏檢測</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {memoryReport.leaks.map((leak, index: number) => (
                <Alert key={index} variant="destructive">
                  <AlertDescription>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">
                          {leak.component ? `組件 ${leak.component}` : '系統'} 可能存在記憶體洩漏
                        </div>
                        <div className="text-xs mt-1">
                          增長率: {leak.growthRate.toFixed(2)} MB/分鐘
                        </div>
                        <div className="text-xs">
                          信心度: {Math.round(leak.confidence * 100)}%
                        </div>
                      </div>
                      <Badge variant="destructive">洩漏</Badge>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const ActionsPanel: React.FC = () => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [lastOptimization, setLastOptimization] = useState<OptimizationResult | null>(null);

  const handleOptimizeMemory = async () => {
    setIsOptimizing(true);
    try {
      const result = globalMemoryManager.optimizeMemory();
      setLastOptimization({
        type: 'memory',
        timestamp: Date.now(),
        result
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleClearCache = () => {
    globalCacheManager.clearAll();
    globalNetworkOptimizer.clearCache();
    setLastOptimization({
      type: 'cache',
      timestamp: Date.now(),
      result: { message: '快取已清除' }
    });
  };

  const handleForceGC = () => {
    globalMemoryManager.forceGarbageCollection();
    setLastOptimization({
      type: 'gc',
      timestamp: Date.now(),
      result: { message: '垃圾回收已執行' }
    });
  };

  const handleResetStats = () => {
    globalPerformanceMonitor.clearHistory();
    globalNetworkOptimizer.resetStats();
    setLastOptimization({
      type: 'reset',
      timestamp: Date.now(),
      result: { message: '統計數據已重置' }
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">性能操作</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={handleOptimizeMemory}
              disabled={isOptimizing}
              variant="outline"
            >
              {isOptimizing ? '優化中...' : '優化記憶體'}
            </Button>
            
            <Button onClick={handleClearCache} variant="outline">
              清除快取
            </Button>
            
            <Button onClick={handleForceGC} variant="outline">
              強制GC
            </Button>
            
            <Button onClick={handleResetStats} variant="outline">
              重置統計
            </Button>
          </div>
        </CardContent>
      </Card>

      {lastOptimization && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">最後操作結果</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-1">
              <div>操作類型: {lastOptimization.type}</div>
              <div>時間: {new Date(lastOptimization.timestamp).toLocaleString()}</div>
              {lastOptimization.result.cleaned && (
                <div>清理組件: {lastOptimization.result.cleaned}</div>
              )}
              {lastOptimization.result.savings && (
                <div>節省記憶體: {Math.round(lastOptimization.result.savings / 1024)} KB</div>
              )}
              {lastOptimization.result.message && (
                <div>{lastOptimization.result.message}</div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-5/6 flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">性能監控儀表板</h2>
          <Button onClick={onClose} variant="outline" size="sm">
            關閉
          </Button>
        </div>

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="overview" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4 mx-4 mt-4">
              <TabsTrigger value="overview">總覽</TabsTrigger>
              <TabsTrigger value="metrics">指標</TabsTrigger>
              <TabsTrigger value="alerts">警告</TabsTrigger>
              <TabsTrigger value="actions">操作</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-auto p-4">
              <TabsContent value="overview" className="mt-0">
                <PerformanceOverview />
              </TabsContent>

              <TabsContent value="metrics" className="mt-0">
                <PerformanceMetrics />
              </TabsContent>

              <TabsContent value="alerts" className="mt-0">
                <AlertsAndRecommendations />
              </TabsContent>

              <TabsContent value="actions" className="mt-0">
                <ActionsPanel />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;