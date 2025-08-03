import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { AlertCircle, CheckCircle, Save, RotateCcw } from "lucide-react";
import { BlockConfigOption } from "./blocks/types";
import { ConfigValidator } from "./utils/configValidation";
import ConfigFormField from "./ConfigFormField";

interface ConfigFormProps {
  /** 配置選項定義陣列 */
  options: BlockConfigOption[];
  /** 當前配置值 */
  values: Record<string, unknown>;
  /** 配置變更回調 */
  onChange: (values: Record<string, unknown>) => void;
  /** 儲存回調 */
  onSave?: (values: Record<string, unknown>) => void;
  /** 重置回調 */
  onReset?: () => void;
  /** 是否為只讀模式 */
  readonly?: boolean;
  /** 是否顯示儲存按鈕 */
  showSaveButton?: boolean;
  /** 是否顯示重置按鈕 */
  showResetButton?: boolean;
  /** 表單標題 */
  title?: string;
  /** 表單描述 */
  description?: string;
  /** 額外的 CSS 類名 */
  className?: string;
}

/**
 * 配置表單組件
 * 
 * 統一的配置表單，支援所有配置類型
 * 提供即時驗證、條件顯示、批量操作
 * 自動分組和排序配置選項
 */
const ConfigForm: React.FC<ConfigFormProps> = ({
  options,
  values,
  onChange,
  onSave,
  onReset,
  readonly = false,
  showSaveButton = true,
  showResetButton = true,
  title = "配置設定",
  description,
  className = "",
}) => {
  const [validationResults, setValidationResults] = useState<Record<string, any>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [initialValues, setInitialValues] = useState<Record<string, unknown>>({});

  /**
   * 初始化
   */
  useEffect(() => {
    setInitialValues({ ...values });
  }, []);

  /**
   * 檢查是否有變更
   */
  useEffect(() => {
    const changed = JSON.stringify(values) !== JSON.stringify(initialValues);
    setHasChanges(changed);
  }, [values, initialValues]);

  /**
   * 即時驗證所有配置
   */
  useEffect(() => {
    const results = ConfigValidator.validateAllConfigs(options, values);
    setValidationResults(results);
  }, [options, values]);

  /**
   * 處理單個欄位值變更
   */
  const handleFieldChange = (optionKey: string, value: unknown) => {
    const newValues = { ...values, [optionKey]: value };
    onChange(newValues);
  };

  /**
   * 處理儲存
   */
  const handleSave = () => {
    if (hasValidationErrors) {
      alert("請修正所有驗證錯誤後再儲存");
      return;
    }
    
    onSave?.(values);
    setInitialValues({ ...values });
  };

  /**
   * 處理重置
   */
  const handleReset = () => {
    if (hasChanges && !confirm("確定要重置所有變更嗎？")) {
      return;
    }
    
    onChange({ ...initialValues });
    onReset?.();
  };

  /**
   * 獲取可見的配置選項
   */
  const getVisibleOptions = (): BlockConfigOption[] => {
    return options.filter(option => {
      const visibilityResult = ConfigValidator.checkConditionalVisibility(option, values);
      return visibilityResult.visible;
    });
  };

  /**
   * 按類別分組配置選項
   */
  const getGroupedOptions = (): Record<string, BlockConfigOption[]> => {
    const visibleOptions = getVisibleOptions();
    const groups: Record<string, BlockConfigOption[]> = {};

    // 按照 option.key 的前綴進行分組，或者使用 'general' 作為預設組
    for (const option of visibleOptions) {
      const groupKey = option.key.includes('.') 
        ? option.key.split('.')[0] 
        : 'general';
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(option);
    }

    return groups;
  };

  /**
   * 獲取組標題
   */
  const getGroupTitle = (groupKey: string): string => {
    const titleMap: Record<string, string> = {
      general: "一般設定",
      basic: "基本設定", 
      advanced: "進階設定",
      appearance: "外觀設定",
      behavior: "行為設定",
      validation: "驗證設定",
      integration: "整合設定",
      security: "安全設定",
      performance: "效能設定",
    };

    return titleMap[groupKey] || groupKey.charAt(0).toUpperCase() + groupKey.slice(1);
  };

  const groupedOptions = getGroupedOptions();
  const hasValidationErrors = ConfigValidator.hasValidationErrors(validationResults);
  const errorMessages = ConfigValidator.getErrorMessages(validationResults);
  const validationCount = Object.keys(validationResults).length;
  const errorCount = errorMessages.length;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 表單頭部 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white/90">{title}</h2>
          
          {/* 狀態指示器 */}
          <div className="flex items-center gap-2">
            {hasChanges && (
              <Badge variant="outline" className="text-amber-400 border-amber-400">
                有變更
              </Badge>
            )}
            
            {validationCount > 0 && (
              <Badge 
                variant={hasValidationErrors ? "destructive" : "outline"}
                className={hasValidationErrors ? "" : "text-green-400 border-green-400"}
              >
                {hasValidationErrors ? (
                  <>
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errorCount} 個錯誤
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    驗證通過
                  </>
                )}
              </Badge>
            )}
          </div>
        </div>
        
        {description && (
          <p className="text-sm text-white/60">{description}</p>
        )}
      </div>

      {/* 錯誤摘要 */}
      {hasValidationErrors && (
        <Card className="bg-red-950/20 border-red-400/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-red-400 text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              驗證錯誤
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm text-red-300">
              {errorMessages.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* 配置欄位 */}
      <div className="space-y-6">
        {Object.entries(groupedOptions).map(([groupKey, groupOptions]) => (
          <Card key={groupKey} className="bg-white/5 border-white/10">
            <CardHeader className="pb-4">
              <CardTitle className="text-white/90 text-base">
                {getGroupTitle(groupKey)}
              </CardTitle>
              <Separator className="bg-white/10" />
            </CardHeader>
            <CardContent className="space-y-4">
              {groupOptions.map((option) => (
                <ConfigFormField
                  key={option.key}
                  option={option}
                  value={values[option.key]}
                  onChange={(value) => handleFieldChange(option.key, value)}
                  readonly={readonly}
                  allValues={values}
                  showValidation={true}
                />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 操作按鈕 */}
      {!readonly && (showSaveButton || showResetButton) && (
        <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
          {showResetButton && (
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={!hasChanges}
              className="border-white/20 text-white/80 hover:bg-white/10"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              重置
            </Button>
          )}
          
          {showSaveButton && (
            <Button
              onClick={handleSave}
              disabled={!hasChanges || hasValidationErrors}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              儲存
            </Button>
          )}
        </div>
      )}

      {/* 偵錯資訊（僅開發模式） */}
      {process.env.NODE_ENV === "development" && (
        <details className="mt-6">
          <summary className="text-xs text-white/40 cursor-pointer">
            偵錯資訊
          </summary>
          <div className="mt-2 p-3 bg-black/20 rounded text-xs font-mono">
            <div className="text-white/60 mb-2">當前配置值:</div>
            <pre className="text-white/80 overflow-auto">
              {JSON.stringify(values, null, 2)}
            </pre>
            <div className="text-white/60 mt-4 mb-2">驗證結果:</div>
            <pre className="text-white/80 overflow-auto">
              {JSON.stringify(validationResults, null, 2)}
            </pre>
          </div>
        </details>
      )}
    </div>
  );
};

export default ConfigForm;