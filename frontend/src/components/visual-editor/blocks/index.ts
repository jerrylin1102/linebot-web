/**
 * 積木模組統一導出
 * 自動載入和註冊所有積木定義
 */

export * from "./types";
export * from "./registry";
export * from "./initialization";

// 導入新的初始化管理器
import { 
  blockInitializationManager,
  InitializationState,
  InitializationResult,
  InitializationError,
  InitializationErrorType
} from "./initialization";
import { blockRegistry } from "./registry";

/**
 * 新的積木初始化函數（使用 Promise-based 初始化管理器）
 */
export async function initializeBlocks(): Promise<InitializationResult> {
  console.log("🚀 開始初始化積木系統（新版本）...");
  
  try {
    const result = await blockInitializationManager.initialize();
    
    if (result.success) {
      console.log(`✅ 積木系統初始化完成，共載入 ${result.blocksLoaded} 個積木`);
      console.log(`⏱️ 初始化時間: ${result.totalTime}ms`);
      
      // 輸出統計資訊
      const stats = blockRegistry.getStatistics();
      console.log("📊 積木統計:", stats);
      
      // 輸出診斷資訊（開發環境）
      if (process.env.NODE_ENV === 'development') {
        const diagnostics = blockInitializationManager.getDiagnostics();
        console.log("🔍 初始化診斷:", diagnostics);
      }
    } else {
      console.error("❌ 積木系統初始化失敗:", result.errors);
    }
    
    return result;
  } catch (error) {
    console.error("💥 積木系統初始化出現未預期錯誤:", error);
    throw error;
  }
}

/**
 * 舊版本的同步初始化函數（向後相容）
 * @deprecated 請使用新的 initializeBlocks() 異步版本
 */
export function initializeBlocksLegacy(): void {
  console.warn("⚠️ 使用舊版本的積木初始化函數，建議遷移至新版本");
  
  // 啟動異步初始化但不等待結果
  initializeBlocks().catch(error => {
    console.error("舊版本初始化回退失敗:", error);
  });
}

/**
 * 重新初始化積木系統
 */
export async function reinitializeBlocks(): Promise<InitializationResult> {
  console.log("🔄 重新初始化積木系統...");
  return await blockInitializationManager.reinitialize();
}

/**
 * 重新載入積木系統（向後相容）
 */
export function reloadBlocks(): void {
  console.log("🔄 重新載入積木系統...");
  reinitializeBlocks().catch(error => {
    console.error("重新載入失敗:", error);
  });
}

/**
 * 等待積木系統準備就緒
 */
export async function waitForBlocksReady(): Promise<void> {
  await blockInitializationManager.waitForReady();
}

/**
 * 檢查積木系統是否已準備就緒
 */
export function isBlocksReady(): boolean {
  return blockInitializationManager.isReady();
}

/**
 * 獲取初始化狀態
 */
export function getInitializationState(): InitializationState {
  return blockInitializationManager.getState();
}

/**
 * 配置初始化設定
 */
export function configureBlockInitialization(config: {
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
  enableCache?: boolean;
  enableDiagnostics?: boolean;
}) {
  blockInitializationManager.configure(config);
}

/**
 * 添加初始化事件監聽器
 */
export function addInitializationListener(
  eventType: 'state-changed' | 'progress-updated' | 'error-occurred' | 'initialization-completed',
  listener: (event: any) => void
): () => void {
  return blockInitializationManager.addEventListener(eventType, listener);
}

// 自動初始化（使用新的 Promise-based 系統）
if (typeof window !== "undefined" && process.env.NODE_ENV !== "test") {
  console.log("🏁 啟動積木系統自動初始化...");
  
  // 使用新的 Promise-based 初始化，不再依賴 setTimeout
  let initializationStarted = false;
  
  function startInitialization() {
    if (initializationStarted) return;
    initializationStarted = true;
    
    initializeBlocks()
      .then(result => {
        if (result.success) {
          console.log("🎉 積木系統自動初始化成功");
        } else {
          console.error("💥 積木系統自動初始化失敗，錯誤:", result.errors);
        }
      })
      .catch(error => {
        console.error("💥 積木系統自動初始化出現未預期錯誤:", error);
      });
  }
  
  // 確保 DOM 和所有模組都已載入
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startInitialization);
  } else {
    // DOM 已經載入，立即開始初始化
    startInitialization();
  }
}
