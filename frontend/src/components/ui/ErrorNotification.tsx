/**
 * 錯誤通知組件
 * 提供用戶友善的錯誤通知和狀態顯示
 */

import React, { useEffect, useState, useCallback } from "react";
import {
  AlertTriangle,
  X,
  RefreshCw,
  Info,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { Button } from "./button";
import { Card, CardContent } from "./card";
import { cn } from "@/lib/utils";
import {
  UnifiedError,
  ErrorSeverity,
  ErrorCategory,
  RecoveryStrategy,
  ErrorNotificationAction,
} from "@/types/error";

interface ErrorNotificationProps {
  error: UnifiedError;
  onDismiss?: () => void;
  onRetry?: () => void;
  onAction?: (action: ErrorNotificationAction) => void;
  autoHide?: boolean;
  duration?: number;
  showActions?: boolean;
  className?: string;
}

interface NotificationState {
  isVisible: boolean;
  isRetrying: boolean;
  countdown: number;
}

const ErrorNotification: React.FC<ErrorNotificationProps> = ({
  error,
  onDismiss,
  onRetry,
  onAction,
  autoHide = false,
  duration = 5000,
  showActions = true,
  className,
}) => {
  const [state, setState] = useState<NotificationState>({
    isVisible: true,
    isRetrying: false,
    countdown: autoHide ? Math.ceil(duration / 1000) : 0,
  });

  // 自動隱藏計時器
  useEffect(() => {
    if (!autoHide) return;

    const interval = setInterval(() => {
      setState(prev => {
        if (prev.countdown <= 1) {
          onDismiss?.();
          return { ...prev, isVisible: false, countdown: 0 };
        }
        return { ...prev, countdown: prev.countdown - 1 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [autoHide, duration, onDismiss]);

  const handleDismiss = useCallback(() => {
    setState(prev => ({ ...prev, isVisible: false }));
    onDismiss?.();
  }, [onDismiss]);

  const handleRetry = useCallback(async () => {
    if (!onRetry) return;

    setState(prev => ({ ...prev, isRetrying: true }));
    
    try {
      await onRetry();
    } finally {
      setState(prev => ({ ...prev, isRetrying: false }));
    }
  }, [onRetry]);

  const getIcon = () => {
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        return <XCircle className="h-5 w-5 text-red-500" />;
      case ErrorSeverity.HIGH:
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case ErrorSeverity.MEDIUM:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case ErrorSeverity.LOW:
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        return "bg-red-50 border-red-200";
      case ErrorSeverity.HIGH:
        return "bg-orange-50 border-orange-200";
      case ErrorSeverity.MEDIUM:
        return "bg-yellow-50 border-yellow-200";
      case ErrorSeverity.LOW:
        return "bg-blue-50 border-blue-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getProgressColor = () => {
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        return "bg-red-500";
      case ErrorSeverity.HIGH:
        return "bg-orange-500";
      case ErrorSeverity.MEDIUM:
        return "bg-yellow-500";
      case ErrorSeverity.LOW:
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getSuggestions = () => {
    const suggestions: ErrorNotificationAction[] = [];

    // 根據錯誤類型添加建議動作
    if (error.isRetryable && onRetry) {
      suggestions.push({
        label: "重試",
        action: handleRetry,
        style: "primary",
      });
    }

    if (error.recovery === RecoveryStrategy.RELOAD) {
      suggestions.push({
        label: "重新載入",
        action: () => window.location.reload(),
        style: "secondary",
      });
    }

    if (error.recovery === RecoveryStrategy.REDIRECT) {
      suggestions.push({
        label: "返回登入",
        action: () => window.location.href = "/login",
        style: "secondary",
      });
    }

    if (error.category === ErrorCategory.NETWORK) {
      suggestions.push({
        label: "檢查網路",
        action: () => window.open("https://www.google.com", "_blank"),
        style: "secondary",
      });
    }

    return suggestions;
  };

  if (!state.isVisible) {
    return null;
  }

  const suggestions = getSuggestions();

  return (
    <Card
      className={cn(
        "fixed top-4 right-4 z-50 w-96 shadow-lg transition-all duration-300",
        getBackgroundColor(),
        className
      )}
    >
      <CardContent className="p-4">
        {/* 錯誤頭部 */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {getIcon()}
            <div>
              <h4 className="font-medium text-gray-900">
                {getSeverityText(error.severity)}
              </h4>
              <p className="text-sm text-gray-600">
                {getCategoryText(error.category)}
              </p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* 錯誤訊息 */}
        <p className="text-sm text-gray-800 mb-3">
          {error.message}
        </p>

        {/* 重試計數 */}
        {error.retryCount && error.retryCount > 0 && (
          <p className="text-xs text-gray-600 mb-3">
            已重試 {error.retryCount} 次
          </p>
        )}

        {/* 建議動作 */}
        {showActions && suggestions.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant={suggestion.style === "primary" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  suggestion.action();
                  onAction?.(suggestion);
                }}
                disabled={state.isRetrying}
              >
                {state.isRetrying && suggestion.label === "重試" ? (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    重試中...
                  </>
                ) : (
                  suggestion.label
                )}
              </Button>
            ))}
          </div>
        )}

        {/* 自動隱藏進度條 */}
        {autoHide && state.countdown > 0 && (
          <div className="relative">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-600">
                自動關閉倒數
              </span>
              <span className="text-xs text-gray-600">
                {state.countdown}s
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div
                className={cn("h-1 rounded-full transition-all duration-1000", getProgressColor())}
                style={{
                  width: `${((duration / 1000 - state.countdown) / (duration / 1000)) * 100}%`,
                }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// 輔助函數
function getSeverityText(severity: ErrorSeverity): string {
  switch (severity) {
    case ErrorSeverity.CRITICAL:
      return "致命錯誤";
    case ErrorSeverity.HIGH:
      return "嚴重錯誤";
    case ErrorSeverity.MEDIUM:
      return "一般錯誤";
    case ErrorSeverity.LOW:
      return "輕微警告";
    default:
      return "未知錯誤";
  }
}

function getCategoryText(category: ErrorCategory): string {
  switch (category) {
    case ErrorCategory.NETWORK:
      return "網路連接";
    case ErrorCategory.API:
      return "伺服器響應";
    case ErrorCategory.AUTHENTICATION:
      return "身份驗證";
    case ErrorCategory.VALIDATION:
      return "數據驗證";
    case ErrorCategory.BLOCK_LOADING:
      return "積木載入";
    case ErrorCategory.BLOCK_CONFIG:
      return "積木配置";
    case ErrorCategory.BLOCK_OPERATION:
      return "積木操作";
    case ErrorCategory.PREVIEW:
      return "預覽功能";
    case ErrorCategory.CODE_GENERATION:
      return "代碼生成";
    case ErrorCategory.UI_RENDER:
      return "界面渲染";
    default:
      return "系統";
  }
}

export default ErrorNotification;