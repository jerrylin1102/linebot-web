import React, { useState, useEffect } from "react";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import { BlockConfigOption } from "./blocks/types";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { ConfigValidator } from "./utils/configValidation";
import ArrayEditor from "./config-fields/ArrayEditor";
import FileUploader from "./config-fields/FileUploader";
import DragDropZone from "./config-fields/DragDropZone";
import MultiSelect from "./config-fields/MultiSelect";
import ConfigButton from "./config-fields/ConfigButton";
import ConfigSlider from "./config-fields/ConfigSlider";

interface ConfigFormFieldProps {
  /** 配置選項定義 */
  option: BlockConfigOption;
  /** 當前值 */
  value: unknown;
  /** 值變更回調 */
  onChange: (value: unknown) => void;
  /** 是否為只讀模式 */
  readonly?: boolean;
  /** 額外的 CSS 類名 */
  className?: string;
  /** 所有配置值（用於條件顯示邏輯） */
  allValues?: Record<string, unknown>;
  /** 是否顯示驗證錯誤 */
  showValidation?: boolean;
}

/**
 * 配置表單欄位組件
 * 
 * 根據 BlockConfigOption 定義渲染對應的表單控件
 * 支援驗證規則和錯誤顯示
 * 提供統一的欄位樣式和布局
 */
const ConfigFormField: React.FC<ConfigFormFieldProps> = ({
  option,
  value,
  onChange,
  readonly = false,
  className = "",
  allValues = {},
  showValidation = true,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [visibilityReason, setVisibilityReason] = useState<string | undefined>();

  /**
   * 使用新的驗證系統
   */
  const validateValue = (val: unknown): string | null => {
    const result = ConfigValidator.validateValue(option, val);
    return result.valid ? null : result.error || null;
  };

  /**
   * 處理值變更
   */
  const handleValueChange = (newValue: unknown) => {
    setTouched(true);
    
    // 類型轉換
    let processedValue = newValue;
    if (option.type === "number" && typeof newValue === "string") {
      const numValue = parseFloat(newValue);
      processedValue = isNaN(numValue) ? 0 : numValue;
    }
    
    // 驗證
    const validationError = validateValue(processedValue);
    setError(validationError);
    
    // 通知父組件
    onChange(processedValue);
  };

  /**
   * 處理失焦事件
   */
  const handleBlur = () => {
    setTouched(true);
    const validationError = validateValue(value);
    setError(validationError);
  };

  // 檢查條件顯示邏輯
  useEffect(() => {
    const visibilityResult = ConfigValidator.checkConditionalVisibility(option, allValues);
    setIsVisible(visibilityResult.visible);
    setVisibilityReason(visibilityResult.reason);
  }, [option, allValues]);

  // 在值變更時重新驗證
  useEffect(() => {
    if (touched && showValidation) {
      const validationError = validateValue(value);
      setError(validationError);
    }
  }, [value, touched, option, showValidation]);

  /**
   * 渲染欄位標籤
   */
  const renderLabel = () => (
    <Label htmlFor={option.key} className="text-sm font-medium text-white/90">
      {option.label}
      {option.required && <span className="text-red-400 ml-1">*</span>}
      {option.description && (
        <span className="block text-xs text-white/60 mt-1 font-normal">
          {option.description}
        </span>
      )}
    </Label>
  );

  /**
   * 渲染錯誤訊息
   */
  const renderError = () => {
    if (!error || !touched) return null;
    
    return (
      <div className="flex items-center gap-1 text-xs text-red-400 mt-1">
        <AlertCircle className="h-3 w-3" />
        {error}
      </div>
    );
  };

  /**
   * 渲染輸入控件
   */
  const renderInput = () => {
    const commonProps = {
      id: option.key,
      disabled: readonly,
      onBlur: handleBlur,
    };

    switch (option.type) {
      case "text":
        return (
          <Input
            {...commonProps}
            type="text"
            value={String(value || "")}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder={option.description}
            className="text-black"
          />
        );

      case "number":
        return (
          <Input
            {...commonProps}
            type="number"
            value={String(value || "")}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder={option.description}
            min={option.validation?.min}
            max={option.validation?.max}
            className="text-black"
          />
        );

      case "textarea":
        return (
          <Textarea
            {...commonProps}
            value={String(value || "")}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder={option.description}
            rows={3}
            className="text-black resize-none"
          />
        );

      case "boolean":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              {...commonProps}
              checked={Boolean(value)}
              onCheckedChange={(checked) => handleValueChange(checked)}
            />
            <Label htmlFor={option.key} className="text-sm text-white/90">
              {option.description || "啟用此選項"}
            </Label>
          </div>
        );

      case "select":
        return (
          <Select
            value={String(value || "")}
            onValueChange={handleValueChange}
            disabled={readonly}
          >
            <SelectTrigger className="text-black">
              <SelectValue placeholder={option.description || "請選擇"} />
            </SelectTrigger>
            <SelectContent>
              {option.options?.map((selectOption) => (
                <SelectItem 
                  key={String(selectOption.value)} 
                  value={String(selectOption.value)}
                >
                  {selectOption.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "multi-select":
        return (
          <MultiSelect
            option={option}
            value={value as string[]}
            onChange={handleValueChange}
            readonly={readonly}
          />
        );

      case "file-upload":
        return (
          <FileUploader
            option={option}
            value={value as string | string[]}
            onChange={handleValueChange}
            readonly={readonly}
          />
        );

      case "drag-drop-zone":
        return (
          <DragDropZone
            option={option}
            value={value as string | string[]}
            onChange={handleValueChange}
            readonly={readonly}
          />
        );

      case "slider":
        return (
          <ConfigSlider
            option={option}
            value={value as number}
            onChange={handleValueChange}
            readonly={readonly}
          />
        );

      case "button":
        return (
          <ConfigButton
            option={option}
            value={value}
            onChange={handleValueChange}
            readonly={readonly}
          />
        );

      case "array-editor":
        return (
          <ArrayEditor
            option={option}
            value={value as unknown[]}
            onChange={handleValueChange}
            readonly={readonly}
          />
        );

      default:
        return (
          <div className="text-sm text-white/60 italic">
            不支援的欄位類型: {option.type}
          </div>
        );
    }
  };

  // 如果不可見，則不渲染
  if (!isVisible) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {renderLabel()}
      {renderInput()}
      {renderError()}
      
      {/* 條件顯示除錯訊息（僅開發模式） */}
      {process.env.NODE_ENV === "development" && visibilityReason && (
        <div className="flex items-center gap-1 text-xs text-yellow-400 mt-1">
          <EyeOff className="h-3 w-3" />
          隱藏原因: {visibilityReason}
        </div>
      )}
    </div>
  );
};

export default ConfigFormField;