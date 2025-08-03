/**
 * 簡單的測試執行器
 * 用於在瀏覽器環境中測試 Flex Message 進階屬性
 */

import { runAllTests } from './flexMessageTest.ts';

// 在控制台中可用的測試函數
window.testFlexMessage = () => {
  console.log("開始測試 Flex Message 進階屬性實現...");
  return runAllTests();
};

// 提供便捷的測試啟動
window.runFlexTests = window.testFlexMessage;

// 自動提示
console.log("💡 Flex Message 測試已載入");
console.log("📋 在控制台執行 testFlexMessage() 或 runFlexTests() 開始測試");
console.log("🔧 所有進階屬性已實現，包括：");
console.log("   - 定位屬性 (Position): absolute, relative");
console.log("   - 邊框屬性 (Border): borderWidth, borderColor, cornerRadius");
console.log("   - 漸層背景 (Gradient): linearGradient 支援");
console.log("   - 陰影效果 (Shadow): boxShadow, textShadow");
console.log("   - 進階間距 (Advanced Spacing): 細緻的 padding, margin 控制");
console.log("   - 佈局增強: justifyContent, alignItems, 完整 flex 支援");

export { runAllTests };