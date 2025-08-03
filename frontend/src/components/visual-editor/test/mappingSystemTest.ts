/**
 * 積木映射系統綜合測試
 * 測試積木映射、別名解析和註冊系統的完整功能
 */

import { 
  mapBlockType, 
  getOldBlockTypes, 
  isValidBlockType,
  getBlockTypeInfo,
  getAllBlockAliases,
  getBlockAliasesByCategory,
  searchBlocks,
  normalizeBlockType,
  getMappingStatistics
} from '../utils/blockMapping';
import { blockRegistry } from '../blocks/registry';
import { BlockCategory } from '../../../types/block';

/**
 * 測試結果介面
 */
interface TestResult {
  testName: string;
  passed: boolean;
  details: string;
  error?: string;
}

/**
 * 測試套件
 */
class MappingSystemTester {
  private results: TestResult[] = [];

  /**
   * 執行測試
   */
  private test(testName: string, testFn: () => void): void {
    try {
      testFn();
      this.results.push({
        testName,
        passed: true,
        details: '測試通過'
      });
    } catch (error) {
      this.results.push({
        testName,
        passed: false,
        details: '測試失敗',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * 斷言方法
   */
  private assert(condition: boolean, message: string): void {
    if (!condition) {
      throw new Error(message);
    }
  }

  /**
   * 測試基本映射功能
   */
  private testBasicMapping(): void {
    this.test('基本映射功能', () => {
      // 測試舊格式到新格式的映射
      this.assert(
        mapBlockType('event') === 'text_message_event',
        '舊格式 "event" 應該映射到 "text_message_event"'
      );

      this.assert(
        mapBlockType('reply') === 'text_reply',
        '舊格式 "reply" 應該映射到 "text_reply"'
      );

      this.assert(
        mapBlockType('flex-container') === 'bubble_container',
        '舊格式 "flex-container" 應該映射到 "bubble_container"'
      );

      // 測試已經是新格式的ID
      this.assert(
        mapBlockType('text_message_event') === 'text_message_event',
        '新格式ID應該保持不變'
      );
    });
  }

  /**
   * 測試反向映射功能
   */
  private testReverseMapping(): void {
    this.test('反向映射功能', () => {
      const oldTypes = getOldBlockTypes('text_message_event');
      
      this.assert(
        oldTypes.includes('event'),
        '"text_message_event" 的舊格式應該包含 "event"'
      );

      this.assert(
        oldTypes.includes('message_event'),
        '"text_message_event" 的舊格式應該包含 "message_event"'
      );

      this.assert(
        oldTypes.includes('text_message_event'),
        '"text_message_event" 的舊格式應該包含自己'
      );
    });
  }

  /**
   * 測試積木類型驗證
   */
  private testBlockTypeValidation(): void {
    this.test('積木類型驗證', () => {
      // 測試有效的積木類型
      this.assert(
        isValidBlockType('text_message_event'),
        '"text_message_event" 應該是有效的積木類型'
      );

      this.assert(
        isValidBlockType('event'),
        '"event" 應該是有效的積木類型（通過別名）'
      );

      // 測試無效的積木類型
      this.assert(
        !isValidBlockType('invalid_block_type'),
        '"invalid_block_type" 應該是無效的積木類型'
      );
    });
  }

  /**
   * 測試積木資訊獲取
   */
  private testBlockInfo(): void {
    this.test('積木資訊獲取', () => {
      const info = getBlockTypeInfo('text_message_event');
      
      this.assert(
        info !== null,
        '應該能夠獲取 "text_message_event" 的資訊'
      );

      this.assert(
        info!.primaryId === 'text_message_event',
        '主要ID應該是 "text_message_event"'
      );

      this.assert(
        info!.category === BlockCategory.EVENT,
        '類別應該是 EVENT'
      );

      this.assert(
        info!.aliases.includes('event'),
        '別名應該包含 "event"'
      );

      // 測試通過別名獲取資訊
      const infoByAlias = getBlockTypeInfo('event');
      this.assert(
        infoByAlias !== null && infoByAlias.primaryId === 'text_message_event',
        '通過別名 "event" 應該能獲取正確的積木資訊'
      );
    });
  }

  /**
   * 測試類別篩選
   */
  private testCategoryFiltering(): void {
    this.test('類別篩選功能', () => {
      const eventBlocks = getBlockAliasesByCategory(BlockCategory.EVENT);
      
      this.assert(
        eventBlocks.length > 0,
        '應該有事件類別的積木'
      );

      this.assert(
        eventBlocks.every(block => block.category === BlockCategory.EVENT),
        '所有返回的積木都應該屬於事件類別'
      );

      const flexContainerBlocks = getBlockAliasesByCategory(BlockCategory.FLEX_CONTAINER);
      
      this.assert(
        flexContainerBlocks.length > 0,
        '應該有Flex容器類別的積木'
      );
    });
  }

  /**
   * 測試搜尋功能
   */
  private testSearchFunction(): void {
    this.test('搜尋功能', () => {
      // 搜尋事件相關積木
      const eventResults = searchBlocks('event');
      
      this.assert(
        eventResults.length > 0,
        '搜尋 "event" 應該有結果'
      );

      this.assert(
        eventResults.some(block => block.primaryId === 'text_message_event'),
        '搜尋結果應該包含文字訊息事件'
      );

      // 搜尋中文
      const chineseResults = searchBlocks('文字');
      
      this.assert(
        chineseResults.length > 0,
        '搜尋中文 "文字" 應該有結果'
      );

      // 搜尋部分匹配
      const partialResults = searchBlocks('reply');
      
      this.assert(
        partialResults.length > 0,
        '搜尋 "reply" 應該有結果'
      );
    });
  }

  /**
   * 測試映射統計
   */
  private testMappingStatistics(): void {
    this.test('映射統計功能', () => {
      const stats = getMappingStatistics();
      
      this.assert(
        stats.totalMappings > 0,
        '總映射數應該大於0'
      );

      this.assert(
        stats.totalAliases > 0,
        '總別名數應該大於0'
      );

      this.assert(
        typeof stats.coveragePercentage === 'number',
        '覆蓋率應該是數字'
      );

      this.assert(
        Object.keys(stats.categoryStats).length > 0,
        '應該有類別統計資料'
      );
    });
  }

  /**
   * 測試Registry別名支援
   */
  private testRegistryAliasSupport(): void {
    this.test('Registry別名支援', () => {
      // 假設已經有積木註冊
      const mockDefinition = {
        id: 'event', // 使用舊格式ID
        blockType: 'text_message_event',
        displayName: '文字訊息事件',
        category: BlockCategory.EVENT,
        color: 'bg-blue-500',
        compatibility: [],
        component: () => null,
      };

      // 註冊積木
      blockRegistry.register(mockDefinition);

      // 測試通過別名獲取
      const blockByAlias = blockRegistry.getBlock('event');
      this.assert(
        blockByAlias !== undefined,
        '應該能通過別名 "event" 獲取積木'
      );

      // 測試通過標準化ID獲取
      const blockByNormalizedId = blockRegistry.getBlock('text_message_event');
      this.assert(
        blockByNormalizedId !== undefined,
        '應該能通過標準化ID "text_message_event" 獲取積木'
      );

      // 測試hasBlock方法
      this.assert(
        blockRegistry.hasBlock('event'),
        'hasBlock應該識別別名 "event"'
      );

      this.assert(
        blockRegistry.hasBlock('text_message_event'),
        'hasBlock應該識別標準化ID "text_message_event"'
      );

      // 測試別名統計
      const aliasStats = blockRegistry.getAliasStatistics();
      this.assert(
        aliasStats.totalAliases > 0,
        '應該有別名映射統計'
      );

      // 測試別名搜尋
      const searchResults = blockRegistry.searchBlocksWithAliases('event');
      this.assert(
        searchResults.length > 0,
        '別名搜尋應該有結果'
      );
    });
  }

  /**
   * 測試邊界情況
   */
  private testEdgeCases(): void {
    this.test('邊界情況處理', () => {
      // 測試空字串
      this.assert(
        mapBlockType('') === '',
        '空字串應該返回空字串'
      );

      // 測試undefined/null處理
      try {
        // @ts-ignore - 故意測試錯誤輸入
        mapBlockType(null);
        this.assert(false, '應該處理null輸入');
      } catch (error) {
        // 預期會拋出錯誤或返回預設值
      }

      // 測試不存在的積木類型
      const unknownType = 'unknown_block_type_12345';
      const mappedUnknown = mapBlockType(unknownType);
      this.assert(
        mappedUnknown === unknownType,
        '不存在的積木類型應該返回原始值'
      );

      // 測試空搜尋
      const emptySearchResults = searchBlocks('');
      this.assert(
        Array.isArray(emptySearchResults),
        '空搜尋應該返回陣列'
      );
    });
  }

  /**
   * 執行所有測試
   */
  runAllTests(): { passed: number; failed: number; results: TestResult[] } {
    console.log('🧪 開始執行積木映射系統測試...');
    
    this.results = [];

    // 執行各項測試
    this.testBasicMapping();
    this.testReverseMapping();
    this.testBlockTypeValidation();
    this.testBlockInfo();
    this.testCategoryFiltering();
    this.testSearchFunction();
    this.testMappingStatistics();
    this.testRegistryAliasSupport();
    this.testEdgeCases();

    // 統計結果
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;

    console.log(`📊 測試完成: ${passed} 通過, ${failed} 失敗`);
    
    // 輸出失敗的測試詳情
    const failedTests = this.results.filter(r => !r.passed);
    if (failedTests.length > 0) {
      console.log('❌ 失敗的測試:');
      failedTests.forEach(test => {
        console.log(`  - ${test.testName}: ${test.error}`);
      });
    } else {
      console.log('✅ 所有測試都通過了！');
    }

    return {
      passed,
      failed,
      results: this.results
    };
  }
}

/**
 * 執行映射系統測試
 */
export function runMappingSystemTests() {
  const tester = new MappingSystemTester();
  return tester.runAllTests();
}

/**
 * 映射系統健康檢查
 */
export function mappingSystemHealthCheck() {
  console.log('🏥 映射系統健康檢查...');
  
  const stats = getMappingStatistics();
  console.log('📈 映射統計:', stats);
  
  const allAliases = getAllBlockAliases();
  console.log(`📝 總別名數: ${allAliases.length}`);
  
  // 檢查各類別覆蓋率
  Object.values(BlockCategory).forEach(category => {
    const categoryBlocks = getBlockAliasesByCategory(category);
    console.log(`📦 ${category} 類別: ${categoryBlocks.length} 個積木`);
  });

  // 檢查註冊表狀態
  const registryStats = blockRegistry.getStatistics();
  console.log('🗃️ 註冊表統計:', registryStats);
  
  const aliasStats = blockRegistry.getAliasStatistics();
  console.log('🔗 別名統計:', aliasStats);
  
  console.log('✅ 健康檢查完成');
  
  return {
    mappingStats: stats,
    registryStats,
    aliasStats,
    totalAliases: allAliases.length
  };
}

// 自動執行健康檢查（僅在開發環境）
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 開發環境：自動執行映射系統健康檢查');
  mappingSystemHealthCheck();
}