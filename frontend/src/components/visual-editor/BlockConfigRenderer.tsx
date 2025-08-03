import React from "react";
import { BlockConfigOption } from "./blocks/types";
import ConfigFormField from "./ConfigFormField";

interface BlockConfigRendererProps {
  /** 積木配置選項陣列 */
  configOptions: BlockConfigOption[];
  /** 當前積木數據 */
  blockData: Record<string, unknown>;
  /** 數據更新回調 */
  onDataChange: (key: string, value: unknown) => void;
  /** 是否為只讀模式 */
  readonly?: boolean;
  /** 額外的 CSS 類名 */
  className?: string;
}

/**
 * 積木配置渲染器組件
 * 
 * 動態渲染 BlockConfigOption[] 陣列為表單控件
 * 支援多種配置類型：text, number, boolean, select, textarea
 * 處理配置值的讀取和更新，並提供驗證功能
 */
const BlockConfigRenderer: React.FC<BlockConfigRendererProps> = ({
  configOptions,
  blockData,
  onDataChange,
  readonly = false,
  className = "",
}) => {
  // 如果沒有配置選項，顯示提示訊息
  if (!configOptions || configOptions.length === 0) {
    return (
      <div className={`text-sm text-white/60 italic ${className}`}>
        此積木沒有可配置的選項
      </div>
    );
  }

  /**
   * 處理欄位值變更
   */
  const handleFieldChange = (key: string, value: unknown) => {
    if (!readonly) {
      onDataChange(key, value);
    }
  };

  /**
   * 獲取欄位當前值
   */
  const getFieldValue = (option: BlockConfigOption): unknown => {
    const value = blockData[option.key];
    // 如果沒有值，使用預設值
    return value !== undefined ? value : option.defaultValue;
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {configOptions.map((option) => (
        <ConfigFormField
          key={option.key}
          option={option}
          value={getFieldValue(option)}
          onChange={(value) => handleFieldChange(option.key, value)}
          readonly={readonly}
        />
      ))}
    </div>
  );
};

export default BlockConfigRenderer;