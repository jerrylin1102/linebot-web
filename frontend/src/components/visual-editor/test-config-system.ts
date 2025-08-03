/**
 * 積木配置系統功能測試腳本
 * 可在瀏覽器控制台中運行
 */

import { blockRegistry } from "./blocks/registry";
import { blockInitializationManager } from "./blocks/initialization";

/**
 * 測試配置系統的基本功能
 */
export async function testConfigSystem() {
  console.log("🧪 開始測試積木配置系統...");
  
  try {
    // 1. 初始化積木系統
    console.log("📦 步驟1: 初始化積木系統");
    const result = await blockInitializationManager.initialize();
    
    if (!result.success) {
      throw new Error(`初始化失敗: ${result.errors.map(e => e.message).join(', ')}`);
    }
    
    console.log(`✅ 初始化成功，載入了 ${result.blocksLoaded} 個積木`);
    
    // 2. 檢查積木註冊表
    console.log("📝 步驟2: 檢查積木註冊表");
    const allBlocks = blockRegistry.getAllBlocks();
    console.log(`📊 總計積木數量: ${allBlocks.length}`);
    
    // 3. 查找有配置選項的積木
    console.log("🔍 步驟3: 查找有配置選項的積木");
    const blocksWithConfig = allBlocks
      .map(item => item.definition)
      .filter(def => def.configOptions && def.configOptions.length > 0);
    
    console.log(`✨ 找到 ${blocksWithConfig.length} 個有配置選項的積木:`);
    
    blocksWithConfig.forEach(block => {
      console.log(`  • ${block.displayName} (${block.id}): ${block.configOptions?.length} 個配置選項`);
    });
    
    // 4. 測試特定積木的配置
    if (blocksWithConfig.length > 0) {
      console.log("🔧 步驟4: 測試積木配置");
      const testBlock = blocksWithConfig[0];
      console.log(`🎯 測試積木: ${testBlock.displayName}`);
      
      if (testBlock.configOptions) {
        console.log("配置選項詳情:");
        testBlock.configOptions.forEach((option, index) => {
          console.log(`  ${index + 1}. ${option.label} (${option.key})`);
          console.log(`     類型: ${option.type}`);
          console.log(`     預設值: ${option.defaultValue}`);
          console.log(`     必填: ${option.required ? 'Yes' : 'No'}`);
          if (option.options) {
            console.log(`     選項: ${option.options.map(o => o.label).join(', ')}`);
          }
        });
      }
      
      // 測試預設數據
      console.log("📋 預設數據:");
      console.log(JSON.stringify(testBlock.defaultData, null, 2));
    }
    
    // 5. 測試積木顏色和顯示
    console.log("🎨 步驟5: 測試積木顯示屬性");
    blocksWithConfig.slice(0, 3).forEach(block => {
      console.log(`  • ${block.displayName}: 顏色=${block.color}, 類別=${block.category}`);
    });
    
    // 6. 統計信息
    console.log("📈 步驟6: 系統統計");
    const stats = blockRegistry.getStatistics();
    console.log("積木統計:", stats);
    
    console.log("✅ 測試完成！積木配置系統運行正常。");
    return {
      success: true,
      totalBlocks: allBlocks.length,
      blocksWithConfig: blocksWithConfig.length,
      testBlock: blocksWithConfig[0],
      stats
    };
    
  } catch (error) {
    console.error("❌ 測試失敗:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "未知錯誤"
    };
  }
}

/**
 * 測試配置數據的設置和獲取
 */
export function testConfigDataManipulation() {
  console.log("🔄 測試配置數據操作...");
  
  const testData = {
    text: "測試文字",
    "properties.size": "lg",
    "properties.color": "#FF0000",
    "properties.weight": "bold"
  };
  
  // 模擬 ConfigFormField 的數據處理
  const getNestedValue = (obj: Record<string, unknown>, path: string): unknown => {
    if (path.includes('.')) {
      const [parent, child] = path.split('.');
      const parentObj = obj[parent] as Record<string, unknown>;
      return parentObj?.[child];
    }
    return obj[path];
  };
  
  const setNestedValue = (obj: Record<string, unknown>, path: string, value: unknown): void => {
    if (path.includes('.')) {
      const [parent, child] = path.split('.');
      if (!obj[parent] || typeof obj[parent] !== 'object') {
        obj[parent] = {};
      }
      (obj[parent] as Record<string, unknown>)[child] = value;
    } else {
      obj[path] = value;
    }
  };
  
  console.log("原始數據:", testData);
  
  // 測試讀取
  console.log("讀取 text:", getNestedValue(testData, 'text'));
  console.log("讀取 properties.size:", getNestedValue(testData, 'properties.size'));
  
  // 測試設置
  const newData = { ...testData };
  setNestedValue(newData, 'properties.align', 'center');
  setNestedValue(newData, 'newField', 'newValue');
  
  console.log("修改後數據:", newData);
  console.log("✅ 配置數據操作測試完成");
}

// 導出到全局作用域以便在控制台中使用
if (typeof window !== 'undefined') {
  (window as unknown as { testConfigSystem: typeof testConfigSystem; testConfigDataManipulation: typeof testConfigDataManipulation }).testConfigSystem = testConfigSystem;
  (window as unknown as { testConfigSystem: typeof testConfigSystem; testConfigDataManipulation: typeof testConfigDataManipulation }).testConfigDataManipulation = testConfigDataManipulation;
}