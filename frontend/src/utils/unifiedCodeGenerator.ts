/**
 * 統一積木代碼生成器
 * 支援邏輯積木和 Flex 積木的混合代碼生成
 */

import { UnifiedBlock, BlockCategory } from "../types/block";
import { migrateBlock } from "./blockCompatibility";
import { LineAction } from "../types/lineActions";

// Quick Reply 相關類型
interface QuickReplyItem {
  action: LineAction;
}

// Template Action 相關類型
interface TemplateAction extends LineAction {
  label?: string;
}

// 向後相容的舊格式介面
interface LegacyBlock {
  blockType: string;
  blockData: { [key: string]: unknown };
}

/**
 * 生成 LINE Bot 的完整程式碼
 */
export function generateUnifiedCode(
  logicBlocks: (UnifiedBlock | LegacyBlock)[],
  flexBlocks: (UnifiedBlock | LegacyBlock)[] = []
): string {
  // 轉換所有積木到統一格式
  const normalizedLogicBlocks = normalizeBlocks(logicBlocks);
  const normalizedFlexBlocks = normalizeBlocks(flexBlocks);

  // 合併所有積木進行統一處理
  const allBlocks = [...normalizedLogicBlocks, ...normalizedFlexBlocks];

  let code = generatePythonTemplate();

  // 生成事件處理器
  code += generateEventHandlers(allBlocks);

  // 生成 Flex 訊息定義
  code += generateFlexMessageDefinitions(normalizedFlexBlocks);

  // 生成主程式碼
  code += generateMainCode();

  return code;
}

/**
 * 轉換積木到統一格式
 */
function normalizeBlocks(
  blocks: (UnifiedBlock | LegacyBlock)[]
): UnifiedBlock[] {
  return blocks.map((block) => {
    if ("category" in block) {
      return block as UnifiedBlock;
    } else {
      return migrateBlock(block as LegacyBlock);
    }
  });
}

/**
 * 生成 Python 模板
 */
function generatePythonTemplate(): string {
  return `# LINE Bot 自動生成程式碼
# 使用統一積木系統生成

from flask import Flask, request, abort
from linebot import LineBotApi, WebhookHandler
from linebot.exceptions import InvalidSignatureError
from linebot.models import (
    # 事件類型
    MessageEvent, TextMessage, ImageMessage, AudioMessage, VideoMessage, 
    FileMessage, StickerMessage, PostbackEvent, FollowEvent, UnfollowEvent,
    MemberJoinedEvent, MemberLeftEvent,
    
    # 回覆訊息類型
    TextSendMessage, ImageSendMessage, AudioSendMessage, VideoSendMessage,
    LocationSendMessage, StickerSendMessage, FlexSendMessage, TemplateSendMessage,
    
    # 模板類型
    ButtonsTemplate, ConfirmTemplate, CarouselTemplate, ImageCarouselTemplate,
    
    # Action 類型
    MessageAction, URIAction, PostbackAction, CameraAction, CameraRollAction,
    LocationAction, DatetimePickerAction, RichMenuSwitchAction, ClipboardAction,
    
    # Quick Reply
    QuickReply, QuickReplyButton
)

app = Flask(__name__)

# LINE Bot 設定
line_bot_api = LineBotApi('YOUR_CHANNEL_ACCESS_TOKEN')
handler = WebhookHandler('YOUR_CHANNEL_SECRET')

@app.route("/callback", methods=['POST'])
def callback():
    signature = request.headers['X-Line-Signature']
    body = request.get_data(as_text=True)
    
    try:
        handler.handle(body, signature)
    except InvalidSignatureError:
        abort(400)
    
    return 'OK'

`;
}

/**
 * 生成事件處理器
 */
function generateEventHandlers(blocks: UnifiedBlock[]): string {
  let code = "";

  const eventBlocks = blocks.filter(
    (block) => block.category === BlockCategory.EVENT
  );
  const replyBlocks = blocks.filter(
    (block) => block.category === BlockCategory.REPLY
  );
  const controlBlocks = blocks.filter(
    (block) => block.category === BlockCategory.CONTROL
  );

  // 為每個事件積木生成處理器
  eventBlocks.forEach((eventBlock, index) => {
    const eventType = eventBlock.blockData.eventType as string;
    const condition = eventBlock.blockData.condition as string;

    code += generateEventHandlerCode(eventType, condition, index, replyBlocks, controlBlocks, blocks);
  });

  // 如果沒有事件積木，生成一個基本的文字訊息處理器
  if (eventBlocks.length === 0 && replyBlocks.length > 0) {
    code += generateDefaultTextHandler(replyBlocks, controlBlocks, blocks);
  }

  return code;
}

/**
 * 生成特定事件類型的處理器代碼
 */
function generateEventHandlerCode(
  eventType: string, 
  condition: string, 
  index: number, 
  replyBlocks: UnifiedBlock[], 
  controlBlocks: UnifiedBlock[], 
  allBlocks: UnifiedBlock[]
): string {
  let code = "";

  switch (eventType) {
    case "message.text":
      code += `@handler.add(MessageEvent, message=TextMessage)
def handle_text_message_${index}(event):
    user_message = event.message.text
    reply_messages = []
    
`;
      if (condition) {
        code += `    # 檢查訊息條件
    if "${condition}" in user_message:
`;
      }
      break;

    case "message.image":
      code += `@handler.add(MessageEvent, message=ImageMessage)
def handle_image_message_${index}(event):
    message_id = event.message.id
    reply_messages = []
    
`;
      break;

    case "message.audio":
      code += `@handler.add(MessageEvent, message=AudioMessage)
def handle_audio_message_${index}(event):
    message_id = event.message.id
    duration = event.message.duration
    reply_messages = []
    
`;
      break;

    case "message.video":
      code += `@handler.add(MessageEvent, message=VideoMessage)
def handle_video_message_${index}(event):
    message_id = event.message.id
    duration = event.message.duration
    reply_messages = []
    
`;
      break;

    case "message.file":
      code += `@handler.add(MessageEvent, message=FileMessage)
def handle_file_message_${index}(event):
    message_id = event.message.id
    file_name = event.message.file_name
    file_size = event.message.file_size
    reply_messages = []
    
`;
      break;

    case "message.sticker":
      code += `@handler.add(MessageEvent, message=StickerMessage)
def handle_sticker_message_${index}(event):
    package_id = event.message.package_id
    sticker_id = event.message.sticker_id
    reply_messages = []
    
`;
      break;

    case "postback":
      code += `@handler.add(PostbackEvent)
def handle_postback_${index}(event):
    postback_data = event.postback.data
    reply_messages = []
    
`;
      if (condition) {
        code += `    # 檢查 postback 數據條件
    if postback_data == "${condition}":
`;
      }
      break;

    case "follow":
      code += `@handler.add(FollowEvent)
def handle_follow_${index}(event):
    user_id = event.source.user_id
    reply_messages = []
    
`;
      break;

    case "unfollow":
      code += `@handler.add(UnfollowEvent)
def handle_unfollow_${index}(event):
    user_id = event.source.user_id
    # 取消追蹤事件，無法回覆訊息
    print(f"用戶 {user_id} 取消追蹤")
    return

`;
      return code; // unfollow 不能回覆訊息，直接返回

    case "memberJoined":
      code += `@handler.add(MemberJoinedEvent)
def handle_member_joined_${index}(event):
    joined_members = event.joined.members
    reply_messages = []
    
`;
      break;

    case "memberLeft":
      code += `@handler.add(MemberLeftEvent)
def handle_member_left_${index}(event):
    left_members = event.left.members
    reply_messages = []
    
`;
      break;

    default:
      code += `# 未支援的事件類型: ${eventType}
@handler.add(MessageEvent, message=TextMessage)
def handle_unknown_event_${index}(event):
    reply_messages = []
    
`;
  }

  // 添加回覆邏輯
  const indent = condition ? "        " : "    ";
  replyBlocks.forEach((replyBlock) => {
    code += generateReplyCode(replyBlock, allBlocks, indent);
  });

  // 添加控制邏輯
  controlBlocks.forEach((controlBlock) => {
    code += generateControlCode(controlBlock, indent);
  });

  // 添加回覆發送邏輯（除了 unfollow 事件）
  if (eventType !== "unfollow") {
    code += `${indent}
${indent}if reply_messages:
${indent}    line_bot_api.reply_message(event.reply_token, reply_messages)

`;
  }

  return code;
}

/**
 * 生成預設的文字訊息處理器
 */
function generateDefaultTextHandler(
  replyBlocks: UnifiedBlock[], 
  controlBlocks: UnifiedBlock[], 
  allBlocks: UnifiedBlock[]
): string {
  let code = `@handler.add(MessageEvent, message=TextMessage)
def handle_message(event):
    user_message = event.message.text
    reply_messages = []
    
`;

  // 添加回覆邏輯
  replyBlocks.forEach((replyBlock) => {
    code += generateReplyCode(replyBlock, allBlocks);
  });

  // 添加控制邏輯
  controlBlocks.forEach((controlBlock) => {
    code += generateControlCode(controlBlock);
  });

  code += `    
    if reply_messages:
        line_bot_api.reply_message(event.reply_token, reply_messages)

`;

  return code;
}

/**
 * 生成回覆積木代碼
 */
function generateReplyCode(
  replyBlock: UnifiedBlock,
  allBlocks: UnifiedBlock[],
  indent: string = "    "
): string {
  const replyType = replyBlock.blockData.replyType as string;

  switch (replyType) {
    case "text":
      return `${indent}reply_messages.append(TextSendMessage(text="${replyBlock.blockData.title || replyBlock.blockData.content || "回覆訊息"}"))
`;

    case "flex": {
      // 查找相關的 Flex 積木
      const flexBlocks = allBlocks.filter(
        (block) =>
          block.category === BlockCategory.FLEX_CONTAINER ||
          block.category === BlockCategory.FLEX_CONTENT ||
          block.category === BlockCategory.FLEX_LAYOUT
      );

      if (flexBlocks.length > 0) {
        const timestamp = Date.now();
        return `${indent}reply_messages.append(FlexSendMessage(alt_text="Flex 訊息", contents=flex_message_${timestamp}()))
`;
      }
      return `${indent}reply_messages.append(TextSendMessage(text="Flex 訊息功能尚未完整設定"))
`;
    }

    case "image":
      return `${indent}reply_messages.append(ImageSendMessage(
${indent}    original_content_url="${replyBlock.blockData.imageUrl || replyBlock.blockData.originalContentUrl || "https://example.com/image.jpg"}",
${indent}    preview_image_url="${replyBlock.blockData.previewImageUrl || replyBlock.blockData.imageUrl || "https://example.com/preview.jpg"}"
${indent}))
`;

    case "audio":
      return `${indent}reply_messages.append(AudioSendMessage(
${indent}    original_content_url="${replyBlock.blockData.audioUrl || replyBlock.blockData.originalContentUrl || "https://example.com/audio.m4a"}",
${indent}    duration=${replyBlock.blockData.duration || 60000}
${indent}))
`;

    case "video":
      return `${indent}reply_messages.append(VideoSendMessage(
${indent}    original_content_url="${replyBlock.blockData.videoUrl || replyBlock.blockData.originalContentUrl || "https://example.com/video.mp4"}",
${indent}    preview_image_url="${replyBlock.blockData.previewImageUrl || "https://example.com/preview.jpg"}"${
          replyBlock.blockData.trackingId 
            ? `,\n${indent}    tracking_id="${replyBlock.blockData.trackingId}"` 
            : ""
        }
${indent}))
`;

    case "location":
      return `${indent}reply_messages.append(LocationSendMessage(
${indent}    title="${replyBlock.blockData.locationTitle || replyBlock.blockData.title || "我的位置"}",
${indent}    address="${replyBlock.blockData.address || "台北市信義區市府路1號"}",
${indent}    latitude=${replyBlock.blockData.latitude || 25.0408578889},
${indent}    longitude=${replyBlock.blockData.longitude || 121.567904444}
${indent}))
`;

    case "sticker":
      return `${indent}reply_messages.append(StickerSendMessage(
${indent}    package_id="${replyBlock.blockData.packageId || "446"}",
${indent}    sticker_id="${replyBlock.blockData.stickerId || "1988"}"
${indent}))
`;

    case "template": {
      const templateType = replyBlock.blockData.templateType || "buttons";
      const actions = generateTemplateActions(replyBlock.blockData.actions || [], indent);
      return `${indent}# Template Message - ${templateType}
${indent}template_message = TemplateSendMessage(
${indent}    alt_text="${replyBlock.blockData.altText || "這是一個模板訊息"}",
${indent}    template=${templateType.charAt(0).toUpperCase() + templateType.slice(1)}Template(
${indent}        text="${replyBlock.blockData.text || "請選擇一個選項："}",
${indent}        actions=[
${actions}
${indent}        ]
${indent}    )
${indent})
${indent}reply_messages.append(template_message)
`;
    }

    case "quickreply": {
      const quickReplyItems = generateQuickReplyItems(replyBlock.blockData.quickReplyItems || [], indent);
      return `${indent}# Quick Reply Message
${indent}quick_reply = QuickReply(items=[
${quickReplyItems}
${indent}])
${indent}text_message = TextSendMessage(
${indent}    text="${replyBlock.blockData.text || "請選擇："}",
${indent}    quick_reply=quick_reply
${indent})
${indent}reply_messages.append(text_message)
`;
    }

    default:
      return `${indent}reply_messages.append(TextSendMessage(text="未支援的回覆類型: ${replyType}"))
`;
  }
}

/**
 * 生成模板Action代碼
 */
function generateTemplateActions(actions: TemplateAction[], indent: string): string {
  if (!actions || actions.length === 0) {
    return `${indent}            MessageAction(label="選項1", text="用戶選擇了選項1"),
${indent}            URIAction(label="開啟連結", uri="https://example.com")`;
  }

  return actions.map(action => {
    switch (action.type) {
      case "postback":
        return `${indent}            PostbackAction(label="${action.label || "Postback"}", data="${action.data || "action_data"}"${action.text ? `, text="${action.text}"` : ""})`;
      
      case "message":
        return `${indent}            MessageAction(label="${action.label || "Message"}", text="${action.text || "Hello"}")`;
      
      case "uri":
        return `${indent}            URIAction(label="${action.label || "Link"}", uri="${action.uri || "https://example.com"}")`;
      
      case "camera":
        return `${indent}            CameraAction(label="${action.label || "Camera"}")`;
      
      case "cameraRoll":
        return `${indent}            CameraRollAction(label="${action.label || "Camera Roll"}")`;
      
      case "location":
        return `${indent}            LocationAction(label="${action.label || "Location"}")`;
      
      case "datetimepicker":
        return `${indent}            DatetimePickerAction(
${indent}                label="${action.label || "Select Date"}",
${indent}                data="${action.data || "datetime_selected"}",
${indent}                mode="${action.mode || "datetime"}"${
                  action.initial ? `,\n${indent}                initial="${action.initial}"` : ""
                }${
                  action.max ? `,\n${indent}                max="${action.max}"` : ""
                }${
                  action.min ? `,\n${indent}                min="${action.min}"` : ""
                }
${indent}            )`;
      
      case "richmenuswitch":
        return `${indent}            RichMenuSwitchAction(
${indent}                rich_menu_alias_id="${action.richMenuAliasId || "alias_1"}",
${indent}                data="${action.data || "richmenu_switched"}"
${indent}            )`;
      
      case "clipboard":
        return `${indent}            ClipboardAction(clipboard_text="${action.clipboardText || "Copied text"}")`;
      
      default:
        return `${indent}            MessageAction(label="${action.label || "Unknown"}", text="未支援的Action類型: ${action.type}")`;
    }
  }).join(",\n");
}

/**
 * 生成Quick Reply項目代碼
 */
function generateQuickReplyItems(items: QuickReplyItem[], indent: string): string {
  if (!items || items.length === 0) {
    return `${indent}    QuickReplyButton(action=MessageAction(label="是", text="是")),
${indent}    QuickReplyButton(action=MessageAction(label="否", text="否"))`;
  }

  return items.map(item => {
    const action = item.action || {};
    switch (action.type) {
      case "postback":
        return `${indent}    QuickReplyButton(action=PostbackAction(label="${action.label || "Postback"}", data="${action.data || "action_data"}"${action.text ? `, text="${action.text}"` : ""}))`;
      
      case "message":
        return `${indent}    QuickReplyButton(action=MessageAction(label="${action.label || "Message"}", text="${action.text || "Hello"}"))`;
      
      case "uri":
        return `${indent}    QuickReplyButton(action=URIAction(label="${action.label || "Link"}", uri="${action.uri || "https://example.com"}"))`;
      
      case "camera":
        return `${indent}    QuickReplyButton(action=CameraAction(label="${action.label || "Camera"}"))`;
      
      case "cameraRoll":
        return `${indent}    QuickReplyButton(action=CameraRollAction(label="${action.label || "Camera Roll"}"))`;
      
      case "location":
        return `${indent}    QuickReplyButton(action=LocationAction(label="${action.label || "Location"}"))`;
      
      case "datetimepicker":
        return `${indent}    QuickReplyButton(action=DatetimePickerAction(
${indent}        label="${action.label || "Select Date"}",
${indent}        data="${action.data || "datetime_selected"}",
${indent}        mode="${action.mode || "datetime"}"${
          action.initial ? `,\n${indent}        initial="${action.initial}"` : ""
        }${
          action.max ? `,\n${indent}        max="${action.max}"` : ""
        }${
          action.min ? `,\n${indent}        min="${action.min}"` : ""
        }
${indent}    ))`;
      
      default:
        return `${indent}    QuickReplyButton(action=MessageAction(label="${action.label || "Unknown"}", text="未支援的Action類型: ${action.type}"))`;
    }
  }).join(",\n");
}

/**
 * 生成控制積木代碼
 */
function generateControlCode(controlBlock: UnifiedBlock, indent: string = "    "): string {
  const controlType = controlBlock.blockData.controlType as string;

  switch (controlType) {
    case "if":
    case "condition": {
      const condition = controlBlock.blockData.condition || "user_message == '條件'";
      return `${indent}# 條件判斷邏輯
${indent}if ${condition}:
${indent}    # 條件為真時的處理
${indent}    pass
${indent}else:
${indent}    # 條件為假時的處理
${indent}    pass
`;
    }

    case "loop": {
      const loopCount = controlBlock.blockData.count || 3;
      const loopVariable = controlBlock.blockData.variable || "i";
      return `${indent}# 迴圈處理邏輯
${indent}for ${loopVariable} in range(${loopCount}):
${indent}    # 重複執行的邏輯
${indent}    pass
`;
    }

    case "wait": {
      const waitTime = controlBlock.blockData.time || 1;
      return `${indent}# 等待處理邏輯
${indent}import time
${indent}time.sleep(${waitTime})
`;
    }

    case "try":
      return `${indent}# 錯誤處理邏輯
${indent}try:
${indent}    # 嘗試執行的邏輯
${indent}    pass
${indent}except Exception as e:
${indent}    # 錯誤處理
${indent}    print(f"發生錯誤: {e}")
`;

    case "function": {
      const functionName = controlBlock.blockData.functionName || "custom_function";
      return `${indent}# 自定義函數調用
${indent}def ${functionName}():
${indent}    # 函數內容
${indent}    pass
${indent}
${indent}${functionName}()
`;
    }

    default:
      return `${indent}# 未知的控制類型: ${controlType}
${indent}pass
`;
  }
}

/**
 * 生成 Flex 訊息定義
 */
function generateFlexMessageDefinitions(flexBlocks: UnifiedBlock[]): string {
  if (flexBlocks.length === 0) {
    return "";
  }

  let code = "# Flex 訊息定義\n";

  const containerBlocks = flexBlocks.filter(
    (block) => block.category === BlockCategory.FLEX_CONTAINER
  );
  const contentBlocks = flexBlocks.filter(
    (block) => block.category === BlockCategory.FLEX_CONTENT
  );

  containerBlocks.forEach((container, index) => {
    const containerType = container.blockData.containerType as string;

    code += `
def flex_message_${Date.now() + index}():
    return {
        "type": "${containerType}",
`;

    if (containerType === "bubble") {
      code += `        "body": {
            "type": "box",
            "layout": "vertical",
            "contents": [
`;

      // 添加內容積木
      contentBlocks.forEach((content) => {
        const contentType = content.blockData.contentType as string;

        switch (contentType) {
          case "text":
            code += `                {
                    "type": "text",
                    "text": "${content.blockData.title || "文字內容"}"
                },
`;
            break;
          case "button": {
            const action = content.blockData.action || {
              type: "postback",
              label: content.blockData.title || "按鈕",
              data: "button_clicked"
            };
            
            code += `                {
                    "type": "button",
                    "action": ${JSON.stringify(action, null, 20).replace(/\n/g, '\n                    ')}
                },
`;
            break;
          }
          case "image": {
            const imageUrl = content.blockData.url || "https://via.placeholder.com/300x200";
            const imageProperties = content.blockData.properties || {};
            
            code += `                {
                    "type": "image",
                    "url": "${imageUrl}",
                    "aspectRatio": "${imageProperties.aspectRatio || "1:1"}",
                    "aspectMode": "${imageProperties.aspectMode || "cover"}",
                    "size": "${imageProperties.size || "full"}"
                },
`;
            break;
          }
          case "video": {
            const videoUrl = content.blockData.url || "https://example.com/video.mp4";
            const previewUrl = content.blockData.previewUrl || "https://example.com/preview.jpg";
            const videoProperties = content.blockData.properties || {};
            
            code += `                {
                    "type": "video",
                    "url": "${videoUrl}",
                    "previewUrl": "${previewUrl}",
                    "aspectRatio": "${videoProperties.aspectRatio || "20:13"}",
                    "aspectMode": "${videoProperties.aspectMode || "cover"}"
                },
`;
            break;
          }
          case "icon": {
            const iconUrl = content.blockData.url || "https://example.com/icon.png";
            const iconProperties = content.blockData.properties || {};
            
            code += `                {
                    "type": "icon",
                    "url": "${iconUrl}",
                    "size": "${iconProperties.size || "md}"
                },
`;
            break;
          }
          case "span": {
            const spanText = content.blockData.text || "範例文字";
            const spanProperties = content.blockData.properties || {};
            
            code += `                {
                    "type": "span",
                    "text": "${spanText}",
                    "size": "${spanProperties.size || "md"}",
                    "weight": "${spanProperties.weight || "regular"}",
                    "color": "${spanProperties.color || "#000000"}",
                    "decoration": "${spanProperties.decoration || "none"}",
                    "style": "${spanProperties.style || "normal"}"
                },
`;
            break;
          }
          case "separator": {
            const separatorProperties = content.blockData.properties || {};
            
            code += `                {
                    "type": "separator",
                    "margin": "${separatorProperties.margin || "md"}",
                    "color": "${separatorProperties.color || "#B0B0B0"}"
                },
`;
            break;
          }
        }
      });

      code += `            ]
        }
`;
    }

    code += `    }

`;
  });

  return code;
}

/**
 * 生成主程式碼
 */
function generateMainCode(): string {
  return `
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
`;
}

/**
 * 生成 Flex 訊息預覽 JSON
 */
export function generateFlexPreview(
  flexBlocks: (UnifiedBlock | LegacyBlock)[]
): object {
  const normalizedBlocks = normalizeBlocks(flexBlocks);

  const containerBlocks = normalizedBlocks.filter(
    (block) => block.category === BlockCategory.FLEX_CONTAINER
  );
  const contentBlocks = normalizedBlocks.filter(
    (block) => block.category === BlockCategory.FLEX_CONTENT
  );

  if (containerBlocks.length === 0) {
    return {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "請添加 Flex 容器積木",
          },
        ],
      },
    };
  }

  const container = containerBlocks[0];
  const containerType = container.blockData.containerType as string;

  const flexMessage: Record<string, unknown> = {
    type: containerType,
  };

  if (containerType === "bubble") {
    flexMessage.body = {
      type: "box",
      layout: "vertical",
      contents: contentBlocks.map((content) => {
        const contentType = content.blockData.contentType as string;

        switch (contentType) {
          case "text":
            return {
              type: "text",
              text: content.blockData.title || "文字內容",
            };
          case "button":
            return {
              type: "button",
              action: {
                type: "postback",
                label: content.blockData.title || "按鈕",
                data: "button_clicked",
              },
            };
          case "image": {
            const imageUrl = content.blockData.url || "https://via.placeholder.com/300x200";
            const imageProperties = content.blockData.properties || {};
            return {
              type: "image",
              url: imageUrl,
              aspectRatio: imageProperties.aspectRatio || "1:1",
              aspectMode: imageProperties.aspectMode || "cover",
              size: imageProperties.size || "full",
            };
          }
          case "video": {
            const videoUrl = content.blockData.url || "https://example.com/video.mp4";
            const previewUrl = content.blockData.previewUrl || "https://example.com/preview.jpg";
            const videoProperties = content.blockData.properties || {};
            return {
              type: "video",
              url: videoUrl,
              previewUrl: previewUrl,
              aspectRatio: videoProperties.aspectRatio || "20:13",
              aspectMode: videoProperties.aspectMode || "cover",
            };
          }
          case "icon": {
            const iconUrl = content.blockData.url || "https://example.com/icon.png";
            const iconProperties = content.blockData.properties || {};
            return {
              type: "icon",
              url: iconUrl,
              size: iconProperties.size || "md",
            };
          }
          case "span": {
            const spanText = content.blockData.text || "範例文字";
            const spanProperties = content.blockData.properties || {};
            return {
              type: "span",
              text: spanText,
              size: spanProperties.size || "md",
              weight: spanProperties.weight || "regular",
              color: spanProperties.color || "#000000",
              decoration: spanProperties.decoration || "none",
              style: spanProperties.style || "normal",
            };
          }
          case "separator": {
            const separatorProperties = content.blockData.properties || {};
            return {
              type: "separator",
              margin: separatorProperties.margin || "md",
              color: separatorProperties.color || "#B0B0B0",
            };
          }
          default:
            return {
              type: "text",
              text: `未支援的內容類型: ${contentType}`,
            };
        }
      }),
    };
  }

  return flexMessage;
}
