/**
 * Flex Message 進階屬性測試
 * 驗證所有新屬性與 LINE Bot Flex Message 規範的相符性
 */

import {
  convertBlockToFlexComponent,
  convertBubbleToFlexMessage,
  generatePythonCode,
  validateFlexMessage
} from './flexMessageConverter';

import {
  validateBoxProperties,
  validateTextProperties,
  validateButtonProperties,
  validateImageProperties,
  LINE_FLEX_LIMITS
} from './flexMessageValidator';

import {
  BoxAdvancedProperties,
  TextAdvancedProperties,
  ImageAdvancedProperties
} from '../types/flexProperties';

import {
  BoxAdvancedProperties,
  TextAdvancedProperties,
  ButtonAdvancedProperties,
  ImageAdvancedProperties
} from '../types/flexProperties';

// ============ 測試數據 ============

const testBoxData = {
  id: "test-box",
  blockType: "flex-container",
  title: "測試 Box 容器",
  containerType: "box",
  properties: {
    layout: "vertical",
    spacing: "md",
    padding: "lg",
    backgroundColor: "#F0F0F0",
    borderWidth: "2px",
    borderColor: "#333333",
    cornerRadius: "8px",
    position: "relative",
    justifyContent: "center",
    alignItems: "stretch",
    flex: 1
  } as BoxAdvancedProperties,
  contents: []
};

const testTextData = {
  id: "test-text",
  blockType: "flex-content",
  title: "測試文字",
  contentType: "text",
  text: "這是一個測試文字，包含各種進階屬性設定",
  properties: {
    size: "lg",
    weight: "bold",
    color: "#2E86AB",
    align: "center",
    gravity: "center",
    style: "italic",
    decoration: "underline",
    wrap: true,
    maxLines: 3,
    lineSpacing: "sm",
    margin: "md",
    flex: 0
  } as TextAdvancedProperties
};

const testButtonData = {
  id: "test-button",
  blockType: "flex-content",
  title: "測試按鈕",
  contentType: "button",
  action: {
    type: "postback",
    label: "點擊我",
    data: "button_clicked"
  },
  properties: {
    style: "primary",
    color: "#0084FF",
    height: "md",
    gravity: "center",
    borderWidth: "1px",
    borderColor: "#0056CC",
    cornerRadius: "12px",
    margin: "sm",
    flex: 1
  } as ButtonAdvancedProperties
};

const testImageData = {
  id: "test-image",
  blockType: "flex-content",
  title: "測試圖片",
  contentType: "image",
  url: "https://example.com/test-image.jpg",
  properties: {
    size: "full",
    aspectRatio: "16:9",
    aspectMode: "cover",
    align: "center",
    gravity: "center",
    backgroundColor: "#EEEEEE",
    cornerRadius: "4px",
    borderWidth: "1px",
    borderColor: "#DDDDDD",
    margin: "xs",
    flex: 2
  } as ImageAdvancedProperties
};

// ============ 測試函數 ============

/**
 * 測試 Box 容器屬性
 */
export function testBoxProperties(): boolean {
  console.log("🧪 測試 Box 容器屬性...");
  
  try {
    // 驗證屬性
    const validation = validateBoxProperties(testBoxData.properties);
    console.log("✅ Box 屬性驗證:", validation);
    
    // 轉換為 Flex 組件
    const flexComponent = convertBlockToFlexComponent(testBoxData);
    console.log("✅ Box 轉換結果:", JSON.stringify(flexComponent, null, 2));
    
    // 檢查必要屬性
    const requiredProps = ['type', 'layout'];
    for (const prop of requiredProps) {
      if (!(prop in flexComponent)) {
        throw new Error(`缺少必要屬性: ${prop}`);
      }
    }
    
    return validation.isValid;
  } catch (error) {
    console.error("❌ Box 屬性測試失敗:", error);
    return false;
  }
}

/**
 * 測試 Text 組件屬性
 */
export function testTextProperties(): boolean {
  console.log("🧪 測試 Text 組件屬性...");
  
  try {
    // 驗證屬性
    const validation = validateTextProperties(testTextData.properties, testTextData.text!);
    console.log("✅ Text 屬性驗證:", validation);
    
    // 轉換為 Flex 組件
    const flexComponent = convertBlockToFlexComponent(testTextData);
    console.log("✅ Text 轉換結果:", JSON.stringify(flexComponent, null, 2));
    
    // 檢查必要屬性
    if (flexComponent.type !== "text" || !flexComponent.text) {
      throw new Error("Text 組件缺少必要屬性");
    }
    
    return validation.isValid;
  } catch (error) {
    console.error("❌ Text 屬性測試失敗:", error);
    return false;
  }
}

/**
 * 測試 Button 組件屬性
 */
export function testButtonProperties(): boolean {
  console.log("🧪 測試 Button 組件屬性...");
  
  try {
    // 驗證屬性
    const validation = validateButtonProperties(testButtonData.properties);
    console.log("✅ Button 屬性驗證:", validation);
    
    // 轉換為 Flex 組件
    const flexComponent = convertBlockToFlexComponent(testButtonData);
    console.log("✅ Button 轉換結果:", JSON.stringify(flexComponent, null, 2));
    
    // 檢查必要屬性
    if (flexComponent.type !== "button" || !flexComponent.action) {
      throw new Error("Button 組件缺少必要屬性");
    }
    
    return validation.isValid;
  } catch (error) {
    console.error("❌ Button 屬性測試失敗:", error);
    return false;
  }
}

/**
 * 測試 Image 組件屬性
 */
export function testImageProperties(): boolean {
  console.log("🧪 測試 Image 組件屬性...");
  
  try {
    // 驗證屬性
    const validation = validateImageProperties(testImageData.properties, testImageData.url!);
    console.log("✅ Image 屬性驗證:", validation);
    
    // 轉換為 Flex 組件
    const flexComponent = convertBlockToFlexComponent(testImageData);
    console.log("✅ Image 轉換結果:", JSON.stringify(flexComponent, null, 2));
    
    // 檢查必要屬性
    if (flexComponent.type !== "image" || !flexComponent.url) {
      throw new Error("Image 組件缺少必要屬性");
    }
    
    return validation.isValid;
  } catch (error) {
    console.error("❌ Image 屬性測試失敗:", error);
    return false;
  }
}

/**
 * 測試完整的 Bubble 轉換
 */
export function testBubbleConversion(): boolean {
  console.log("🧪 測試完整 Bubble 轉換...");
  
  try {
    const bubbleData = {
      id: "test-bubble",
      blockType: "flex-container",
      title: "測試 Bubble",
      containerType: "bubble",
      properties: {
        size: "mega"
      },
      contents: [
        {
          ...testBoxData,
          contentType: "body",
          contents: [
            testTextData,
            testButtonData,
            testImageData
          ]
        }
      ]
    };
    
    // 轉換為 Flex Message
    const flexMessage = convertBubbleToFlexMessage(bubbleData);
    console.log("✅ Bubble 轉換結果:", JSON.stringify(flexMessage, null, 2));
    
    // 驗證 Flex Message
    const validation = validateFlexMessage(flexMessage);
    console.log("✅ Flex Message 驗證:", validation);
    
    // 生成 Python 代碼
    if (validation.isValid) {
      const pythonCode = generatePythonCode(flexMessage);
      console.log("✅ Python 代碼生成成功");
      console.log("Python 代碼:");
      console.log(pythonCode);
    }
    
    return validation.isValid;
  } catch (error) {
    console.error("❌ Bubble 轉換測試失敗:", error);
    return false;
  }
}

/**
 * 測試邊界值和錯誤情況
 */
export function testEdgeCases(): boolean {
  console.log("🧪 測試邊界值和錯誤情況...");
  
  try {
    const tests = [
      {
        name: "超長文字",
        test: () => {
          const longText = "a".repeat(LINE_FLEX_LIMITS.MAX_TEXT_LENGTH + 1);
          const validation = validateTextProperties({}, longText);
          return !validation.isValid && validation.errors.some(e => e.includes("長度"));
        }
      },
      {
        name: "無效顏色",
        test: () => {
          const validation = validateBoxProperties({ backgroundColor: "invalid-color" } as BoxAdvancedProperties);
          return !validation.isValid && validation.errors.some(e => e.includes("色碼"));
        }
      },
      {
        name: "無效 URL",
        test: () => {
          const validation = validateImageProperties({} as ImageAdvancedProperties, "not-a-url");
          return !validation.isValid && validation.errors.some(e => e.includes("URL"));
        }
      },
      {
        name: "無效枚舉值",
        test: () => {
          const validation = validateTextProperties({ size: "invalid-size" } as TextAdvancedProperties, "test");
          return !validation.isValid && validation.errors.some(e => e.includes("值之一"));
        }
      },
      {
        name: "超出範圍的數值",
        test: () => {
          const validation = validateBoxProperties({ flex: 999 } as BoxAdvancedProperties);
          return !validation.isValid && validation.errors.some(e => e.includes("之間"));
        }
      }
    ];
    
    let allPassed = true;
    for (const test of tests) {
      const result = test.test();
      console.log(`${result ? "✅" : "❌"} ${test.name}: ${result ? "通過" : "失敗"}`);
      allPassed = allPassed && result;
    }
    
    return allPassed;
  } catch (error) {
    console.error("❌ 邊界值測試失敗:", error);
    return false;
  }
}

/**
 * 執行所有測試
 */
export function runAllTests(): boolean {
  console.log("🚀 開始執行 Flex Message 進階屬性測試...");
  console.log("=".repeat(50));
  
  const tests = [
    { name: "Box 容器屬性", fn: testBoxProperties },
    { name: "Text 組件屬性", fn: testTextProperties },
    { name: "Button 組件屬性", fn: testButtonProperties },
    { name: "Image 組件屬性", fn: testImageProperties },
    { name: "完整 Bubble 轉換", fn: testBubbleConversion },
    { name: "邊界值和錯誤情況", fn: testEdgeCases }
  ];
  
  let totalPassed = 0;
  const totalTests = tests.length;
  
  for (const test of tests) {
    console.log(`\n📋 執行測試: ${test.name}`);
    const result = test.fn();
    if (result) {
      totalPassed++;
      console.log(`✅ ${test.name} - 通過`);
    } else {
      console.log(`❌ ${test.name} - 失敗`);
    }
  }
  
  console.log("\n" + "=".repeat(50));
  console.log(`📊 測試結果: ${totalPassed}/${totalTests} 通過`);
  
  if (totalPassed === totalTests) {
    console.log("🎉 所有測試都通過！進階屬性實現符合 LINE Bot Flex Message 規範。");
    return true;
  } else {
    console.log("⚠️ 部分測試失敗，請檢查實現。");
    return false;
  }
}

// ============ 自動執行測試（僅在開發環境） ============
if (process.env.NODE_ENV === 'development') {
  // 可以在控制台手動調用: runAllTests()
  console.log("💡 提示：在控制台執行 runAllTests() 來測試 Flex Message 進階屬性");
}