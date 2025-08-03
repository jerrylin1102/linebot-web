/**
 * 直接測試積木映射系統
 * 模擬實際使用情況，測試是否還會出現警告
 */

// 模擬 console.warn 來捕獲警告
const originalWarn = console.warn;
const warnings = [];

console.warn = function(...args) {
  const message = args.join(' ');
  if (message.includes('未找到積木類型') || message.includes('使用原始值')) {
    warnings.push(message);
  }
  originalWarn.apply(console, args);
};

// 導入映射函數
import { mapBlockType, isValidBlockType } from './components/visual-editor/utils/blockMapping.js';

// 測試所有原本會產生警告的積木類型
const testTypes = [
  // 原始警告中的回覆積木類型
  'audio-reply', 'flex-reply', 'image-reply', 'location-reply', 'quick-reply',
  'sticker-message', 'sticker-reply', 'template-reply', 'text-reply', 'video-reply',
  
  // 原始警告中的事件積木類型
  'audio-message-event', 'file-message-event', 'follow-event', 'image-message-event',
  'member-joined-event', 'member-left-event', 'postback-event', 'sticker-message-event',
  'text-message-event', 'unfollow-event', 'video-message-event',
  
  // 原始警告中的控制積木類型
  'if-then-control', 'loop-control', 'wait-control',
  
  // 原始警告中的設定積木類型
  'get-variable-setting', 'save-user-data-setting', 'set-variable-setting',
  
  // 原始警告中的 Flex 積木類型
  'box-container', 'bubble-container', 'carousel-container',
  'button-content', 'icon-content', 'image-content', 'span-content', 'text-content', 'video-content',
  'align-layout', 'filler-layout', 'separator-content', 'spacer-layout',
  
  // 原始警告中的動作積木類型
  'camera-action', 'camera-roll-action', 'clipboard-action', 'datetime-picker-action',
  'location-action', 'richmenu-switch-action', 'uri-action'
];

console.log('🧪 開始測試積木映射修正...\n');

let successCount = 0;
let failCount = 0;

testTypes.forEach(blockType => {
  try {
    const mapped = mapBlockType(blockType);
    const isValid = isValidBlockType(blockType);
    
    if (mapped === blockType && isValid) {
      console.log(`✅ ${blockType} - 直接識別成功`);
      successCount++;
    } else if (mapped !== blockType && isValid) {
      console.log(`🔄 ${blockType} -> ${mapped} - 映射成功`);
      successCount++;
    } else {
      console.log(`❌ ${blockType} - 映射失敗`);
      failCount++;
    }
  } catch (error) {
    console.log(`💥 ${blockType} - 發生錯誤: ${error.message}`);
    failCount++;
  }
});

console.log('\n📊 測試結果:');
console.log(`✅ 成功: ${successCount}`);
console.log(`❌ 失敗: ${failCount}`);
console.log(`⚠️ 警告數量: ${warnings.length}`);

if (warnings.length > 0) {
  console.log('\n🚨 仍存在的警告:');
  warnings.forEach(warning => console.log(`  - ${warning}`));
} else {
  console.log('\n🎉 沒有積木映射警告！修正成功！');
}

// 恢復原始 console.warn
console.warn = originalWarn;

// 測試完成
console.log('\n✨ 積木映射修正測試完成');