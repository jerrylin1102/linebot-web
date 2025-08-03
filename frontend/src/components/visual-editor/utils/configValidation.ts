import { BlockConfigOption } from "../blocks/types";

/**
 * 配置驗證結果
 */
export interface ValidationResult {
  /** 是否有效 */
  valid: boolean;
  /** 錯誤訊息 */
  error?: string;
  /** 警告訊息 */
  warning?: string;
}

/**
 * 條件顯示結果
 */
export interface ConditionalVisibilityResult {
  /** 是否顯示 */
  visible: boolean;
  /** 不顯示的原因 */
  reason?: string;
}

/**
 * 配置驗證工具類
 */
export class ConfigValidator {
  /**
   * 驗證單個配置值
   */
  static validateValue(option: BlockConfigOption, value: unknown): ValidationResult {
    // 必填檢查
    if (option.required && this.isEmpty(value)) {
      return {
        valid: false,
        error: `${option.label}為必填欄位`,
      };
    }

    // 如果值為空且非必填，則跳過後續驗證
    if (this.isEmpty(value)) {
      return { valid: true };
    }

    // 類型特定驗證
    switch (option.type) {
      case "text":
      case "textarea":
        return this.validateText(option, value as string);
      
      case "number":
        return this.validateNumber(option, value as number);
      
      case "boolean":
        return this.validateBoolean(option, value as boolean);
      
      case "select":
        return this.validateSelect(option, value);
      
      case "multi-select":
        return this.validateMultiSelect(option, value as string[]);
      
      case "file-upload":
      case "drag-drop-zone":
        return this.validateFile(option, value);
      
      case "slider":
        return this.validateSlider(option, value as number);
      
      case "array-editor":
        return this.validateArray(option, value as unknown[]);
      
      case "button":
        return this.validateButton(option, value);
      
      default:
        return { valid: true };
    }
  }

  /**
   * 檢查值是否為空
   */
  private static isEmpty(value: unknown): boolean {
    if (value === undefined || value === null) return true;
    if (typeof value === "string" && value.trim() === "") return true;
    if (Array.isArray(value) && value.length === 0) return true;
    return false;
  }

  /**
   * 驗證文字欄位
   */
  private static validateText(option: BlockConfigOption, value: string): ValidationResult {
    if (!option.validation) return { valid: true };

    const validation = option.validation;
    
    // 長度檢查
    if (validation.min !== undefined && value.length < validation.min) {
      return {
        valid: false,
        error: `${option.label}長度不能少於 ${validation.min} 個字元`,
      };
    }
    
    if (validation.max !== undefined && value.length > validation.max) {
      return {
        valid: false,
        error: `${option.label}長度不能超過 ${validation.max} 個字元`,
      };
    }

    // 正則表達式檢查
    if (validation.pattern) {
      const pattern = typeof validation.pattern === "string" 
        ? new RegExp(validation.pattern) 
        : validation.pattern;
      
      if (!pattern.test(value)) {
        return {
          valid: false,
          error: validation.message || `${option.label}格式不正確`,
        };
      }
    }

    return { valid: true };
  }

  /**
   * 驗證數字欄位
   */
  private static validateNumber(option: BlockConfigOption, value: number): ValidationResult {
    if (typeof value !== "number" || isNaN(value)) {
      return {
        valid: false,
        error: `${option.label}必須是有效的數字`,
      };
    }

    if (!option.validation) return { valid: true };

    const validation = option.validation;
    
    if (validation.min !== undefined && value < validation.min) {
      return {
        valid: false,
        error: `${option.label}不能小於 ${validation.min}`,
      };
    }
    
    if (validation.max !== undefined && value > validation.max) {
      return {
        valid: false,
        error: `${option.label}不能大於 ${validation.max}`,
      };
    }

    return { valid: true };
  }

  /**
   * 驗證布林欄位
   */
  private static validateBoolean(option: BlockConfigOption, value: boolean): ValidationResult {
    if (typeof value !== "boolean") {
      return {
        valid: false,
        error: `${option.label}必須是布林值`,
      };
    }
    return { valid: true };
  }

  /**
   * 驗證單選欄位
   */
  private static validateSelect(option: BlockConfigOption, value: unknown): ValidationResult {
    if (!option.options) return { valid: true };

    const validValues = option.options.map(opt => opt.value);
    if (!validValues.includes(value)) {
      return {
        valid: false,
        error: `${option.label}的值不在允許的選項中`,
      };
    }

    return { valid: true };
  }

  /**
   * 驗證多選欄位
   */
  private static validateMultiSelect(option: BlockConfigOption, value: string[]): ValidationResult {
    if (!Array.isArray(value)) {
      return {
        valid: false,
        error: `${option.label}必須是陣列`,
      };
    }

    const multiSelectConfig = option.multiSelect;
    if (multiSelectConfig?.maxSelections && value.length > multiSelectConfig.maxSelections) {
      return {
        valid: false,
        error: `${option.label}最多只能選擇 ${multiSelectConfig.maxSelections} 項`,
      };
    }

    // 檢查選項是否有效
    if (option.options) {
      const validValues = option.options.map(opt => String(opt.value));
      const invalidValues = value.filter(v => !validValues.includes(v));
      
      if (invalidValues.length > 0) {
        return {
          valid: false,
          error: `${option.label}包含無效的選項: ${invalidValues.join(", ")}`,
        };
      }
    }

    return { valid: true };
  }

  /**
   * 驗證檔案欄位
   */
  private static validateFile(option: BlockConfigOption, value: unknown): ValidationResult {
    // 檔案驗證通常在上傳時進行，這裡主要檢查格式
    if (value && typeof value !== "string" && !Array.isArray(value)) {
      return {
        valid: false,
        error: `${option.label}必須是字串或字串陣列`,
      };
    }

    return { valid: true };
  }

  /**
   * 驗證滑桿欄位
   */
  private static validateSlider(option: BlockConfigOption, value: number): ValidationResult {
    if (typeof value !== "number" || isNaN(value)) {
      return {
        valid: false,
        error: `${option.label}必須是有效的數字`,
      };
    }

    const sliderConfig = option.slider;
    if (!sliderConfig) return { valid: true };

    if (value < sliderConfig.min) {
      return {
        valid: false,
        error: `${option.label}不能小於 ${sliderConfig.min}`,
      };
    }

    if (value > sliderConfig.max) {
      return {
        valid: false,
        error: `${option.label}不能大於 ${sliderConfig.max}`,
      };
    }

    // 檢查步進值
    if (sliderConfig.step) {
      const remainder = (value - sliderConfig.min) % sliderConfig.step;
      if (Math.abs(remainder) > 0.0001) { // 允許浮點數精度誤差
        return {
          valid: false,
          error: `${option.label}必須是 ${sliderConfig.step} 的倍數`,
        };
      }
    }

    return { valid: true };
  }

  /**
   * 驗證陣列欄位
   */
  private static validateArray(option: BlockConfigOption, value: unknown[]): ValidationResult {
    if (!Array.isArray(value)) {
      return {
        valid: false,
        error: `${option.label}必須是陣列`,
      };
    }

    const arrayConfig = option.arrayEditor;
    if (!arrayConfig) return { valid: true };

    // 檢查數量限制
    if (arrayConfig.minItems && value.length < arrayConfig.minItems) {
      return {
        valid: false,
        error: `${option.label}至少需要 ${arrayConfig.minItems} 個項目`,
      };
    }

    if (arrayConfig.maxItems && value.length > arrayConfig.maxItems) {
      return {
        valid: false,
        error: `${option.label}最多只能有 ${arrayConfig.maxItems} 個項目`,
      };
    }

    // 檢查項目類型
    for (let i = 0; i < value.length; i++) {
      const item = value[i];
      const itemValid = this.validateArrayItem(arrayConfig.itemType, item, arrayConfig.itemTemplate);
      
      if (!itemValid.valid) {
        return {
          valid: false,
          error: `${option.label}第 ${i + 1} 項: ${itemValid.error}`,
        };
      }
    }

    return { valid: true };
  }

  /**
   * 驗證陣列項目
   */
  private static validateArrayItem(
    itemType: string, 
    item: unknown, 
    itemTemplate?: BlockConfigOption[]
  ): ValidationResult {
    switch (itemType) {
      case "text":
        if (typeof item !== "string") {
          return { valid: false, error: "必須是文字" };
        }
        break;
        
      case "number":
        if (typeof item !== "number" || isNaN(item)) {
          return { valid: false, error: "必須是數字" };
        }
        break;
        
      case "boolean":
        if (typeof item !== "boolean") {
          return { valid: false, error: "必須是布林值" };
        }
        break;
        
      case "object":
        if (typeof item !== "object" || item === null || Array.isArray(item)) {
          return { valid: false, error: "必須是物件" };
        }
        
        // 如果有模板，驗證物件屬性
        if (itemTemplate) {
          const objItem = item as Record<string, unknown>;
          for (const field of itemTemplate) {
            const fieldValue = objItem[field.key];
            const fieldValid = this.validateValue(field, fieldValue);
            
            if (!fieldValid.valid) {
              return { valid: false, error: fieldValid.error };
            }
          }
        }
        break;
    }

    return { valid: true };
  }

  /**
   * 驗證按鈕欄位
   */
  private static validateButton(option: BlockConfigOption, value: unknown): ValidationResult {
    // 按鈕欄位通常不需要特殊驗證
    return { valid: true };
  }

  /**
   * 檢查條件顯示邏輯
   */
  static checkConditionalVisibility(
    option: BlockConfigOption,
    allValues: Record<string, unknown>
  ): ConditionalVisibilityResult {
    if (!option.conditionalLogic) {
      return { visible: true };
    }

    const { dependsOn, condition, value: conditionValue } = option.conditionalLogic;
    const dependentValue = allValues[dependsOn];

    let conditionMet = false;

    switch (condition) {
      case "equals":
        conditionMet = dependentValue === conditionValue;
        break;
        
      case "not-equals":
        conditionMet = dependentValue !== conditionValue;
        break;
        
      case "includes":
        if (Array.isArray(dependentValue)) {
          conditionMet = dependentValue.includes(conditionValue);
        } else if (typeof dependentValue === "string") {
          conditionMet = dependentValue.includes(String(conditionValue));
        }
        break;
        
      case "not-includes":
        if (Array.isArray(dependentValue)) {
          conditionMet = !dependentValue.includes(conditionValue);
        } else if (typeof dependentValue === "string") {
          conditionMet = !dependentValue.includes(String(conditionValue));
        }
        break;
        
      case "greater-than":
        if (typeof dependentValue === "number" && typeof conditionValue === "number") {
          conditionMet = dependentValue > conditionValue;
        }
        break;
        
      case "less-than":
        if (typeof dependentValue === "number" && typeof conditionValue === "number") {
          conditionMet = dependentValue < conditionValue;
        }
        break;
    }

    return {
      visible: conditionMet,
      reason: conditionMet ? undefined : `條件不滿足: ${dependsOn} ${condition} ${conditionValue}`,
    };
  }

  /**
   * 批量驗證所有配置
   */
  static validateAllConfigs(
    options: BlockConfigOption[],
    values: Record<string, unknown>
  ): Record<string, ValidationResult> {
    const results: Record<string, ValidationResult> = {};

    for (const option of options) {
      // 先檢查條件顯示
      const visibility = this.checkConditionalVisibility(option, values);
      
      if (visibility.visible) {
        // 只有可見的欄位才需要驗證
        results[option.key] = this.validateValue(option, values[option.key]);
      }
    }

    return results;
  }

  /**
   * 檢查是否有任何驗證錯誤
   */
  static hasValidationErrors(validationResults: Record<string, ValidationResult>): boolean {
    return Object.values(validationResults).some(result => !result.valid);
  }

  /**
   * 獲取所有錯誤訊息
   */
  static getErrorMessages(validationResults: Record<string, ValidationResult>): string[] {
    return Object.values(validationResults)
      .filter(result => !result.valid && result.error)
      .map(result => result.error!);
  }
}