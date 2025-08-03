/**
 * 積木錯誤處理服務
 * 專門處理積木載入、配置和操作相關的錯誤
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
import {
  UnifiedBlock,
  BlockCategory,
  WorkspaceContext,
  BlockValidationResult,
  BLOCK_COMPATIBILITY_RULES,
} from "@/types/block";

interface BlockErrorContext {
  blockType?: string;
  blockId?: string;
  category?: BlockCategory;
  workspace?: WorkspaceContext;
  operation?: string;
  parentBlockId?: string;
  position?: { x: number; y: number };
  additional?: Record<string, unknown>;
}

interface BlockLoadError {
  blockType: string;
  reason: string;
  isRetryable: boolean;
}

interface BlockCompatibilityError {
  sourceBlock: UnifiedBlock;
  targetWorkspace: WorkspaceContext;
  violation: string;
  suggestion?: string;
}

interface BlockOperationError {
  operation: string;
  blockId: string;
  reason: string;
  canRecover: boolean;
}

class BlockErrorHandler {
  private static instance: BlockErrorHandler;
  private errorManager = ErrorManager.getInstance();
  private loadFailures = new Map<string, number>();
  private maxLoadRetries = 3;

  constructor() {
    this.setupBlockErrorHandlers();
  }

  public static getInstance(): BlockErrorHandler {
    if (!BlockErrorHandler.instance) {
      BlockErrorHandler.instance = new BlockErrorHandler();
    }
    return BlockErrorHandler.instance;
  }

  /**
   * 處理積木載入錯誤
   */
  public async handleBlockLoadError(
    blockType: string,
    error: Error,
    context: Partial<BlockErrorContext> = {}
  ): Promise<ErrorHandleResult> {
    // 記錄載入失敗次數
    const failureCount = this.loadFailures.get(blockType) || 0;
    this.loadFailures.set(blockType, failureCount + 1);

    const isRetryable = failureCount < this.maxLoadRetries;
    
    const unifiedError = this.errorManager.createError(
      ERROR_CODES.BLOCK_LOAD_FAILED,
      `積木 "${blockType}" 載入失敗: ${error.message}`,
      ErrorSeverity.MEDIUM,
      ErrorCategory.BLOCK_LOADING,
      {
        component: "BlockLoader",
        action: "load",
        blockType,
        additional: {
          failureCount: failureCount + 1,
          maxRetries: this.maxLoadRetries,
          isRetryable,
          ...context.additional,
        },
        ...context,
      },
      error
    );

    unifiedError.isRetryable = isRetryable;
    unifiedError.suggestions = this.getLoadFailureSuggestions(blockType, error);

    return this.errorManager.handleError(unifiedError);
  }

  /**
   * 處理積木配置錯誤
   */
  public async handleBlockConfigError(
    block: UnifiedBlock,
    configError: string,
    context: Partial<BlockErrorContext> = {}
  ): Promise<ErrorHandleResult> {
    const unifiedError = this.errorManager.createError(
      ERROR_CODES.BLOCK_INVALID_CONFIG,
      `積木配置錯誤: ${configError}`,
      ErrorSeverity.MEDIUM,
      ErrorCategory.BLOCK_CONFIG,
      {
        component: "BlockConfig",
        action: "validate",
        blockType: block.blockType,
        blockId: block.id,
        additional: {
          blockCategory: block.category,
          configError,
          ...context.additional,
        },
        ...context,
      }
    );

    unifiedError.suggestions = this.getConfigErrorSuggestions(block, configError);
    unifiedError.recovery = RecoveryStrategy.RESET;

    return this.errorManager.handleError(unifiedError);
  }

  /**
   * 處理積木相容性錯誤
   */
  public async handleCompatibilityError(
    sourceBlock: UnifiedBlock,
    targetWorkspace: WorkspaceContext,
    context: Partial<BlockErrorContext> = {}
  ): Promise<ErrorHandleResult> {
    const compatibility = this.checkBlockCompatibility(sourceBlock, targetWorkspace);
    
    const unifiedError = this.errorManager.createError(
      ERROR_CODES.BLOCK_COMPATIBILITY_ERROR,
      `積木 "${sourceBlock.blockType}" 不相容於 "${targetWorkspace}" 工作區`,
      ErrorSeverity.LOW,
      ErrorCategory.BLOCK_OPERATION,
      {
        component: "BlockDropZone",
        action: "drop",
        blockType: sourceBlock.blockType,
        blockId: sourceBlock.id,
        additional: {
          sourceCategory: sourceBlock.category,
          targetWorkspace,
          violation: compatibility.reason || "相容性檢查失敗",
          ...context.additional,
        },
        ...context,
      }
    );

    unifiedError.suggestions = compatibility.suggestions || this.getCompatibilitySuggestions(
      sourceBlock,
      targetWorkspace
    );
    unifiedError.recovery = RecoveryStrategy.FALLBACK;

    return this.errorManager.handleError(unifiedError);
  }

  /**
   * 處理積木拖拽錯誤
   */
  public async handleDragDropError(
    sourceBlock: UnifiedBlock,
    targetPosition: { x: number; y: number },
    reason: string,
    context: Partial<BlockErrorContext> = {}
  ): Promise<ErrorHandleResult> {
    const unifiedError = this.errorManager.createError(
      ERROR_CODES.BLOCK_DROP_INVALID,
      `無法在指定位置放置積木: ${reason}`,
      ErrorSeverity.LOW,
      ErrorCategory.BLOCK_OPERATION,
      {
        component: "DragDropSystem",
        action: "drop",
        blockType: sourceBlock.blockType,
        blockId: sourceBlock.id,
        position: targetPosition,
        additional: {
          sourceCategory: sourceBlock.category,
          dropReason: reason,
          ...context.additional,
        },
        ...context,
      }
    );

    unifiedError.suggestions = this.getDragDropSuggestions(sourceBlock, reason);
    unifiedError.recovery = RecoveryStrategy.NONE;

    return this.errorManager.handleError(unifiedError);
  }

  /**
   * 處理積木儲存錯誤
   */
  public async handleBlockSaveError(
    blocks: UnifiedBlock[],
    error: Error,
    context: Partial<BlockErrorContext> = {}
  ): Promise<ErrorHandleResult> {
    const unifiedError = this.errorManager.createError(
      ERROR_CODES.BLOCK_SAVE_FAILED,
      `積木儲存失敗: ${error.message}`,
      ErrorSeverity.HIGH,
      ErrorCategory.BLOCK_OPERATION,
      {
        component: "BlockSaver",
        action: "save",
        additional: {
          blockCount: blocks.length,
          blockTypes: blocks.map(b => b.blockType),
          ...context.additional,
        },
        ...context,
      },
      error
    );

    unifiedError.isRetryable = true;
    unifiedError.suggestions = this.getSaveErrorSuggestions(error);
    unifiedError.recovery = RecoveryStrategy.RETRY;

    return this.errorManager.handleError(unifiedError);
  }

  /**
   * 驗證積木配置
   */
  public validateBlockConfig(block: UnifiedBlock): BlockValidationResult {
    try {
      // 檢查必要欄位
      if (!block.id || !block.blockType || !block.category) {
        return {
          isValid: false,
          reason: "缺少必要的積木屬性",
          suggestions: ["確保積木具有 id、blockType 和 category 屬性"],
        };
      }

      // 檢查積木數據
      if (!block.blockData || typeof block.blockData !== "object") {
        return {
          isValid: false,
          reason: "積木數據無效",
          suggestions: ["檢查積木的 blockData 屬性"],
        };
      }

      // 檢查相容性配置
      if (!Array.isArray(block.compatibility)) {
        return {
          isValid: false,
          reason: "積木相容性配置無效",
          suggestions: ["確保 compatibility 是有效的工作區數組"],
        };
      }

      // 檢查嵌套關係
      if (block.isNested && !block.parentId) {
        return {
          isValid: false,
          reason: "嵌套積木缺少父積木 ID",
          suggestions: ["為嵌套積木設置 parentId 屬性"],
        };
      }

      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        reason: `配置驗證發生錯誤: ${(error as Error).message}`,
        suggestions: ["檢查積木配置格式是否正確"],
      };
    }
  }

  /**
   * 檢查積木相容性
   */
  public checkBlockCompatibility(
    block: UnifiedBlock,
    workspace: WorkspaceContext
  ): BlockValidationResult {
    // 檢查積木是否支持目標工作區
    if (!block.compatibility.includes(workspace)) {
      return {
        isValid: false,
        reason: `積木 "${block.blockType}" 不支持 "${workspace}" 工作區`,
        suggestions: this.getCompatibilitySuggestions(block, workspace),
      };
    }

    // 檢查特定規則
    const rule = BLOCK_COMPATIBILITY_RULES.find(r => r.category === block.category);
    if (rule) {
      // 檢查工作區限制
      if (!rule.allowedIn.includes(workspace)) {
        return {
          isValid: false,
          reason: `${block.category} 類別的積木不允許在 ${workspace} 工作區使用`,
          suggestions: [`請在 ${rule.allowedIn.join(" 或 ")} 工作區中使用此積木`],
        };
      }

      // 檢查依賴需求
      if (rule.dependencies && !this.checkDependencies(block, rule.dependencies)) {
        return {
          isValid: false,
          reason: "積木依賴需求未滿足",
          suggestions: [`此積木需要以下類型的積木: ${rule.dependencies.join(", ")}`],
        };
      }

      // 檢查限制條件
      if (rule.restrictions) {
        const restrictionCheck = this.checkRestrictions(block, rule.restrictions, workspace);
        if (!restrictionCheck.isValid) {
          return restrictionCheck;
        }
      }
    }

    return { isValid: true };
  }

  /**
   * 重置積木載入失敗計數
   */
  public resetLoadFailures(blockType?: string): void {
    if (blockType) {
      this.loadFailures.delete(blockType);
    } else {
      this.loadFailures.clear();
    }
  }

  /**
   * 獲取積木錯誤統計
   */
  public getErrorStatistics(): {
    loadFailures: Map<string, number>;
    totalErrors: number;
    criticalErrors: number;
    recentErrors: number;
  } {
    const health = this.errorManager.getHealthStatus();
    
    return {
      loadFailures: new Map(this.loadFailures),
      totalErrors: health.totalErrors,
      criticalErrors: health.criticalErrors,
      recentErrors: health.recentErrors,
    };
  }

  /**
   * 設置積木錯誤處理器
   */
  private setupBlockErrorHandlers(): void {
    // 這裡可以設置特定的積木錯誤處理邏輯
    // 例如對特定類型的積木錯誤進行特殊處理
  }

  /**
   * 獲取載入失敗建議
   */
  private getLoadFailureSuggestions(blockType: string, error: Error): string[] {
    const suggestions = ["檢查網路連接", "稍後重試"];
    
    if (error.message.includes("fetch")) {
      suggestions.push("確認伺服器狀態", "檢查防火牆設置");
    }
    
    if (error.message.includes("timeout")) {
      suggestions.push("增加連接超時時間", "檢查網路穩定性");
    }
    
    if (blockType.includes("flex")) {
      suggestions.push("檢查 Flex Message 服務狀態");
    }
    
    return suggestions;
  }

  /**
   * 獲取配置錯誤建議
   */
  private getConfigErrorSuggestions(block: UnifiedBlock, configError: string): string[] {
    const suggestions = ["檢查積木配置參數"];
    
    if (configError.includes("required")) {
      suggestions.push("確保所有必填欄位都已填寫");
    }
    
    if (configError.includes("format")) {
      suggestions.push("檢查數據格式是否正確");
    }
    
    if (configError.includes("validation")) {
      suggestions.push("檢查輸入值是否符合驗證規則");
    }
    
    if (block.category === BlockCategory.FLEX_CONTENT) {
      suggestions.push("參考 Flex Message 文檔", "檢查 Flex 屬性設置");
    }
    
    return suggestions;
  }

  /**
   * 獲取相容性建議
   */
  private getCompatibilitySuggestions(
    block: UnifiedBlock,
    workspace: WorkspaceContext
  ): string[] {
    const suggestions = [];
    
    // 根據積木類別提供建議
    switch (block.category) {
      case BlockCategory.EVENT:
        suggestions.push("事件積木僅可在邏輯編輯器中使用");
        break;
      case BlockCategory.FLEX_CONTENT:
        suggestions.push("Flex 內容積木需要放置在 Flex 容器內");
        break;
      case BlockCategory.FLEX_LAYOUT:
        suggestions.push("Flex 佈局積木僅可在 Flex 設計器中使用");
        break;
      default:
        suggestions.push("檢查積木使用環境是否正確");
    }
    
    // 根據目標工作區提供建議
    if (workspace === WorkspaceContext.LOGIC) {
      suggestions.push("嘗試在邏輯編輯器中使用相應的積木");
    } else if (workspace === WorkspaceContext.FLEX) {
      suggestions.push("嘗試在 Flex 設計器中使用相應的積木");
    }
    
    return suggestions;
  }

  /**
   * 獲取拖拽錯誤建議
   */
  private getDragDropSuggestions(block: UnifiedBlock, reason: string): string[] {
    const suggestions = [];
    
    if (reason.includes("position")) {
      suggestions.push("嘗試放置在其他位置");
    }
    
    if (reason.includes("parent")) {
      suggestions.push("確保放置在正確的父容器中");
    }
    
    if (reason.includes("compatibility")) {
      suggestions.push("檢查積木相容性", "選擇合適的工作區");
    }
    
    if (block.category === BlockCategory.FLEX_CONTENT) {
      suggestions.push("Flex 內容積木需要放置在 Flex 容器內");
    }
    
    return suggestions;
  }

  /**
   * 獲取儲存錯誤建議
   */
  private getSaveErrorSuggestions(error: Error): string[] {
    const suggestions = ["檢查網路連接", "稍後重試"];
    
    if (error.message.includes("permission")) {
      suggestions.push("檢查儲存權限", "確認登入狀態");
    }
    
    if (error.message.includes("quota")) {
      suggestions.push("檢查儲存空間", "清理不必要的數據");
    }
    
    if (error.message.includes("validation")) {
      suggestions.push("檢查積木配置", "確保所有數據有效");
    }
    
    return suggestions;
  }

  /**
   * 檢查積木依賴
   */
  private checkDependencies(block: UnifiedBlock, dependencies: BlockCategory[]): boolean {
    // 這裡應該檢查積木的依賴關係
    // 簡化實現，實際應該根據工作區的積木配置來檢查
    return true;
  }

  /**
   * 檢查積木限制
   */
  private checkRestrictions(
    block: UnifiedBlock,
    restrictions: any,
    workspace: WorkspaceContext
  ): BlockValidationResult {
    // 檢查父積木需求
    if (restrictions.requiresParent && block.isNested && !block.parentId) {
      return {
        isValid: false,
        reason: "此積木需要父積木",
        suggestions: ["將積木放置在適當的父容器中"],
      };
    }
    
    // 檢查禁止組合
    if (restrictions.forbiddenWith) {
      // 簡化實現，實際應該檢查工作區中的其他積木
    }
    
    // 檢查數量限制
    if (restrictions.maxCount) {
      // 簡化實現，實際應該檢查同類型積木的數量
    }
    
    return { isValid: true };
  }
}

export default BlockErrorHandler;