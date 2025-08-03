/**
 * Flex Message 屬性驗證工具
 * 確保所有屬性符合 LINE Messaging API 規範
 */

import { 
  FlexSize, FlexWeight, FlexAlign, FlexGravity, FlexSpacing,
  BoxAdvancedProperties, TextAdvancedProperties, 
  ButtonAdvancedProperties, ImageAdvancedProperties
} from '../types/flexProperties';

// ============ 驗證結果介面 ============
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface PropertyValidationResult {
  property: string;
  isValid: boolean;
  message?: string;
  severity: "error" | "warning" | "info";
}

// ============ LINE 規範常數 ============
export const LINE_FLEX_LIMITS = {
  // 文字長度限制
  MAX_TEXT_LENGTH: 2000,
  MAX_ALT_TEXT_LENGTH: 400,
  MAX_BUTTON_LABEL_LENGTH: 40,
  
  // 組件數量限制
  MAX_CAROUSEL_BUBBLES: 10,
  MAX_BOX_CONTENTS: 50,
  MAX_BUBBLE_SIZE_KB: 24,
  
  // URL 限制
  MAX_URL_LENGTH: 1000,
  
  // 數值限制
  MAX_FLEX_VALUE: 100,
  MIN_FLEX_VALUE: 0,
  MAX_OFFSET_VALUE: 300,
  MIN_OFFSET_VALUE: -300,
  
  // 支援的值
  SUPPORTED_SIZES: ["xs", "sm", "md", "lg", "xl", "xxl", "3xl", "4xl", "5xl", "full"] as const,
  SUPPORTED_WEIGHTS: ["ultralight", "light", "regular", "bold"] as const,
  SUPPORTED_ALIGNS: ["start", "end", "center"] as const,
  SUPPORTED_GRAVITIES: ["top", "bottom", "center"] as const,
  SUPPORTED_SPACINGS: ["none", "xs", "sm", "md", "lg", "xl", "xxl"] as const,
  SUPPORTED_BUTTON_STYLES: ["primary", "secondary", "link"] as const,
  SUPPORTED_BUTTON_HEIGHTS: ["sm", "md", "lg"] as const,
  SUPPORTED_IMAGE_ASPECT_RATIOS: ["1:1", "16:9", "4:3", "3:2", "2:3", "3:4", "9:16"] as const,
  SUPPORTED_IMAGE_ASPECT_MODES: ["cover", "fit"] as const,
  SUPPORTED_POSITIONS: ["relative", "absolute"] as const,
  SUPPORTED_TEXT_DECORATIONS: ["none", "underline", "line-through"] as const,
  SUPPORTED_TEXT_STYLES: ["normal", "italic"] as const,
  SUPPORTED_LAYOUTS: ["vertical", "horizontal", "baseline"] as const,
  SUPPORTED_JUSTIFY_CONTENT: ["start", "end", "center", "space-between", "space-around", "space-evenly"] as const,
  SUPPORTED_ALIGN_ITEMS: ["start", "end", "center", "stretch"] as const
};

// ============ 基礎驗證函數 ============

/**
 * 驗證顏色格式（十六進位）
 */
export function validateColor(color: string | undefined): PropertyValidationResult {
  if (!color) {
    return { property: "color", isValid: true, severity: "info" };
  }
  
  const colorPattern = /^#[0-9A-Fa-f]{6}$/;
  const isValid = colorPattern.test(color);
  
  return {
    property: "color",
    isValid,
    message: isValid ? undefined : "顏色必須是有效的十六進位色碼，例如: #FF0000",
    severity: "error"
  };
}

/**
 * 驗證像素值
 */
export function validatePixelValue(value: string | undefined, propertyName: string): PropertyValidationResult {
  if (!value) {
    return { property: propertyName, isValid: true, severity: "info" };
  }
  
  const pixelPattern = /^\d+px$/;
  const isValid = pixelPattern.test(value);
  
  return {
    property: propertyName,
    isValid,
    message: isValid ? undefined : `${propertyName} 必須是像素值，例如: 10px`,
    severity: "error"
  };
}

/**
 * 驗證百分比或像素值
 */
export function validateSizeValue(value: string | undefined, propertyName: string): PropertyValidationResult {
  if (!value) {
    return { property: propertyName, isValid: true, severity: "info" };
  }
  
  const sizePattern = /^(\d+px|\d+%|\d+(\.\d+)?)$/;
  const isValid = sizePattern.test(value);
  
  return {
    property: propertyName,
    isValid,
    message: isValid ? undefined : `${propertyName} 必須是像素值、百分比或flex值，例如: 100px, 50%, 2`,
    severity: "error"
  };
}

/**
 * 驗證偏移值
 */
export function validateOffsetValue(value: string | undefined, propertyName: string): PropertyValidationResult {
  if (!value) {
    return { property: propertyName, isValid: true, severity: "info" };
  }
  
  const offsetPattern = /^-?\d+(px|%)$/;
  const isValid = offsetPattern.test(value);
  
  return {
    property: propertyName,
    isValid,
    message: isValid ? undefined : `${propertyName} 必須是帶單位的數值，例如: 10px, -5%, 20px`,
    severity: "error"
  };
}

/**
 * 驗證枚舉值
 */
export function validateEnum<T extends readonly string[]>(
  value: string | undefined,
  allowedValues: T,
  propertyName: string
): PropertyValidationResult {
  if (!value) {
    return { property: propertyName, isValid: true, severity: "info" };
  }
  
  const isValid = allowedValues.includes(value as any);
  
  return {
    property: propertyName,
    isValid,
    message: isValid ? undefined : `${propertyName} 必須是以下值之一: ${allowedValues.join(", ")}`,
    severity: "error"
  };
}

/**
 * 驗證 URL
 */
export function validateUrl(url: string | undefined, propertyName: string): PropertyValidationResult {
  if (!url) {
    return { property: propertyName, isValid: false, message: `${propertyName} 為必填項目`, severity: "error" };
  }
  
  try {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === "https:";
    const hasValidLength = url.length <= LINE_FLEX_LIMITS.MAX_URL_LENGTH;
    
    if (!isHttps) {
      return {
        property: propertyName,
        isValid: false,
        message: `${propertyName} 必須使用 HTTPS 協議`,
        severity: "error"
      };
    }
    
    if (!hasValidLength) {
      return {
        property: propertyName,
        isValid: false,
        message: `${propertyName} 長度不能超過 ${LINE_FLEX_LIMITS.MAX_URL_LENGTH} 字符`,
        severity: "error"
      };
    }
    
    return { property: propertyName, isValid: true, severity: "info" };
  } catch {
    return {
      property: propertyName,
      isValid: false,
      message: `${propertyName} 必須是有效的 URL`,
      severity: "error"
    };
  }
}

/**
 * 驗證數值範圍
 */
export function validateNumberRange(
  value: number | undefined,
  min: number,
  max: number,
  propertyName: string
): PropertyValidationResult {
  if (value === undefined || value === null) {
    return { property: propertyName, isValid: true, severity: "info" };
  }
  
  const isValid = value >= min && value <= max;
  
  return {
    property: propertyName,
    isValid,
    message: isValid ? undefined : `${propertyName} 必須在 ${min} 到 ${max} 之間`,
    severity: "error"
  };
}

// ============ 組件特定驗證函數 ============

/**
 * 驗證 Box 屬性
 */
export function validateBoxProperties(properties: BoxAdvancedProperties): ValidationResult {
  const results: PropertyValidationResult[] = [];
  
  // 基礎佈局驗證
  results.push(validateEnum(properties.layout, LINE_FLEX_LIMITS.SUPPORTED_LAYOUTS, "layout"));
  results.push(validateEnum(properties.spacing, LINE_FLEX_LIMITS.SUPPORTED_SPACINGS, "spacing"));
  results.push(validateEnum(properties.justifyContent, LINE_FLEX_LIMITS.SUPPORTED_JUSTIFY_CONTENT, "justifyContent"));
  results.push(validateEnum(properties.alignItems, LINE_FLEX_LIMITS.SUPPORTED_ALIGN_ITEMS, "alignItems"));
  
  // 尺寸驗證
  results.push(validateSizeValue(properties.width, "width"));
  results.push(validateSizeValue(properties.height, "height"));
  results.push(validateNumberRange(properties.flex, LINE_FLEX_LIMITS.MIN_FLEX_VALUE, LINE_FLEX_LIMITS.MAX_FLEX_VALUE, "flex"));
  
  // 間距驗證
  results.push(validateEnum(properties.padding, LINE_FLEX_LIMITS.SUPPORTED_SPACINGS, "padding"));
  results.push(validateEnum(properties.paddingTop, LINE_FLEX_LIMITS.SUPPORTED_SPACINGS, "paddingTop"));
  results.push(validateEnum(properties.paddingBottom, LINE_FLEX_LIMITS.SUPPORTED_SPACINGS, "paddingBottom"));
  results.push(validateEnum(properties.paddingStart, LINE_FLEX_LIMITS.SUPPORTED_SPACINGS, "paddingStart"));
  results.push(validateEnum(properties.paddingEnd, LINE_FLEX_LIMITS.SUPPORTED_SPACINGS, "paddingEnd"));
  results.push(validateEnum(properties.margin, LINE_FLEX_LIMITS.SUPPORTED_SPACINGS, "margin"));
  
  // 外觀驗證
  results.push(validateColor(properties.backgroundColor));
  results.push(validatePixelValue(properties.borderWidth, "borderWidth"));
  results.push(validateColor(properties.borderColor));
  results.push(validatePixelValue(properties.cornerRadius, "cornerRadius"));
  
  // 定位驗證
  results.push(validateEnum(properties.position, LINE_FLEX_LIMITS.SUPPORTED_POSITIONS, "position"));
  results.push(validateOffsetValue(properties.offsetTop, "offsetTop"));
  results.push(validateOffsetValue(properties.offsetBottom, "offsetBottom"));
  results.push(validateOffsetValue(properties.offsetStart, "offsetStart"));
  results.push(validateOffsetValue(properties.offsetEnd, "offsetEnd"));
  
  return compileValidationResults(results);
}

/**
 * 驗證 Text 屬性
 */
export function validateTextProperties(properties: TextAdvancedProperties, text: string): ValidationResult {
  const results: PropertyValidationResult[] = [];
  
  // 文字內容驗證
  if (!text || text.trim().length === 0) {
    results.push({
      property: "text",
      isValid: false,
      message: "文字內容不能為空",
      severity: "error"
    });
  } else if (text.length > LINE_FLEX_LIMITS.MAX_TEXT_LENGTH) {
    results.push({
      property: "text",
      isValid: false,
      message: `文字長度不能超過 ${LINE_FLEX_LIMITS.MAX_TEXT_LENGTH} 字符`,
      severity: "error"
    });
  }
  
  // 基礎文字屬性驗證
  results.push(validateEnum(properties.size, LINE_FLEX_LIMITS.SUPPORTED_SIZES, "size"));
  results.push(validateEnum(properties.weight, LINE_FLEX_LIMITS.SUPPORTED_WEIGHTS, "weight"));
  results.push(validateColor(properties.color));
  results.push(validateEnum(properties.align, LINE_FLEX_LIMITS.SUPPORTED_ALIGNS, "align"));
  results.push(validateEnum(properties.gravity, LINE_FLEX_LIMITS.SUPPORTED_GRAVITIES, "gravity"));
  
  // 排版屬性驗證
  results.push(validateNumberRange(properties.maxLines, 1, 20, "maxLines"));
  results.push(validateEnum(properties.lineSpacing, LINE_FLEX_LIMITS.SUPPORTED_SPACINGS, "lineSpacing"));
  
  // 樣式驗證
  results.push(validateEnum(properties.style, LINE_FLEX_LIMITS.SUPPORTED_TEXT_STYLES, "style"));
  results.push(validateEnum(properties.decoration, LINE_FLEX_LIMITS.SUPPORTED_TEXT_DECORATIONS, "decoration"));
  
  // 通用屬性驗證
  results.push(validateNumberRange(properties.flex, LINE_FLEX_LIMITS.MIN_FLEX_VALUE, LINE_FLEX_LIMITS.MAX_FLEX_VALUE, "flex"));
  results.push(validateEnum(properties.margin, LINE_FLEX_LIMITS.SUPPORTED_SPACINGS, "margin"));
  results.push(validateEnum(properties.position, LINE_FLEX_LIMITS.SUPPORTED_POSITIONS, "position"));
  results.push(validateOffsetValue(properties.offsetTop, "offsetTop"));
  results.push(validateOffsetValue(properties.offsetBottom, "offsetBottom"));
  results.push(validateOffsetValue(properties.offsetStart, "offsetStart"));
  results.push(validateOffsetValue(properties.offsetEnd, "offsetEnd"));
  
  return compileValidationResults(results);
}

/**
 * 驗證 Button 屬性
 */
export function validateButtonProperties(properties: ButtonAdvancedProperties): ValidationResult {
  const results: PropertyValidationResult[] = [];
  
  // 按鈕樣式驗證
  results.push(validateEnum(properties.style, LINE_FLEX_LIMITS.SUPPORTED_BUTTON_STYLES, "style"));
  results.push(validateColor(properties.color));
  results.push(validateEnum(properties.height, LINE_FLEX_LIMITS.SUPPORTED_BUTTON_HEIGHTS, "height"));
  results.push(validateEnum(properties.gravity, LINE_FLEX_LIMITS.SUPPORTED_GRAVITIES, "gravity"));
  
  // 通用屬性驗證
  results.push(validateNumberRange(properties.flex, LINE_FLEX_LIMITS.MIN_FLEX_VALUE, LINE_FLEX_LIMITS.MAX_FLEX_VALUE, "flex"));
  results.push(validateEnum(properties.margin, LINE_FLEX_LIMITS.SUPPORTED_SPACINGS, "margin"));
  
  // 邊框驗證
  results.push(validatePixelValue(properties.borderWidth, "borderWidth"));
  results.push(validateColor(properties.borderColor));
  results.push(validatePixelValue(properties.cornerRadius, "cornerRadius"));
  
  // 定位驗證
  results.push(validateEnum(properties.position, LINE_FLEX_LIMITS.SUPPORTED_POSITIONS, "position"));
  results.push(validateOffsetValue(properties.offsetTop, "offsetTop"));
  results.push(validateOffsetValue(properties.offsetBottom, "offsetBottom"));
  results.push(validateOffsetValue(properties.offsetStart, "offsetStart"));
  results.push(validateOffsetValue(properties.offsetEnd, "offsetEnd"));
  
  return compileValidationResults(results);
}

/**
 * 驗證 Image 屬性
 */
export function validateImageProperties(properties: ImageAdvancedProperties, url: string): ValidationResult {
  const results: PropertyValidationResult[] = [];
  
  // URL 驗證
  results.push(validateUrl(url, "url"));
  
  // 圖片檢查 (簡化版)
  if (url && !url.match(/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i)) {
    results.push({
      property: "url",
      isValid: false,
      message: "圖片 URL 必須以支援的圖片格式結尾 (.jpg, .jpeg, .png, .gif, .webp)",
      severity: "warning"
    });
  }
  
  // 基礎圖片屬性驗證
  results.push(validateEnum(properties.size, LINE_FLEX_LIMITS.SUPPORTED_SIZES, "size"));
  results.push(validateEnum(properties.aspectRatio, LINE_FLEX_LIMITS.SUPPORTED_IMAGE_ASPECT_RATIOS, "aspectRatio"));
  results.push(validateEnum(properties.aspectMode, LINE_FLEX_LIMITS.SUPPORTED_IMAGE_ASPECT_MODES, "aspectMode"));
  results.push(validateEnum(properties.align, LINE_FLEX_LIMITS.SUPPORTED_ALIGNS, "align"));
  results.push(validateEnum(properties.gravity, LINE_FLEX_LIMITS.SUPPORTED_GRAVITIES, "gravity"));
  
  // 通用屬性驗證
  results.push(validateNumberRange(properties.flex, LINE_FLEX_LIMITS.MIN_FLEX_VALUE, LINE_FLEX_LIMITS.MAX_FLEX_VALUE, "flex"));
  results.push(validateEnum(properties.margin, LINE_FLEX_LIMITS.SUPPORTED_SPACINGS, "margin"));
  results.push(validateColor(properties.backgroundColor));
  results.push(validatePixelValue(properties.cornerRadius, "cornerRadius"));
  
  // 邊框驗證
  results.push(validatePixelValue(properties.borderWidth, "borderWidth"));
  results.push(validateColor(properties.borderColor));
  
  // 定位驗證
  results.push(validateEnum(properties.position, LINE_FLEX_LIMITS.SUPPORTED_POSITIONS, "position"));
  results.push(validateOffsetValue(properties.offsetTop, "offsetTop"));
  results.push(validateOffsetValue(properties.offsetBottom, "offsetBottom"));
  results.push(validateOffsetValue(properties.offsetStart, "offsetStart"));
  results.push(validateOffsetValue(properties.offsetEnd, "offsetEnd"));
  
  return compileValidationResults(results);
}

// ============ 工具函數 ============

/**
 * 編譯驗證結果
 */
function compileValidationResults(results: PropertyValidationResult[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  results.forEach(result => {
    if (!result.isValid && result.message) {
      if (result.severity === "error") {
        errors.push(result.message);
      } else if (result.severity === "warning") {
        warnings.push(result.message);
      }
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * 驗證完整的 Flex Message 結構
 */
export function validateFlexMessage(flexMessage: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // 基本結構驗證
  if (!flexMessage.type || flexMessage.type !== "flex") {
    errors.push("Flex Message 必須具有 'flex' 類型");
  }
  
  if (!flexMessage.altText) {
    errors.push("Flex Message 必須包含 altText");
  } else if (flexMessage.altText.length > LINE_FLEX_LIMITS.MAX_ALT_TEXT_LENGTH) {
    errors.push(`altText 長度不能超過 ${LINE_FLEX_LIMITS.MAX_ALT_TEXT_LENGTH} 字符`);
  }
  
  if (!flexMessage.contents) {
    errors.push("Flex Message 必須包含 contents");
  } else {
    const contentType = flexMessage.contents.type;
    if (!contentType || !["bubble", "carousel"].includes(contentType)) {
      errors.push("contents 必須是 bubble 或 carousel 類型");
    }
    
    if (contentType === "carousel") {
      if (!flexMessage.contents.contents || !Array.isArray(flexMessage.contents.contents)) {
        errors.push("Carousel 必須包含 contents 陣列");
      } else if (flexMessage.contents.contents.length > LINE_FLEX_LIMITS.MAX_CAROUSEL_BUBBLES) {
        errors.push(`Carousel 最多只能包含 ${LINE_FLEX_LIMITS.MAX_CAROUSEL_BUBBLES} 個 Bubble`);
      }
    }
  }
  
  // JSON 大小檢查（粗略估算）
  const jsonString = JSON.stringify(flexMessage);
  const sizeKB = new Blob([jsonString]).size / 1024;
  if (sizeKB > LINE_FLEX_LIMITS.MAX_BUBBLE_SIZE_KB) {
    warnings.push(`Flex Message 大小約 ${sizeKB.toFixed(1)}KB，可能超過 ${LINE_FLEX_LIMITS.MAX_BUBBLE_SIZE_KB}KB 限制`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// ============ 匯出 ============
export {
  LINE_FLEX_LIMITS,
  type ValidationResult,
  type PropertyValidationResult
};