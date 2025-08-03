import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import DraggableBlock from "./DraggableBlock";
import { Info, Filter } from "lucide-react";
import { BlockCategory, WorkspaceContext } from "../../types/block";
import {
  getBlockCompatibility,
  getBlockUsageSuggestions,
} from "../../utils/blockCompatibility";
import {
  blockRegistry,
  getCategoryConfig,
  getCategoriesForContext,
} from "./blocks/registry";
import { BlockRegistryItem } from "./blocks/types";
// 導入新的初始化系統
import { 
  waitForBlocksReady, 
  isBlocksReady,
  getInitializationState,
  addInitializationListener,
  InitializationState 
} from "./blocks";

interface BlockCategoryProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  context?: WorkspaceContext;
  categoryType?: BlockCategory;
}

const BlockCategoryComponent: React.FC<BlockCategoryProps> = ({
  title,
  icon: Icon,
  children,
  context,
  categoryType,
}) => {
  const isCompatible =
    categoryType && context
      ? getBlockCompatibility(categoryType).includes(context)
      : true;

  return (
    <div className={`mb-4 ${!isCompatible ? "opacity-50" : ""}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center text-sm font-medium text-gray-700">
          <Icon className="w-4 h-4 mr-2" />
          {title}
          {!isCompatible && (
            <div className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
              其他模式專用
            </div>
          )}
        </div>
        {categoryType && (
          <div className="group relative">
            <Info className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help" />
            <div className="invisible group-hover:visible absolute right-0 top-5 w-64 p-2 bg-black text-white text-xs rounded shadow-lg z-10">
              {getBlockUsageSuggestions(categoryType).map(
                (suggestion, index) => (
                  <div key={index}>• {suggestion}</div>
                )
              )}
            </div>
          </div>
        )}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
};

interface BlockPaletteProps {
  currentContext?: WorkspaceContext;
  showAllBlocks?: boolean;
  onShowAllBlocksChange?: (showAll: boolean) => void;
}

export const BlockPalette: React.FC<BlockPaletteProps> = ({
  currentContext = WorkspaceContext.LOGIC,
  showAllBlocks = true,
  onShowAllBlocksChange,
}) => {
  const [blocks, setBlocks] = useState<BlockRegistryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [initializationState, setInitializationState] = useState<InitializationState>(InitializationState.IDLE);
  const [initializationProgress, setInitializationProgress] = useState<{
    percentage: number;
    currentOperation: string;
  }>({ percentage: 0, currentOperation: "等待初始化" });

  // 初始化積木數據（使用新的 Promise-based 系統）
  useEffect(() => {
    let isMounted = true;

    const loadBlocks = async () => {
      try {
        // 檢查是否已經準備就緒
        if (isBlocksReady()) {
          const allBlocks = blockRegistry.getAllBlocks();
          if (isMounted) {
            setBlocks(allBlocks);
            setLoading(false);
            setInitializationState(InitializationState.READY);
            console.log("🎨 BlockPalette 載入完成，共", allBlocks.length, "個積木");
          }
          return;
        }

        // 等待初始化完成
        console.log("⏳ BlockPalette 等待積木系統初始化...");
        await waitForBlocksReady();

        if (isMounted) {
          const allBlocks = blockRegistry.getAllBlocks();
          setBlocks(allBlocks);
          setLoading(false);
          setInitializationState(InitializationState.READY);
          console.log("🎨 BlockPalette 載入完成，共", allBlocks.length, "個積木");
        }

      } catch (error) {
        console.error("❌ BlockPalette 載入失敗:", error);
        if (isMounted) {
          setLoading(false);
          setInitializationState(InitializationState.ERROR);
        }
      }
    };

    // 監聽積木註冊變更
    const unsubscribeRegistry = blockRegistry.addListener((updatedBlocks) => {
      if (isMounted) {
        setBlocks(updatedBlocks);
      }
    });

    // 監聽初始化狀態變更
    const unsubscribeStateChange = addInitializationListener('state-changed', (event) => {
      if (isMounted) {
        setInitializationState(event.data.state);
      }
    });

    // 監聽初始化進度更新
    const unsubscribeProgressUpdate = addInitializationListener('progress-updated', (event) => {
      if (isMounted) {
        setInitializationProgress({
          percentage: event.data.progress.percentage,
          currentOperation: event.data.progress.currentOperation
        });
      }
    });

    // 獲取當前狀態
    setInitializationState(getInitializationState());

    // 開始載入
    loadBlocks();

    return () => {
      isMounted = false;
      unsubscribeRegistry();
      unsubscribeStateChange();
      unsubscribeProgressUpdate();
    };
  }, []);

  // 根據當前上下文過濾積木
  const shouldShowCategory = (category: BlockCategory) => {
    if (showAllBlocks) return true;
    return getBlockCompatibility(category).includes(currentContext);
  };

  // 渲染積木組件
  const renderBlock = (blockItem: BlockRegistryItem) => {
    const { definition } = blockItem;
    return (
      <DraggableBlock
        key={definition.id}
        blockType={definition.blockType}
        blockData={definition.defaultData}
        color={definition.color}
      >
        {definition.displayName}
      </DraggableBlock>
    );
  };

  // 按類別渲染積木
  const renderBlocksByCategory = (
    category: BlockCategory,
    tabContext?: "all" | "logic" | "flex"
  ) => {
    const categoryConfig = getCategoryConfig(category);
    if (!categoryConfig) return null;

    // 根據標籤上下文進一步過濾
    if (
      tabContext === "logic" &&
      !categoryConfig.showInContext.includes(WorkspaceContext.LOGIC)
    ) {
      return null;
    }
    if (
      tabContext === "flex" &&
      !categoryConfig.showInContext.includes(WorkspaceContext.FLEX)
    ) {
      return null;
    }

    const categoryBlocks = blocks.filter(
      (item) =>
        item.definition.category === category &&
        item.enabled &&
        (showAllBlocks || shouldShowCategory(category))
    );

    if (categoryBlocks.length === 0) return null;

    return (
      <BlockCategoryComponent
        key={category}
        title={categoryConfig.displayName}
        icon={categoryConfig.icon}
        context={currentContext}
        categoryType={category}
      >
        {categoryBlocks.map(renderBlock)}
      </BlockCategoryComponent>
    );
  };

  if (loading) {
    return (
      <div className="w-80 bg-gray-50 border-r border-gray-200 flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          
          {/* 初始化狀態顯示 */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">
              {initializationState === InitializationState.LOADING && "載入積木模組"}
              {initializationState === InitializationState.RESOLVING_DEPENDENCIES && "解析依賴關係"}
              {initializationState === InitializationState.REGISTERING_BLOCKS && "註冊積木"}
              {initializationState === InitializationState.VALIDATING && "驗證積木"}
              {initializationState === InitializationState.RETRYING && "重試初始化"}
              {initializationState === InitializationState.IDLE && "準備初始化"}
            </p>
            
            {/* 進度條 */}
            {initializationProgress.percentage > 0 && (
              <div className="w-48 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${initializationProgress.percentage}%` }}
                ></div>
              </div>
            )}
            
            <p className="text-xs text-gray-500">
              {initializationProgress.currentOperation}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 錯誤狀態顯示
  if (initializationState === InitializationState.ERROR) {
    return (
      <div className="w-80 bg-gray-50 border-r border-gray-200 flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <div className="text-red-500">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-red-700 mb-1">積木系統載入失敗</p>
            <p className="text-xs text-gray-500">請重新整理頁面或聯絡技術支援</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
      <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
        {/* 當前模式指示器 */}
        <div className="p-4 bg-white border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                當前模式：
                {currentContext === WorkspaceContext.LOGIC
                  ? "邏輯編輯器"
                  : "Flex 設計器"}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onShowAllBlocksChange?.(!showAllBlocks)}
              className="text-xs"
            >
              {showAllBlocks ? "僅顯示相容" : "顯示全部"}
            </Button>
          </div>

          {/* 積木統計 */}
          <div className="mt-2 text-xs text-gray-500">
            已載入 {blocks.filter((b) => b.enabled).length} 個積木
          </div>
        </div>

        <Tabs defaultValue="all" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3 m-2 flex-shrink-0">
            <TabsTrigger value="all">全部積木</TabsTrigger>
            <TabsTrigger value="logic">邏輯積木</TabsTrigger>
            <TabsTrigger value="flex">Flex 組件</TabsTrigger>
          </TabsList>

          {/* 全部積木標籤 */}
          <TabsContent value="all" className="flex-1 overflow-hidden">
            <div
              className="h-full px-4 pt-4 pb-6 space-y-4 overflow-y-scroll custom-scrollbar"
              style={{
                maxHeight: "calc(100vh - 240px)",
                scrollbarWidth: "thin",
                scrollbarColor: "#cbd5e0 #f7fafc",
              }}
            >
              {Object.values(BlockCategory).map((category) =>
                renderBlocksByCategory(category, "all")
              )}
            </div>
          </TabsContent>

          {/* 邏輯積木標籤 */}
          <TabsContent value="logic" className="flex-1 overflow-hidden">
            <div
              className="h-full px-4 pt-4 pb-6 space-y-4 overflow-y-scroll custom-scrollbar"
              style={{
                maxHeight: "calc(100vh - 240px)",
                scrollbarWidth: "thin",
                scrollbarColor: "#cbd5e0 #f7fafc",
              }}
            >
              {getCategoriesForContext(WorkspaceContext.LOGIC).map((config) =>
                renderBlocksByCategory(config.category, "logic")
              )}
            </div>
          </TabsContent>

          {/* Flex 組件標籤 */}
          <TabsContent value="flex" className="flex-1 overflow-hidden">
            <div
              className="h-full px-4 pt-4 pb-6 space-y-4 overflow-y-scroll custom-scrollbar"
              style={{
                maxHeight: "calc(100vh - 240px)",
                scrollbarWidth: "thin",
                scrollbarColor: "#cbd5e0 #f7fafc",
              }}
            >
              {getCategoriesForContext(WorkspaceContext.FLEX).map((config) =>
                renderBlocksByCategory(config.category, "flex")
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};
