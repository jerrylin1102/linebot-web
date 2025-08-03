/**
 * 積木定義類型系統
 * 用於統一管理所有積木的配置和結構
 */

import { BlockCategory, WorkspaceContext } from "../../../types/block";
import { LucideIcon } from "lucide-react";

/**
 * 積木基礎數據類型
 */
export interface BlockData {
  [key: string]: unknown;
}

/**
 * 積木定義配置
 */
export interface BlockDefinition {
  /** 積木唯一識別符 */
  id: string;

  /** 積木類型（向後相容） */
  blockType: string;

  /** 積木類別 */
  category: BlockCategory;

  /** 顯示名稱 */
  displayName: string;

  /** 積木描述 */
  description?: string;

  /** 積木圖示 */
  icon: LucideIcon;

  /** 積木顏色 */
  color: string;

  /** 相容的工作區上下文 */
  compatibility: WorkspaceContext[];

  /** 預設積木數據 */
  defaultData: BlockData;

  /** 積木標籤（用於搜尋和分類） */
  tags?: string[];

  /** 是否為實驗性功能 */
  experimental?: boolean;

  /** 積木版本 */
  version?: string;

  /** 使用建議和說明 */
  usageHints?: string[];

  /** 積木配置選項 */
  configOptions?: BlockConfigOption[];

  /** 積木驗證配置 */
  validation?: {
    required?: string[];
    rules?: Array<{
      field: string;
      type: "enum" | "pattern" | "range" | "custom";
      values?: unknown[];
      pattern?: RegExp;
      min?: number;
      max?: number;
      message: string;
      validator?: (value: unknown) => boolean;
    }>;
  };

  /** 積木依賴關係 */
  dependencies?: string[];

  /** 是否為可選積木（載入失敗時不影響系統運行） */
  optional?: boolean;

  /** 積木優先級（影響載入順序） */
  priority?: number;
}

/**
 * 積木配置選項
 */
export interface BlockConfigOption {
  /** 選項鍵名 */
  key: string;

  /** 選項標籤 */
  label: string;

  /** 選項類型 */
  type: "text" | "number" | "boolean" | "select" | "textarea";

  /** 預設值 */
  defaultValue?: unknown;

  /** 選項說明 */
  description?: string;

  /** 選擇選項（當 type 為 select 時） */
  options?: Array<{ label: string; value: unknown }>;

  /** 是否必填 */
  required?: boolean;

  /** 驗證規則 */
  validation?: {
    min?: number;
    max?: number;
    pattern?: string | RegExp;
    message?: string;
  };
}

/**
 * 積木類別配置
 */
export interface BlockCategoryConfig {
  /** 類別識別符 */
  category: BlockCategory;

  /** 類別顯示名稱 */
  displayName: string;

  /** 類別圖示 */
  icon: LucideIcon;

  /** 類別描述 */
  description?: string;

  /** 類別排序優先級 */
  order: number;

  /** 是否在特定上下文中顯示 */
  showInContext: WorkspaceContext[];
}

/**
 * 積木註冊項目
 */
export interface BlockRegistryItem {
  /** 積木定義 */
  definition: BlockDefinition;

  /** 註冊時間 */
  registeredAt: Date;

  /** 積木來源模組路徑 */
  modulePath?: string;

  /** 是否啟用 */
  enabled: boolean;
}

/**
 * 積木過濾選項
 */
export interface BlockFilterOptions {
  /** 按類別過濾 */
  categories?: BlockCategory[];

  /** 按相容性過濾 */
  compatibility?: WorkspaceContext;

  /** 按標籤過濾 */
  tags?: string[];

  /** 搜尋關鍵字 */
  searchQuery?: string;

  /** 是否顯示實驗性積木 */
  showExperimental?: boolean;

  /** 是否僅顯示啟用的積木 */
  enabledOnly?: boolean;
}

/**
 * 積木載入狀態
 */
export interface BlockLoadState {
  /** 是否正在載入 */
  loading: boolean;

  /** 載入錯誤 */
  error?: string;

  /** 已載入的積木數量 */
  loadedCount: number;

  /** 總積木數量 */
  totalCount: number;

  /** 載入進度 (0-100) */
  progress: number;
}

/**
 * 積木驗證結果
 */
export interface BlockValidationResult {
  /** 是否有效 */
  valid: boolean;

  /** 錯誤訊息 */
  errors: string[];

  /** 警告訊息 */
  warnings: string[];

  /** 建議 */
  suggestions: string[];
}

/**
 * 積木匯出格式
 */
export interface BlockExportData {
  /** 積木定義 */
  definition: BlockDefinition;

  /** 匯出時間 */
  exportedAt: string;

  /** 匯出版本 */
  version: string;

  /** 相依性 */
  dependencies?: string[];
}
