// utils/flexWrapper.js
import { 
  convertBubbleToFlexMessage, 
  convertCarouselToFlexMessage,
  validateFlexMessage,
  generatePythonCode
} from './flexMessageConverter.ts';

export const wrapFlexMessageBubble = (json) => {
  if (
    json.type === "flex" &&
    typeof json.altText === "string" &&
    typeof json.contents === "object"
  ) {
    return json; // 已經是完整 flex 結構
  }

  if (json.type === "bubble" || json.type === "carousel") {
    return {
      type: "flex",
      altText: "這是 Flex Message",
      contents: json,
    };
  }

  return null; // 不符合格式
};

// 新增進階 Flex Message 轉換函數
export const convertAdvancedFlexMessage = (blockData) => {
  try {
    let flexMessage;
    
    if (blockData.containerType === "bubble") {
      flexMessage = convertBubbleToFlexMessage(blockData);
    } else if (blockData.containerType === "carousel") {
      flexMessage = convertCarouselToFlexMessage(blockData);
    } else {
      throw new Error(`不支援的容器類型: ${blockData.containerType}`);
    }
    
    // 驗證生成的 Flex Message
    const validation = validateFlexMessage(flexMessage);
    if (!validation.isValid) {
      console.warn("Flex Message 驗證警告:", validation.errors);
    }
    
    return {
      flexMessage,
      validation,
      isValid: validation.isValid
    };
  } catch (error) {
    console.error("Flex Message 轉換失敗:", error);
    return {
      flexMessage: null,
      validation: { isValid: false, errors: [error.message], warnings: [] },
      isValid: false
    };
  }
};

// 生成 Python 代碼
export const generateFlexMessagePython = (blockData) => {
  try {
    const result = convertAdvancedFlexMessage(blockData);
    if (!result.isValid || !result.flexMessage) {
      throw new Error("無法生成 Python 代碼：Flex Message 無效");
    }
    
    const pythonCode = generatePythonCode(result.flexMessage);
    return {
      code: pythonCode,
      isValid: true,
      validation: result.validation
    };
  } catch (error) {
    console.error("Python 代碼生成失敗:", error);
    return {
      code: null,
      isValid: false,
      error: error.message
    };
  }
};
