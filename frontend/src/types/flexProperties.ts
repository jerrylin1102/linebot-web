/**
 * LINE Flex Message 進階佈局屬性類型定義
 * 支援完整的 LINE Flex Message 規範屬性
 */

// ============ 基礎單位類型 ============
export type FlexSize = "xs" | "sm" | "md" | "lg" | "xl" | "xxl" | "3xl" | "4xl" | "5xl";
export type FlexWeight = "ultralight" | "light" | "regular" | "bold";
export type FlexAlign = "start" | "end" | "center";
export type FlexGravity = "top" | "bottom" | "center";
export type FlexSpacing = "none" | "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
export type FlexMargin = FlexSpacing;
export type FlexPadding = FlexSpacing;

// ============ 定位屬性 (Position) ============
export type PositionType = "relative" | "absolute";

export interface PositionProperties {
  position?: PositionType;
  offsetTop?: string;    // 支援 px 和 %
  offsetBottom?: string;
  offsetStart?: string;
  offsetEnd?: string;
}

// ============ 邊框屬性 (Border) ============
export interface BorderProperties {
  borderWidth?: string;     // 例如: "1px", "2px"
  borderColor?: string;     // 十六進位色碼
  cornerRadius?: string;    // 例如: "4px", "8px"
}

// ============ 漸層背景 (Gradient) ============
export type GradientDirection = "to top" | "to bottom" | "to left" | "to right" | 
                               "to top left" | "to top right" | "to bottom left" | "to bottom right";

export interface LinearGradient {
  type: "linearGradient";
  angle?: string;           // 例如: "45deg"
  colors: Array<{
    color: string;          // 十六進位色碼
    position?: string;      // 例如: "0%", "50%", "100%"
  }>;
}

export interface GradientProperties {
  background?: LinearGradient;
}

// ============ 陰影效果 (Shadow) ============
export interface ShadowProperties {
  boxShadow?: string;       // CSS box-shadow 格式
  textShadow?: string;      // CSS text-shadow 格式
}

// ============ 動畫屬性 (Animation) ============
export interface AnimationProperties {
  transition?: string;      // CSS transition 格式
  transform?: string;       // CSS transform 格式
}

// ============ 進階間距 (Advanced Spacing) ============
export interface AdvancedSpacingProperties {
  // 統一間距
  padding?: FlexPadding;
  margin?: FlexMargin;
  
  // 細緻間距控制
  paddingAll?: FlexPadding;
  paddingTop?: FlexPadding;
  paddingBottom?: FlexPadding;
  paddingStart?: FlexPadding;
  paddingEnd?: FlexPadding;
  
  marginTop?: FlexMargin;
  marginBottom?: FlexMargin;
  marginStart?: FlexMargin;
  marginEnd?: FlexMargin;
}

// ============ 尺寸屬性 ============
export interface SizeProperties {
  width?: string;           // 支援 px, %, flex 值
  height?: string;
  maxWidth?: string;
  maxHeight?: string;
  minWidth?: string;
  minHeight?: string;
  flex?: number | string;   // flex grow 值
}

// ============ 佈局屬性 ============
export type FlexDirection = "vertical" | "horizontal" | "baseline";
export type JustifyContent = "start" | "end" | "center" | "space-between" | "space-around" | "space-evenly";
export type AlignItems = "start" | "end" | "center" | "stretch";

export interface LayoutProperties {
  layout?: FlexDirection;
  justifyContent?: JustifyContent;
  alignItems?: AlignItems;
  spacing?: FlexSpacing;
}

// ============ 背景屬性 ============
export interface BackgroundProperties {
  backgroundColor?: string;  // 十六進位色碼
  background?: LinearGradient;
}

// ============ 組合屬性介面 ============

// Box 容器進階屬性
export interface BoxAdvancedProperties extends 
  PositionProperties,
  BorderProperties,
  GradientProperties,
  ShadowProperties,
  AnimationProperties,
  AdvancedSpacingProperties,
  SizeProperties,
  LayoutProperties,
  BackgroundProperties {}

// Text 文字進階屬性
export interface TextAdvancedProperties extends
  PositionProperties,
  ShadowProperties,
  AnimationProperties,
  AdvancedSpacingProperties,
  SizeProperties {
  // 文字特有屬性
  decoration?: "none" | "underline" | "line-through";
  style?: "normal" | "italic";
  lineSpacing?: FlexSpacing;
  maxLines?: number;
  wrap?: boolean;
}

// Image 圖片進階屬性
export interface ImageAdvancedProperties extends
  PositionProperties,
  BorderProperties,
  ShadowProperties,
  AnimationProperties,
  AdvancedSpacingProperties,
  SizeProperties,
  BackgroundProperties {
  // 圖片特有屬性
  aspectRatio?: string;     // 例如: "1:1", "16:9"
  aspectMode?: "cover" | "fit";
}

// Button 按鈕進階屬性
export interface ButtonAdvancedProperties extends
  PositionProperties,
  BorderProperties,
  ShadowProperties,
  AnimationProperties,
  AdvancedSpacingProperties,
  SizeProperties {
  // 按鈕特有屬性
  style?: "primary" | "secondary" | "link";
  height?: "sm" | "md" | "lg";
  adjustMode?: "shrink-to-fit";
}

// Icon 圖示進階屬性
export interface IconAdvancedProperties extends
  PositionProperties,
  ShadowProperties,
  AnimationProperties,
  AdvancedSpacingProperties,
  SizeProperties {}

// Separator 分隔線進階屬性
export interface SeparatorAdvancedProperties extends
  AdvancedSpacingProperties {
  color?: string;
}

// ============ 屬性驗證 ============
export interface PropertyValidationRule {
  required?: boolean;
  pattern?: RegExp;
  min?: number;
  max?: number;
  enum?: string[];
  message?: string;
}

export interface PropertyValidation {
  [key: string]: PropertyValidationRule;
}

// ============ 預設值配置 ============
export const DEFAULT_BOX_PROPERTIES: Partial<BoxAdvancedProperties> = {
  layout: "vertical",
  spacing: "md",
  padding: "md",
  backgroundColor: "#FFFFFF",
  cornerRadius: "0px",
  borderWidth: "0px",
  borderColor: "#000000"
};

export const DEFAULT_TEXT_PROPERTIES: Partial<TextAdvancedProperties> = {
  size: "md",
  weight: "regular",
  color: "#000000",
  align: "start",
  decoration: "none",
  style: "normal",
  wrap: true
};

export const DEFAULT_IMAGE_PROPERTIES: Partial<ImageAdvancedProperties> = {
  size: "full",
  aspectRatio: "1:1",
  aspectMode: "cover",
  cornerRadius: "0px"
};

export const DEFAULT_BUTTON_PROPERTIES: Partial<ButtonAdvancedProperties> = {
  style: "primary",
  height: "md",
  color: "#0084ff",
  adjustMode: "shrink-to-fit"
};

export const DEFAULT_ICON_PROPERTIES: Partial<IconAdvancedProperties> = {
  size: "md"
};

export const DEFAULT_SEPARATOR_PROPERTIES: Partial<SeparatorAdvancedProperties> = {
  color: "#DDDDDD",
  margin: "md"
};

// ============ 屬性驗證規則 ============
export const PROPERTY_VALIDATION_RULES: Record<string, PropertyValidation> = {
  position: {
    position: {
      enum: ["relative", "absolute"],
      message: "位置類型必須是 relative 或 absolute"
    }
  },
  
  border: {
    borderWidth: {
      pattern: /^\d+px$/,
      message: "邊框寬度必須是像素值，例如: 1px"
    },
    borderColor: {
      pattern: /^#[0-9A-Fa-f]{6}$/,
      message: "邊框顏色必須是十六進位色碼，例如: #000000"
    },
    cornerRadius: {
      pattern: /^\d+px$/,
      message: "圓角半徑必須是像素值，例如: 4px"
    }
  },
  
  spacing: {
    padding: {
      enum: ["none", "xs", "sm", "md", "lg", "xl", "xxl"],
      message: "內邊距必須是有效的間距值"
    },
    margin: {
      enum: ["none", "xs", "sm", "md", "lg", "xl", "xxl"],
      message: "外邊距必須是有效的間距值"
    }
  },
  
  size: {
    width: {
      pattern: /^(\d+px|\d+%|\d+(\.\d+)?)$/,
      message: "寬度必須是像素值、百分比或flex值"
    },
    height: {
      pattern: /^(\d+px|\d+%|\d+(\.\d+)?)$/,
      message: "高度必須是像素值、百分比或flex值"
    }
  }
};

// ============ 工具函數 ============

/**
 * 驗證屬性值
 */
export function validateProperty(
  category: string, 
  property: string, 
  value: any
): { isValid: boolean; message?: string } {
  const categoryRules = PROPERTY_VALIDATION_RULES[category];
  if (!categoryRules) {
    return { isValid: true };
  }
  
  const rule = categoryRules[property];
  if (!rule) {
    return { isValid: true };
  }
  
  // 檢查必填
  if (rule.required && (value === undefined || value === null || value === "")) {
    return { isValid: false, message: rule.message || `${property} 為必填欄位` };
  }
  
  // 如果值為空且非必填，則跳過其他驗證
  if (!value && !rule.required) {
    return { isValid: true };
  }
  
  // 檢查枚舉值
  if (rule.enum && !rule.enum.includes(value)) {
    return { isValid: false, message: rule.message || `${property} 值不在允許範圍內` };
  }
  
  // 檢查正則表達式
  if (rule.pattern && typeof value === "string" && !rule.pattern.test(value)) {
    return { isValid: false, message: rule.message || `${property} 格式不正確` };
  }
  
  // 檢查數值範圍
  if (typeof value === "number") {
    if (rule.min !== undefined && value < rule.min) {
      return { isValid: false, message: rule.message || `${property} 不能小於 ${rule.min}` };
    }
    if (rule.max !== undefined && value > rule.max) {
      return { isValid: false, message: rule.message || `${property} 不能大於 ${rule.max}` };
    }
  }
  
  return { isValid: true };
}

/**
 * 合併屬性，移除未定義的值
 */
export function mergeProperties<T extends Record<string, any>>(
  defaultProps: T,
  userProps: Partial<T>
): T {
  const result = { ...defaultProps };
  
  Object.keys(userProps).forEach(key => {
    const value = userProps[key];
    if (value !== undefined && value !== null && value !== "") {
      result[key] = value;
    }
  });
  
  return result;
}

/**
 * 轉換屬性為 LINE Flex Message JSON 格式
 */
export function convertPropertiesToLineFormat(properties: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  
  Object.keys(properties).forEach(key => {
    const value = properties[key];
    if (value !== undefined && value !== null && value !== "") {
      result[key] = value;
    }
  });
  
  return result;
}