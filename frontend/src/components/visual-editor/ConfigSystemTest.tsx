/**
 * 配置系統測試組件
 * 用於測試新的積木配置渲染系統
 */

import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { blockRegistry } from "./blocks/registry";
import { blockInitializationManager } from "./blocks/initialization";
import { BlockDefinition } from "./blocks/types";
import BlockConfigRenderer from "./BlockConfigRenderer";
import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react";

interface TestState {
  initialized: boolean;
  loading: boolean;
  error: string | null;
  blocksWithConfig: BlockDefinition[];
  selectedBlock: BlockDefinition | null;
  testData: Record<string, unknown>;
}

const ConfigSystemTest: React.FC = () => {
  const [state, setState] = useState<TestState>({
    initialized: false,
    loading: false,
    error: null,
    blocksWithConfig: [],
    selectedBlock: null,
    testData: {}
  });

  /**
   * 初始化積木系統並查找有配置的積木
   */
  const initializeSystem = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // 初始化積木系統
      console.log("🔄 開始初始化積木系統...");
      const result = await blockInitializationManager.initialize();
      
      if (!result.success) {
        throw new Error(`初始化失敗: ${result.errors.map(e => e.message).join(', ')}`);
      }
      
      // 查找有配置選項的積木
      const allBlocks = blockRegistry.getAllBlocks();
      const blocksWithConfig = allBlocks
        .map(item => item.definition)
        .filter(def => def.configOptions && def.configOptions.length > 0);
      
      console.log(`✅ 找到 ${blocksWithConfig.length} 個有配置選項的積木:`, 
        blocksWithConfig.map(b => b.displayName));
      
      setState(prev => ({
        ...prev,
        initialized: true,
        loading: false,
        blocksWithConfig,
        selectedBlock: blocksWithConfig[0] || null,
        testData: blocksWithConfig[0]?.defaultData || {}
      }));
      
    } catch (error) {
      console.error("❌ 初始化失敗:", error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "未知錯誤"
      }));
    }
  };

  /**
   * 處理配置數據變更
   */
  const handleConfigChange = (key: string, value: unknown) => {
    setState(prev => ({
      ...prev,
      testData: {
        ...prev.testData,
        [key]: value
      }
    }));
    console.log(`配置變更: ${key} = ${value}`);
  };

  /**
   * 選擇測試積木
   */
  const selectBlock = (block: BlockDefinition) => {
    setState(prev => ({
      ...prev,
      selectedBlock: block,
      testData: { ...block.defaultData }
    }));
  };

  /**
   * 重置測試數據
   */
  const resetTestData = () => {
    if (state.selectedBlock) {
      setState(prev => ({
        ...prev,
        testData: { ...state.selectedBlock!.defaultData }
      }));
    }
  };

  // 組件載入時自動初始化
  useEffect(() => {
    initializeSystem();
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">積木配置系統測試</h1>
        <p className="text-gray-600">測試新的 BlockConfigRenderer 和 ConfigFormField 組件</p>
      </div>

      {/* 初始化狀態 */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          {state.loading ? (
            <AlertCircle className="h-5 w-5 text-yellow-500" />
          ) : state.initialized ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
          <h2 className="text-lg font-semibold">
            初始化狀態: {state.loading ? "載入中..." : state.initialized ? "已完成" : "未初始化"}
          </h2>
        </div>
        
        {state.error && (
          <Alert className="mb-3">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}
        
        {state.initialized && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              找到 {state.blocksWithConfig.length} 個有配置選項的積木，可以進行測試
            </AlertDescription>
          </Alert>
        )}
        
        <div className="mt-3">
          <Button 
            onClick={initializeSystem} 
            disabled={state.loading}
            variant="outline"
          >
            {state.loading ? "初始化中..." : "重新初始化"}
          </Button>
        </div>
      </Card>

      {/* 積木選擇 */}
      {state.initialized && state.blocksWithConfig.length > 0 && (
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-3">選擇測試積木</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {state.blocksWithConfig.map(block => (
              <Button
                key={block.id}
                variant={state.selectedBlock?.id === block.id ? "default" : "outline"}
                onClick={() => selectBlock(block)}
                className="text-left justify-start"
              >
                <span className="truncate">{block.displayName}</span>
              </Button>
            ))}
          </div>
        </Card>
      )}

      {/* 配置測試區域 */}
      {state.selectedBlock && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 配置表單 */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">配置選項</h2>
              <Button onClick={resetTestData} variant="outline" size="sm">
                重置
              </Button>
            </div>
            
            <div className="mb-4">
              <h3 className="font-medium text-sm text-gray-600 mb-2">
                積木: {state.selectedBlock.displayName}
              </h3>
              <p className="text-xs text-gray-500">
                {state.selectedBlock.description}
              </p>
            </div>

            <BlockConfigRenderer
              configOptions={state.selectedBlock.configOptions || []}
              blockData={state.testData}
              onDataChange={handleConfigChange}
              className="space-y-4"
            />
          </Card>

          {/* 數據預覽 */}
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">當前數據</h2>
            <div className="bg-gray-50 p-3 rounded border">
              <pre className="text-xs text-gray-700 overflow-auto max-h-96">
                {JSON.stringify(state.testData, null, 2)}
              </pre>
            </div>
            
            <div className="mt-4">
              <h3 className="font-medium text-sm mb-2">配置選項數量</h3>
              <p className="text-sm text-gray-600">
                {state.selectedBlock.configOptions?.length || 0} 個配置選項
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* 測試結果 */}
      {state.initialized && state.blocksWithConfig.length === 0 && (
        <Card className="p-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              沒有找到任何有配置選項的積木。請確保積木定義中包含 configOptions 屬性。
            </AlertDescription>
          </Alert>
        </Card>
      )}
    </div>
  );
};

export default ConfigSystemTest;