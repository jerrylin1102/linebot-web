/**
 * 調試工具面板
 * 集成錯誤日志、系統健康監控和其他調試工具
 */

import React, { useState, useCallback } from "react";
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import ErrorLogger from "./ErrorLogger";
import SystemHealthMonitor from "../ui/SystemHealthMonitor";
import { Badge } from "../ui/badge";
import ErrorManager from "../../services/ErrorManager";
import { 
  Bug, 
  Activity, 
  FileText, 
  Settings, 
  Minimize2,
  Maximize2,
  X,
  AlertTriangle,
  CheckCircle,
  Trash2
} from "lucide-react";

interface DebugPanelProps {
  isVisible?: boolean;
  onToggle?: () => void;
  position?: "bottom" | "right";
  initialTab?: "logs" | "health" | "tools";
}

const DebugPanel: React.FC<DebugPanelProps> = ({
  isVisible = false,
  onToggle,
  position = "bottom",
  initialTab = "logs",
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [healthMonitorOpen, setHealthMonitorOpen] = useState(false);
  const [systemStats, setSystemStats] = useState({
    totalErrors: 0,
    recentErrors: 0,
    criticalErrors: 0,
    isHealthy: true,
  });

  const errorManager = ErrorManager.getInstance();

  // 更新系統統計
  const updateStats = useCallback(() => {
    const health = errorManager.getHealthStatus();
    setSystemStats({
      totalErrors: health.totalErrors,
      recentErrors: health.recentErrors,
      criticalErrors: health.criticalErrors,
      isHealthy: health.criticalErrors === 0 && health.recentErrors < 5,
    });
  }, [errorManager]);

  // 定期更新統計
  React.useEffect(() => {
    updateStats();
    const interval = setInterval(updateStats, 10000); // 每10秒更新
    return () => clearInterval(interval);
  }, [updateStats]);

  // 如果不可見，顯示浮動按鈕
  if (!isVisible) {
    return (
      <div className={`fixed z-50 ${
        position === "bottom" ? "bottom-4 right-4" : "top-4 right-4"
      }`}>
        <Button
          onClick={onToggle}
          className="flex items-center gap-2 shadow-lg"
          variant={systemStats.isHealthy ? "default" : "destructive"}
        >
          <Bug className="w-4 h-4" />
          調試工具
          {!systemStats.isHealthy && (
            <Badge variant="destructive" className="ml-1">
              {systemStats.criticalErrors > 0 ? systemStats.criticalErrors : systemStats.recentErrors}
            </Badge>
          )}
        </Button>
      </div>
    );
  }

  // 調試面板主界面
  return (
    <>
      {/* 調試面板 */}
      <div className={`fixed z-40 bg-white border shadow-lg ${
        position === "bottom" 
          ? `bottom-0 left-0 right-0 ${isMinimized ? "h-12" : "h-96"}` 
          : `top-0 right-0 bottom-0 ${isMinimized ? "w-12" : "w-96"}`
      } transition-all duration-300`}>
        
        {/* 標題欄 */}
        <div className="flex items-center justify-between p-3 border-b bg-gray-50">
          <div className="flex items-center gap-2">
            <Bug className="w-5 h-5" />
            {!isMinimized && (
              <>
                <span className="font-medium">調試工具</span>
                <div className="flex items-center gap-1">
                  {systemStats.isHealthy ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  )}
                  {systemStats.totalErrors > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {systemStats.totalErrors}
                    </Badge>
                  )}
                </div>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? (
                <Maximize2 className="w-4 h-4" />
              ) : (
                <Minimize2 className="w-4 h-4" />
              )}
            </Button>
            
            <Button variant="ghost" size="sm" onClick={onToggle}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* 內容區域 */}
        {!isMinimized && (
          <div className="flex-1 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="logs" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  錯誤日志
                  {systemStats.recentErrors > 0 && (
                    <Badge variant="destructive" className="ml-1 text-xs">
                      {systemStats.recentErrors}
                    </Badge>
                  )}
                </TabsTrigger>
                
                <TabsTrigger value="health" className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  系統健康
                  {!systemStats.isHealthy && (
                    <div className="w-2 h-2 bg-red-500 rounded-full ml-1" />
                  )}
                </TabsTrigger>
                
                <TabsTrigger value="tools" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  工具
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-hidden">
                <TabsContent value="logs" className="h-full m-0">
                  <ErrorLogger
                    maxEntries={500}
                    autoRefresh={true}
                    refreshInterval={5000}
                  />
                </TabsContent>

                <TabsContent value="health" className="h-full m-0 p-4">
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Activity className="w-5 h-5" />
                          快速狀態
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {systemStats.totalErrors}
                            </div>
                            <div className="text-sm text-gray-600">總錯誤數</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">
                              {systemStats.recentErrors}
                            </div>
                            <div className="text-sm text-gray-600">最近錯誤</div>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex justify-center">
                          <Button 
                            onClick={() => setHealthMonitorOpen(true)}
                            variant="outline"
                            className="w-full"
                          >
                            <Activity className="w-4 h-4 mr-2" />
                            詳細健康監控
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>系統狀態</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span>整體狀態</span>
                            <Badge variant={systemStats.isHealthy ? "default" : "destructive"}>
                              {systemStats.isHealthy ? "健康" : "異常"}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span>致命錯誤</span>
                            <Badge variant={systemStats.criticalErrors > 0 ? "destructive" : "default"}>
                              {systemStats.criticalErrors}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span>最近錯誤</span>
                            <Badge variant={systemStats.recentErrors > 0 ? "secondary" : "default"}>
                              {systemStats.recentErrors}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="tools" className="h-full m-0 p-4">
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>調試工具</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={() => {
                            console.clear();
                            console.log("🧹 控制台已清除");
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          清除控制台
                        </Button>

                        <Button 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={() => {
                            const health = errorManager.getHealthStatus();
                            console.log("📊 系統健康狀態:", health);
                          }}
                        >
                          <Activity className="w-4 h-4 mr-2" />
                          輸出健康狀態
                        </Button>

                        <Button 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={() => {
                            const errors = errorManager.getErrorHistory();
                            console.log("📋 錯誤歷史:", errors);
                          }}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          輸出錯誤歷史
                        </Button>

                        <Button 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={() => {
                            errorManager.clearErrorHistory();
                            updateStats();
                            console.log("🗑️ 錯誤歷史已清除");
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          清除錯誤歷史
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>測試工具</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={() => {
                            const testError = new Error("這是一個測試錯誤");
                            errorManager.handleQuickError(testError, {
                              component: "DebugPanel",
                              action: "test",
                            });
                          }}
                        >
                          <Bug className="w-4 h-4 mr-2" />
                          觸發測試錯誤
                        </Button>

                        <Button 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={() => {
                            // 觸發網路錯誤
                            fetch("/api/non-existent").catch(error => {
                              errorManager.handleQuickError(error, {
                                component: "DebugPanel",
                                action: "test-network",
                              });
                            });
                          }}
                        >
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          測試網路錯誤
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        )}
      </div>

      {/* 系統健康監控模態框 */}
      <SystemHealthMonitor
        isOpen={healthMonitorOpen}
        onClose={() => setHealthMonitorOpen(false)}
      />
    </>
  );
};


export default DebugPanel;