/**
 * 積木映射系統
 * 負責處理舊格式積木ID到新格式ID的轉換與對應
 */

import { BlockCategory } from '../../../types/block';

/**
 * 積木類型別名映射介面
 */
export interface BlockTypeAlias {
  /** 主要 ID */
  primaryId: string;
  /** 別名列表 */
  aliases: string[];
  /** 積木類別 */
  category: BlockCategory;
  /** 顯示名稱 */
  displayName: string;
  /** 描述 */
  description?: string;
}

/**
 * 完整的積木類型映射表
 * 將舊格式的 blockType 映射到新的統一 ID
 */
export const BLOCK_TYPE_MAPPING: Record<string, string> = {
  // ============ 事件積木映射 ============
  'event': 'text-message-event',
  'message_event': 'text-message-event',
  'message-event': 'text-message-event',
  'postback_event': 'postback-event',
  'postback-event': 'postback-event',
  'text_message_event': 'text-message-event',
  'text-message-event': 'text-message-event',
  'image_message_event': 'image-message-event',
  'image-message-event': 'image-message-event',
  'audio_message_event': 'audio-message-event',
  'audio-message-event': 'audio-message-event',
  'video_message_event': 'video-message-event',
  'video-message-event': 'video-message-event',
  'file_message_event': 'file-message-event',
  'file-message-event': 'file-message-event',
  'sticker_message_event': 'sticker-message-event',
  'sticker-message-event': 'sticker-message-event',
  'follow_event': 'follow-event',
  'follow-event': 'follow-event',
  'unfollow_event': 'unfollow-event',
  'unfollow-event': 'unfollow-event',
  'member_joined_event': 'member-joined-event',
  'member-joined-event': 'member-joined-event',
  'member_left_event': 'member-left-event',
  'member-left-event': 'member-left-event',

  // ============ 回覆積木映射 ============
  'reply': 'text-reply',
  'text_reply': 'text-reply',
  'text-reply': 'text-reply',
  'flex_reply': 'flex-reply',
  'flex-reply': 'flex-reply',
  'image_reply': 'image-reply',
  'image-reply': 'image-reply',
  'audio_reply': 'audio-reply',
  'audio-reply': 'audio-reply',
  'video_reply': 'video-reply',
  'video-reply': 'video-reply',
  'location_reply': 'location-reply',
  'location-reply': 'location-reply',
  'sticker_reply': 'sticker-reply',
  'sticker-reply': 'sticker-reply',
  'sticker_message': 'sticker-message',
  'sticker-message': 'sticker-message',
  'template_reply': 'template-reply',
  'template-reply': 'template-reply',
  'quickreply_reply': 'quick-reply',
  'quick_reply': 'quick-reply',
  'quick-reply': 'quick-reply',

  // ============ 控制積木映射 ============
  'control': 'if-then-control',
  'condition': 'if-then-control',
  'loop': 'loop-control',
  'if': 'if-then-control',
  'wait': 'wait-control',
  'if_then_control': 'if-then-control',
  'if-then-control': 'if-then-control',
  'loop_control': 'loop-control',
  'loop-control': 'loop-control',
  'wait_control': 'wait-control',
  'wait-control': 'wait-control',

  // ============ 設定積木映射 ============
  'setting': 'set-variable-setting',
  'config': 'set-variable-setting',
  'webhook_setting': 'set-variable-setting',
  'get_variable_setting': 'get-variable-setting',
  'get-variable-setting': 'get-variable-setting',
  'set_variable_setting': 'set-variable-setting',
  'set-variable-setting': 'set-variable-setting',
  'save_user_data_setting': 'save-user-data-setting',
  'save-user-data-setting': 'save-user-data-setting',

  // ============ Flex 容器積木映射 ============
  'flex-container': 'bubble-container',
  'bubble': 'bubble-container',
  'carousel': 'carousel-container',
  'flex_bubble': 'bubble-container',
  'flex-bubble': 'bubble-container',
  'flex_carousel': 'carousel-container',
  'flex-carousel': 'carousel-container',
  'box': 'box-container',
  'flex_box': 'box-container',
  'flex-box': 'box-container',
  'bubble_container': 'bubble-container',
  'bubble-container': 'bubble-container',
  'carousel_container': 'carousel-container',
  'carousel-container': 'carousel-container',
  'box_container': 'box-container',
  'box-container': 'box-container',

  // ============ Flex 內容積木映射 ============
  'flex-content': 'text-content',
  'text': 'text-content',
  'image': 'image-content',
  'button': 'button-content',
  'icon': 'icon-content',
  'flex_text': 'text-content',
  'flex-text': 'text-content',
  'flex_image': 'image-content',
  'flex-image': 'image-content',
  'flex_button': 'button-content',
  'flex-button': 'button-content',
  'flex_icon': 'icon-content',
  'flex-icon': 'icon-content',
  'video': 'video-content',
  'flex_video': 'video-content',
  'flex-video': 'video-content',
  'span': 'span-content',
  'flex_span': 'span-content',
  'flex-span': 'span-content',
  'text_content': 'text-content',
  'text-content': 'text-content',
  'image_content': 'image-content',
  'image-content': 'image-content',
  'button_content': 'button-content',
  'button-content': 'button-content',
  'icon_content': 'icon-content',
  'icon-content': 'icon-content',
  'video_content': 'video-content',
  'video-content': 'video-content',
  'span_content': 'span-content',
  'span-content': 'span-content',

  // ============ Flex 佈局積木映射 ============
  'flex-layout': 'spacer-layout',
  'separator': 'separator-content',
  'spacer': 'spacer-layout',
  'filler': 'filler-layout',
  'flex_separator': 'separator-content',
  'flex-separator': 'separator-content',
  'flex_spacer': 'spacer-layout',
  'flex-spacer': 'spacer-layout',
  'flex_filler': 'filler-layout',
  'flex-filler': 'filler-layout',
  'align': 'align-layout',
  'flex_align': 'align-layout',
  'flex-align': 'align-layout',
  'separator_content': 'separator-content',
  'separator-content': 'separator-content',
  'spacer_layout': 'spacer-layout',
  'spacer-layout': 'spacer-layout',
  'filler_layout': 'filler-layout',
  'filler-layout': 'filler-layout',
  'align_layout': 'align-layout',
  'align-layout': 'align-layout',

  // ============ 互動動作積木映射 ============
  'action': 'uri-action',
  'uri_action': 'uri-action',
  'uri-action': 'uri-action',
  'camera_action': 'camera-action',
  'camera-action': 'camera-action',
  'camera_roll_action': 'camera-roll-action',
  'camera-roll-action': 'camera-roll-action',
  'location_action': 'location-action',
  'location-action': 'location-action',
  'datetime_picker_action': 'datetime-picker-action',
  'datetime-picker-action': 'datetime-picker-action',
  'richmenu_switch_action': 'richmenu-switch-action',
  'richmenu-switch-action': 'richmenu-switch-action',
  'clipboard_action': 'clipboard-action',
  'clipboard-action': 'clipboard-action',
};

/**
 * 反向映射表：從新ID到舊格式ID
 */
export const REVERSE_BLOCK_TYPE_MAPPING: Record<string, string[]> = {};

/**
 * 積木別名映射表
 * 支援多個ID指向同一個積木定義
 */
export const BLOCK_ALIASES: BlockTypeAlias[] = [
  // ============ 事件積木別名 ============
  {
    primaryId: 'text-message-event',
    aliases: ['event', 'message_event', 'message-event', 'text_event', 'text-event', 'text_message_event'],
    category: BlockCategory.EVENT,
    displayName: '文字訊息事件',
    description: '當用戶發送文字訊息時觸發'
  },
  {
    primaryId: 'postback-event',
    aliases: ['postback', 'postback_event'],
    category: BlockCategory.EVENT,
    displayName: '回傳事件',
    description: '當用戶點擊按鈕或快速回覆時觸發'
  },
  {
    primaryId: 'image-message-event',
    aliases: ['image_event', 'image-event', 'image_message_event'],
    category: BlockCategory.EVENT,
    displayName: '圖片訊息事件',
    description: '當用戶發送圖片時觸發'
  },
  {
    primaryId: 'audio-message-event',
    aliases: ['audio_event', 'audio-event', 'audio_message_event'],
    category: BlockCategory.EVENT,
    displayName: '語音訊息事件',
    description: '當用戶發送語音時觸發'
  },
  {
    primaryId: 'video-message-event',
    aliases: ['video_event', 'video-event', 'video_message_event'],
    category: BlockCategory.EVENT,
    displayName: '影片訊息事件',
    description: '當用戶發送影片時觸發'
  },
  {
    primaryId: 'file-message-event',
    aliases: ['file_event', 'file-event', 'file_message_event'],
    category: BlockCategory.EVENT,
    displayName: '檔案訊息事件',
    description: '當用戶發送檔案時觸發'
  },
  {
    primaryId: 'sticker-message-event',
    aliases: ['sticker_event', 'sticker-event', 'sticker_message_event'],
    category: BlockCategory.EVENT,
    displayName: '貼圖訊息事件',
    description: '當用戶發送貼圖時觸發'
  },
  {
    primaryId: 'follow-event',
    aliases: ['follow', 'follow_event'],
    category: BlockCategory.EVENT,
    displayName: '加好友事件',
    description: '當用戶加 Bot 為好友時觸發'
  },
  {
    primaryId: 'unfollow-event',
    aliases: ['unfollow', 'unfollow_event'],
    category: BlockCategory.EVENT,
    displayName: '封鎖事件',
    description: '當用戶封鎖 Bot 時觸發'
  },
  {
    primaryId: 'member-joined-event',
    aliases: ['member_joined', 'member-joined', 'join_event', 'join-event', 'member_joined_event'],
    category: BlockCategory.EVENT,
    displayName: '成員加入事件',
    description: '當新成員加入群組時觸發'
  },
  {
    primaryId: 'member-left-event',
    aliases: ['member_left', 'member-left', 'leave_event', 'leave-event', 'member_left_event'],
    category: BlockCategory.EVENT,
    displayName: '成員離開事件',
    description: '當成員離開群組時觸發'
  },

  // ============ 回覆積木別名 ============
  {
    primaryId: 'text-reply',
    aliases: ['reply', 'text_message', 'text-message', 'text_reply'],
    category: BlockCategory.REPLY,
    displayName: '文字回覆',
    description: '回覆文字訊息給用戶'
  },
  {
    primaryId: 'flex-reply',
    aliases: ['flex_message', 'flex-message', 'flex_reply'],
    category: BlockCategory.REPLY,
    displayName: 'Flex 回覆',
    description: '回覆 Flex 訊息給用戶'
  },
  {
    primaryId: 'image-reply',
    aliases: ['image_message', 'image-message', 'image_reply'],
    category: BlockCategory.REPLY,
    displayName: '圖片回覆',
    description: '回覆圖片訊息給用戶'
  },
  {
    primaryId: 'audio-reply',
    aliases: ['audio_message', 'audio-message', 'audio_reply'],
    category: BlockCategory.REPLY,
    displayName: '語音回覆',
    description: '回覆語音訊息給用戶'
  },
  {
    primaryId: 'video-reply',
    aliases: ['video_message', 'video-message', 'video_reply'],
    category: BlockCategory.REPLY,
    displayName: '影片回覆',
    description: '回覆影片訊息給用戶'
  },
  {
    primaryId: 'location-reply',
    aliases: ['location_message', 'location-message', 'location_reply'],
    category: BlockCategory.REPLY,
    displayName: '位置回覆',
    description: '回覆位置訊息給用戶'
  },
  {
    primaryId: 'sticker-message',
    aliases: ['sticker_message', 'sticker_reply', 'sticker-reply'],
    category: BlockCategory.REPLY,
    displayName: '貼圖回覆',
    description: '回覆貼圖訊息給用戶'
  },
  {
    primaryId: 'template-reply',
    aliases: ['template_message', 'template-message', 'template_reply'],
    category: BlockCategory.REPLY,
    displayName: '模板回覆',
    description: '回覆模板訊息給用戶'
  },
  {
    primaryId: 'quick-reply',
    aliases: ['quickreply_reply', 'quickreply-reply', 'quick_reply', 'quick_reply_message', 'quick-reply-message'],
    category: BlockCategory.REPLY,
    displayName: '快速回覆',
    description: '回覆快速回覆選項給用戶'
  },

  // ============ 控制積木別名 ============
  {
    primaryId: 'if-then-control',
    aliases: ['control', 'condition', 'if', 'if_then_control'],
    category: BlockCategory.CONTROL,
    displayName: '條件控制',
    description: '根據條件執行不同的邏輯分支'
  },
  {
    primaryId: 'loop-control',
    aliases: ['loop', 'loop_control'],
    category: BlockCategory.CONTROL,
    displayName: '迴圈控制',
    description: '重複執行特定的邏輯區塊'
  },
  {
    primaryId: 'wait-control',
    aliases: ['wait', 'delay', 'wait_control'],
    category: BlockCategory.CONTROL,
    displayName: '等待控制',
    description: '暫停執行指定的時間'
  },

  // ============ 設定積木別名 ============
  {
    primaryId: 'get-variable-setting',
    aliases: ['get_variable', 'get-variable', 'read_variable', 'read-variable', 'get_variable_setting'],
    category: BlockCategory.SETTING,
    displayName: '取得變數',
    description: '從變數儲存中讀取值'
  },
  {
    primaryId: 'set-variable-setting',
    aliases: ['setting', 'config', 'set_variable', 'set-variable', 'webhook_setting', 'webhook-setting', 'set_variable_setting'],
    category: BlockCategory.SETTING,
    displayName: '設定變數',
    description: '設定變數的值'
  },
  {
    primaryId: 'save-user-data-setting',
    aliases: ['save_user_data', 'save-user-data', 'user_data', 'user-data', 'save_user_data_setting'],
    category: BlockCategory.SETTING,
    displayName: '儲存用戶資料',
    description: '儲存用戶相關的資料'
  },

  // ============ Flex 容器積木別名 ============
  {
    primaryId: 'bubble-container',
    aliases: ['flex-container', 'bubble', 'flex_bubble', 'flex-bubble', 'bubble_container'],
    category: BlockCategory.FLEX_CONTAINER,
    displayName: 'Bubble 容器',
    description: 'Flex 訊息的氣泡容器'
  },
  {
    primaryId: 'carousel-container',
    aliases: ['carousel', 'flex_carousel', 'flex-carousel', 'carousel_container'],
    category: BlockCategory.FLEX_CONTAINER,
    displayName: 'Carousel 容器',
    description: 'Flex 訊息的輪播容器'
  },
  {
    primaryId: 'box-container',
    aliases: ['box', 'flex_box', 'flex-box', 'box_container'],
    category: BlockCategory.FLEX_CONTAINER,
    displayName: 'Box 容器',
    description: 'Flex 訊息的盒子容器'
  },

  // ============ Flex 內容積木別名 ============
  {
    primaryId: 'text-content',
    aliases: ['flex-content', 'text', 'flex_text', 'flex-text', 'text_content'],
    category: BlockCategory.FLEX_CONTENT,
    displayName: '文字內容',
    description: 'Flex 訊息中的文字元件'
  },
  {
    primaryId: 'image-content',
    aliases: ['image', 'flex_image', 'flex-image', 'image_content'],
    category: BlockCategory.FLEX_CONTENT,
    displayName: '圖片內容',
    description: 'Flex 訊息中的圖片元件'
  },
  {
    primaryId: 'button-content',
    aliases: ['button', 'flex_button', 'flex-button', 'button_content'],
    category: BlockCategory.FLEX_CONTENT,
    displayName: '按鈕內容',
    description: 'Flex 訊息中的按鈕元件'
  },
  {
    primaryId: 'icon-content',
    aliases: ['icon', 'flex_icon', 'flex-icon', 'icon_content'],
    category: BlockCategory.FLEX_CONTENT,
    displayName: '圖示內容',
    description: 'Flex 訊息中的圖示元件'
  },
  {
    primaryId: 'video-content',
    aliases: ['video', 'flex_video', 'flex-video', 'video_content'],
    category: BlockCategory.FLEX_CONTENT,
    displayName: '影片內容',
    description: 'Flex 訊息中的影片元件'
  },
  {
    primaryId: 'span-content',
    aliases: ['span', 'flex_span', 'flex-span', 'span_content'],
    category: BlockCategory.FLEX_CONTENT,
    displayName: 'Span 內容',
    description: 'Flex 訊息中的文字片段元件'
  },

  // ============ Flex 佈局積木別名 ============
  {
    primaryId: 'separator-content',
    aliases: ['separator', 'flex_separator', 'flex-separator', 'separator_content'],
    category: BlockCategory.FLEX_LAYOUT,
    displayName: '分隔線',
    description: 'Flex 訊息中的分隔線元件'
  },
  {
    primaryId: 'spacer-layout',
    aliases: ['flex-layout', 'spacer', 'flex_spacer', 'flex-spacer', 'spacer_layout'],
    category: BlockCategory.FLEX_LAYOUT,
    displayName: '間距元件',
    description: 'Flex 訊息中的間距元件'
  },
  {
    primaryId: 'filler-layout',
    aliases: ['filler', 'flex_filler', 'flex-filler', 'filler_layout'],
    category: BlockCategory.FLEX_LAYOUT,
    displayName: '填充元件',
    description: 'Flex 訊息中的填充元件'
  },
  {
    primaryId: 'align-layout',
    aliases: ['align', 'flex_align', 'flex-align', 'align_layout'],
    category: BlockCategory.FLEX_LAYOUT,
    displayName: '對齊佈局',
    description: 'Flex 訊息中的對齊佈局元件'
  },

  // ============ 互動動作積木別名 ============
  {
    primaryId: 'uri-action',
    aliases: ['action', 'url_action', 'url-action', 'uri_action'],
    category: BlockCategory.ACTION,
    displayName: 'URI 動作',
    description: '開啟網址的互動動作'
  },
  {
    primaryId: 'camera-action',
    aliases: ['camera', 'camera_action'],
    category: BlockCategory.ACTION,
    displayName: '相機動作',
    description: '開啟相機的互動動作'
  },
  {
    primaryId: 'camera-roll-action',
    aliases: ['camera_roll', 'camera-roll', 'gallery_action', 'gallery-action', 'camera_roll_action'],
    category: BlockCategory.ACTION,
    displayName: '相簿動作',
    description: '開啟相簿的互動動作'
  },
  {
    primaryId: 'location-action',
    aliases: ['location', 'location_action'],
    category: BlockCategory.ACTION,
    displayName: '位置動作',
    description: '分享位置的互動動作'
  },
  {
    primaryId: 'datetime-picker-action',
    aliases: ['datetime_picker', 'datetime-picker', 'date_picker', 'date-picker', 'datetime_picker_action'],
    category: BlockCategory.ACTION,
    displayName: '日期時間選擇器',
    description: '選擇日期時間的互動動作'
  },
  {
    primaryId: 'richmenu-switch-action',
    aliases: ['richmenu_switch', 'richmenu-switch', 'menu_switch', 'menu-switch', 'richmenu_switch_action'],
    category: BlockCategory.ACTION,
    displayName: '選單切換',
    description: '切換圖文選單的互動動作'
  },
  {
    primaryId: 'clipboard-action',
    aliases: ['clipboard', 'copy_action', 'copy-action', 'clipboard_action'],
    category: BlockCategory.ACTION,
    displayName: '剪貼簿動作',
    description: '複製到剪貼簿的互動動作'
  },
];

/**
 * 初始化反向映射表
 */
function initializeReverseMappingTable(): void {
  // 清空反向映射表
  Object.keys(REVERSE_BLOCK_TYPE_MAPPING).forEach(key => {
    delete REVERSE_BLOCK_TYPE_MAPPING[key];
  });

  // 從別名映射表建立反向映射
  BLOCK_ALIASES.forEach(alias => {
    const { primaryId, aliases } = alias;
    
    // 主要 ID 指向自己
    if (!REVERSE_BLOCK_TYPE_MAPPING[primaryId]) {
      REVERSE_BLOCK_TYPE_MAPPING[primaryId] = [];
    }
    REVERSE_BLOCK_TYPE_MAPPING[primaryId].push(primaryId);
    
    // 處理所有別名
    aliases.forEach(aliasId => {
      if (!REVERSE_BLOCK_TYPE_MAPPING[primaryId]) {
        REVERSE_BLOCK_TYPE_MAPPING[primaryId] = [];
      }
      if (!REVERSE_BLOCK_TYPE_MAPPING[primaryId].includes(aliasId)) {
        REVERSE_BLOCK_TYPE_MAPPING[primaryId].push(aliasId);
      }
    });
  });

  // 從基本映射表建立反向映射
  Object.entries(BLOCK_TYPE_MAPPING).forEach(([oldId, newId]) => {
    if (!REVERSE_BLOCK_TYPE_MAPPING[newId]) {
      REVERSE_BLOCK_TYPE_MAPPING[newId] = [];
    }
    if (!REVERSE_BLOCK_TYPE_MAPPING[newId].includes(oldId)) {
      REVERSE_BLOCK_TYPE_MAPPING[newId].push(oldId);
    }
  });
}

/**
 * 映射舊的 blockType 到新的統一 ID
 */
export function mapBlockType(oldBlockType: string): string {
  // 直接查找映射表
  const mappedType = BLOCK_TYPE_MAPPING[oldBlockType];
  if (mappedType) {
    return mappedType;
  }

  // 查找別名映射
  const aliasMatch = BLOCK_ALIASES.find(
    alias => alias.primaryId === oldBlockType || alias.aliases.includes(oldBlockType)
  );
  if (aliasMatch) {
    return aliasMatch.primaryId;
  }

  // 如果沒有找到映射，回傳原始值並記錄警告
  console.warn(`未找到積木類型 "${oldBlockType}" 的映射，使用原始值`);
  return oldBlockType;
}

/**
 * 獲取新 ID 對應的所有舊格式 ID
 */
export function getOldBlockTypes(newBlockType: string): string[] {
  return REVERSE_BLOCK_TYPE_MAPPING[newBlockType] || [newBlockType];
}

/**
 * 檢查是否為有效的積木類型（包含別名）
 */
export function isValidBlockType(blockType: string): boolean {
  // 檢查是否在映射表中
  if (BLOCK_TYPE_MAPPING[blockType]) {
    return true;
  }

  // 檢查是否在別名映射中
  const aliasMatch = BLOCK_ALIASES.find(
    alias => alias.primaryId === blockType || alias.aliases.includes(blockType)
  );
  return !!aliasMatch;
}

/**
 * 獲取積木的完整資訊（包含別名）
 */
export function getBlockTypeInfo(blockType: string): BlockTypeAlias | null {
  const mappedType = mapBlockType(blockType);
  const aliasInfo = BLOCK_ALIASES.find(alias => alias.primaryId === mappedType);
  return aliasInfo || null;
}

/**
 * 獲取所有別名映射
 */
export function getAllBlockAliases(): BlockTypeAlias[] {
  return [...BLOCK_ALIASES];
}

/**
 * 獲取指定類別的所有積木別名
 */
export function getBlockAliasesByCategory(category: BlockCategory): BlockTypeAlias[] {
  return BLOCK_ALIASES.filter(alias => alias.category === category);
}

/**
 * 搜尋積木（支援模糊搜尋）
 */
export function searchBlocks(query: string): BlockTypeAlias[] {
  const lowerQuery = query.toLowerCase();
  
  return BLOCK_ALIASES.filter(alias => {
    // 檢查主要 ID
    if (alias.primaryId.toLowerCase().includes(lowerQuery)) {
      return true;
    }
    
    // 檢查別名
    if (alias.aliases.some(a => a.toLowerCase().includes(lowerQuery))) {
      return true;
    }
    
    // 檢查顯示名稱
    if (alias.displayName.toLowerCase().includes(lowerQuery)) {
      return true;
    }
    
    // 檢查描述
    if (alias.description && alias.description.toLowerCase().includes(lowerQuery)) {
      return true;
    }
    
    return false;
  });
}

/**
 * 標準化積木類型名稱
 */
export function normalizeBlockType(blockType: string): string {
  return mapBlockType(blockType);
}

/**
 * 取得映射統計資訊
 */
export function getMappingStatistics() {
  const totalMappings = Object.keys(BLOCK_TYPE_MAPPING).length;
  const totalAliases = BLOCK_ALIASES.length;
  const categoryStats = BLOCK_ALIASES.reduce((stats, alias) => {
    stats[alias.category] = (stats[alias.category] || 0) + 1;
    return stats;
  }, {} as Record<BlockCategory, number>);

  return {
    totalMappings,
    totalAliases,
    categoryStats,
    coveragePercentage: (totalMappings / totalAliases) * 100,
  };
}

// 初始化反向映射表
initializeReverseMappingTable();

// 開發環境下輸出映射統計
if (process.env.NODE_ENV === 'development') {
  console.log('🗺️ 積木映射系統初始化完成:', getMappingStatistics());
}
