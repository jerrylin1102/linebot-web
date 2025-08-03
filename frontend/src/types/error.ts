/**
 * 統一錯誤處理系統類型定義
 * 支援分層錯誤處理和自動恢復機制
 */

// 錯誤嚴重程度等級
export enum ErrorSeverity {
  LOW = "low",           // 輕微錯誤，不影響核心功能
  MEDIUM = "medium",     // 中等錯誤，部分功能受影響
  HIGH = "high",         // 嚴重錯誤，重要功能無法使用
  CRITICAL = "critical", // 致命錯誤，系統無法正常運行
}

// 錯誤類別分類
export enum ErrorCategory {
  NETWORK = "network",           // 網路連接錯誤
  API = "api",                   // API 調用錯誤
  VALIDATION = "validation",     // 數據驗證錯誤
  AUTHENTICATION = "auth",       // 認證授權錯誤
  PERMISSION = "permission",     // 權限錯誤
  BLOCK_LOADING = "block_loading", // 積木載入錯誤
  BLOCK_CONFIG = "block_config", // 積木配置錯誤
  BLOCK_OPERATION = "block_operation", // 積木操作錯誤
  PREVIEW = "preview",           // 預覽錯誤
  CODE_GENERATION = "code_gen",  // 代碼生成錯誤
  FILE_SYSTEM = "file_system",   // 文件系統錯誤
  UI_RENDER = "ui_render",       // UI 渲染錯誤
  UNEXPECTED = "unexpected",     // 未預期錯誤
}

// 錯誤恢復策略
export enum RecoveryStrategy {
  NONE = "none",                 // 無恢復策略
  RETRY = "retry",               // 重試操作
  FALLBACK = "fallback",         // 降級處理
  RELOAD = "reload",             // 重新載入
  REDIRECT = "redirect",         // 重定向
  REFRESH = "refresh",           // 刷新頁面
  RESET = "reset",               // 重置狀態
  MANUAL = "manual",             // 需要手動處理
}

// 錯誤上下文信息
export interface ErrorContext {
  component?: string;            // 發生錯誤的組件
  action?: string;               // 觸發錯誤的動作
  blockType?: string;            // 相關積木類型
  userId?: string;               // 用戶 ID
  sessionId?: string;            // 會話 ID
  timestamp: number;             // 錯誤發生時間
  url?: string;                  // 當前頁面 URL
  userAgent?: string;            // 用戶代理信息
  additional?: Record<string, unknown>; // 額外上下文信息
}

// 統一錯誤介面
export interface UnifiedError {
  id: string;                    // 錯誤唯一標識
  code: string;                  // 錯誤代碼
  message: string;               // 用戶友善的錯誤訊息
  severity: ErrorSeverity;       // 錯誤嚴重程度
  category: ErrorCategory;       // 錯誤類別
  context: ErrorContext;         // 錯誤上下文
  originalError?: Error;         // 原始錯誤對象
  stack?: string;                // 錯誤堆疊
  recovery?: RecoveryStrategy;   // 推薦的恢復策略
  suggestions?: string[];        // 用戶建議
  isRetryable?: boolean;         // 是否可重試
  retryCount?: number;           // 已重試次數
  maxRetries?: number;           // 最大重試次數
}

// 錯誤處理器介面
export interface ErrorHandler {
  canHandle(error: UnifiedError): boolean;
  handle(error: UnifiedError): Promise<ErrorHandleResult>;
  priority: number; // 處理器優先級
}

// 錯誤處理結果
export interface ErrorHandleResult {
  success: boolean;              // 是否處理成功
  recovery?: RecoveryStrategy;   // 執行的恢復策略
  message?: string;              // 處理結果訊息
  shouldNotify?: boolean;        // 是否需要通知用戶
  shouldLog?: boolean;           // 是否需要記錄日誌
  nextAction?: () => void;       // 後續操作
}

// 錯誤邊界狀態
export interface ErrorBoundaryState {
  hasError: boolean;
  error?: UnifiedError;
  errorInfo?: React.ErrorInfo;
  isRecovering?: boolean;
  recoveryAttempts?: number;
}

// 錯誤通知配置
export interface ErrorNotificationConfig {
  severity: ErrorSeverity;
  category: ErrorCategory;
  showToUser: boolean;
  autoHide: boolean;
  duration?: number;
  actions?: ErrorNotificationAction[];
}

// 錯誤通知動作
export interface ErrorNotificationAction {
  label: string;
  action: () => void | Promise<void>;
  style?: "primary" | "secondary" | "danger";
}

// 錯誤監控配置
export interface ErrorMonitoringConfig {
  enableRemoteLogging: boolean;
  enableLocalStorage: boolean;
  enableConsoleLogging: boolean;
  maxLogEntries: number;
  logLevel: ErrorSeverity;
  sensitiveDataFilter: (data: unknown) => unknown;
}

// 錯誤重試配置
export interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  backoffMultiplier: number;
  retryCondition: (error: UnifiedError) => boolean;
}

// 預定義錯誤代碼
export const ERROR_CODES = {
  // 網路錯誤
  NETWORK_TIMEOUT: "NETWORK_TIMEOUT",
  NETWORK_OFFLINE: "NETWORK_OFFLINE",
  NETWORK_CONNECTION_FAILED: "NETWORK_CONNECTION_FAILED",
  
  // API 錯誤
  API_UNAUTHORIZED: "API_UNAUTHORIZED",
  API_FORBIDDEN: "API_FORBIDDEN",
  API_NOT_FOUND: "API_NOT_FOUND",
  API_SERVER_ERROR: "API_SERVER_ERROR",
  API_RATE_LIMITED: "API_RATE_LIMITED",
  
  // 積木相關錯誤
  BLOCK_LOAD_FAILED: "BLOCK_LOAD_FAILED",
  BLOCK_INVALID_CONFIG: "BLOCK_INVALID_CONFIG",
  BLOCK_COMPATIBILITY_ERROR: "BLOCK_COMPATIBILITY_ERROR",
  BLOCK_DROP_INVALID: "BLOCK_DROP_INVALID",
  BLOCK_SAVE_FAILED: "BLOCK_SAVE_FAILED",
  
  // 預覽錯誤
  PREVIEW_RENDER_FAILED: "PREVIEW_RENDER_FAILED",
  PREVIEW_DATA_INVALID: "PREVIEW_DATA_INVALID",
  
  // 代碼生成錯誤
  CODE_GEN_FAILED: "CODE_GEN_FAILED",
  CODE_GEN_INVALID_TEMPLATE: "CODE_GEN_INVALID_TEMPLATE",
  
  // 認證錯誤
  AUTH_TOKEN_EXPIRED: "AUTH_TOKEN_EXPIRED",
  AUTH_INVALID_CREDENTIALS: "AUTH_INVALID_CREDENTIALS",
  
  // 通用錯誤
  UNEXPECTED_ERROR: "UNEXPECTED_ERROR",
  VALIDATION_FAILED: "VALIDATION_FAILED",
} as const;

// 錯誤訊息對應表
export const ERROR_MESSAGES = {
  [ERROR_CODES.NETWORK_TIMEOUT]: "網路連接超時，請檢查網路連接後重試",
  [ERROR_CODES.NETWORK_OFFLINE]: "目前無網路連接，請檢查網路設定",
  [ERROR_CODES.NETWORK_CONNECTION_FAILED]: "無法連接到伺服器，請稍後再試",
  
  [ERROR_CODES.API_UNAUTHORIZED]: "登入已過期，請重新登入",
  [ERROR_CODES.API_FORBIDDEN]: "您沒有權限執行此操作",
  [ERROR_CODES.API_NOT_FOUND]: "請求的資源不存在",
  [ERROR_CODES.API_SERVER_ERROR]: "伺服器發生錯誤，請稍後再試",
  [ERROR_CODES.API_RATE_LIMITED]: "請求過於頻繁，請稍後再試",
  
  [ERROR_CODES.BLOCK_LOAD_FAILED]: "積木載入失敗，請檢查網路連接",
  [ERROR_CODES.BLOCK_INVALID_CONFIG]: "積木配置無效，請檢查設定參數",
  [ERROR_CODES.BLOCK_COMPATIBILITY_ERROR]: "積木不相容，無法在此位置使用",
  [ERROR_CODES.BLOCK_DROP_INVALID]: "無法在此位置放置積木",
  [ERROR_CODES.BLOCK_SAVE_FAILED]: "積木儲存失敗，請重試",
  
  [ERROR_CODES.PREVIEW_RENDER_FAILED]: "預覽渲染失敗，請檢查積木配置",
  [ERROR_CODES.PREVIEW_DATA_INVALID]: "預覽數據無效，請檢查輸入內容",
  
  [ERROR_CODES.CODE_GEN_FAILED]: "代碼生成失敗，請檢查積木配置",
  [ERROR_CODES.CODE_GEN_INVALID_TEMPLATE]: "無效的代碼模板",
  
  [ERROR_CODES.AUTH_TOKEN_EXPIRED]: "登入憑證已過期，請重新登入",
  [ERROR_CODES.AUTH_INVALID_CREDENTIALS]: "登入憑證無效",
  
  [ERROR_CODES.UNEXPECTED_ERROR]: "發生未預期的錯誤",
  [ERROR_CODES.VALIDATION_FAILED]: "數據驗證失敗",
} as const;

// 預定義恢復策略對應表
export const RECOVERY_STRATEGIES = {
  [ERROR_CODES.NETWORK_TIMEOUT]: RecoveryStrategy.RETRY,
  [ERROR_CODES.NETWORK_OFFLINE]: RecoveryStrategy.MANUAL,
  [ERROR_CODES.NETWORK_CONNECTION_FAILED]: RecoveryStrategy.RETRY,
  
  [ERROR_CODES.API_UNAUTHORIZED]: RecoveryStrategy.REDIRECT,
  [ERROR_CODES.API_FORBIDDEN]: RecoveryStrategy.NONE,
  [ERROR_CODES.API_NOT_FOUND]: RecoveryStrategy.FALLBACK,
  [ERROR_CODES.API_SERVER_ERROR]: RecoveryStrategy.RETRY,
  [ERROR_CODES.API_RATE_LIMITED]: RecoveryStrategy.RETRY,
  
  [ERROR_CODES.BLOCK_LOAD_FAILED]: RecoveryStrategy.RETRY,
  [ERROR_CODES.BLOCK_INVALID_CONFIG]: RecoveryStrategy.RESET,
  [ERROR_CODES.BLOCK_COMPATIBILITY_ERROR]: RecoveryStrategy.FALLBACK,
  [ERROR_CODES.BLOCK_DROP_INVALID]: RecoveryStrategy.NONE,
  [ERROR_CODES.BLOCK_SAVE_FAILED]: RecoveryStrategy.RETRY,
  
  [ERROR_CODES.PREVIEW_RENDER_FAILED]: RecoveryStrategy.FALLBACK,
  [ERROR_CODES.PREVIEW_DATA_INVALID]: RecoveryStrategy.RESET,
  
  [ERROR_CODES.CODE_GEN_FAILED]: RecoveryStrategy.RETRY,
  [ERROR_CODES.CODE_GEN_INVALID_TEMPLATE]: RecoveryStrategy.FALLBACK,
  
  [ERROR_CODES.AUTH_TOKEN_EXPIRED]: RecoveryStrategy.REDIRECT,
  [ERROR_CODES.AUTH_INVALID_CREDENTIALS]: RecoveryStrategy.REDIRECT,
  
  [ERROR_CODES.UNEXPECTED_ERROR]: RecoveryStrategy.REFRESH,
  [ERROR_CODES.VALIDATION_FAILED]: RecoveryStrategy.NONE,
} as const;