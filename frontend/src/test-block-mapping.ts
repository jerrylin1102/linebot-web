/**
 * 積木映射功能測試
 * 用於驗證DroppedBlock組件的映射邏輯是否正常工作
 */

// 模擬舊格式的積木數據
const testBlocks = [
  // 回覆積木測試
  {
    blockType: "reply",
    blockData: {
      replyType: "text",
      title: "回覆文字訊息",
      content: "測試文字內容"
    }
  },
  {
    blockType: "reply", 
    blockData: {
      replyType: "image",
      title: "回覆圖片訊息",
      imageUrl: "https://example.com/image.jpg"
    }
  },
  {
    blockType: "reply",
    blockData: {
      replyType: "flex",
      title: "回覆FLEX訊息",
      flexMessageId: "test-flex-123"
    }
  },
  
  // 事件積木測試
  {
    blockType: "event",
    blockData: {
      eventType: "message.text",
      title: "當收到文字訊息時",
      condition: "任何文字"
    }
  },
  {
    blockType: "event",
    blockData: {
      eventType: "follow",
      title: "當用戶加入好友時"
    }
  },
  
  // 控制積木測試
  {
    blockType: "control",
    blockData: {
      controlType: "if-then",
      title: "如果-則"
    }
  },
  
  // Flex積木測試
  {
    blockType: "flex-content",
    blockData: {
      contentType: "text",
      title: "文字內容",
      text: "測試文字"
    }
  },
  {
    blockType: "flex-container",
    blockData: {
      containerType: "box",
      title: "盒子容器"
    }
  }
];

/**
 * 模擬DroppedBlock的映射邏輯
 */
function testBlockMapping() {
  console.log("🧪 開始測試積木映射功能...");
  
  testBlocks.forEach((block, index) => {
    console.log(`\n--- 測試 ${index + 1}: ${block.blockData.title} ---`);
    console.log(`原始類型: ${block.blockType}`);
    console.log(`積木數據:`, block.blockData);
    
    // 模擬映射邏輯
    const mappedId = getBlockIdMapping(block.blockType, block.blockData);
    console.log(`映射結果: ${mappedId}`);
    
    // 檢查映射是否成功
    if (mappedId !== block.blockType) {
      console.log("✅ 映射成功");
    } else {
      console.log("⚠️ 使用原始ID，可能需要檢查映射規則");
    }
  });
  
  console.log("\n🎉 積木映射測試完成");
}

/**
 * 模擬DroppedBlock中的映射邏輯
 */
function getBlockIdMapping(blockType: string, blockData: any): string {
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
    const mappedId = replyTypeMap[blockData.replyType];
    if (mappedId) {
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
    const mappedId = eventTypeMap[blockData.eventType];
    if (mappedId) {
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
    const mappedId = controlTypeMap[blockData.controlType];
    if (mappedId) {
      return mappedId;
    }
  }
  
  // Flex積木映射
  if (blockType === "flex-container" && blockData.containerType) {
    const containerTypeMap: Record<string, string> = {
      "bubble": "flex-bubble",
      "carousel": "flex-carousel", 
      "box": "flex-box",
    };
    const mappedId = containerTypeMap[blockData.containerType];
    if (mappedId) {
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
    const mappedId = contentTypeMap[blockData.contentType];
    if (mappedId) {
      return mappedId;
    }
  }
  
  // 通用映射模式
  if (blockData.replyType) {
    return `${blockData.replyType}-reply`;
  }
  
  if (blockData.eventType) {
    return `${blockData.eventType.replace('.', '-')}-event`;
  }
  
  return blockType;
}

// 如果在瀏覽器環境中，自動執行測試
if (typeof window !== 'undefined') {
  // 延遲執行，確保其他模組已載入
  setTimeout(testBlockMapping, 1000);
}

export { testBlockMapping, getBlockIdMapping };