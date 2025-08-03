/**
 * Flex Message 轉換工具
 * 將視覺編輯器的 Flex 積木轉換為 LINE Messaging API 格式
 */

import { 
  BoxAdvancedProperties, 
  TextAdvancedProperties, 
  ButtonAdvancedProperties, 
  ImageAdvancedProperties,
  LinearGradient,
  convertPropertiesToLineFormat 
} from '../types/flexProperties';
import { LineAction } from '../types/lineActions';

// ============ 基礎轉換介面 ============
export interface FlexComponent {
  type: string;
  [key: string]: unknown;
}

export interface FlexBox extends FlexComponent {
  type: "box";
  layout: "vertical" | "horizontal" | "baseline";
  contents: FlexComponent[];
}

export interface FlexText extends FlexComponent {
  type: "text";
  text: string;
}

export interface FlexButton extends FlexComponent {
  type: "button";
  action: LineAction;
}

export interface FlexImage extends FlexComponent {
  type: "image";
  url: string;
}

export interface FlexSeparator extends FlexComponent {
  type: "separator";
}

// ============ 積木數據介面 ============
export interface BlockData {
  id: string;
  blockType: string;
  title: string;
  contentType?: string;
  containerType?: string;
  properties?: Record<string, unknown>;
  contents?: BlockData[];
  text?: string;
  url?: string;
  action?: LineAction;
  actionType?: string;
  children?: string[];
}

// ============ Box 容器轉換 ============
export function convertBoxToFlex(blockData: BlockData): FlexBox {
  const properties = blockData.properties as BoxAdvancedProperties || {};
  
  const flexBox: FlexBox = {
    type: "box",
    layout: properties.layout || "vertical",
    contents: []
  };

  // 基礎佈局屬性
  if (properties.spacing && properties.spacing !== "none") {
    flexBox.spacing = properties.spacing;
  }
  
  if (properties.justifyContent && properties.justifyContent !== "start") {
    flexBox.justifyContent = properties.justifyContent;
  }
  
  if (properties.alignItems && properties.alignItems !== "start") {
    flexBox.alignItems = properties.alignItems;
  }

  // 尺寸屬性
  if (properties.width) {
    flexBox.width = properties.width;
  }
  
  if (properties.height) {
    flexBox.height = properties.height;
  }
  
  if (properties.flex) {
    flexBox.flex = properties.flex;
  }
  
  if (properties.maxWidth) {
    flexBox.maxWidth = properties.maxWidth;
  }
  
  if (properties.maxHeight) {
    flexBox.maxHeight = properties.maxHeight;
  }

  // 間距屬性
  addSpacingProperties(flexBox, properties);

  // 外觀屬性
  addAppearanceProperties(flexBox, properties);

  // 定位屬性
  addPositionProperties(flexBox, properties);

  // 轉換子元件
  if (blockData.contents && blockData.contents.length > 0) {
    flexBox.contents = blockData.contents.map(convertBlockToFlexComponent);
  }

  return flexBox;
}

// ============ Text 元件轉換 ============
export function convertTextToFlex(blockData: BlockData): FlexText {
  const properties = blockData.properties as TextAdvancedProperties || {};
  
  const flexText: FlexText = {
    type: "text",
    text: blockData.text || "範例文字"
  };

  // 基礎文字屬性
  if (properties.size && properties.size !== "md") {
    flexText.size = properties.size;
  }
  
  if (properties.weight && properties.weight !== "regular") {
    flexText.weight = properties.weight;
  }
  
  if (properties.color && properties.color !== "#000000") {
    flexText.color = properties.color;
  }
  
  if (properties.align && properties.align !== "start") {
    flexText.align = properties.align;
  }
  
  if (properties.gravity && properties.gravity !== "center") {
    flexText.gravity = properties.gravity;
  }

  // 排版屬性
  if (properties.wrap !== undefined) {
    flexText.wrap = properties.wrap;
  }
  
  if (properties.maxLines) {
    flexText.maxLines = properties.maxLines;
  }
  
  if (properties.lineSpacing && properties.lineSpacing !== "none") {
    flexText.lineSpacing = properties.lineSpacing;
  }

  // 樣式屬性
  if (properties.style && properties.style !== "normal") {
    flexText.style = properties.style;
  }
  
  if (properties.decoration && properties.decoration !== "none") {
    flexText.decoration = properties.decoration;
  }

  // 尺寸和間距
  if (properties.flex) {
    flexText.flex = properties.flex;
  }
  
  addSpacingProperties(flexText, properties);
  addPositionProperties(flexText, properties);

  return flexText;
}

// ============ Button 元件轉換 ============
export function convertButtonToFlex(blockData: BlockData): FlexButton {
  const properties = blockData.properties as ButtonAdvancedProperties || {};
  
  const flexButton: FlexButton = {
    type: "button",
    action: blockData.action || {
      type: "postback",
      label: "按鈕",
      data: "button_clicked"
    }
  };

  // 按鈕樣式屬性
  if (properties.style && properties.style !== "primary") {
    flexButton.style = properties.style;
  }
  
  if (properties.color && properties.color !== "#0084ff") {
    flexButton.color = properties.color;
  }
  
  if (properties.height && properties.height !== "md") {
    flexButton.height = properties.height;
  }
  
  if (properties.gravity && properties.gravity !== "center") {
    flexButton.gravity = properties.gravity;
  }
  
  if (properties.adjustMode) {
    flexButton.adjustMode = properties.adjustMode;
  }

  // 尺寸和間距
  if (properties.flex) {
    flexButton.flex = properties.flex;
  }
  
  addSpacingProperties(flexButton, properties);
  addAppearanceProperties(flexButton, properties);
  addPositionProperties(flexButton, properties);

  return flexButton;
}

// ============ Image 元件轉換 ============
export function convertImageToFlex(blockData: BlockData): FlexImage {
  const properties = blockData.properties as ImageAdvancedProperties || {};
  
  const flexImage: FlexImage = {
    type: "image",
    url: blockData.url || "https://example.com/image.jpg"
  };

  // 基礎圖片屬性
  if (properties.size && properties.size !== "full") {
    flexImage.size = properties.size;
  }
  
  if (properties.aspectRatio && properties.aspectRatio !== "1:1") {
    flexImage.aspectRatio = properties.aspectRatio;
  }
  
  if (properties.aspectMode && properties.aspectMode !== "cover") {
    flexImage.aspectMode = properties.aspectMode;
  }
  
  if (properties.align && properties.align !== "center") {
    flexImage.align = properties.align;
  }
  
  if (properties.gravity && properties.gravity !== "center") {
    flexImage.gravity = properties.gravity;
  }

  // 尺寸和間距
  if (properties.flex) {
    flexImage.flex = properties.flex;
  }
  
  addSpacingProperties(flexImage, properties);
  addAppearanceProperties(flexImage, properties);
  addPositionProperties(flexImage, properties);

  return flexImage;
}

// ============ 通用屬性添加函數 ============

/**
 * 添加間距屬性
 */
function addSpacingProperties(component: FlexComponent, properties: Record<string, unknown>): void {
  // 統一間距
  if (properties.padding && properties.padding !== "none") {
    component.paddingAll = properties.padding;
  }
  
  if (properties.margin && properties.margin !== "none") {
    component.margin = properties.margin;
  }

  // 細緻間距
  if (properties.paddingTop && properties.paddingTop !== "none") {
    component.paddingTop = properties.paddingTop;
  }
  
  if (properties.paddingBottom && properties.paddingBottom !== "none") {
    component.paddingBottom = properties.paddingBottom;
  }
  
  if (properties.paddingStart && properties.paddingStart !== "none") {
    component.paddingStart = properties.paddingStart;
  }
  
  if (properties.paddingEnd && properties.paddingEnd !== "none") {
    component.paddingEnd = properties.paddingEnd;
  }
}

/**
 * 添加外觀屬性
 */
function addAppearanceProperties(component: FlexComponent, properties: Record<string, unknown>): void {
  // 背景顏色
  if (properties.backgroundColor && properties.backgroundColor !== "#FFFFFF") {
    component.backgroundColor = properties.backgroundColor;
  }

  // 漸層背景
  if (properties.background && properties.background.type === "linearGradient") {
    component.background = convertLinearGradient(properties.background);
  }

  // 邊框屬性
  if (properties.borderWidth && properties.borderWidth !== "0px") {
    component.borderWidth = properties.borderWidth;
  }
  
  if (properties.borderColor && properties.borderColor !== "#000000") {
    component.borderColor = properties.borderColor;
  }
  
  if (properties.cornerRadius && properties.cornerRadius !== "0px") {
    component.cornerRadius = properties.cornerRadius;
  }
}

/**
 * 添加定位屬性
 */
function addPositionProperties(component: FlexComponent, properties: Record<string, unknown>): void {
  if (properties.position) {
    component.position = properties.position;
  }
  
  if (properties.offsetTop) {
    component.offsetTop = properties.offsetTop;
  }
  
  if (properties.offsetBottom) {
    component.offsetBottom = properties.offsetBottom;
  }
  
  if (properties.offsetStart) {
    component.offsetStart = properties.offsetStart;
  }
  
  if (properties.offsetEnd) {
    component.offsetEnd = properties.offsetEnd;
  }
}

/**
 * 轉換線性漸層
 */
function convertLinearGradient(gradient: LinearGradient): Record<string, unknown> {
  return {
    type: "linearGradient",
    angle: gradient.angle || "0deg",
    colors: gradient.colors.map(color => ({
      color: color.color,
      ...(color.position && { position: color.position })
    }))
  };
}

// ============ 主要轉換函數 ============

/**
 * 將積木數據轉換為 Flex 組件
 */
export function convertBlockToFlexComponent(blockData: BlockData): FlexComponent {
  switch (blockData.contentType || blockData.containerType) {
    case "box":
      return convertBoxToFlex(blockData);
    
    case "text":
      return convertTextToFlex(blockData);
    
    case "button":
      return convertButtonToFlex(blockData);
    
    case "image":
      return convertImageToFlex(blockData);
    
    case "separator": {
      const separatorProperties = blockData.properties || {};
      return {
        type: "separator",
        ...(separatorProperties.color && { color: separatorProperties.color }),
        ...(separatorProperties.margin && separatorProperties.margin !== "none" && { margin: separatorProperties.margin })
      };
    }
    
    case "filler":
      return {
        type: "filler",
        ...(blockData.properties?.flex && { flex: blockData.properties.flex })
      };
    
    default:
      console.warn(`Unknown component type: ${blockData.contentType || blockData.containerType}`);
      return {
        type: "text",
        text: `未知組件: ${blockData.title || "Unknown"}`
      };
  }
}

/**
 * 將 Bubble 積木轉換為 LINE Flex Message
 */
export function convertBubbleToFlexMessage(bubbleData: BlockData): Record<string, unknown> {
  const flexMessage = {
    type: "flex",
    altText: bubbleData.title || "Flex Message",
    contents: {
      type: "bubble",
      ...(bubbleData.properties?.size && { size: bubbleData.properties.size }),
      ...(bubbleData.properties?.direction && { direction: bubbleData.properties.direction })
    } as Record<string, unknown>
  };

  // 處理 Bubble 的各個區塊
  if (bubbleData.contents && bubbleData.contents.length > 0) {
    bubbleData.contents.forEach(section => {
      const sectionName = section.contentType;
      if (sectionName && ["header", "hero", "body", "footer"].includes(sectionName)) {
        if (section.contents && section.contents.length > 0) {
          if (sectionName === "hero" && section.contents[0]?.contentType === "image") {
            // Hero 區塊可以直接放 image
            flexMessage.contents[sectionName] = convertBlockToFlexComponent(section.contents[0]);
          } else {
            // 其他區塊需要 box 容器
            flexMessage.contents[sectionName] = convertBoxToFlex(section);
          }
        }
      }
    });
  }

  return flexMessage;
}

/**
 * 將 Carousel 積木轉換為 LINE Flex Message
 */
export function convertCarouselToFlexMessage(carouselData: BlockData): Record<string, unknown> {
  const flexMessage = {
    type: "flex",
    altText: carouselData.title || "Carousel Message",
    contents: {
      type: "carousel",
      contents: []
    } as Record<string, unknown>
  };

  // 轉換每個 Bubble
  if (carouselData.contents && carouselData.contents.length > 0) {
    flexMessage.contents.contents = carouselData.contents.map(bubbleData => {
      const bubble = convertBubbleToFlexMessage(bubbleData);
      return bubble.contents; // 只返回 bubble 部分，不包含外層的 flex 包裝
    });
  }

  return flexMessage;
}

/**
 * 驗證 Flex Message 格式
 */
export function validateFlexMessage(flexMessage: Record<string, unknown>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // 基本結構驗證
  if (!flexMessage.type || flexMessage.type !== "flex") {
    errors.push("缺少有效的 type 屬性");
  }

  if (!flexMessage.altText || typeof flexMessage.altText !== "string") {
    errors.push("缺少有效的 altText 屬性");
  }

  if (!flexMessage.contents) {
    errors.push("缺少 contents 屬性");
  } else {
    // 驗證 contents 類型
    const contentType = flexMessage.contents.type;
    if (!contentType || !["bubble", "carousel"].includes(contentType)) {
      errors.push("contents 必須是 bubble 或 carousel 類型");
    }

    // 驗證 Carousel 的 contents 數量
    if (contentType === "carousel") {
      if (!flexMessage.contents.contents || !Array.isArray(flexMessage.contents.contents)) {
        errors.push("Carousel 必須包含 contents 陣列");
      } else if (flexMessage.contents.contents.length > 10) {
        errors.push("Carousel 最多只能包含 10 個 Bubble");
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * 生成 Python 代碼
 */
export function generatePythonCode(flexMessage: Record<string, unknown>): string {
  const validation = validateFlexMessage(flexMessage);
  if (!validation.isValid) {
    throw new Error(`Flex Message 驗證失敗: ${validation.errors.join(", ")}`);
  }

  const indent = "    ";
  let code = "from linebot.models import FlexSendMessage\n\n";
  
  code += "# 建立 Flex Message\n";
  code += "flex_message = FlexSendMessage(\n";
  code += `${indent}alt_text="${flexMessage.altText}",\n`;
  code += `${indent}contents={\n`;
  
  // 轉換 contents
  code += generatePythonObject(flexMessage.contents, 2);
  
  code += `${indent}}\n`;
  code += ")\n\n";
  code += "# 發送 Flex Message\n";
  code += "line_bot_api.reply_message(event.reply_token, flex_message)";
  
  return code;
}

/**
 * 生成 Python 物件字符串
 */
function generatePythonObject(obj: unknown, indentLevel: number = 0): string {
  const indent = "    ".repeat(indentLevel);
  const nextIndent = "    ".repeat(indentLevel + 1);
  
  if (Array.isArray(obj)) {
    if (obj.length === 0) {
      return "[]";
    }
    
    let result = "[\n";
    obj.forEach((item, index) => {
      result += nextIndent + generatePythonObject(item, indentLevel + 1);
      if (index < obj.length - 1) {
        result += ",";
      }
      result += "\n";
    });
    result += indent + "]";
    return result;
  }
  
  if (typeof obj === "object" && obj !== null) {
    const keys = Object.keys(obj);
    if (keys.length === 0) {
      return "{}";
    }
    
    let result = "{\n";
    keys.forEach((key, index) => {
      const value = obj[key];
      result += `${nextIndent}"${key}": ${generatePythonObject(value, indentLevel + 1)}`;
      if (index < keys.length - 1) {
        result += ",";
      }
      result += "\n";
    });
    result += indent + "}";
    return result;
  }
  
  if (typeof obj === "string") {
    return `"${obj.replace(/"/g, '\\"')}"`;
  }
  
  if (typeof obj === "number" || typeof obj === "boolean") {
    return String(obj);
  }
  
  return "None";
}

// ============ 匯出工具函數 ============
export {
  convertPropertiesToLineFormat,
  type FlexComponent,
  type FlexBox,
  type FlexText,
  type FlexButton,
  type FlexImage,
  type FlexSeparator
};