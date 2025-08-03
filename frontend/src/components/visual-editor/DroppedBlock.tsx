import React, { useState, useRef, useEffect } from "react";
import { useDrag, useDrop } from "react-dnd";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { X, Settings, GripVertical, ArrowUp, ArrowDown } from "lucide-react";
import DataCacheService from "../../services/DataCacheService";
import { FlexMessageSummary } from "../../services/visualEditorApi";
import { blockRegistry } from "./blocks/registry";
import { BlockDefinition } from "./blocks/types";
import BlockConfigRenderer from "./BlockConfigRenderer";

interface BlockData {
  [key: string]: unknown;
  title?: string;
  condition?: string;
  content?: string;
  text?: string;
  size?: string;
  weight?: string;
  color?: string;
  url?: string;
  layout?: string;
  spacing?: string;
  eventType?: string;
  replyType?: string;
  controlType?: string;
  settingType?: string;
  containerType?: string;
  contentType?: string;
  layoutType?: string;
  flexMessageId?: string;
  flexMessageName?: string;
}

interface Block {
  blockType: string;
  blockData: BlockData;
}

interface DroppedBlockProps {
  block: Block;
  index: number;
  onRemove?: (index: number) => void;
  onUpdate?: (index: number, data: BlockData) => void;
  onMove?: (dragIndex: number, hoverIndex: number) => void;
  onInsert?: (index: number, item: Block) => void;
}

const DroppedBlock: React.FC<DroppedBlockProps> = ({
  block,
  index,
  onRemove,
  onUpdate,
  onMove,
  onInsert,
}) => {
  const dataCache = DataCacheService.getInstance();
  const [isEditing, setIsEditing] = useState(false);
  const [blockData, setBlockData] = useState<BlockData>(block.blockData || {});
  const [showInsertZone, setShowInsertZone] = useState<
    "above" | "below" | null
  >(null);
  const [flexMessages, setFlexMessages] = useState<FlexMessageSummary[]>([]);
  const [loadingFlexMessages, setLoadingFlexMessages] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  /**
   * 獲取積木ID映射 - 處理舊格式到新格式的轉換
   */
  const getBlockId = (): string => {
    const { blockType, blockData } = block;
    
    // 如果已經是新格式的ID，直接返回
    if (blockRegistry.getBlock(blockType)) {
      return blockType;
    }
    
    // 處理舊格式映射到新格式
    try {
      // 回覆積木映射
      if (blockType === "reply" && blockData.replyType) {
        const replyTypeMap: Record<string, string> = {
          "text": "text-reply",
          "image": "image-reply", 
          "flex": "flex-reply",
          "sticker": "sticker-reply",
          "audio": "audio-reply",
          "video": "video-reply", 
          "location": "location-reply",
          "template": "template-reply",
          "quick": "quick-reply",
        };
        const mappedId = replyTypeMap[blockData.replyType as string];
        if (mappedId) {
          console.log(`[DroppedBlock] 映射回覆積木: ${blockType}+${blockData.replyType} → ${mappedId}`);
          return mappedId;
        }
      }
      
      // 事件積木映射
      if (blockType === "event" && blockData.eventType) {
        const eventTypeMap: Record<string, string> = {
          "message.text": "text-message-event",
          "message.image": "image-message-event",
          "message.audio": "audio-message-event",
          "message.video": "video-message-event",
          "message.file": "file-message-event",
          "message.location": "location-message-event",
          "message.sticker": "sticker-message-event",
          "follow": "follow-event",
          "unfollow": "unfollow-event",
          "join": "join-event",
          "leave": "leave-event",
          "memberJoined": "member-joined-event",
          "memberLeft": "member-left-event",
          "postback": "postback-event",
          "beacon": "beacon-event",
        };
        const mappedId = eventTypeMap[blockData.eventType as string];
        if (mappedId) {
          console.log(`[DroppedBlock] 映射事件積木: ${blockType}+${blockData.eventType} → ${mappedId}`);
          return mappedId;
        }
      }
      
      // 控制積木映射
      if (blockType === "control" && blockData.controlType) {
        const controlTypeMap: Record<string, string> = {
          "if-then": "if-then-control",
          "if-then-else": "if-then-else-control",
          "switch": "switch-control",
          "loop": "loop-control",
          "break": "break-control",
          "continue": "continue-control",
        };
        const mappedId = controlTypeMap[blockData.controlType as string];
        if (mappedId) {
          console.log(`[DroppedBlock] 映射控制積木: ${blockType}+${blockData.controlType} → ${mappedId}`);
          return mappedId;
        }
      }
      
      // 設定積木映射
      if (blockType === "setting" && blockData.settingType) {
        const settingTypeMap: Record<string, string> = {
          "variable": "variable-setting",
          "function": "function-setting",
          "api": "api-setting",
          "database": "database-setting",
        };
        const mappedId = settingTypeMap[blockData.settingType as string];
        if (mappedId) {
          console.log(`[DroppedBlock] 映射設定積木: ${blockType}+${blockData.settingType} → ${mappedId}`);
          return mappedId;
        }
      }
      
      // Flex Message 積木映射
      if (blockType === "flex-container" && blockData.containerType) {
        const containerTypeMap: Record<string, string> = {
          "bubble": "flex-bubble",
          "carousel": "flex-carousel", 
          "box": "flex-box",
        };
        const mappedId = containerTypeMap[blockData.containerType as string];
        if (mappedId) {
          console.log(`[DroppedBlock] 映射容器積木: ${blockType}+${blockData.containerType} → ${mappedId}`);
          return mappedId;
        }
      }
      
      if (blockType === "flex-content" && blockData.contentType) {
        const contentTypeMap: Record<string, string> = {
          "text": "flex-text",
          "image": "flex-image",
          "button": "flex-button",
          "filler": "flex-filler",
          "icon": "flex-icon",
          "separator": "flex-separator",
        };
        const mappedId = contentTypeMap[blockData.contentType as string];
        if (mappedId) {
          console.log(`[DroppedBlock] 映射內容積木: ${blockType}+${blockData.contentType} → ${mappedId}`);
          return mappedId;
        }
      }
      
      if (blockType === "flex-layout" && blockData.layoutType) {
        const layoutTypeMap: Record<string, string> = {
          "spacer": "flex-spacer",
          "separator": "flex-separator",
        };
        const mappedId = layoutTypeMap[blockData.layoutType as string];
        if (mappedId) {
          console.log(`[DroppedBlock] 映射佈局積木: ${blockType}+${blockData.layoutType} → ${mappedId}`);
          return mappedId;
        }
      }
      
      // 如果沒有找到映射，嘗試一些通用映射模式
      if (blockData.replyType) {
        const genericReplyId = `${blockData.replyType}-reply`;
        if (blockRegistry.getBlock(genericReplyId)) {
          console.log(`[DroppedBlock] 通用回覆映射: ${blockType} → ${genericReplyId}`);
          return genericReplyId;
        }
      }
      
      if (blockData.eventType) {
        const genericEventId = `${blockData.eventType.replace('.', '-')}-event`;
        if (blockRegistry.getBlock(genericEventId)) {
          console.log(`[DroppedBlock] 通用事件映射: ${blockType} → ${genericEventId}`);
          return genericEventId;
        }
      }
      
    } catch (error) {
      console.error("[DroppedBlock] 積木ID映射過程中發生錯誤:", error);
    }
    
    // 如果都沒有找到，返回原始ID並記錄警告
    console.warn(`[DroppedBlock] 無法映射積木ID: ${blockType}，可能需要更新映射規則`, blockData);
    return blockType;
  };

  // 從註冊表獲取積木定義（使用映射後的ID）
  const mappedBlockId = getBlockId();
  const blockDefinition: BlockDefinition | undefined = blockRegistry.getBlock(mappedBlockId);
  
  // 判斷是否使用新的配置系統
  const useNewConfigSystem = blockDefinition && blockDefinition.configOptions && blockDefinition.configOptions.length > 0;
  
  // 增強的調試日誌和錯誤處理
  useEffect(() => {
    const logBlockInfo = () => {
      console.group(`[DroppedBlock] 積木資訊 - Index: ${index}`);
      console.log("原始積木類型:", block.blockType);
      console.log("映射後積木ID:", mappedBlockId);
      console.log("積木數據:", block.blockData);
      console.log("找到積木定義:", !!blockDefinition);
      console.log("使用新配置系統:", useNewConfigSystem);
      
      if (blockDefinition) {
        console.log("積木定義詳情:", {
          id: blockDefinition.id,
          displayName: blockDefinition.displayName,
          configOptionsCount: blockDefinition.configOptions?.length || 0,
          category: blockDefinition.category,
        });
      } else {
        console.warn("⚠️ 找不到積木定義，可能的原因:");
        console.warn("1. 積木尚未註冊到註冊表");
        console.warn("2. 映射規則不正確");
        console.warn("3. 積木初始化未完成");
        
        // 提供診斷資訊
        const registryStats = blockRegistry.getStatistics();
        console.log("註冊表統計:", registryStats);
        
        // 嘗試列出相似的積木ID
        const allBlocks = blockRegistry.getAllBlocks();
        const similarBlocks = allBlocks.filter(item => 
          item.definition.id.includes(block.blockType) || 
          item.definition.blockType === block.blockType
        );
        
        if (similarBlocks.length > 0) {
          console.log("找到相似的積木:", similarBlocks.map(item => ({
            id: item.definition.id,
            blockType: item.definition.blockType,
            displayName: item.definition.displayName,
          })));
        }
      }
      console.groupEnd();
    };
    
    // 在開發環境下輸出詳細日誌
    if (process.env.NODE_ENV === 'development') {
      logBlockInfo();
    }
    
    // 如果找不到積木定義，發出警告
    if (!blockDefinition) {
      console.error(`[DroppedBlock] 找不到積木定義: ${mappedBlockId}，原始類型: ${block.blockType}`);
    }
  }, [block.blockType, mappedBlockId, blockDefinition, useNewConfigSystem, index, block.blockData]);

  // 載入FLEX訊息列表（使用快取服務）
  useEffect(() => {
    const loadFlexMessages = async () => {
      if (block.blockType === "reply" && block.blockData.replyType === "flex") {
        setLoadingFlexMessages(true);
        try {
          const messages = await dataCache.getUserFlexMessagesSummary();
          setFlexMessages(messages);
          console.log(`[DroppedBlock] 載入 FlexMessage 列表，共 ${messages.length} 個`);
        } catch (error) {
          console.error("[DroppedBlock] 載入 FlexMessage 列表失敗:", error);
          setFlexMessages([]);
        } finally {
          setLoadingFlexMessages(false);
        }
      }
    };

    loadFlexMessages();
  }, [block.blockType, block.blockData.replyType, dataCache]);

  // 處理FLEX訊息選擇
  const handleFlexMessageSelect = (value: string) => {
    const selectedMessage = flexMessages.find((msg) => msg.id === value);
    if (selectedMessage) {
      setBlockData({
        ...blockData,
        flexMessageId: value,
        flexMessageName: selectedMessage.name,
      });
    }
  };

  /**
   * 處理新配置系統的數據變更
   */
  const handleConfigDataChange = (key: string, value: unknown) => {
    setBlockData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  /**
   * 獲取積木顯示名稱
   */
  const getBlockDisplayName = (): string => {
    if (blockDefinition) {
      return blockDefinition.displayName;
    }
    return block.blockData.title || block.blockType;
  };

  /**
   * 獲取積木顏色（優先使用註冊表定義）
   */
  const getBlockColor = (): string => {
    if (blockDefinition) {
      return blockDefinition.color;
    }
    
    // 向後相容的顏色映射
    const colorMap: Record<string, string> = {
      event: "bg-orange-500",
      reply: "bg-green-500",
      control: "bg-purple-500",
      setting: "bg-gray-500",
      "flex-container": "bg-indigo-500",
      "flex-content": "bg-blue-500",
      "flex-layout": "bg-teal-500",
    };
    return colorMap[block.blockType] || "bg-blue-500";
  };

  // 拖拽功能 - 支持重排
  const [{ isDragging }, drag, _preview] = useDrag({
    type: "dropped-block",
    item: () => ({
      index,
      block,
      id: `dropped-${index}`,
    }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // 拖拽目標 - 支持插入和重排
  const [{ isOver, dropPosition: _dropPosition }, drop] = useDrop({
    accept: ["block", "dropped-block"],
    hover: (item: Block & { index?: number; type?: string }, monitor) => {
      if (!ref.current) return;

      // 處理重排 (dropped-block 到 dropped-block)
      if (
        item.type === "dropped-block" ||
        (item.index !== undefined && typeof item.index === "number")
      ) {
        const dragIndex = item.index;
        const hoverIndex = index;

        if (dragIndex === hoverIndex) return;

        const hoverBoundingRect = ref.current.getBoundingClientRect();
        const hoverMiddleY =
          (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
        const clientOffset = monitor.getClientOffset();

        if (!clientOffset) return;

        const hoverClientY = clientOffset.y - hoverBoundingRect.top;

        // 設置插入位置提示
        if (hoverClientY < hoverMiddleY / 2) {
          setShowInsertZone("above");
        } else if (hoverClientY > hoverBoundingRect.height - hoverMiddleY / 2) {
          setShowInsertZone("below");
        } else {
          setShowInsertZone(null);
        }

        // 執行重排
        if (
          (dragIndex < hoverIndex && hoverClientY > hoverMiddleY) ||
          (dragIndex > hoverIndex && hoverClientY < hoverMiddleY)
        ) {
          if (onMove) {
            onMove(dragIndex, hoverIndex);
            item.index = hoverIndex;
          }
        }
      } else {
        // 處理新積木插入 (block 到 dropped-block)
        const hoverBoundingRect = ref.current.getBoundingClientRect();
        const clientOffset = monitor.getClientOffset();

        if (!clientOffset) return;

        const hoverClientY = clientOffset.y - hoverBoundingRect.top;
        const hoverMiddleY =
          (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

        if (hoverClientY < hoverMiddleY) {
          setShowInsertZone("above");
        } else {
          setShowInsertZone("below");
        }
      }
    },
    drop: (item: Block & { index?: number; blockType?: string }, monitor) => {
      if (!ref.current) return;

      // 處理新積木插入
      if (item.blockType && onInsert) {
        const hoverBoundingRect = ref.current.getBoundingClientRect();
        const clientOffset = monitor.getClientOffset();

        if (!clientOffset) return;

        const hoverClientY = clientOffset.y - hoverBoundingRect.top;
        const hoverMiddleY =
          (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

        const insertIndex = hoverClientY < hoverMiddleY ? index : index + 1;
        onInsert(insertIndex, item);
      }

      setShowInsertZone(null);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      dropPosition: showInsertZone,
    }),
  });

  // 清除插入區域提示
  const handleMouseLeave = () => {
    setShowInsertZone(null);
  };

  // 組合 drag 和 drop refs
  drag(drop(ref));


  const renderBlockContent = () => {
    // 如果使用新的配置系統，優先使用配置渲染器
    if (useNewConfigSystem && isEditing) {
      try {
        if (!blockDefinition || !blockDefinition.configOptions) {
          console.error("[DroppedBlock] 新配置系統缺少必要的配置選項");
          return (
            <div>
              <div className="font-medium text-red-200">⚠️ 配置錯誤</div>
              <div className="text-xs text-red-300 mt-1">
                積木定義缺少配置選項，請檢查積木註冊
              </div>
            </div>
          );
        }

        return (
          <div>
            <div className="font-medium">{getBlockDisplayName()}</div>
            <div className="mt-3">
              <BlockConfigRenderer
                configOptions={blockDefinition.configOptions}
                blockData={blockData}
                onDataChange={handleConfigDataChange}
                className="space-y-3"
              />
            </div>
          </div>
        );
      } catch (error) {
        console.error("[DroppedBlock] 新配置系統渲染錯誤:", error);
        return (
          <div>
            <div className="font-medium text-red-200">⚠️ 渲染錯誤</div>
            <div className="text-xs text-red-300 mt-1">
              配置渲染器出現錯誤: {error instanceof Error ? error.message : String(error)}
            </div>
          </div>
        );
      }
    }

    // 非編輯模式或舊系統，顯示積木標題
    if (!isEditing) {
      return (
        <div>
          <div className="font-medium">{getBlockDisplayName()}</div>
          
          {/* 如果找不到積木定義，顯示警告 */}
          {!blockDefinition && (
            <div className="text-xs text-yellow-300 mt-1">
              ⚠️ 找不到積木定義 (ID: {mappedBlockId})
            </div>
          )}
          
          {/* 顯示一些關鍵配置資訊 */}
          {blockDefinition?.configOptions && blockDefinition.configOptions.length > 0 && (
            <div className="text-xs text-white/60 mt-1">
              {blockDefinition.configOptions
                .filter(option => {
                  const value = blockData[option.key];
                  return value !== undefined && value !== null && value !== '';
                })
                .slice(0, 2) // 只顯示前2個配置
                .map(option => {
                  const value = blockData[option.key];
                  const displayValue = typeof value === 'string' && value.length > 20 
                    ? value.substring(0, 20) + '...' 
                    : String(value);
                  return `${option.label}: ${displayValue}`;
                })
                .join(', ')}
            </div>
          )}
          
          {/* 如果是新系統但沒有配置選項，顯示提示 */}
          {blockDefinition && (!blockDefinition.configOptions || blockDefinition.configOptions.length === 0) && (
            <div className="text-xs text-white/40 mt-1">
              (此積木暫無可配置選項)
            </div>
          )}
        </div>
      );
    }

    // 向後相容的舊系統渲染邏輯
    switch (block.blockType) {
      case "event":
        return (
          <div>
            <div className="font-medium">{block.blockData.title}</div>
            {isEditing && (
              <div className="mt-2 space-y-2">
                <Input
                  placeholder="事件條件"
                  value={blockData.condition || ""}
                  onChange={(e) =>
                    setBlockData({ ...blockData, condition: e.target.value })
                  }
                  className="text-black"
                />
              </div>
            )}
          </div>
        );
      case "reply":
        return (
          <div>
            <div className="font-medium">{block.blockData.title}</div>
            {isEditing && (
              <div className="mt-2 space-y-2">
                {/* 根據回覆類型顯示不同的編輯介面 */}
                {block.blockData.replyType === "flex" ? (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-white/80">
                      選擇FLEX訊息模板:
                    </div>
                    <Select
                      value={blockData.flexMessageId || ""}
                      onValueChange={handleFlexMessageSelect}
                      disabled={loadingFlexMessages}
                    >
                      <SelectTrigger className="text-black">
                        <SelectValue
                          placeholder={
                            loadingFlexMessages
                              ? "載入中..."
                              : "選擇FLEX訊息模板"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {flexMessages.length === 0 && !loadingFlexMessages ? (
                          <SelectItem value="" disabled>
                            沒有可用的FLEX訊息模板
                          </SelectItem>
                        ) : (
                          flexMessages.map((message) => (
                            <SelectItem key={message.id} value={message.id}>
                              {message.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {blockData.flexMessageName && (
                      <div className="text-xs text-white/60">
                        已選擇: {blockData.flexMessageName}
                      </div>
                    )}
                  </div>
                ) : (
                  <Textarea
                    placeholder="回覆內容"
                    value={blockData.content || ""}
                    onChange={(e) =>
                      setBlockData({ ...blockData, content: e.target.value })
                    }
                    className="text-black"
                    rows={3}
                  />
                )}
              </div>
            )}
            {/* 顯示當前選擇的FLEX訊息（非編輯模式） */}
            {!isEditing &&
              block.blockData.replyType === "flex" &&
              block.blockData.flexMessageName && (
                <div className="text-xs text-white/70 mt-1">
                  FLEX模板: {block.blockData.flexMessageName}
                </div>
              )}
          </div>
        );
      case "flex-content":
        return (
          <div>
            <div className="font-medium">{block.blockData.title}</div>
            {isEditing && (
              <div className="mt-2 space-y-2">
                {block.blockData.contentType === "text" && (
                  <>
                    <Input
                      placeholder="文字內容"
                      value={blockData.text || ""}
                      onChange={(e) =>
                        setBlockData({ ...blockData, text: e.target.value })
                      }
                      className="text-black"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Select
                        value={blockData.size || "md"}
                        onValueChange={(value) =>
                          setBlockData({ ...blockData, size: value })
                        }
                      >
                        <SelectTrigger className="text-black">
                          <SelectValue placeholder="文字大小" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="xs">極小</SelectItem>
                          <SelectItem value="sm">小</SelectItem>
                          <SelectItem value="md">中</SelectItem>
                          <SelectItem value="lg">大</SelectItem>
                          <SelectItem value="xl">極大</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select
                        value={blockData.weight || "regular"}
                        onValueChange={(value) =>
                          setBlockData({ ...blockData, weight: value })
                        }
                      >
                        <SelectTrigger className="text-black">
                          <SelectValue placeholder="字重" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="regular">一般</SelectItem>
                          <SelectItem value="bold">粗體</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Input
                      placeholder="文字顏色 (例如: #000000)"
                      value={blockData.color || ""}
                      onChange={(e) =>
                        setBlockData({ ...blockData, color: e.target.value })
                      }
                      className="text-black"
                    />
                  </>
                )}
                {block.blockData.contentType === "image" && (
                  <Input
                    placeholder="圖片 URL"
                    value={blockData.url || ""}
                    onChange={(e) =>
                      setBlockData({ ...blockData, url: e.target.value })
                    }
                    className="text-black"
                  />
                )}
                {block.blockData.contentType === "button" && (
                  <Input
                    placeholder="按鈕文字"
                    value={blockData.text || ""}
                    onChange={(e) =>
                      setBlockData({ ...blockData, text: e.target.value })
                    }
                    className="text-black"
                  />
                )}
              </div>
            )}
          </div>
        );
      case "flex-container":
        return (
          <div>
            <div className="font-medium">{block.blockData.title}</div>
            {isEditing && block.blockData.containerType === "box" && (
              <div className="mt-2 space-y-2">
                <Select
                  value={blockData.layout || "vertical"}
                  onValueChange={(value) =>
                    setBlockData({ ...blockData, layout: value })
                  }
                >
                  <SelectTrigger className="text-black">
                    <SelectValue placeholder="佈局方向" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vertical">垂直</SelectItem>
                    <SelectItem value="horizontal">水平</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={blockData.spacing || "md"}
                  onValueChange={(value) =>
                    setBlockData({ ...blockData, spacing: value })
                  }
                >
                  <SelectTrigger className="text-black">
                    <SelectValue placeholder="間距" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="xs">極小</SelectItem>
                    <SelectItem value="sm">小</SelectItem>
                    <SelectItem value="md">中</SelectItem>
                    <SelectItem value="lg">大</SelectItem>
                    <SelectItem value="xl">極大</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        );
      case "flex-layout":
        return (
          <div>
            <div className="font-medium">{block.blockData.title}</div>
            {isEditing && block.blockData.layoutType === "spacer" && (
              <div className="mt-2 space-y-2">
                <Select
                  value={blockData.size || "md"}
                  onValueChange={(value) =>
                    setBlockData({ ...blockData, size: value })
                  }
                >
                  <SelectTrigger className="text-black">
                    <SelectValue placeholder="間距大小" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="xs">極小</SelectItem>
                    <SelectItem value="sm">小</SelectItem>
                    <SelectItem value="md">中</SelectItem>
                    <SelectItem value="lg">大</SelectItem>
                    <SelectItem value="xl">極大</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        );
      default:
        return (
          <div>
            <div className="font-medium">{block.blockData.title}</div>
          </div>
        );
    }
  };

  return (
    <div className="relative">
      {/* 上方插入區域 */}
      {showInsertZone === "above" && (
        <div className="absolute -top-2 left-0 right-0 h-1 bg-blue-400 rounded-full z-10 shadow-lg">
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-400 rounded-full"></div>
        </div>
      )}

      <div
        ref={ref}
        onMouseLeave={handleMouseLeave}
        className={`${getBlockColor()} text-white p-3 rounded-lg shadow-sm transition-all duration-200 ${
          isDragging ? "opacity-50 scale-95 rotate-2" : "opacity-100 scale-100"
        } ${isOver ? "ring-2 ring-blue-300 ring-opacity-50" : ""}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-2 flex-1">
            {/* 拖拽手柄 */}
            <div className="pt-1 cursor-move hover:bg-white/20 p-1 rounded">
              <GripVertical className="h-4 w-4 text-white/70" />
            </div>
            <div className="flex-1">{renderBlockContent()}</div>
          </div>
          <div className="flex items-center space-x-1 ml-2">
            {/* 快速移動按鈕 */}
            {index > 0 && (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-white hover:bg-white/20"
                onClick={() => onMove && onMove(index, index - 1)}
                title="向上移動"
              >
                <ArrowUp className="h-3 w-3" />
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-white hover:bg-white/20"
              onClick={() => onMove && onMove(index, index + 1)}
              title="向下移動"
            >
              <ArrowDown className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-white hover:bg-white/20"
              onClick={() => setIsEditing(!isEditing)}
              title="編輯設定"
            >
              <Settings className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-white hover:bg-white/20"
              onClick={() => onRemove && onRemove(index)}
              title="刪除積木"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {isEditing && (
          <div className="mt-3 pt-3 border-t border-white/20">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                if (onUpdate) {
                  onUpdate(index, blockData);
                }
                setIsEditing(false);
              }}
            >
              儲存設定
            </Button>
          </div>
        )}
      </div>

      {/* 下方插入區域 */}
      {showInsertZone === "below" && (
        <div className="absolute -bottom-2 left-0 right-0 h-1 bg-blue-400 rounded-full z-10 shadow-lg">
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-400 rounded-full"></div>
        </div>
      )}
    </div>
  );
};

export default DroppedBlock;
