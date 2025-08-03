/**
 * 統一代碼生成器測試檔案
 * 驗證向後相容性和新功能
 */

import { generateUnifiedCode } from './unifiedCodeGenerator';

// 測試向後相容性的舊格式積木
const oldFormatBlocks = [
  {
    blockType: "event",
    blockData: {
      eventType: "message.text",
      condition: "hello"
    }
  },
  {
    blockType: "reply",
    blockData: {
      replyType: "text",
      content: "Hello World!"
    }
  }
];

// 測試新的事件積木
const newEventBlocks = [
  {
    blockType: "audio_message_event", 
    blockData: {
      eventType: "message.audio"
    }
  },
  {
    blockType: "video_message_event",
    blockData: {
      eventType: "message.video"
    }
  },
  {
    blockType: "member_joined_event",
    blockData: {
      eventType: "memberJoined"
    }
  }
];

// 測試新的回覆積木
const newReplyBlocks = [
  {
    blockType: "audio_reply",
    blockData: {
      replyType: "audio",
      audioUrl: "https://example.com/audio.m4a",
      duration: 5000
    }
  },
  {
    blockType: "video_reply", 
    blockData: {
      replyType: "video",
      videoUrl: "https://example.com/video.mp4",
      previewImageUrl: "https://example.com/preview.jpg"
    }
  },
  {
    blockType: "template_reply",
    blockData: {
      replyType: "template",
      templateType: "buttons",
      text: "請選擇一個選項",
      actions: [
        {
          type: "postback",
          label: "選項1",
          data: "option_1"
        },
        {
          type: "uri",
          label: "開啟連結", 
          uri: "https://example.com"
        }
      ]
    }
  }
];

// 測試函數
export function testUnifiedCodeGenerator() {
  console.log("🧪 開始測試統一代碼生成器...");
  
  try {
    // 測試1：向後相容性
    console.log("\n📊 測試1：向後相容性");
    const oldCode = generateUnifiedCode(oldFormatBlocks);
    console.log("✅ 舊格式積木代碼生成成功");
    console.log("生成的代碼長度:", oldCode.length, "字符");
    
    // 測試2：新事件積木
    console.log("\n📊 測試2：新事件積木");
    const newEventCode = generateUnifiedCode(newEventBlocks);
    console.log("✅ 新事件積木代碼生成成功");
    console.log("生成的代碼長度:", newEventCode.length, "字符");
    
    // 測試3：新回覆積木
    console.log("\n📊 測試3：新回覆積木");
    const newReplyCode = generateUnifiedCode(newReplyBlocks);
    console.log("✅ 新回覆積木代碼生成成功");
    console.log("生成的代碼長度:", newReplyCode.length, "字符");
    
    // 測試4：混合測試
    console.log("\n📊 測試4：混合測試");
    const mixedBlocks = [...oldFormatBlocks, ...newEventBlocks.slice(0, 1), ...newReplyBlocks.slice(0, 1)];
    const mixedCode = generateUnifiedCode(mixedBlocks);
    console.log("✅ 混合積木代碼生成成功");
    console.log("生成的代碼長度:", mixedCode.length, "字符");
    
    // 驗證生成的代碼包含必要的元素
    console.log("\n🔍 驗證生成的代碼內容...");
    
    const validationChecks = [
      { check: mixedCode.includes("from linebot import LineBotApi"), name: "包含基本import" },
      { check: mixedCode.includes("AudioMessage"), name: "包含AudioMessage import" },
      { check: mixedCode.includes("VideoMessage"), name: "包含VideoMessage import" },
      { check: mixedCode.includes("MemberJoinedEvent"), name: "包含MemberJoinedEvent import" },
      { check: mixedCode.includes("AudioSendMessage"), name: "包含AudioSendMessage import" },
      { check: mixedCode.includes("VideoSendMessage"), name: "包含VideoSendMessage import" },
      { check: mixedCode.includes("TemplateSendMessage"), name: "包含TemplateSendMessage import" },
      { check: mixedCode.includes("@handler.add"), name: "包含事件處理器" },
      { check: mixedCode.includes("reply_messages"), name: "包含回覆訊息邏輯" },
      { check: mixedCode.includes("line_bot_api.reply_message"), name: "包含回覆API調用" },
      { check: mixedCode.includes("if __name__ == \"__main__\""), name: "包含主程式入口" }
    ];
    
    let passedChecks = 0;
    validationChecks.forEach(({ check, name }) => {
      if (check) {
        console.log(`✅ ${name}`);
        passedChecks++;
      } else {
        console.log(`❌ ${name}`);
      }
    });
    
    console.log(`\n📊 驗證結果: ${passedChecks}/${validationChecks.length} 項檢查通過`);
    
    if (passedChecks === validationChecks.length) {
      console.log("🎉 所有測試通過！統一代碼生成器工作正常。");
      return true;
    } else {
      console.log("⚠️ 部分測試失敗，需要進一步檢查。");
      return false;
    }
    
  } catch (error) {
    console.error("❌ 測試過程中發生錯誤:", error);
    return false;
  }
}

// 如果直接執行此檔案，則運行測試
if (typeof window === 'undefined') {
  // Node.js 環境
  testUnifiedCodeGenerator();
}