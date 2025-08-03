/**
 * 積木模組統一導出
 * 自動載入和註冊所有積木定義
 */

export * from "./types";
export * from "./registry";

// 導入所有積木類別
import * as EventBlocks from "./event";
import * as ReplyBlocks from "./reply";
import * as ControlBlocks from "./control";
import * as SettingBlocks from "./setting";
import * as FlexContainerBlocks from "./flex-container";
import * as FlexContentBlocks from "./flex-content";
import * as FlexLayoutBlocks from "./flex-layout";

import { blockRegistry } from "./registry";
import { BlockDefinition } from "./types";

/**
 * 自動註冊所有積木
 */
export function initializeBlocks(): void {
  console.log("🚀 開始初始化積木系統...");

  const allBlockModules = [
    EventBlocks,
    ReplyBlocks,
    ControlBlocks,
    SettingBlocks,
    FlexContainerBlocks,
    FlexContentBlocks,
    FlexLayoutBlocks,
  ];

  const allDefinitions: BlockDefinition[] = [];

  // 收集所有積木定義
  allBlockModules.forEach((blockModule) => {
    Object.values(blockModule).forEach((exportedItem) => {
      if (
        exportedItem &&
        typeof exportedItem === "object" &&
        "id" in exportedItem
      ) {
        allDefinitions.push(exportedItem as BlockDefinition);
      }
    });
  });

  // 批量註冊積木
  if (allDefinitions.length > 0) {
    blockRegistry.registerBatch(allDefinitions);
    console.log(
      `✅ 積木系統初始化完成，共載入 ${allDefinitions.length} 個積木`
    );
  } else {
    console.warn("⚠️ 未找到任何積木定義");
  }

  // 輸出統計資訊
  const stats = blockRegistry.getStatistics();
  console.log("📊 積木統計:", stats);
}

/**
 * 重新載入積木系統
 */
export function reloadBlocks(): void {
  console.log("🔄 重新載入積木系統...");
  blockRegistry.reset();
  initializeBlocks();
}

// 自動初始化（僅在生產環境中）
if (typeof window !== "undefined" && process.env.NODE_ENV !== "test") {
  // 延遲初始化以確保所有模組都已載入
  setTimeout(() => {
    initializeBlocks();
  }, 100);
}
