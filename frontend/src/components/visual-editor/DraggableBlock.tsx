import React, { useState } from "react";
import { useDrag } from "react-dnd";
import { BlockCategory, WorkspaceContext } from "../../types/block";
import {
  getCategoryFromBlockType,
  getBlockCompatibility,
} from "../../utils/blockCompatibility";
import { blockRegistry } from "./blocks/registry";
import { Badge } from "../ui/badge";
import ErrorBoundary from "../ui/ErrorBoundary";
import { useErrorHandler } from "../../hooks/useErrorHandler";
import BlockErrorHandler from "../../services/BlockErrorHandler";
import {
  Info,
  Zap,
  MessageSquare,
  Settings,
  Square,
  Type,
  MousePointer,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";

interface BlockData {
  [key: string]: unknown;
}

interface DraggableBlockProps {
  children: React.ReactNode;
  blockType: string;
  blockData: BlockData;
  color?: string;
  showCompatibilityBadge?: boolean;
  onError?: (error: Error) => void;
}

const DraggableBlock: React.FC<DraggableBlockProps> = ({
  children,
  blockType,
  blockData,
  color = "bg-blue-500",
  showCompatibilityBadge = true,
  onError,
}) => {
  const [hasLoadError, setHasLoadError] = useState(false);
  const { handleErrorAsync } = useErrorHandler();
  const blockErrorHandler = BlockErrorHandler.getInstance();

  // 獲取積木的類別和相容性資訊 - 增強版
  const [category, setCategory] = useState<BlockCategory | null>(null);
  const [compatibility, setCompatibility] = useState<WorkspaceContext[]>([]);

  // 安全地獲取積木信息
  React.useEffect(() => {
    const loadBlockInfo = async () => {
      try {
        // 首先嘗試從註冊表獲取積木定義（新格式 ID）
        const blockDefinition = blockRegistry.getBlock(blockType);
        let blockCategory: BlockCategory;
        
        if (blockDefinition) {
          // 如果找到積木定義，直接使用其類別
          blockCategory = blockDefinition.category;
          console.log("📦 從註冊表獲取積木類別:", { blockType, category: blockCategory });
        } else {
          // 回退到舊方法（用於向後相容）
          blockCategory = getCategoryFromBlockType(blockType);
          console.log("📦 使用舊方法獲取積木類別:", { blockType, category: blockCategory });
        }
        
        const blockCompatibility = getBlockCompatibility(blockCategory);
        
        setCategory(blockCategory);
        setCompatibility(blockCompatibility || []);
        setHasLoadError(false);
      } catch (error) {
        setHasLoadError(true);
        await blockErrorHandler.handleBlockLoadError(
          blockType,
          error as Error,
          { component: "DraggableBlock", operation: "loadInfo" }
        );
        onError?.(error as Error);
      }
    };

    if (blockType) {
      loadBlockInfo();
    }
  }, [blockType, blockErrorHandler, onError]);

  // React Hook must be called before any early returns
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: "block",
      item: () => {
        try {
          console.log("🏁 開始拖拽積木:", { blockType, category });
          return {
            blockType,
            blockData: blockData || {},
            category,
            compatibility: compatibility || [],
          };
        } catch (error) {
          handleErrorAsync(
            async () => {
              throw error;
            },
            { component: "DraggableBlock", operation: "startDrag", blockType }
          );
          return null;
        }
      },
      end: (item, monitor) => {
        try {
          const didDrop = monitor.didDrop();
          const dropResult = monitor.getDropResult();
          
          console.log("🏁 拖拽結束:", {
            blockType,
            category,
            didDrop,
            dropResult,
          });

          // 如果拖拽失敗，記錄錯誤
          if (!didDrop && item) {
            console.warn("⚠️ 拖拽未成功放置:", { blockType, category });
          }
        } catch (error) {
          handleErrorAsync(
            async () => {
              throw error;
            },
            { component: "DraggableBlock", operation: "endDrag", blockType }
          );
        }
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [blockType, blockData, category, compatibility, handleErrorAsync]
  );

  // 調試資訊
  console.log("📦 DraggableBlock 初始化:", {
    blockType,
    category,
    compatibility,
    blockDataKeys: Object.keys(blockData || {}),
    timestamp: new Date().toISOString(),
  });

  // 錯誤狀態處理
  if (hasLoadError) {
    return (
      <div className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm border border-red-600 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4" />
        <span>積木載入失敗</span>
      </div>
    );
  }

  // 增強的積木數據完整性檢查
  if (!blockType) {
    return (
      <ErrorBoundary level="component" isolate>
        <div className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm border border-red-600 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>錯誤: blockType 未定義</span>
        </div>
      </ErrorBoundary>
    );
  }

  if (!category) {
    return (
      <ErrorBoundary level="component" isolate>
        <div className="bg-orange-500 text-white px-3 py-2 rounded-lg text-sm border border-orange-600 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>警告: 類別無效 ({blockType})</span>
        </div>
      </ErrorBoundary>
    );
  }

  // 獲取類別圖示
  const getCategoryIcon = (category: BlockCategory) => {
    const iconClass = "w-3 h-3";
    switch (category) {
      case BlockCategory.EVENT:
        return <Zap className={iconClass} />;
      case BlockCategory.REPLY:
        return <MessageSquare className={iconClass} />;
      case BlockCategory.CONTROL:
        return <ArrowRight className={iconClass} />;
      case BlockCategory.SETTING:
        return <Settings className={iconClass} />;
      case BlockCategory.FLEX_CONTAINER:
        return <Square className={iconClass} />;
      case BlockCategory.FLEX_CONTENT:
        return <Type className={iconClass} />;
      case BlockCategory.FLEX_LAYOUT:
        return <MousePointer className={iconClass} />;
      default:
        return <Info className={iconClass} />;
    }
  };

  // 獲取相容性描述
  const getCompatibilityText = (compatibility: WorkspaceContext[]) => {
    if (compatibility.length === 2) {
      return "通用";
    } else if (compatibility.includes(WorkspaceContext.LOGIC)) {
      return "邏輯";
    } else if (compatibility.includes(WorkspaceContext.FLEX)) {
      return "Flex";
    }
    return "未知";
  };

  return (
    <ErrorBoundary 
      level="component" 
      isolate 
      onError={(error) => {
        console.error("DraggableBlock Error:", error);
        onError?.(error.originalError || new Error(error.message));
      }}
    >
      <div
        ref={drag}
        className={`${color} text-white px-3 py-2 rounded-lg cursor-move text-sm shadow-sm hover:shadow-md transition-all duration-200 ${
          isDragging ? "opacity-50 scale-95" : "opacity-100 scale-100"
        }`}
        data-testid={`draggable-block-${blockType}`}
        data-block-type={blockType}
        data-block-category={category}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getCategoryIcon(category)}
            <span>{children}</span>
          </div>

          {showCompatibilityBadge && compatibility.length > 0 && (
            <Badge
              variant="secondary"
              className="ml-2 text-xs bg-white/20 text-white border-white/30 hover:bg-white/30"
            >
              {getCompatibilityText(compatibility)}
            </Badge>
          )}
        </div>

        {/* 拖拽時的額外視覺提示 */}
        {isDragging && (
          <div className="absolute inset-0 rounded-lg border-2 border-dashed border-white/50 bg-white/10 pointer-events-none" />
        )}

        {/* 載入狀態指示器 */}
        {!category && (
          <div className="absolute inset-0 rounded-lg bg-gray-500/50 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default DraggableBlock;
