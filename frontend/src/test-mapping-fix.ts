/**
 * 積木映射系統修正測試
 * 測試所有積木類型是否能正確映射，確認警告訊息已消失
 */

import { 
  mapBlockType, 
  isValidBlockType, 
  getBlockTypeInfo,
  getAllBlockAliases,
  getMappingStatistics,
  BLOCK_TYPE_MAPPING
} from './components/visual-editor/utils/blockMapping';

// 實際存在的積木ID列表（從實際文件中提取）
const ACTUAL_BLOCK_IDS = [
  // 事件積木
  'text-message-event',
  'audio-message-event', 
  'file-message-event',
  'follow-event',
  'image-message-event',
  'member-joined-event',
  'member-left-event',
  'postback-event',
  'sticker-message-event',
  'unfollow-event',
  'video-message-event',
  
  // 回覆積木
  'audio-reply',
  'flex-reply',
  'image-reply',
  'location-reply',
  'quick-reply',
  'sticker-message',
  'sticker-reply',
  'template-reply',
  'text-reply',
  'video-reply',
  
  // 控制積木
  'if-then-control',
  'loop-control',
  'wait-control',
  
  // 設定積木
  'get-variable-setting',
  'save-user-data-setting',
  'set-variable-setting',
  
  // Flex 容器積木
  'box-container',
  'bubble-container',
  'carousel-container',
  
  // Flex 內容積木
  'button-content',
  'icon-content',
  'image-content',
  'span-content',
  'text-content',
  'video-content',
  
  // Flex 佈局積木
  'align-layout',
  'filler-layout',
  'separator-content',
  'spacer-layout',
  
  // 動作積木
  'camera-action',
  'camera-roll-action',
  'clipboard-action',
  'datetime-picker-action',
  'location-action',
  'richmenu-switch-action',
  'uri-action'
];

// 常見的舊格式積木類型（需要映射的）
const OLD_FORMAT_TYPES = [
  // 舊格式事件積木
  'text_message_event',
  'audio_message_event',
  'video_message_event',
  'image_message_event',
  'file_message_event',
  'sticker_message_event',
  'postback_event',
  'follow_event',
  'unfollow_event',
  'member_joined_event',
  'member_left_event',
  
  // 舊格式回覆積木
  'text_reply',
  'audio_reply',
  'video_reply',
  'image_reply',
  'flex_reply',
  'sticker_reply',
  'template_reply',
  'quick_reply',
  'location_reply',
  
  // 舊格式控制積木
  'if_then_control',
  'loop_control',
  'wait_control',
  
  // 舊格式設定積木
  'get_variable_setting',
  'set_variable_setting',
  'save_user_data_setting',
  
  // 舊格式 Flex 積木
  'bubble_container',
  'carousel_container',
  'box_container',
  'text_content',
  'image_content',
  'button_content',
  'icon_content',
  'video_content',
  'span_content',
  'separator_content',
  'spacer_layout',
  'filler_layout',
  'align_layout',
  
  // 舊格式動作積木
  'uri_action',
  'camera_action',
  'camera_roll_action',
  'location_action',
  'datetime_picker_action',
  'richmenu_switch_action',
  'clipboard_action'
];

/**
 * 測試積木映射功能
 */
function testBlockMapping() {
  console.log('🧪 開始測試積木映射系統...\n');
  
  let successCount = 0;
  let errorCount = 0;
  const errors: string[] = [];
  
  // 測試 1: 實際積木ID應該能正確識別
  console.log('📝 測試 1: 實際積木ID識別');
  ACTUAL_BLOCK_IDS.forEach(blockId => {
    const mapped = mapBlockType(blockId);
    const isValid = isValidBlockType(blockId);
    
    if (mapped === blockId && isValid) {
      console.log(`✅ ${blockId} -> ${mapped}`);
      successCount++;
    } else {
      console.log(`❌ ${blockId} -> ${mapped} (valid: ${isValid})`);
      errors.push(`實際積木ID "${blockId}" 無法正確識別`);
      errorCount++;
    }
  });
  
  console.log('\n📝 測試 2: 舊格式積木ID映射');
  OLD_FORMAT_TYPES.forEach(oldId => {
    const mapped = mapBlockType(oldId);
    const isValid = isValidBlockType(oldId);
    
    if (mapped !== oldId && isValid) {
      console.log(`✅ ${oldId} -> ${mapped}`);
      successCount++;
    } else {
      console.log(`❌ ${oldId} -> ${mapped} (valid: ${isValid})`);
      errors.push(`舊格式積木ID "${oldId}" 映射失敗`);
      errorCount++;
    }
  });
  
  // 測試 3: 檢查別名映射
  console.log('\n📝 測試 3: 別名映射檢查');
  const aliases = getAllBlockAliases();
  aliases.forEach(alias => {
    const info = getBlockTypeInfo(alias.primaryId);
    if (info && info.primaryId === alias.primaryId) {
      console.log(`✅ 別名映射: ${alias.displayName} (${alias.primaryId})`);
      successCount++;
    } else {
      console.log(`❌ 別名映射失敗: ${alias.primaryId}`);
      errors.push(`別名映射失敗: ${alias.primaryId}`);
      errorCount++;
    }
  });
  
  // 測試 4: 映射統計
  console.log('\n📊 映射統計資訊:');
  const stats = getMappingStatistics();
  console.log(`總映射數量: ${stats.totalMappings}`);
  console.log(`總別名數量: ${stats.totalAliases}`);
  console.log(`涵蓋率: ${stats.coveragePercentage.toFixed(2)}%`);
  console.log(`各類別統計:`, stats.categoryStats);
  
  // 總結
  console.log('\n📈 測試結果總結:');
  console.log(`✅ 成功: ${successCount}`);
  console.log(`❌ 失敗: ${errorCount}`);
  
  if (errorCount === 0) {
    console.log('🎉 所有測試通過！積木映射系統工作正常。');
  } else {
    console.log('⚠️ 發現問題:');
    errors.forEach(error => console.log(`  - ${error}`));
  }
  
  return {
    success: errorCount === 0,
    successCount,
    errorCount,
    errors
  };
}

/**
 * 測試特定問題類型的映射
 */
function testProblematicTypes() {
  console.log('\n🔍 測試問題積木類型:');
  
  // 這些是控制台警告中提到的積木類型
  const problematicTypes = [
    'audio-reply', 'flex-reply', 'image-reply', 'location-reply', 'quick-reply',
    'sticker-message', 'sticker-reply', 'template-reply', 'text-reply', 'video-reply',
    'audio-message-event', 'file-message-event', 'follow-event', 'image-message-event',
    'member-joined-event', 'member-left-event', 'postback-event', 'sticker-message-event',
    'text-message-event', 'unfollow-event', 'video-message-event',
    'if-then-control', 'loop-control', 'wait-control',
    'get-variable-setting', 'save-user-data-setting', 'set-variable-setting',
    'box-container', 'bubble-container', 'carousel-container',
    'button-content', 'icon-content', 'image-content', 'span-content', 'text-content', 'video-content',
    'align-layout', 'filler-layout', 'separator-content', 'spacer-layout',
    'camera-action', 'camera-roll-action', 'clipboard-action', 'datetime-picker-action',
    'location-action', 'richmenu-switch-action', 'uri-action'
  ];
  
  problematicTypes.forEach(type => {
    const mapped = mapBlockType(type);
    const isValid = isValidBlockType(type);
    const info = getBlockTypeInfo(type);
    
    console.log(`📋 ${type}:`);
    console.log(`  映射結果: ${mapped}`);
    console.log(`  是否有效: ${isValid}`);
    console.log(`  別名資訊: ${info ? info.displayName : '無'}`);
    console.log('');
  });
}

// 執行測試
if (typeof window === 'undefined') {
  // Node.js 環境
  const result = testBlockMapping();
  testProblematicTypes();
  
  if (!result.success) {
    process.exit(1);
  }
} else {
  // 瀏覽器環境
  (window as any).testBlockMapping = testBlockMapping;
  (window as any).testProblematicTypes = testProblematicTypes;
  
  console.log('🔧 積木映射測試函數已載入到 window 物件');
  console.log('使用 testBlockMapping() 執行完整測試');
  console.log('使用 testProblematicTypes() 測試問題積木類型');
}

export { testBlockMapping, testProblematicTypes };