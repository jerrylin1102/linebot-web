/**
 * 統一錯誤管理器
 * 提供錯誤分類、處理、恢復和通知功能
 */

import {
  UnifiedError,
  ErrorHandler,
  ErrorHandleResult,
  ErrorSeverity,
  ErrorCategory,
  ErrorContext,
  RecoveryStrategy,
  ErrorMonitoringConfig,
  RetryConfig,
  ERROR_CODES,
  ERROR_MESSAGES,
  RECOVERY_STRATEGIES,
} from "@/types/error";

class ErrorManager {
  private static instance: ErrorManager;
  private handlers: ErrorHandler[] = [];
  private errorHistory: UnifiedError[] = [];
  private monitoringConfig: ErrorMonitoringConfig;
  private retryConfig: RetryConfig;
  private listeners: ((error: UnifiedError) => void)[] = [];

  constructor() {
    this.monitoringConfig = {
      enableRemoteLogging: true,
      enableLocalStorage: true,
      enableConsoleLogging: true,
      maxLogEntries: 1000,
      logLevel: ErrorSeverity.LOW,
      sensitiveDataFilter: this.filterSensitiveData,
    };

    this.retryConfig = {
      maxRetries: 3,
      retryDelay: 1000,
      backoffMultiplier: 2,
      retryCondition: (error) => error.isRetryable ?? false,
    };

    this.initializeDefaultHandlers();
    this.setupGlobalErrorHandling();
  }

  public static getInstance(): ErrorManager {
    if (!ErrorManager.instance) {
      ErrorManager.instance = new ErrorManager();
    }
    return ErrorManager.instance;
  }

  /**
   * 註冊錯誤處理器
   */
  public registerHandler(handler: ErrorHandler): void {
    this.handlers.push(handler);
    this.handlers.sort((a, b) => b.priority - a.priority);
  }

  /**
   * 創建統一錯誤對象
   */
  public createError(
    code: string,
    message?: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    category: ErrorCategory = ErrorCategory.UNEXPECTED,
    context: Partial<ErrorContext> = {},
    originalError?: Error
  ): UnifiedError {
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const fullContext: ErrorContext = {
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      ...context,
    };

    const error: UnifiedError = {
      id: errorId,
      code,
      message: message || ERROR_MESSAGES[code as keyof typeof ERROR_MESSAGES] || "未知錯誤",
      severity,
      category,
      context: fullContext,
      originalError,
      stack: originalError?.stack || new Error().stack,
      recovery: RECOVERY_STRATEGIES[code as keyof typeof RECOVERY_STRATEGIES] || RecoveryStrategy.NONE,
      isRetryable: this.isRetryableError(category, code),
      retryCount: 0,
      maxRetries: this.retryConfig.maxRetries,
    };

    return error;
  }

  /**
   * 處理錯誤
   */
  public async handleError(error: UnifiedError): Promise<ErrorHandleResult> {
    // 記錄錯誤
    this.logError(error);
    
    // 通知監聽器
    this.notifyListeners(error);

    // 尋找合適的處理器
    const handler = this.handlers.find(h => h.canHandle(error));
    
    if (handler) {
      try {
        const result = await handler.handle(error);
        
        if (result.success) {
          this.logSuccess(error, result);
        } else {
          this.logFailure(error, result);
        }
        
        return result;
      } catch (handlerError) {
        console.error("Error handler failed:", handlerError);
        return this.createDefaultHandleResult(error);
      }
    }

    // 沒有合適的處理器，使用默認處理
    return this.createDefaultHandleResult(error);
  }

  /**
   * 快速錯誤處理方法
   */
  public async handleQuickError(
    originalError: Error | string,
    context: Partial<ErrorContext> = {}
  ): Promise<ErrorHandleResult> {
    const errorMessage = typeof originalError === "string" ? originalError : originalError.message;
    const errorObj = typeof originalError === "string" ? new Error(originalError) : originalError;
    
    const category = this.categorizeError(errorObj);
    const severity = this.determineSeverity(category, errorObj);
    const code = this.generateErrorCode(category, errorObj);
    
    const unifiedError = this.createError(
      code,
      errorMessage,
      severity,
      category,
      context,
      errorObj
    );

    return this.handleError(unifiedError);
  }

  /**
   * 重試錯誤操作
   */
  public async retryError(
    error: UnifiedError,
    operation: () => Promise<any>
  ): Promise<any> {
    if (!error.isRetryable || (error.retryCount ?? 0) >= (error.maxRetries ?? 0)) {
      throw error;
    }

    error.retryCount = (error.retryCount ?? 0) + 1;
    
    const delay = this.calculateRetryDelay(error.retryCount);
    await this.sleep(delay);

    try {
      const result = await operation();
      this.logRetrySuccess(error);
      return result;
    } catch (retryError) {
      if (error.retryCount >= (error.maxRetries ?? 0)) {
        this.logRetryFailure(error);
        throw error;
      }
      
      return this.retryError(error, operation);
    }
  }

  /**
   * 添加錯誤監聽器
   */
  public addErrorListener(listener: (error: UnifiedError) => void): void {
    this.listeners.push(listener);
  }

  /**
   * 移除錯誤監聽器
   */
  public removeErrorListener(listener: (error: UnifiedError) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * 獲取錯誤歷史
   */
  public getErrorHistory(): UnifiedError[] {
    return [...this.errorHistory];
  }

  /**
   * 清除錯誤歷史
   */
  public clearErrorHistory(): void {
    this.errorHistory = [];
    if (this.monitoringConfig.enableLocalStorage) {
      localStorage.removeItem("error_history");
    }
  }

  /**
   * 獲取系統健康狀態
   */
  public getHealthStatus(): {
    totalErrors: number;
    criticalErrors: number;
    recentErrors: number;
    errorRate: number;
  } {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    const recentErrors = this.errorHistory.filter(
      error => now - error.context.timestamp < oneHour
    );
    
    const criticalErrors = this.errorHistory.filter(
      error => error.severity === ErrorSeverity.CRITICAL
    );

    return {
      totalErrors: this.errorHistory.length,
      criticalErrors: criticalErrors.length,
      recentErrors: recentErrors.length,
      errorRate: recentErrors.length / (oneHour / 1000 / 60), // errors per minute
    };
  }

  /**
   * 初始化默認處理器
   */
  private initializeDefaultHandlers(): void {
    // 網路錯誤處理器
    this.registerHandler({
      canHandle: (error) => error.category === ErrorCategory.NETWORK,
      handle: async (error) => this.handleNetworkError(error),
      priority: 100,
    });

    // API錯誤處理器
    this.registerHandler({
      canHandle: (error) => error.category === ErrorCategory.API,
      handle: async (error) => this.handleApiError(error),
      priority: 90,
    });

    // 積木錯誤處理器
    this.registerHandler({
      canHandle: (error) => 
        error.category === ErrorCategory.BLOCK_LOADING ||
        error.category === ErrorCategory.BLOCK_CONFIG ||
        error.category === ErrorCategory.BLOCK_OPERATION,
      handle: async (error) => this.handleBlockError(error),
      priority: 80,
    });

    // 認證錯誤處理器
    this.registerHandler({
      canHandle: (error) => error.category === ErrorCategory.AUTHENTICATION,
      handle: async (error) => this.handleAuthError(error),
      priority: 95,
    });

    // 默認錯誤處理器
    this.registerHandler({
      canHandle: () => true,
      handle: async (error) => this.handleDefaultError(error),
      priority: 1,
    });
  }

  /**
   * 處理網路錯誤
   */
  private async handleNetworkError(error: UnifiedError): Promise<ErrorHandleResult> {
    if (error.code === ERROR_CODES.NETWORK_OFFLINE) {
      return {
        success: false,
        recovery: RecoveryStrategy.MANUAL,
        message: "請檢查網路連接後重試",
        shouldNotify: true,
        shouldLog: true,
      };
    }

    if (error.code === ERROR_CODES.NETWORK_TIMEOUT) {
      return {
        success: false,
        recovery: RecoveryStrategy.RETRY,
        message: "連接超時，正在重試...",
        shouldNotify: true,
        shouldLog: true,
      };
    }

    return this.createDefaultHandleResult(error);
  }

  /**
   * 處理API錯誤
   */
  private async handleApiError(error: UnifiedError): Promise<ErrorHandleResult> {
    if (error.code === ERROR_CODES.API_UNAUTHORIZED) {
      return {
        success: false,
        recovery: RecoveryStrategy.REDIRECT,
        message: "登入已過期，正在重新導向到登入頁面",
        shouldNotify: true,
        shouldLog: true,
        nextAction: () => {
          window.location.href = "/login";
        },
      };
    }

    if (error.code === ERROR_CODES.API_RATE_LIMITED) {
      return {
        success: false,
        recovery: RecoveryStrategy.RETRY,
        message: "請求過於頻繁，請稍後再試",
        shouldNotify: true,
        shouldLog: true,
      };
    }

    return this.createDefaultHandleResult(error);
  }

  /**
   * 處理積木錯誤
   */
  private async handleBlockError(error: UnifiedError): Promise<ErrorHandleResult> {
    if (error.code === ERROR_CODES.BLOCK_LOAD_FAILED) {
      return {
        success: false,
        recovery: RecoveryStrategy.RETRY,
        message: "積木載入失敗，正在重試...",
        shouldNotify: true,
        shouldLog: true,
      };
    }

    if (error.code === ERROR_CODES.BLOCK_COMPATIBILITY_ERROR) {
      return {
        success: false,
        recovery: RecoveryStrategy.FALLBACK,
        message: "積木不相容，請選擇其他積木",
        shouldNotify: true,
        shouldLog: false,
      };
    }

    return this.createDefaultHandleResult(error);
  }

  /**
   * 處理認證錯誤
   */
  private async handleAuthError(error: UnifiedError): Promise<ErrorHandleResult> {
    return {
      success: false,
      recovery: RecoveryStrategy.REDIRECT,
      message: "認證失敗，正在重新導向到登入頁面",
      shouldNotify: true,
      shouldLog: true,
      nextAction: () => {
        window.location.href = "/login";
      },
    };
  }

  /**
   * 處理默認錯誤
   */
  private async handleDefaultError(error: UnifiedError): Promise<ErrorHandleResult> {
    return this.createDefaultHandleResult(error);
  }

  /**
   * 創建默認處理結果
   */
  private createDefaultHandleResult(error: UnifiedError): ErrorHandleResult {
    return {
      success: false,
      recovery: error.recovery || RecoveryStrategy.NONE,
      message: error.message,
      shouldNotify: error.severity !== ErrorSeverity.LOW,
      shouldLog: true,
    };
  }

  /**
   * 設置全局錯誤處理
   */
  private setupGlobalErrorHandling(): void {
    // 捕獲未處理的Promise拒絕
    window.addEventListener("unhandledrejection", (event) => {
      const error = this.createError(
        ERROR_CODES.UNEXPECTED_ERROR,
        event.reason?.message || "未處理的Promise拒絕",
        ErrorSeverity.HIGH,
        ErrorCategory.UNEXPECTED,
        { component: "global" },
        event.reason
      );
      
      this.handleError(error);
    });

    // 捕獲全局JavaScript錯誤
    window.addEventListener("error", (event) => {
      const error = this.createError(
        ERROR_CODES.UNEXPECTED_ERROR,
        event.message,
        ErrorSeverity.HIGH,
        ErrorCategory.UNEXPECTED,
        { 
          component: "global",
          additional: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
          }
        },
        event.error
      );
      
      this.handleError(error);
    });
  }

  /**
   * 記錄錯誤
   */
  private logError(error: UnifiedError): void {
    // 添加到歷史記錄
    this.errorHistory.push(error);
    
    // 限制歷史記錄大小
    if (this.errorHistory.length > this.monitoringConfig.maxLogEntries) {
      this.errorHistory = this.errorHistory.slice(-this.monitoringConfig.maxLogEntries);
    }

    // 控制台日誌
    if (this.monitoringConfig.enableConsoleLogging) {
      console.error(`[${error.severity}] ${error.code}: ${error.message}`, error);
    }

    // 本地存儲
    if (this.monitoringConfig.enableLocalStorage) {
      try {
        const filtered = this.monitoringConfig.sensitiveDataFilter(error);
        localStorage.setItem("error_history", JSON.stringify(this.errorHistory.map(e => 
          this.monitoringConfig.sensitiveDataFilter(e)
        )));
      } catch (storageError) {
        console.warn("Failed to save error to localStorage:", storageError);
      }
    }

    // 遠程日誌（如果配置）
    if (this.monitoringConfig.enableRemoteLogging) {
      this.sendToRemoteLogging(error);
    }
  }

  /**
   * 記錄成功處理
   */
  private logSuccess(error: UnifiedError, result: ErrorHandleResult): void {
    console.log(`Error ${error.id} handled successfully:`, result);
  }

  /**
   * 記錄處理失敗
   */
  private logFailure(error: UnifiedError, result: ErrorHandleResult): void {
    console.warn(`Error ${error.id} handling failed:`, result);
  }

  /**
   * 記錄重試成功
   */
  private logRetrySuccess(error: UnifiedError): void {
    console.log(`Error ${error.id} retry successful after ${error.retryCount} attempts`);
  }

  /**
   * 記錄重試失敗
   */
  private logRetryFailure(error: UnifiedError): void {
    console.error(`Error ${error.id} retry failed after ${error.retryCount} attempts`);
  }

  /**
   * 通知監聽器
   */
  private notifyListeners(error: UnifiedError): void {
    this.listeners.forEach(listener => {
      try {
        listener(error);
      } catch (listenerError) {
        console.error("Error listener failed:", listenerError);
      }
    });
  }

  /**
   * 判斷是否為可重試錯誤
   */
  private isRetryableError(category: ErrorCategory, code: string): boolean {
    const retryableCategories = [
      ErrorCategory.NETWORK,
      ErrorCategory.API,
      ErrorCategory.BLOCK_LOADING,
    ];

    const nonRetryableCodes = [
      ERROR_CODES.API_UNAUTHORIZED,
      ERROR_CODES.API_FORBIDDEN,
      ERROR_CODES.VALIDATION_FAILED,
    ];

    return retryableCategories.includes(category) && !nonRetryableCodes.includes(code);
  }

  /**
   * 計算重試延遲
   */
  private calculateRetryDelay(retryCount: number): number {
    return this.retryConfig.retryDelay * Math.pow(this.retryConfig.backoffMultiplier, retryCount - 1);
  }

  /**
   * 分類錯誤
   */
  private categorizeError(error: Error): ErrorCategory {
    const message = error.message.toLowerCase();
    
    if (message.includes("network") || message.includes("fetch")) {
      return ErrorCategory.NETWORK;
    }
    
    if (message.includes("unauthorized") || message.includes("authentication")) {
      return ErrorCategory.AUTHENTICATION;
    }
    
    if (message.includes("validation")) {
      return ErrorCategory.VALIDATION;
    }
    
    return ErrorCategory.UNEXPECTED;
  }

  /**
   * 確定錯誤嚴重程度
   */
  private determineSeverity(category: ErrorCategory, error: Error): ErrorSeverity {
    if (category === ErrorCategory.AUTHENTICATION) {
      return ErrorSeverity.HIGH;
    }
    
    if (category === ErrorCategory.NETWORK) {
      return ErrorSeverity.MEDIUM;
    }
    
    return ErrorSeverity.LOW;
  }

  /**
   * 生成錯誤代碼
   */
  private generateErrorCode(category: ErrorCategory, error: Error): string {
    const message = error.message.toLowerCase();
    
    if (category === ErrorCategory.NETWORK) {
      if (message.includes("timeout")) return ERROR_CODES.NETWORK_TIMEOUT;
      if (message.includes("offline")) return ERROR_CODES.NETWORK_OFFLINE;
      return ERROR_CODES.NETWORK_CONNECTION_FAILED;
    }
    
    if (category === ErrorCategory.AUTHENTICATION) {
      return ERROR_CODES.AUTH_INVALID_CREDENTIALS;
    }
    
    if (category === ErrorCategory.VALIDATION) {
      return ERROR_CODES.VALIDATION_FAILED;
    }
    
    return ERROR_CODES.UNEXPECTED_ERROR;
  }

  /**
   * 過濾敏感數據
   */
  private filterSensitiveData(data: any): any {
    const sensitiveKeys = ["password", "token", "secret", "key", "auth"];
    
    if (typeof data !== "object" || data === null) {
      return data;
    }
    
    const filtered = { ...data };
    
    for (const key of Object.keys(filtered)) {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        filtered[key] = "[FILTERED]";
      } else if (typeof filtered[key] === "object") {
        filtered[key] = this.filterSensitiveData(filtered[key]);
      }
    }
    
    return filtered;
  }

  /**
   * 發送到遠程日誌服務
   */
  private async sendToRemoteLogging(error: UnifiedError): Promise<void> {
    try {
      // TODO: 實現遠程日誌服務
      // await fetch("/api/logs/error", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(this.monitoringConfig.sensitiveDataFilter(error)),
      // });
    } catch (remoteError) {
      console.warn("Failed to send error to remote logging:", remoteError);
    }
  }

  /**
   * 延遲函數
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default ErrorManager;