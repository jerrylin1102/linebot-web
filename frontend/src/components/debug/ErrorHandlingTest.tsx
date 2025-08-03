/**
 * 錯誤處理測試組件
 * 用於測試和驗證錯誤處理系統的各個功能
 */

import React, { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import ErrorBoundary from "../ui/ErrorBoundary";
import { useErrorHandler } from "../../hooks/useErrorHandler";
import ErrorManager from "../../services/ErrorManager";
import BlockErrorHandler from "../../services/BlockErrorHandler";
import PreviewErrorHandler from "../../services/PreviewErrorHandler";
import { 
  Bug, 
  TestTube, 
  AlertTriangle, 
  CheckCircle,
  PlayCircle,
  StopCircle,
  RotateCcw
} from "lucide-react";
import { ErrorSeverity, ErrorCategory } from "../../types/error";

interface TestResult {
  testName: string;
  passed: boolean;
  message: string;
  timestamp: number;
}

const ErrorHandlingTest: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [customErrorMessage, setCustomErrorMessage] = useState("");
  const [customErrorSeverity, setCustomErrorSeverity] = useState<ErrorSeverity>(ErrorSeverity.MEDIUM);
  const [customErrorCategory, setCustomErrorCategory] = useState<ErrorCategory>(ErrorCategory.UNEXPECTED);

  const { handleError, handleErrorAsync } = useErrorHandler();
  const errorManager = ErrorManager.getInstance();
  const blockErrorHandler = BlockErrorHandler.getInstance();
  const previewErrorHandler = PreviewErrorHandler.getInstance();

  // 添加測試結果
  const addTestResult = (testName: string, passed: boolean, message: string) => {
    const result: TestResult = {
      testName,
      passed,
      message,
      timestamp: Date.now(),
    };
    setTestResults(prev => [...prev, result]);
  };

  // 清除測試結果
  const clearResults = () => {
    setTestResults([]);
  };

  // 基礎錯誤處理測試
  const testBasicErrorHandling = async () => {
    try {
      const error = new Error("測試基礎錯誤處理");
      await handleError(error, { component: "ErrorHandlingTest", action: "basicTest" });
      addTestResult("基礎錯誤處理", true, "錯誤成功處理");
    } catch (error) {
      addTestResult("基礎錯誤處理", false, `測試失敗: ${(error as Error).message}`);
    }
  };

  // 異步錯誤處理測試
  const testAsyncErrorHandling = async () => {
    try {
      await handleErrorAsync(
        async () => {
          throw new Error("測試異步錯誤處理");
        },
        { component: "ErrorHandlingTest", action: "asyncTest" }
      );
      addTestResult("異步錯誤處理", false, "應該拋出錯誤但沒有");
    } catch (error) {
      addTestResult("異步錯誤處理", true, "異步錯誤成功捕獲");
    }
  };

  // 積木錯誤處理測試
  const testBlockErrorHandling = async () => {
    try {
      const testBlock = {
        id: "test-block",
        blockType: "test-block-type",
        category: "flex-content" as any,
        blockData: {},
        compatibility: [],
      };

      await blockErrorHandler.handleBlockLoadError(
        "test-block-type",
        new Error("測試積木載入錯誤"),
        { component: "ErrorHandlingTest", operation: "loadTest" }
      );

      addTestResult("積木錯誤處理", true, "積木錯誤成功處理");
    } catch (error) {
      addTestResult("積木錯誤處理", false, `測試失敗: ${(error as Error).message}`);
    }
  };

  // 預覽錯誤處理測試
  const testPreviewErrorHandling = async () => {
    try {
      const testBlocks = [{
        id: "test-preview-block",
        blockType: "flex-content",
        category: "flex-content" as any,
        blockData: { invalid: "data" },
        compatibility: [],
      }];

      await previewErrorHandler.handleFlexPreviewError(
        new Error("測試預覽錯誤"),
        testBlocks,
        { component: "ErrorHandlingTest", operation: "previewTest" }
      );

      addTestResult("預覽錯誤處理", true, "預覽錯誤成功處理");
    } catch (error) {
      addTestResult("預覽錯誤處理", false, `測試失敗: ${(error as Error).message}`);
    }
  };

  // 錯誤邊界測試
  const testErrorBoundary = () => {
    try {
      // 觸發 React 錯誤
      throw new Error("測試錯誤邊界");
    } catch (error) {
      addTestResult("錯誤邊界", true, "錯誤邊界測試完成（需要檢查 UI）");
    }
  };

  // 網路錯誤測試
  const testNetworkError = async () => {
    try {
      await fetch("/api/non-existent-endpoint");
      addTestResult("網路錯誤", false, "應該產生網路錯誤但沒有");
    } catch (error) {
      await handleError(error as Error, { 
        component: "ErrorHandlingTest", 
        action: "networkTest" 
      });
      addTestResult("網路錯誤", true, "網路錯誤成功處理");
    }
  };

  // 驗證錯誤測試
  const testValidationError = async () => {
    try {
      const invalidData = null;
      const validationErrors = ["數據不能為空", "格式無效"];
      
      await previewErrorHandler.handlePreviewDataError(
        invalidData,
        validationErrors,
        { component: "ErrorHandlingTest", operation: "validationTest" }
      );

      addTestResult("驗證錯誤", true, "驗證錯誤成功處理");
    } catch (error) {
      addTestResult("驗證錯誤", false, `測試失敗: ${(error as Error).message}`);
    }
  };

  // 自定義錯誤測試
  const testCustomError = async () => {
    try {
      if (!customErrorMessage.trim()) {
        addTestResult("自定義錯誤", false, "請輸入錯誤訊息");
        return;
      }

      const customError = errorManager.createError(
        "CUSTOM_TEST_ERROR",
        customErrorMessage,
        customErrorSeverity,
        customErrorCategory,
        { component: "ErrorHandlingTest", action: "customTest" }
      );

      await errorManager.handleError(customError);
      addTestResult("自定義錯誤", true, `自定義錯誤成功處理: ${customErrorMessage}`);
    } catch (error) {
      addTestResult("自定義錯誤", false, `測試失敗: ${(error as Error).message}`);
    }
  };

  // 運行所有測試
  const runAllTests = async () => {
    setIsRunning(true);
    clearResults();

    const tests = [
      { name: "基礎錯誤處理", fn: testBasicErrorHandling },
      { name: "異步錯誤處理", fn: testAsyncErrorHandling },
      { name: "積木錯誤處理", fn: testBlockErrorHandling },
      { name: "預覽錯誤處理", fn: testPreviewErrorHandling },
      { name: "網路錯誤", fn: testNetworkError },
      { name: "驗證錯誤", fn: testValidationError },
    ];

    for (const test of tests) {
      try {
        await test.fn();
        // 等待一小段時間讓錯誤處理完成
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        addTestResult(test.name, false, `測試異常: ${(error as Error).message}`);
      }
    }

    setIsRunning(false);
  };

  // 錯誤統計
  const passedTests = testResults.filter(r => r.passed).length;
  const failedTests = testResults.filter(r => !r.passed).length;

  return (
    <div className="space-y-6">
      {/* 測試控制面板 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            錯誤處理測試
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 mb-4">
            <Button 
              onClick={runAllTests} 
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <>
                  <StopCircle className="w-4 h-4" />
                  測試中...
                </>
              ) : (
                <>
                  <PlayCircle className="w-4 h-4" />
                  運行所有測試
                </>
              )}
            </Button>

            <Button variant="outline" onClick={clearResults}>
              <RotateCcw className="w-4 h-4 mr-2" />
              清除結果
            </Button>
          </div>

          {/* 測試統計 */}
          {testResults.length > 0 && (
            <div className="flex gap-4 mb-4">
              <Badge variant="default" className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                通過: {passedTests}
              </Badge>
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                失敗: {failedTests}
              </Badge>
              <Badge variant="secondary">
                總計: {testResults.length}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 個別測試 */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>基礎測試</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" onClick={testBasicErrorHandling} className="w-full">
              基礎錯誤處理
            </Button>
            <Button variant="outline" onClick={testAsyncErrorHandling} className="w-full">
              異步錯誤處理
            </Button>
            <Button variant="outline" onClick={testNetworkError} className="w-full">
              網路錯誤測試
            </Button>
            <Button variant="outline" onClick={testValidationError} className="w-full">
              驗證錯誤測試
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>組件測試</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" onClick={testBlockErrorHandling} className="w-full">
              積木錯誤處理
            </Button>
            <Button variant="outline" onClick={testPreviewErrorHandling} className="w-full">
              預覽錯誤處理
            </Button>
            <ErrorBoundary level="component">
              <Button variant="outline" onClick={testErrorBoundary} className="w-full">
                錯誤邊界測試
              </Button>
            </ErrorBoundary>
          </CardContent>
        </Card>
      </div>

      {/* 自定義錯誤測試 */}
      <Card>
        <CardHeader>
          <CardTitle>自定義錯誤測試</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="輸入自定義錯誤訊息..."
            value={customErrorMessage}
            onChange={(e) => setCustomErrorMessage(e.target.value)}
            rows={3}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Select value={customErrorSeverity} onValueChange={(value) => setCustomErrorSeverity(value as ErrorSeverity)}>
              <SelectTrigger>
                <SelectValue placeholder="選擇嚴重程度" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ErrorSeverity.LOW}>輕微</SelectItem>
                <SelectItem value={ErrorSeverity.MEDIUM}>中等</SelectItem>
                <SelectItem value={ErrorSeverity.HIGH}>嚴重</SelectItem>
                <SelectItem value={ErrorSeverity.CRITICAL}>致命</SelectItem>
              </SelectContent>
            </Select>

            <Select value={customErrorCategory} onValueChange={(value) => setCustomErrorCategory(value as ErrorCategory)}>
              <SelectTrigger>
                <SelectValue placeholder="選擇錯誤類別" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ErrorCategory.NETWORK}>網路</SelectItem>
                <SelectItem value={ErrorCategory.API}>API</SelectItem>
                <SelectItem value={ErrorCategory.VALIDATION}>驗證</SelectItem>
                <SelectItem value={ErrorCategory.BLOCK_CONFIG}>積木配置</SelectItem>
                <SelectItem value={ErrorCategory.PREVIEW}>預覽</SelectItem>
                <SelectItem value={ErrorCategory.UNEXPECTED}>未預期</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={testCustomError} className="w-full">
            <Bug className="w-4 h-4 mr-2" />
            觸發自定義錯誤
          </Button>
        </CardContent>
      </Card>

      {/* 測試結果 */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>測試結果</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-auto">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 p-3 rounded border ${
                    result.passed 
                      ? "bg-green-50 border-green-200" 
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  {result.passed ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 mb-1">
                      {result.testName}
                    </div>
                    <div className="text-sm text-gray-700 mb-1">
                      {result.message}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ErrorHandlingTest;