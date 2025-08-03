/**
 * 積木註冊系統
 * 管理所有積木的註冊、發現和載入
 */

import {
  BlockDefinition,
  BlockRegistryItem,
  BlockFilterOptions,
  BlockLoadState,
  BlockValidationResult,
  BlockCategoryConfig,
} from "./types";
import { BlockCategory, WorkspaceContext } from "../../../types/block";
import { 
  mapBlockType, 
  getOldBlockTypes, 
  isValidBlockType,
  getBlockTypeInfo,
  normalizeBlockType
} from "../utils/blockMapping";
import {
  Zap,
  MessageSquare,
  ArrowRight,
  Settings,
  Square,
  Type,
  MousePointer,
  Hand,
} from "lucide-react";

/**
 * 積木註冊表
 */
class BlockRegistry {
  private static instance: BlockRegistry;
  private blocks: Map<string, BlockRegistryItem> = new Map();
  private aliases: Map<string, string> = new Map(); // 別名到主要ID的映射
  private loadState: BlockLoadState = {
    loading: false,
    loadedCount: 0,
    totalCount: 0,
    progress: 0,
  };
  private listeners: Set<(blocks: BlockRegistryItem[]) => void> = new Set();

  /**
   * 獲取單例實例
   */
  static getInstance(): BlockRegistry {
    if (!BlockRegistry.instance) {
      BlockRegistry.instance = new BlockRegistry();
    }
    return BlockRegistry.instance;
  }

  /**
   * 註冊積木
   */
  register(definition: BlockDefinition): void {
    const validation = this.validateBlockDefinition(definition);
    if (!validation.valid) {
      console.error(`積木註冊失敗 ${definition.id}:`, validation.errors);
      throw new Error(`積木註冊失敗: ${validation.errors.join(", ")}`);
    }

    if (validation.warnings.length > 0) {
      console.warn(`積木註冊警告 ${definition.id}:`, validation.warnings);
    }

    // 標準化積木ID
    const normalizedId = normalizeBlockType(definition.id);
    const registryItem: BlockRegistryItem = {
      definition: {
        ...definition,
        id: normalizedId, // 使用標準化後的ID
      },
      registeredAt: new Date(),
      enabled: true,
    };

    this.blocks.set(normalizedId, registryItem);
    
    // 註冊別名映射
    this.registerAliases(normalizedId);
    
    this.updateLoadState();
    this.notifyListeners();

    console.log(
      `✅ 積木註冊成功: ${normalizedId} (${definition.displayName})`
    );
  }

  /**
   * 批量註冊積木
   */
  registerBatch(definitions: BlockDefinition[]): void {
    console.log(`🔄 開始批量註冊 ${definitions.length} 個積木...`);

    let successCount = 0;
    let errorCount = 0;

    definitions.forEach((definition) => {
      try {
        this.register(definition);
        successCount++;
      } catch (error) {
        console.error(`積木 ${definition.id} 註冊失敗:`, error);
        errorCount++;
      }
    });

    console.log(`📊 批量註冊完成: 成功 ${successCount}，失敗 ${errorCount}`);
  }

  /**
   * 取消註冊積木
   */
  unregister(blockId: string): boolean {
    const success = this.blocks.delete(blockId);
    if (success) {
      this.updateLoadState();
      this.notifyListeners();
      console.log(`🗑️ 積木取消註冊: ${blockId}`);
    }
    return success;
  }

  /**
   * 獲取積木定義（支援別名查詢）
   */
  getBlock(blockId: string): BlockDefinition | undefined {
    // 首先嘗試直接查詢
    let definition = this.blocks.get(blockId)?.definition;
    if (definition) {
      return definition;
    }

    // 嘗試通過別名查詢
    const mappedId = this.resolveAlias(blockId);
    if (mappedId && mappedId !== blockId) {
      definition = this.blocks.get(mappedId)?.definition;
      if (definition) {
        console.log(`🔄 通過別名 "${blockId}" 找到積木: ${mappedId}`);
        return definition;
      }
    }

    // 嘗試標準化後查詢
    const normalizedId = normalizeBlockType(blockId);
    if (normalizedId !== blockId) {
      definition = this.blocks.get(normalizedId)?.definition;
      if (definition) {
        console.log(`🔄 通過標準化 "${blockId}" → "${normalizedId}" 找到積木`);
        return definition;
      }
    }

    console.warn(`⚠️ 未找到積木: ${blockId}`);
    return undefined;
  }

  /**
   * 獲取所有積木
   */
  getAllBlocks(): BlockRegistryItem[] {
    return Array.from(this.blocks.values());
  }

  /**
   * 按類別獲取積木
   */
  getBlocksByCategory(category: BlockCategory): BlockRegistryItem[] {
    return this.getAllBlocks().filter(
      (item) => item.definition.category === category && item.enabled
    );
  }

  /**
   * 按相容性獲取積木
   */
  getBlocksByCompatibility(context: WorkspaceContext): BlockRegistryItem[] {
    return this.getAllBlocks().filter(
      (item) => item.definition.compatibility.includes(context) && item.enabled
    );
  }

  /**
   * 過濾積木
   */
  filterBlocks(options: BlockFilterOptions): BlockRegistryItem[] {
    let blocks = this.getAllBlocks();

    // 僅顯示啟用的積木
    if (options.enabledOnly !== false) {
      blocks = blocks.filter((item) => item.enabled);
    }

    // 按類別過濾
    if (options.categories && options.categories.length > 0) {
      blocks = blocks.filter((item) =>
        options.categories!.includes(item.definition.category)
      );
    }

    // 按相容性過濾
    if (options.compatibility) {
      blocks = blocks.filter((item) =>
        item.definition.compatibility.includes(options.compatibility!)
      );
    }

    // 按標籤過濾
    if (options.tags && options.tags.length > 0) {
      blocks = blocks.filter((item) => {
        const blockTags = item.definition.tags || [];
        return options.tags!.some((tag) => blockTags.includes(tag));
      });
    }

    // 搜尋過濾
    if (options.searchQuery) {
      const query = options.searchQuery.toLowerCase();
      blocks = blocks.filter((item) => {
        const def = item.definition;
        return (
          def.displayName.toLowerCase().includes(query) ||
          (def.description && def.description.toLowerCase().includes(query)) ||
          def.blockType.toLowerCase().includes(query) ||
          (def.tags &&
            def.tags.some((tag) => tag.toLowerCase().includes(query)))
        );
      });
    }

    // 是否顯示實驗性積木
    if (options.showExperimental === false) {
      blocks = blocks.filter((item) => !item.definition.experimental);
    }

    return blocks;
  }

  /**
   * 搜尋積木
   */
  searchBlocks(query: string): BlockRegistryItem[] {
    return this.filterBlocks({ searchQuery: query });
  }

  /**
   * 獲取積木統計
   */
  getStatistics() {
    const allBlocks = this.getAllBlocks();
    const enabledBlocks = allBlocks.filter((item) => item.enabled);

    const categoryStats = Object.values(BlockCategory).reduce(
      (stats, category) => {
        stats[category] = enabledBlocks.filter(
          (item) => item.definition.category === category
        ).length;
        return stats;
      },
      {} as Record<BlockCategory, number>
    );

    const compatibilityStats = Object.values(WorkspaceContext).reduce(
      (stats, context) => {
        stats[context] = enabledBlocks.filter((item) =>
          item.definition.compatibility.includes(context)
        ).length;
        return stats;
      },
      {} as Record<WorkspaceContext, number>
    );

    return {
      total: allBlocks.length,
      enabled: enabledBlocks.length,
      disabled: allBlocks.length - enabledBlocks.length,
      experimental: enabledBlocks.filter((item) => item.definition.experimental)
        .length,
      categoryStats,
      compatibilityStats,
    };
  }

  /**
   * 驗證積木定義
   */
  private validateBlockDefinition(
    definition: BlockDefinition
  ): BlockValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // 必填欄位檢查
    if (!definition.id) errors.push("積木 ID 不能為空");
    if (!definition.blockType) errors.push("積木類型不能為空");
    if (!definition.displayName) errors.push("顯示名稱不能為空");
    if (!definition.category) errors.push("積木類別不能為空");
    if (!definition.color) errors.push("積木顏色不能為空");
    if (!definition.compatibility || definition.compatibility.length === 0) {
      errors.push("相容性配置不能為空");
    }

    // 重複 ID 檢查
    if (definition.id && this.blocks.has(definition.id)) {
      errors.push(`積木 ID "${definition.id}" 已存在`);
    }

    // 類別有效性檢查
    if (
      definition.category &&
      !Object.values(BlockCategory).includes(definition.category)
    ) {
      errors.push(`無效的積木類別: ${definition.category}`);
    }

    // 相容性有效性檢查
    if (definition.compatibility) {
      const invalidContexts = definition.compatibility.filter(
        (context) => !Object.values(WorkspaceContext).includes(context)
      );
      if (invalidContexts.length > 0) {
        errors.push(`無效的工作區上下文: ${invalidContexts.join(", ")}`);
      }
    }

    // 顏色格式檢查
    if (
      definition.color &&
      !definition.color.match(/^(bg-\w+-\d+|#[0-9a-fA-F]{6})$/)
    ) {
      warnings.push("建議使用 Tailwind CSS 色彩類別或有效的十六進位色彩");
    }

    // 建議檢查
    if (!definition.description) {
      suggestions.push("建議添加積木描述以提高可用性");
    }
    if (!definition.tags || definition.tags.length === 0) {
      suggestions.push("建議添加標籤以改善搜尋體驗");
    }
    if (!definition.usageHints || definition.usageHints.length === 0) {
      suggestions.push("建議添加使用提示以幫助用戶");
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestions,
    };
  }

  /**
   * 更新載入狀態
   */
  private updateLoadState(): void {
    const totalCount = this.blocks.size;
    this.loadState = {
      ...this.loadState,
      loadedCount: totalCount,
      totalCount,
      progress: totalCount > 0 ? 100 : 0,
    };
  }

  /**
   * 通知監聽器
   */
  private notifyListeners(): void {
    const blocks = this.getAllBlocks();
    this.listeners.forEach((listener) => {
      try {
        listener(blocks);
      } catch (error) {
        console.error("積木註冊監聽器執行錯誤:", error);
      }
    });
  }

  /**
   * 添加變更監聽器
   */
  addListener(listener: (blocks: BlockRegistryItem[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * 獲取載入狀態
   */
  getLoadState(): BlockLoadState {
    return { ...this.loadState };
  }

  /**
   * 重置註冊表
   */
  reset(): void {
    this.blocks.clear();
    this.updateLoadState();
    this.notifyListeners();
    console.log("🔄 積木註冊表已重置");
  }

  /**
   * 啟用/停用積木
   */
  setBlockEnabled(blockId: string, enabled: boolean): boolean {
    const resolvedId = this.resolveAlias(blockId);
    const registryItem = this.blocks.get(resolvedId);
    if (registryItem) {
      registryItem.enabled = enabled;
      this.notifyListeners();
      console.log(
        `${enabled ? "✅" : "❌"} 積木 ${resolvedId} ${enabled ? "已啟用" : "已停用"}`
      );
      return true;
    }
    return false;
  }

  /**
   * 註冊別名映射
   */
  private registerAliases(primaryId: string): void {
    const blockInfo = getBlockTypeInfo(primaryId);
    if (blockInfo) {
      // 註冊主要ID到自己的映射
      this.aliases.set(primaryId, primaryId);
      
      // 註冊所有別名到主要ID的映射
      blockInfo.aliases.forEach(alias => {
        this.aliases.set(alias, primaryId);
        console.log(`🔗 註冊別名映射: ${alias} → ${primaryId}`);
      });

      // 註冊舊格式ID的映射
      const oldTypes = getOldBlockTypes(primaryId);
      oldTypes.forEach(oldType => {
        if (oldType !== primaryId) {
          this.aliases.set(oldType, primaryId);
          console.log(`🔗 註冊舊格式映射: ${oldType} → ${primaryId}`);
        }
      });
    }
  }

  /**
   * 解析別名到主要ID
   */
  private resolveAlias(blockId: string): string {
    // 首先查看本地別名映射
    const localMapped = this.aliases.get(blockId);
    if (localMapped) {
      return localMapped;
    }

    // 使用映射系統進行標準化
    const normalized = normalizeBlockType(blockId);
    if (normalized !== blockId) {
      // 如果標準化後的ID存在於註冊表中，使用它
      if (this.blocks.has(normalized)) {
        return normalized;
      }
    }

    return blockId;
  }

  /**
   * 獲取積木的所有別名
   */
  getBlockAliases(blockId: string): string[] {
    const resolvedId = this.resolveAlias(blockId);
    const aliases: string[] = [];
    
    // 查找所有映射到此主要ID的別名
    this.aliases.forEach((primaryId, alias) => {
      if (primaryId === resolvedId) {
        aliases.push(alias);
      }
    });

    return aliases;
  }

  /**
   * 檢查積木ID是否存在（包含別名）
   */
  hasBlock(blockId: string): boolean {
    const resolvedId = this.resolveAlias(blockId);
    return this.blocks.has(resolvedId);
  }

  /**
   * 檢查積木類型是否有效
   */
  isValidBlockType(blockType: string): boolean {
    return isValidBlockType(blockType) || this.aliases.has(blockType);
  }

  /**
   * 獲取別名映射統計
   */
  getAliasStatistics() {
    const totalAliases = this.aliases.size;
    const uniquePrimaryIds = new Set(this.aliases.values()).size;
    
    return {
      totalAliases,
      uniquePrimaryIds,
      averageAliasesPerBlock: totalAliases / uniquePrimaryIds,
      aliasMapping: Object.fromEntries(this.aliases.entries()),
    };
  }

  /**
   * 搜尋積木（支援別名搜尋）
   */
  searchBlocksWithAliases(query: string): BlockRegistryItem[] {
    const results = this.searchBlocks(query);
    const queryLower = query.toLowerCase();
    
    // 額外搜尋別名
    const aliasMatches: BlockRegistryItem[] = [];
    this.aliases.forEach((primaryId, alias) => {
      if (alias.toLowerCase().includes(queryLower)) {
        const block = this.blocks.get(primaryId);
        if (block && !results.includes(block)) {
          aliasMatches.push(block);
        }
      }
    });

    return [...results, ...aliasMatches];
  }
}

/**
 * 積木類別配置
 */
export const BLOCK_CATEGORY_CONFIGS: BlockCategoryConfig[] = [
  {
    category: BlockCategory.EVENT,
    displayName: "事件",
    icon: Zap,
    description: "觸發 LINE Bot 邏輯的事件積木",
    order: 1,
    showInContext: [WorkspaceContext.LOGIC],
  },
  {
    category: BlockCategory.REPLY,
    displayName: "回覆",
    icon: MessageSquare,
    description: "回應用戶訊息的積木",
    order: 2,
    showInContext: [WorkspaceContext.LOGIC],
  },
  {
    category: BlockCategory.CONTROL,
    displayName: "控制",
    icon: ArrowRight,
    description: "控制程式流程的邏輯積木",
    order: 3,
    showInContext: [WorkspaceContext.LOGIC, WorkspaceContext.FLEX],
  },
  {
    category: BlockCategory.SETTING,
    displayName: "設定",
    icon: Settings,
    description: "變數和資料管理積木",
    order: 4,
    showInContext: [WorkspaceContext.LOGIC],
  },
  {
    category: BlockCategory.FLEX_CONTAINER,
    displayName: "容器",
    icon: Square,
    description: "Flex Message 容器積木",
    order: 5,
    showInContext: [WorkspaceContext.LOGIC, WorkspaceContext.FLEX],
  },
  {
    category: BlockCategory.FLEX_CONTENT,
    displayName: "內容",
    icon: Type,
    description: "Flex Message 內容積木",
    order: 6,
    showInContext: [WorkspaceContext.LOGIC, WorkspaceContext.FLEX],
  },
  {
    category: BlockCategory.FLEX_LAYOUT,
    displayName: "佈局",
    icon: MousePointer,
    description: "Flex Message 佈局和排版積木",
    order: 7,
    showInContext: [WorkspaceContext.FLEX, WorkspaceContext.LOGIC],
  },
  {
    category: BlockCategory.ACTION,
    displayName: "互動動作",
    icon: Hand,
    description: "LINE Bot 互動動作積木",
    order: 8,
    showInContext: [WorkspaceContext.LOGIC, WorkspaceContext.FLEX],
  },
];

/**
 * 獲取類別配置
 */
export function getCategoryConfig(
  category: BlockCategory
): BlockCategoryConfig | undefined {
  return BLOCK_CATEGORY_CONFIGS.find((config) => config.category === category);
}

/**
 * 獲取上下文中顯示的類別
 */
export function getCategoriesForContext(
  context: WorkspaceContext
): BlockCategoryConfig[] {
  return BLOCK_CATEGORY_CONFIGS.filter((config) =>
    config.showInContext.includes(context)
  ).sort((a, b) => a.order - b.order);
}

// 導出單例實例
export const blockRegistry = BlockRegistry.getInstance();
