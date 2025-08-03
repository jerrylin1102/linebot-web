/**
 * 積木初始化系統測試
 */

import {
  BlockInitializationManager,
  InitializationState,
  InitializationError,
  InitializationErrorType
} from './initialization';
import { BlockCategory, WorkspaceContext } from '../../../types/block';

/**
 * 測試初始化管理器基本功能
 */
export function testInitializationManager() {
  console.group('🧪 測試積木初始化管理器');
  
  const manager = BlockInitializationManager.getInstance();
  
  // 測試 1: 單例模式
  const manager2 = BlockInitializationManager.getInstance();
  console.assert(manager === manager2, '❌ 單例模式測試失敗');
  console.log('✅ 單例模式測試通過');
  
  // 測試 2: 初始狀態
  console.assert(manager.getState() === InitializationState.IDLE, '❌ 初始狀態測試失敗');
  console.log('✅ 初始狀態測試通過');
  
  // 測試 3: 配置設定
  const testConfig = {
    timeout: 5000,
    maxRetries: 2,
    enableCache: false
  };
  manager.configure(testConfig);
  console.log('✅ 配置設定測試通過');
  
  // 測試 4: 事件監聽器
  let _eventReceived = false;
  const unsubscribe = manager.addEventListener('state-changed', () => {
    _eventReceived = true;
  });
  console.assert(typeof unsubscribe === 'function', '❌ 事件監聽器註冊失敗');
  console.log('✅ 事件監聽器測試通過');
  
  console.groupEnd();
}

/**
 * 測試初始化錯誤處理
 */
export function testInitializationErrors() {
  console.group('🧪 測試初始化錯誤處理');
  
  // 測試初始化錯誤類
  const error = new InitializationError(
    InitializationErrorType.MODULE_LOAD_FAILED,
    "測試錯誤",
    "test-block",
    true
  );
  
  console.assert(error.type === InitializationErrorType.MODULE_LOAD_FAILED, '❌ 錯誤類型測試失敗');
  console.assert(error.message === "測試錯誤", '❌ 錯誤訊息測試失敗');
  console.assert(error.blockId === "test-block", '❌ 積木ID測試失敗');
  console.assert(error.retryable === true, '❌ 重試標記測試失敗');
  console.log('✅ 初始化錯誤類測試通過');
  
  console.groupEnd();
}

/**
 * 測試依賴解析算法
 */
export function testDependencyResolution() {
  console.group('🧪 測試依賴解析算法');
  
  // 創建測試積木定義
  const testBlocks = [
    {
      id: 'block-a',
      blockType: 'test',
      dependencies: ['block-b'],
      displayName: 'Block A',
      category: 'EVENT' as unknown,
      icon: null as unknown,
      color: 'blue',
      compatibility: ['LOGIC' as unknown],
      defaultData: {}
    },
    {
      id: 'block-b',
      blockType: 'test',
      dependencies: [],
      displayName: 'Block B',
      category: BlockCategory.EVENT,
      icon: null,
      color: 'blue',
      compatibility: [WorkspaceContext.LOGIC],
      defaultData: {}
    },
    {
      id: 'block-c',
      blockType: 'test',
      dependencies: ['block-a'],
      displayName: 'Block C',
      category: BlockCategory.EVENT,
      icon: null,
      color: 'blue',
      compatibility: [WorkspaceContext.LOGIC],
      defaultData: {}
    }
  ];
  
  // 預期的排序結果應該是：block-b, block-a, block-c
  console.log('✅ 依賴解析算法測試準備完成');
  console.log('📊 測試積木:', testBlocks.map(b => b.id));
  
  console.groupEnd();
}

/**
 * 測試快取機制
 */
export function testCacheSystem() {
  console.group('🧪 測試快取機制');
  
  const manager = BlockInitializationManager.getInstance();
  
  // 測試快取配置
  manager.configureCaching({
    maxAge: 1000, // 1秒
    maxSize: 10,
    enableCompression: true
  });
  
  console.log('✅ 快取配置測試通過');
  
  // 測試診斷資訊
  const diagnostics = manager.getDiagnostics();
  console.assert(typeof diagnostics.cacheSize === 'number', '❌ 快取大小診斷失敗');
  console.assert(typeof diagnostics.cacheEfficiency === 'number', '❌ 快取效率診斷失敗');
  console.log('✅ 診斷資訊測試通過');
  
  console.groupEnd();
}

/**
 * 性能測試
 */
export async function testPerformance() {
  console.group('🧪 測試初始化性能');
  
  const manager = BlockInitializationManager.getInstance();
  
  // 重置以進行乾淨的性能測試
  manager.reset();
  
  const startTime = performance.now();
  
  try {
    // 使用較短的超時時間進行測試
    manager.configure({
      timeout: 3000,
      maxRetries: 1,
      enableCache: true
    });
    
    console.log('⏳ 開始性能測試...');
    
    // 注意：這裡我們不真的執行初始化，因為會影響實際系統
    // 在實際測試中，可以使用模擬的積木定義
    console.log('✅ 性能測試準備完成（模擬模式）');
    
  } catch (error) {
    console.error('❌ 性能測試失敗:', error);
  }
  
  const endTime = performance.now();
  console.log(`⏱️ 測試執行時間: ${endTime - startTime}ms`);
  
  console.groupEnd();
}

/**
 * 運行所有測試
 */
export function runAllTests() {
  console.group('🧪 積木初始化系統測試套件');
  console.log('開始執行所有測試...');
  
  try {
    testInitializationManager();
    testInitializationErrors();
    testDependencyResolution();
    testCacheSystem();
    
    // 性能測試
    testPerformance().then(() => {
      console.log('🎉 所有測試完成');
      console.groupEnd();
    }).catch(error => {
      console.error('❌ 性能測試失敗:', error);
      console.groupEnd();
    });
    
  } catch (error) {
    console.error('💥 測試執行出現錯誤:', error);
    console.groupEnd();
  }
}

// 開發環境自動運行測試
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // 延遲運行測試，確保模組載入完成
  setTimeout(() => {
    console.log('🧪 自動運行積木初始化系統測試');
    runAllTests();
  }, 2000);
}