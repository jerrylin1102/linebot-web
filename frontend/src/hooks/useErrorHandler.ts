/**
 * 錯誤處理 Hook
 * 提供統一的錯誤處理介面和狀態管理
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import ErrorManager from "@/services/ErrorManager";
import {
  UnifiedError,
  ErrorSeverity,
  ErrorCategory,
  RecoveryStrategy,
  ErrorHandleResult,
} from "@/types/error";

// Error context interface
interface ErrorContext {
  component?: string;
  operation?: string;
  metadata?: Record<string, unknown>;
  timestamp?: number;
  userId?: string;
  sessionId?: string;
}

interface ErrorState {
  currentError: UnifiedError | null;
  isHandling: boolean;
  errorHistory: UnifiedError[];
  lastHandleResult: ErrorHandleResult | null;
}

interface UseErrorHandlerOptions {
  enableNotifications?: boolean;
  enableAutoRetry?: boolean;
  maxAutoRetries?: number;
  enableErrorHistory?: boolean;
  onError?: (error: UnifiedError) => void;
  onRecover?: (error: UnifiedError, result: ErrorHandleResult) => void;
}

interface UseErrorHandlerReturn {
  // 狀態
  error: UnifiedError | null;
  isHandling: boolean;
  errorHistory: UnifiedError[];
  hasError: boolean;
  
  // 錯誤處理方法
  handleError: (error: Error | string, context?: Partial<ErrorContext>) => Promise<ErrorHandleResult>;
  handleErrorAsync: <T>(operation: () => Promise<T>, context?: Partial<ErrorContext>) => Promise<T>;
  clearError: () => void;
  clearErrorHistory: () => void;
  
  // 重試方法
  retryLastOperation: () => Promise<void>;
  retryWithCustomOperation: <T>(operation: () => Promise<T>) => Promise<T>;
  
  // 恢復方法
  recoverFromError: (strategy?: RecoveryStrategy) => Promise<void>;
  
  // 查詢方法
  getErrorsByCategory: (category: ErrorCategory) => UnifiedError[];
  getErrorsBySeverity: (severity: ErrorSeverity) => UnifiedError[];
  getRecentErrors: (minutes?: number) => UnifiedError[];
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}): UseErrorHandlerReturn {
  const {
    enableNotifications = true,
    enableAutoRetry = true,
    maxAutoRetries: _maxAutoRetries = 3,
    enableErrorHistory = true,
    onError,
    onRecover,
  } = options;

  const [state, setState] = useState<ErrorState>({
    currentError: null,
    isHandling: false,
    errorHistory: [],
    lastHandleResult: null,
  });

  const errorManager = useRef(ErrorManager.getInstance());
  const lastOperationRef = useRef<(() => Promise<unknown>) | null>(null);

  /**
   * 顯示錯誤通知
   */
  const showErrorNotification = useCallback((error: UnifiedError) => {
    const duration = getSeverityDuration(error.severity);
    
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        toast.error(error.message, { 
          duration,
          description: "這是一個嚴重錯誤，請立即處理",
        });
        break;
      case ErrorSeverity.HIGH:
        toast.error(error.message, { duration });
        break;
      case ErrorSeverity.MEDIUM:
        toast.warning(error.message, { duration });
        break;
      case ErrorSeverity.LOW:
        toast.info(error.message, { duration });
        break;
      default:
        toast(error.message, { duration });
    }
  }, []);

  // 監聽全局錯誤
  useEffect(() => {
    const manager = errorManager.current;
    
    const handleGlobalError = (error: UnifiedError) => {
      setState(prev => ({
        ...prev,
        currentError: error,
        errorHistory: enableErrorHistory 
          ? [...prev.errorHistory.slice(-99), error] 
          : prev.errorHistory,
      }));

      // 顯示通知
      if (enableNotifications) {
        showErrorNotification(error);
      }

      // 觸發回調
      onError?.(error);
    };

    manager.addErrorListener(handleGlobalError);

    return () => {
      manager.removeErrorListener(handleGlobalError);
    };
  }, [enableNotifications, enableErrorHistory, onError, showErrorNotification]);

  /**
   * 重試操作
   */
  const retryOperation = useCallback(async <T>(
    operation: () => Promise<T>
  ): Promise<{ success: boolean; result?: T; error?: Error }> => {
    try {
      const result = await operation();
      return { success: true, result };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }, []);

  /**
   * 主要錯誤處理方法
   */
  const handleError = useCallback(async (
    error: Error | string,
    context: Partial<ErrorContext> = {}
  ): Promise<ErrorHandleResult> => {
    setState(prev => ({ ...prev, isHandling: true }));

    try {
      const result = await errorManager.current.handleQuickError(error, context);
      
      setState(prev => ({
        ...prev,
        isHandling: false,
        lastHandleResult: result,
      }));

      // 自動重試
      if (enableAutoRetry && result.recovery === RecoveryStrategy.RETRY && lastOperationRef.current) {
        const retryResult = await retryOperation(lastOperationRef.current);
        if (retryResult.success) {
          // 使用 setState 回調來獲取最新的 currentError
          setState(currentState => {
            onRecover?.(currentState.currentError!, result);
            return currentState;
          });
        }
      }

      return result;
    } catch (handlingError) {
      setState(prev => ({ ...prev, isHandling: false }));
      throw handlingError;
    }
  }, [enableAutoRetry, onRecover, retryOperation]);

  /**
   * 異步操作錯誤處理包裝器
   */
  const handleErrorAsync = useCallback(async <T>(
    operation: () => Promise<T>,
    context: Partial<ErrorContext> = {}
  ): Promise<T> => {
    lastOperationRef.current = operation;
    
    try {
      return await operation();
    } catch (error) {
      await handleError(error as Error, context);
      throw error;
    }
  }, [handleError]);

  /**
   * 重試最後一次操作
   */
  const retryLastOperation = useCallback(async (): Promise<void> => {
    if (!lastOperationRef.current) {
      throw new Error("沒有可重試的操作");
    }

    // 通過 setState 獲取當前狀態來檢查錯誤
    const currentState = await new Promise<ErrorState>(resolve => {
      setState(state => {
        resolve(state);
        return state;
      });
    });

    if (!currentState.currentError?.isRetryable) {
      throw new Error("當前錯誤不支援重試");
    }

    const retryResult = await retryOperation(lastOperationRef.current);
    
    if (retryResult.success) {
      setState(prev => ({ ...prev, currentError: null }));
      toast.success("操作重試成功");
      onRecover?.(currentState.currentError!, { success: true, recovery: RecoveryStrategy.RETRY });
    } else {
      throw retryResult.error;
    }
  }, [onRecover, retryOperation]);

  /**
   * 使用自定義操作重試
   */
  const retryWithCustomOperation = useCallback(async <T>(
    operation: () => Promise<T>
  ): Promise<T> => {
    lastOperationRef.current = operation;
    return operation();
  }, []);

  /**
   * 從錯誤中恢復
   */
  const recoverFromError = useCallback(async (
    strategy?: RecoveryStrategy
  ): Promise<void> => {
    // 通過 setState 獲取當前狀態
    const currentState = await new Promise<ErrorState>(resolve => {
      setState(state => {
        resolve(state);
        return state;
      });
    });

    if (!currentState.currentError) return;

    const recoveryStrategy = strategy || currentState.currentError.recovery || RecoveryStrategy.NONE;
    
    switch (recoveryStrategy) {
      case RecoveryStrategy.RETRY:
        await retryLastOperation();
        break;
        
      case RecoveryStrategy.RELOAD:
        window.location.reload();
        break;
        
      case RecoveryStrategy.REDIRECT:
        window.location.href = "/";
        break;
        
      case RecoveryStrategy.REFRESH:
        window.location.reload();
        break;
        
      case RecoveryStrategy.RESET:
        setState(prev => ({ ...prev, currentError: null }));
        break;
        
      case RecoveryStrategy.FALLBACK:
        // 使用降級處理
        setState(prev => ({ ...prev, currentError: null }));
        toast.info("已切換到安全模式");
        break;
        
      default:
        setState(prev => ({ ...prev, currentError: null }));
    }
  }, [retryLastOperation]);

  /**
   * 清除當前錯誤
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, currentError: null }));
  }, []);

  /**
   * 清除錯誤歷史
   */
  const clearErrorHistory = useCallback(() => {
    setState(prev => ({ ...prev, errorHistory: [] }));
    errorManager.current.clearErrorHistory();
  }, []);

  /**
   * 按類別獲取錯誤
   */
  const getErrorsByCategory = useCallback((category: ErrorCategory): UnifiedError[] => {
    return state.errorHistory.filter(error => error.category === category);
  }, [state.errorHistory]);

  /**
   * 按嚴重程度獲取錯誤
   */
  const getErrorsBySeverity = useCallback((severity: ErrorSeverity): UnifiedError[] => {
    return state.errorHistory.filter(error => error.severity === severity);
  }, [state.errorHistory]);

  /**
   * 獲取最近的錯誤
   */
  const getRecentErrors = useCallback((minutes: number = 60): UnifiedError[] => {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    return state.errorHistory.filter(error => error.context.timestamp > cutoff);
  }, [state.errorHistory]);

  return {
    // 狀態
    error: state.currentError,
    isHandling: state.isHandling,
    errorHistory: state.errorHistory,
    hasError: !!state.currentError,
    
    // 錯誤處理方法
    handleError,
    handleErrorAsync,
    clearError,
    clearErrorHistory,
    
    // 重試方法
    retryLastOperation,
    retryWithCustomOperation,
    
    // 恢復方法
    recoverFromError,
    
    // 查詢方法
    getErrorsByCategory,
    getErrorsBySeverity,
    getRecentErrors,
  };
}

/**
 * 根據錯誤嚴重程度獲取通知持續時間
 */
function getSeverityDuration(severity: ErrorSeverity): number {
  switch (severity) {
    case ErrorSeverity.CRITICAL:
      return 10000; // 10秒
    case ErrorSeverity.HIGH:
      return 7000;  // 7秒
    case ErrorSeverity.MEDIUM:
      return 5000;  // 5秒
    case ErrorSeverity.LOW:
      return 3000;  // 3秒
    default:
      return 5000;  // 默認5秒
  }
}

export default useErrorHandler;