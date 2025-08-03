/**
 * 錯誤邊界組件
 * 提供React錯誤邊界功能，捕獲子組件錯誤並提供恢復機制
 */

import React, { Component, ReactNode, ErrorInfo } from "react";
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";
import { Button } from "./button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "./card";
import { Alert, AlertDescription } from "./alert";
import ErrorManager from "@/services/ErrorManager";
import {
  UnifiedError,
  ErrorSeverity,
  ErrorCategory,
  RecoveryStrategy,
  ErrorBoundaryState,
} from "@/types/error";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: UnifiedError, errorInfo: ErrorInfo) => void;
  enableRetry?: boolean;
  enableReset?: boolean;
  enableReporting?: boolean;
  maxRetryAttempts?: number;
  resetKeys?: (string | number)[];
  level?: "page" | "section" | "component";
  isolate?: boolean;
}

interface ExtendedErrorBoundaryState extends ErrorBoundaryState {
  retryAttempts: number;
  isRetrying: boolean;
  lastResetKeys?: (string | number)[];
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ExtendedErrorBoundaryState> {
  private errorManager = ErrorManager.getInstance();
  private resetTimeoutId?: NodeJS.Timeout;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      isRecovering: false,
      recoveryAttempts: 0,
      retryAttempts: 0,
      isRetrying: false,
      lastResetKeys: props.resetKeys,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ExtendedErrorBoundaryState> {
    return {
      hasError: true,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const unifiedError = this.errorManager.createError(
      "REACT_ERROR_BOUNDARY",
      error.message,
      ErrorSeverity.HIGH,
      ErrorCategory.UI_RENDER,
      {
        component: this.props.level || "component",
        additional: {
          componentStack: errorInfo.componentStack,
          errorBoundary: true,
        },
      },
      error
    );

    this.setState({
      error: unifiedError,
      errorInfo,
    });

    // 處理錯誤
    this.errorManager.handleError(unifiedError);

    // 調用回調
    if (this.props.onError) {
      this.props.onError(unifiedError, errorInfo);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys } = this.props;
    const { lastResetKeys } = this.state;
    
    // 檢查重置鍵是否改變
    if (resetKeys && lastResetKeys && this.hasResetKeysChanged(resetKeys, lastResetKeys)) {
      if (this.state.hasError) {
        this.handleReset();
      }
      this.setState({ lastResetKeys: resetKeys });
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  private hasResetKeysChanged(current: (string | number)[], previous: (string | number)[]): boolean {
    if (current.length !== previous.length) return true;
    return current.some((key, index) => key !== previous[index]);
  }

  private handleRetry = async () => {
    const { maxRetryAttempts = 3 } = this.props;
    
    if (this.state.retryAttempts >= maxRetryAttempts) {
      return;
    }

    this.setState({ 
      isRetrying: true,
      retryAttempts: this.state.retryAttempts + 1,
    });

    try {
      // 延遲一段時間後重試
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        isRetrying: false,
        isRecovering: false,
      });
    } catch (retryError) {
      this.setState({ isRetrying: false });
    }
  };

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      isRecovering: false,
      recoveryAttempts: 0,
      retryAttempts: 0,
      isRetrying: false,
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = "/";
  };

  private handleReportError = () => {
    if (this.state.error) {
      // TODO: 實現錯誤報告功能
      console.log("Reporting error:", this.state.error);
      
      // 可以開啟一個模態框或跳轉到錯誤報告頁面
      const errorReport = {
        error: this.state.error,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        url: window.location.href,
      };
      
      // 暫時用console.log，實際應該發送到錯誤報告服務
      console.log("Error Report:", errorReport);
    }
  };

  private renderErrorDetails = () => {
    const { error, errorInfo } = this.state;
    
    if (!error) return null;

    return (
      <details className="mt-4 text-sm">
        <summary className="cursor-pointer font-medium">技術細節</summary>
        <div className="mt-2 p-3 bg-gray-100 rounded border overflow-auto text-xs">
          <div className="mb-2">
            <strong>錯誤代碼:</strong> {error.code}
          </div>
          <div className="mb-2">
            <strong>錯誤訊息:</strong> {error.message}
          </div>
          <div className="mb-2">
            <strong>組件:</strong> {error.context.component}
          </div>
          {error.stack && (
            <div className="mb-2">
              <strong>堆疊追蹤:</strong>
              <pre className="mt-1 whitespace-pre-wrap">{error.stack}</pre>
            </div>
          )}
          {errorInfo?.componentStack && (
            <div>
              <strong>組件堆疊:</strong>
              <pre className="mt-1 whitespace-pre-wrap">{errorInfo.componentStack}</pre>
            </div>
          )}
        </div>
      </details>
    );
  };

  private renderMinimalError = () => {
    const { error } = this.state;
    
    return (
      <Alert variant="destructive" className="m-2">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {error?.message || "發生錯誤，請稍後再試"}
        </AlertDescription>
      </Alert>
    );
  };

  private renderFullError = () => {
    const { enableRetry = true, enableReset = true, enableReporting = true, maxRetryAttempts = 3 } = this.props;
    const { error, retryAttempts, isRetrying } = this.state;

    const canRetry = enableRetry && retryAttempts < maxRetryAttempts;

    return (
      <div className="flex items-center justify-center min-h-[400px] p-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              發生錯誤
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <p className="text-gray-700 mb-4">
              {error?.message || "應用程序遇到意外錯誤，請嘗試以下解決方案："}
            </p>
            
            {retryAttempts > 0 && (
              <Alert className="mb-4">
                <AlertDescription>
                  已嘗試重試 {retryAttempts} 次
                </AlertDescription>
              </Alert>
            )}

            {this.renderErrorDetails()}
          </CardContent>
          
          <CardFooter className="flex flex-wrap gap-2">
            {canRetry && (
              <Button
                onClick={this.handleRetry}
                disabled={isRetrying}
                variant="default"
                size="sm"
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    重試中...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    重試 ({maxRetryAttempts - retryAttempts})
                  </>
                )}
              </Button>
            )}
            
            {enableReset && (
              <Button
                onClick={this.handleReset}
                variant="outline"
                size="sm"
              >
                重置
              </Button>
            )}
            
            <Button
              onClick={this.handleReload}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              重新載入
            </Button>
            
            <Button
              onClick={this.handleGoHome}
              variant="outline"
              size="sm"
            >
              <Home className="h-4 w-4 mr-2" />
              回到首頁
            </Button>
            
            {enableReporting && (
              <Button
                onClick={this.handleReportError}
                variant="outline"
                size="sm"
              >
                <Bug className="h-4 w-4 mr-2" />
                回報問題
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    );
  };

  render() {
    if (this.state.hasError) {
      // 如果提供了自定義fallback，使用它
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 根據組件級別決定錯誤顯示方式
      if (this.props.level === "component" || this.props.isolate) {
        return this.renderMinimalError();
      }

      return this.renderFullError();
    }

    return this.props.children;
  }
}

export default ErrorBoundary;