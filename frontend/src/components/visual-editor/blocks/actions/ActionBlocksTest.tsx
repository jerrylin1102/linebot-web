/**
 * Action 積木測試組件
 * 用於測試和驗證所有 Action 積木的功能
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ActionSelector } from "../ActionSelector";
import { 
  ActionType, 
  LineAction, 
  createDefaultAction, 
  validateAction,
  ACTION_TYPE_CONFIG 
} from "../../../../types/lineActions";

// 導入所有 Action 積木
import { uriAction } from "./UriAction";
import { cameraAction } from "./CameraAction";
import { cameraRollAction } from "./CameraRollAction";
import { locationAction } from "./LocationAction";
import { datetimePickerAction } from "./DatetimePickerAction";
import { richMenuSwitchAction } from "./RichMenuSwitchAction";
import { clipboardAction } from "./ClipboardAction";

const allActionBlocks = [
  uriAction,
  cameraAction,
  cameraRollAction,
  locationAction,
  datetimePickerAction,
  richMenuSwitchAction,
  clipboardAction
];

export const ActionBlocksTest: React.FC = () => {
  const [selectedAction, setSelectedAction] = useState<LineAction>(
    createDefaultAction(ActionType.POSTBACK)
  );
  const [testResults, setTestResults] = useState<unknown[]>([]);

  // 測試所有Action積木
  const testAllActionBlocks = () => {
    const results = allActionBlocks.map(block => {
      const blockAction = block.defaultData.action;
      const validation = validateAction(blockAction);
      
      return {
        blockId: block.id,
        blockName: block.displayName,
        actionType: blockAction.type,
        isValid: validation.isValid,
        errors: validation.errors,
        defaultData: block.defaultData
      };
    });
    
    setTestResults(results);
  };

  // 測試Action類型創建
  const testActionCreation = () => {
    const results = Object.values(ActionType).map(type => {
      try {
        const action = createDefaultAction(type);
        const validation = validateAction(action);
        
        return {
          actionType: type,
          created: true,
          action: action,
          isValid: validation.isValid,
          errors: validation.errors,
          config: ACTION_TYPE_CONFIG[type]
        };
      } catch (error) {
        return {
          actionType: type,
          created: false,
          error: error.message,
          config: ACTION_TYPE_CONFIG[type]
        };
      }
    });
    
    setTestResults(results);
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Action 積木測試</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={testAllActionBlocks}>
              測試所有 Action 積木
            </Button>
            <Button onClick={testActionCreation} variant="outline">
              測試 Action 創建
            </Button>
          </div>
          
          {/* 積木統計 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{allActionBlocks.length}</div>
                <div className="text-sm text-muted-foreground">Action 積木總數</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{Object.keys(ActionType).length}</div>
                <div className="text-sm text-muted-foreground">Action 類型總數</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {testResults.filter(r => r.isValid).length}
                </div>
                <div className="text-sm text-muted-foreground">有效的 Action</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {testResults.filter(r => !r.isValid).length}
                </div>
                <div className="text-sm text-muted-foreground">無效的 Action</div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Action 選擇器測試 */}
      <Card>
        <CardHeader>
          <CardTitle>Action 選擇器測試</CardTitle>
        </CardHeader>
        <CardContent>
          <ActionSelector
            value={selectedAction}
            onChange={setSelectedAction}
          />
          
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">當前 Action 數據：</h4>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(selectedAction, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* 測試結果 */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>測試結果</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">
                      {result.blockName || result.actionType}
                    </h4>
                    <div className="flex gap-2">
                      <Badge variant={result.isValid ? "default" : "destructive"}>
                        {result.isValid ? "有效" : "無效"}
                      </Badge>
                      {result.actionType && (
                        <Badge variant="outline">
                          {result.actionType}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {result.errors && result.errors.length > 0 && (
                    <div className="text-sm text-red-600 mb-2">
                      錯誤：{result.errors.join(", ")}
                    </div>
                  )}
                  
                  {result.config && (
                    <div className="text-sm text-muted-foreground mb-2">
                      {result.config.description}
                    </div>
                  )}
                  
                  <details className="text-xs">
                    <summary className="cursor-pointer font-medium">
                      查看詳細數據
                    </summary>
                    <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </details>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action 類型總覽 */}
      <Card>
        <CardHeader>
          <CardTitle>支援的 Action 類型</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(ActionType).map(type => {
              const config = ACTION_TYPE_CONFIG[type];
              return (
                <Card key={type} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded ${config.color} flex items-center justify-center text-white text-xs`}>
                      {config.icon.slice(0, 2)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{config.displayName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {config.description}
                      </p>
                      <div className="flex gap-1 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {config.category}
                        </Badge>
                        {config.requiresInput && (
                          <Badge variant="outline" className="text-xs">
                            需要輸入
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};