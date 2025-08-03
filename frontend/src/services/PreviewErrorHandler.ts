/**
 * 預覽和代碼生成錯誤處理服務
 * 專門處理 Flex Message 預覽和代碼生成相關的錯誤
 */

import ErrorManager from "./ErrorManager";
import {
  UnifiedError,
  ErrorSeverity,
  ErrorCategory,
  RecoveryStrategy,
  ErrorHandleResult,
  ERROR_CODES,
} from "@/types/error";
import { UnifiedBlock } from "@/types/block";

interface PreviewErrorContext {
  blockId?: string;
  blockType?: string;
  previewType?: "flex" | "code" | "logic";
  templateType?: string;
  operation?: string;
  additional?: Record<string, unknown>;
}

interface CodeGenerationError {
  blockId: string;
  blockType: string;
  reason: string;
  isRetryable: boolean;
  suggestions: string[];
}

interface PreviewRenderError {
  component: string;
  reason: string;
  data?: any;
  isDataRelated: boolean;
}

interface NetworkError {
  endpoint: string;
  status?: number;
  statusText?: string;
  timeout: boolean;
}

class PreviewErrorHandler {
  private static instance: PreviewErrorHandler;
  private errorManager = ErrorManager.getInstance();
  private previewFailures = new Map<string, number>();
  private codeGenFailures = new Map<string, number>();
  private maxRetries = 3;

  constructor() {
    this.setupPreviewErrorHandlers();
  }

  public static getInstance(): PreviewErrorHandler {
    if (!PreviewErrorHandler.instance) {
      PreviewErrorHandler.instance = new PreviewErrorHandler();
    }
    return PreviewErrorHandler.instance;
  }

  /**
   * 處理 Flex Message 預覽錯誤
   */
  public async handleFlexPreviewError(
    error: Error,
    blocks: UnifiedBlock[],
    context: Partial<PreviewErrorContext> = {}
  ): Promise<ErrorHandleResult> {
    const previewKey = `flex-${blocks.map(b => b.id).join('-')}`;
    const failureCount = this.previewFailures.get(previewKey) || 0;
    this.previewFailures.set(previewKey, failureCount + 1);

    const isRetryable = failureCount < this.maxRetries && this.isRetryablePreviewError(error);
    
    const unifiedError = this.errorManager.createError(
      ERROR_CODES.PREVIEW_RENDER_FAILED,
      `Flex Message 預覽失敗: ${error.message}`,
      this.determinePreviewErrorSeverity(error),
      ErrorCategory.PREVIEW,
      {
        component: "FlexPreview",
        action: "render",
        additional: {
          blockCount: blocks.length,
          blockTypes: blocks.map(b => b.blockType),
          failureCount: failureCount + 1,
          maxRetries: this.maxRetries,
          isRetryable,
          previewType: "flex",
          ...context.additional,
        },
        ...context,
      },
      error
    );

    unifiedError.isRetryable = isRetryable;
    unifiedError.suggestions = this.getFlexPreviewSuggestions(error, blocks);

    return this.errorManager.handleError(unifiedError);
  }

  /**
   * 處理代碼生成錯誤
   */
  public async handleCodeGenerationError(
    error: Error,
    blocks: UnifiedBlock[],
    templateType: string,
    context: Partial<PreviewErrorContext> = {}
  ): Promise<ErrorHandleResult> {
    const codeGenKey = `codegen-${templateType}-${blocks.length}`;
    const failureCount = this.codeGenFailures.get(codeGenKey) || 0;
    this.codeGenFailures.set(codeGenKey, failureCount + 1);

    const isRetryable = failureCount < this.maxRetries && this.isRetryableCodeGenError(error);
    
    const unifiedError = this.errorManager.createError(
      ERROR_CODES.CODE_GEN_FAILED,
      `代碼生成失敗: ${error.message}`,
      this.determineCodeGenErrorSeverity(error),
      ErrorCategory.CODE_GENERATION,
      {
        component: "CodeGenerator",
        action: "generate",
        additional: {
          blockCount: blocks.length,
          blockTypes: blocks.map(b => b.blockType),
          templateType,
          failureCount: failureCount + 1,
          maxRetries: this.maxRetries,
          isRetryable,
          ...context.additional,
        },
        ...context,
      },
      error
    );

    unifiedError.isRetryable = isRetryable;
    unifiedError.suggestions = this.getCodeGenerationSuggestions(error, templateType);

    return this.errorManager.handleError(unifiedError);
  }

  /**
   * 處理預覽數據驗證錯誤
   */
  public async handlePreviewDataError(
    invalidData: any,
    validationErrors: string[],
    context: Partial<PreviewErrorContext> = {}
  ): Promise<ErrorHandleResult> {
    const unifiedError = this.errorManager.createError(
      ERROR_CODES.PREVIEW_DATA_INVALID,
      `預覽數據無效: ${validationErrors.join(", ")}`,
      ErrorSeverity.MEDIUM,
      ErrorCategory.VALIDATION,
      {
        component: "PreviewValidator",
        action: "validate",
        additional: {
          validationErrors,
          dataKeys: typeof invalidData === "object" ? Object.keys(invalidData) : [],
          dataType: typeof invalidData,
          ...context.additional,
        },
        ...context,
      }
    );

    unifiedError.suggestions = this.getDataValidationSuggestions(validationErrors);
    unifiedError.recovery = RecoveryStrategy.RESET;

    return this.errorManager.handleError(unifiedError);
  }

  /**
   * 處理網路請求錯誤（預覽API）
   */
  public async handlePreviewNetworkError(
    error: Error,
    endpoint: string,
    context: Partial<PreviewErrorContext> = {}
  ): Promise<ErrorHandleResult> {
    const isTimeout = error.message.includes("timeout") || error.name === "TimeoutError";
    const isOffline = !navigator.onLine;
    
    let errorCode = ERROR_CODES.NETWORK_CONNECTION_FAILED;
    if (isTimeout) {
      errorCode = ERROR_CODES.NETWORK_TIMEOUT;
    } else if (isOffline) {
      errorCode = ERROR_CODES.NETWORK_OFFLINE;
    }

    const unifiedError = this.errorManager.createError(
      errorCode,
      `預覽服務網路錯誤: ${error.message}`,
      isOffline ? ErrorSeverity.HIGH : ErrorSeverity.MEDIUM,
      ErrorCategory.NETWORK,
      {
        component: "PreviewAPI",
        action: "request",
        additional: {
          endpoint,
          isTimeout,
          isOffline,
          userAgent: navigator.userAgent,
          ...context.additional,
        },
        ...context,
      },
      error
    );

    unifiedError.isRetryable = !isOffline;
    unifiedError.suggestions = this.getNetworkErrorSuggestions(error, isTimeout, isOffline);

    return this.errorManager.handleError(unifiedError);
  }

  /**
   * 處理模板錯誤
   */
  public async handleTemplateError(
    templateType: string,
    error: Error,
    context: Partial<PreviewErrorContext> = {}
  ): Promise<ErrorHandleResult> {
    const unifiedError = this.errorManager.createError(
      ERROR_CODES.CODE_GEN_INVALID_TEMPLATE,
      `模板錯誤: ${error.message}`,
      ErrorSeverity.MEDIUM,
      ErrorCategory.CODE_GENERATION,
      {
        component: "TemplateEngine",
        action: "process",
        additional: {
          templateType,
          ...context.additional,
        },
        ...context,
      },
      error
    );

    unifiedError.suggestions = this.getTemplateSuggestions(templateType, error);
    unifiedError.recovery = RecoveryStrategy.FALLBACK;

    return this.errorManager.handleError(unifiedError);
  }

  /**
   * 驗證預覽數據
   */
  public validatePreviewData(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data) {
      errors.push("預覽數據為空");
      return { isValid: false, errors };
    }

    if (typeof data !== "object") {
      errors.push("預覽數據必須是對象格式");
      return { isValid: false, errors };
    }

    // Flex Message 特定驗證
    if (data.type === "flex") {
      if (!data.altText) {
        errors.push("Flex Message 缺少 altText 屬性");
      }
      if (!data.contents) {
        errors.push("Flex Message 缺少 contents 屬性");
      }
      if (data.contents && !data.contents.type) {
        errors.push("Flex Message contents 缺少 type 屬性");
      }
    }

    // 檢查必要的結構
    if (Array.isArray(data)) {
      if (data.length === 0) {
        errors.push("預覽數據陣列為空");
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * 重置錯誤計數
   */
  public resetErrorCounts(type?: "preview" | "codegen"): void {
    if (!type || type === "preview") {
      this.previewFailures.clear();
    }
    if (!type || type === "codegen") {
      this.codeGenFailures.clear();
    }
  }

  /**
   * 獲取錯誤統計
   */
  public getErrorStatistics(): {
    previewFailures: Map<string, number>;
    codeGenFailures: Map<string, number>;
    totalErrors: number;
    recentErrors: number;
  } {
    const health = this.errorManager.getHealthStatus();
    
    return {
      previewFailures: new Map(this.previewFailures),
      codeGenFailures: new Map(this.codeGenFailures),
      totalErrors: health.totalErrors,
      recentErrors: health.recentErrors,
    };
  }

  /**
   * 設置預覽錯誤處理器
   */
  private setupPreviewErrorHandlers(): void {
    // 監聽圖片載入錯誤
    window.addEventListener("error", (event) => {
      if (event.target instanceof HTMLImageElement) {
        this.handleImageLoadError(event.target, event.error);
      }
    }, true);
  }

  /**
   * 處理圖片載入錯誤
   */
  private async handleImageLoadError(img: HTMLImageElement, error: any): Promise<void> {
    if (img.closest("[data-flex-preview]")) {
      const unifiedError = this.errorManager.createError(
        "IMAGE_LOAD_FAILED",
        `圖片載入失敗: ${img.src}`,
        ErrorSeverity.LOW,
        ErrorCategory.PREVIEW,
        {
          component: "FlexPreview",
          action: "loadImage",
          additional: {
            imageUrl: img.src,
            imageAlt: img.alt,
          },
        },
        error
      );

      await this.errorManager.handleError(unifiedError);
    }
  }

  /**
   * 判斷是否為可重試的預覽錯誤
   */
  private isRetryablePreviewError(error: Error): boolean {
    const retryableMessages = [
      "network",
      "timeout",
      "fetch",
      "connection",
      "temporary",
    ];
    
    return retryableMessages.some(msg => 
      error.message.toLowerCase().includes(msg)
    );
  }

  /**
   * 判斷是否為可重試的代碼生成錯誤
   */
  private isRetryableCodeGenError(error: Error): boolean {
    const nonRetryableMessages = [
      "template not found",
      "invalid template",
      "syntax error",
      "compilation error",
    ];
    
    return !nonRetryableMessages.some(msg =>
      error.message.toLowerCase().includes(msg)
    );
  }

  /**
   * 確定預覽錯誤嚴重程度
   */
  private determinePreviewErrorSeverity(error: Error): ErrorSeverity {
    if (error.message.includes("critical") || error.message.includes("fatal")) {
      return ErrorSeverity.CRITICAL;
    }
    if (error.message.includes("network") || error.message.includes("timeout")) {
      return ErrorSeverity.MEDIUM;
    }
    return ErrorSeverity.LOW;
  }

  /**
   * 確定代碼生成錯誤嚴重程度
   */
  private determineCodeGenErrorSeverity(error: Error): ErrorSeverity {
    if (error.message.includes("template") || error.message.includes("syntax")) {
      return ErrorSeverity.HIGH;
    }
    return ErrorSeverity.MEDIUM;
  }

  /**
   * 獲取 Flex 預覽錯誤建議
   */
  private getFlexPreviewSuggestions(error: Error, blocks: UnifiedBlock[]): string[] {
    const suggestions = [];
    
    if (error.message.includes("network")) {
      suggestions.push("檢查網路連接", "稍後重試");
    }
    
    if (error.message.includes("render")) {
      suggestions.push("檢查 Flex Message 結構", "確認所有必要屬性已設置");
    }
    
    if (error.message.includes("data")) {
      suggestions.push("檢查積木配置", "確認數據格式正確");
    }
    
    if (blocks.length > 10) {
      suggestions.push("嘗試減少積木數量", "分批處理複雜結構");
    }
    
    suggestions.push("參考 LINE Flex Message 文檔", "檢查瀏覽器控制台的詳細錯誤");
    
    return suggestions;
  }

  /**
   * 獲取代碼生成錯誤建議
   */
  private getCodeGenerationSuggestions(error: Error, templateType: string): string[] {
    const suggestions = [];
    
    if (error.message.includes("template")) {
      suggestions.push(`檢查 ${templateType} 模板是否存在`, "確認模板格式正確");
    }
    
    if (error.message.includes("syntax")) {
      suggestions.push("檢查模板語法", "確認變數名稱正確");
    }
    
    if (error.message.includes("data")) {
      suggestions.push("檢查積木數據完整性", "確認所有必要數據已提供");
    }
    
    suggestions.push("嘗試簡化積木結構", "檢查積木配置是否正確");
    
    return suggestions;
  }

  /**
   * 獲取數據驗證錯誤建議
   */
  private getDataValidationSuggestions(validationErrors: string[]): string[] {
    const suggestions = [];
    
    if (validationErrors.some(e => e.includes("altText"))) {
      suggestions.push("為 Flex Message 添加 altText 屬性");
    }
    
    if (validationErrors.some(e => e.includes("contents"))) {
      suggestions.push("確認 Flex Message 包含有效的 contents");
    }
    
    if (validationErrors.some(e => e.includes("type"))) {
      suggestions.push("檢查所有組件是否包含 type 屬性");
    }
    
    suggestions.push("參考 Flex Message 規範", "檢查積木配置");
    
    return suggestions;
  }

  /**
   * 獲取網路錯誤建議
   */
  private getNetworkErrorSuggestions(
    error: Error,
    isTimeout: boolean,
    isOffline: boolean
  ): string[] {
    const suggestions = [];
    
    if (isOffline) {
      suggestions.push("檢查網路連接", "連接網路後重試");
    } else if (isTimeout) {
      suggestions.push("檢查網路速度", "稍後重試", "聯繫系統管理員");
    } else {
      suggestions.push("檢查伺服器狀態", "稍後重試");
    }
    
    return suggestions;
  }

  /**
   * 獲取模板錯誤建議
   */
  private getTemplateSuggestions(templateType: string, error: Error): string[] {
    const suggestions = [`檢查 ${templateType} 模板配置`];
    
    if (error.message.includes("not found")) {
      suggestions.push("確認模板文件存在", "檢查模板路徑");
    }
    
    if (error.message.includes("syntax")) {
      suggestions.push("檢查模板語法", "確認模板格式正確");
    }
    
    suggestions.push("使用預設模板", "聯繫技術支援");
    
    return suggestions;
  }
}

export default PreviewErrorHandler;