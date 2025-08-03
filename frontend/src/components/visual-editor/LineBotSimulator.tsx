import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Send, User, Bot } from "lucide-react";
import DataCacheService from "../../services/DataCacheService";
import { FlexMessage } from "../../services/visualEditorApi";

interface BlockData {
  [key: string]: unknown;
  eventType?: string;
  condition?: string;
  replyType?: string;
  content?: string;
  flexMessageId?: string;
  flexMessageName?: string;
}

interface Block {
  blockType: string;
  blockData: BlockData;
}

interface LocalFlexMessage {
  type: string;
  altText?: string;
  content?: Record<string, unknown>;
}

interface Message {
  type: "user" | "bot";
  content: string;
  messageType?: "text" | "flex";
  flexMessage?: LocalFlexMessage; // FLEX訊息內容
}

interface LineBotSimulatorProps {
  blocks: Block[];
}

// 升級版FLEX訊息渲染引擎 - 支援Video、Icon、Span和新Action積木
class FlexMessageRenderer {
  static renderFlexMessage(flexMessage: LocalFlexMessage): string {
    if (!flexMessage || !flexMessage.content) {
      return '<div class="text-gray-500 text-center py-2">無法載入FLEX訊息</div>';
    }

    let html =
      '<div class="bg-white border border-gray-200 rounded-lg shadow-sm" style="max-width: 280px; overflow: hidden;">';

    // 簡化處理FLEX訊息結構
    const content = flexMessage.content;

    // 處理 body 區塊
    if (content.body && content.body.contents) {
      html += '<div class="p-3">';
      content.body.contents.forEach((item: Record<string, unknown>) => {
        html += this.renderFlexItem(item);
      });
      html += "</div>";
    }

    // 處理 footer 區塊
    if (content.footer && content.footer.contents) {
      html += '<div class="p-3 bg-gray-50 border-t">';
      content.footer.contents.forEach((item: Record<string, unknown>) => {
        html += this.renderFlexItem(item);
      });
      html += "</div>";
    }

    // 如果都無法解析，顯示FLEX訊息名稱
    if (!content.body && !content.footer) {
      html += `<div class="p-3 text-blue-600 font-medium">[FLEX訊息: ${flexMessage.name || "未命名"}]</div>`;
    }

    html += "</div>";
    return html;
  }

  private static renderFlexItem(item: Record<string, unknown>): string {
    switch (item.type) {
      case "text": {
        const textAlign = item.align ? `text-align: ${item.align};` : "";
        const margin = item.margin
          ? `margin-top: ${this.getMarginInPx(item.margin)};`
          : "";
        
        // 處理包含 span 內容的文字
        if (item.contents && Array.isArray(item.contents)) {
          let textHtml = `<div class="mb-1" style="color: ${item.color || "#000"}; font-size: ${this.getSizeInPx(item.size)}; font-weight: ${item.weight || "normal"}; ${textAlign} ${margin}">`;
          
          // 先顯示主要文字
          if (item.text) {
            textHtml += this.formatText(item.text);
          }
          
          // 處理 span 內容
          item.contents.forEach((span: Record<string, unknown>) => {
            if (span.type === "span") {
              textHtml += this.renderSpanContent(span);
            }
          });
          
          textHtml += "</div>";
          return textHtml;
        } else {
          return `<div class="mb-1" style="color: ${item.color || "#000"}; font-size: ${this.getSizeInPx(item.size)}; font-weight: ${item.weight || "normal"}; ${textAlign} ${margin}">${this.formatText(item.text || "")}</div>`;
        }
      }

      case "image":
        return `<img src="${item.url}" class="w-full rounded mb-2" style="max-height: 150px; object-fit: cover;" alt="FLEX Image" />`;

      case "video": {
        const aspectRatio = item.aspectRatio || "20:13";
        const previewUrl = item.previewUrl || item.url;
        const backgroundColor = item.backgroundColor || "#FFFFFF";
        
        return `
          <div class="relative mb-2 rounded overflow-hidden" style="background-color: ${backgroundColor}; aspect-ratio: ${aspectRatio.replace(':', '/')};">
            <img src="${previewUrl}" class="w-full h-full object-cover" alt="Video Preview" />
            <div class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
              <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-gray-700 ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.841z"/>
                </svg>
              </div>
            </div>
            <div class="absolute bottom-2 left-2 text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
              📹 影片
            </div>
          </div>
        `;
      }

      case "icon": {
        const size = this.getIconSizeInPx(item.size);
        const margin = item.margin ? `margin: ${this.getMarginInPx(item.margin)};` : "";
        const offsetStyles = this.getOffsetStyles(item);
        
        return `
          <div class="inline-block" style="${margin} ${offsetStyles}">
            <img src="${item.url}" class="inline-block" style="width: ${size}; height: ${size};" alt="Icon" />
          </div>
        `;
      }

      case "span": {
        return this.renderSpanContent(item);
      }

      case "button": {
        const buttonColor = item.color || "#0066cc";
        const action = item.action || {};
        const buttonLabel = action.label || "按鈕";
        const actionInfo = this.getActionInfo(action);
        const actionData = this.getActionData(action);
        
        return `
          <button class="line-bot-button w-full text-white py-2 px-3 rounded text-sm mb-1 hover:opacity-80 transition-opacity group relative" 
                  style="background-color: ${buttonColor};"
                  title="${actionInfo.description}"
                  data-action-type="${action.type || ''}"
                  data-action-data="${actionData}">
            ${buttonLabel}
            ${actionInfo.icon ? `<span class="ml-2">${actionInfo.icon}</span>` : ""}
            <div class="absolute top-0 right-0 bg-gray-800 text-white text-xs px-1 py-0.5 rounded-bl opacity-0 group-hover:opacity-100 transition-opacity">
              ${actionInfo.type}
            </div>
          </button>
        `;
      }

      case "separator": {
        const separatorMargin = item.margin
          ? `margin: ${this.getMarginInPx(item.margin)} 0;`
          : "margin: 8px 0;";
        return `<hr class="border-gray-300" style="${separatorMargin}" />`;
      }

      case "box": {
        // 處理巢狀的 box 容器
        if (item.contents && Array.isArray(item.contents)) {
          let boxHtml = '<div class="';
          if (item.layout === "horizontal") {
            boxHtml += "flex space-x-2";
          } else {
            boxHtml += "space-y-1";
          }
          boxHtml += '">';

          item.contents.forEach((subItem: Record<string, unknown>) => {
            boxHtml += this.renderFlexItem(subItem);
          });

          boxHtml += "</div>";
          return boxHtml;
        }
        return "";
      }

      default:
        return `<div class="text-gray-400 text-xs">不支援的元素類型: ${item.type}</div>`;
    }
  }

  private static formatText(text: string): string {
    // 將換行符號轉換為 HTML 換行
    return text.replace(/\n/g, "<br>");
  }

  private static getSizeInPx(size?: string): string {
    const sizeMap: { [key: string]: string } = {
      xxs: "10px",
      xs: "12px",
      sm: "14px",
      md: "16px",
      lg: "18px",
      xl: "20px",
      xxl: "24px",
    };
    return sizeMap[size || "md"] || "16px";
  }

  private static getMarginInPx(margin?: string): string {
    const marginMap: { [key: string]: string } = {
      none: "0px",
      xs: "2px",
      sm: "4px",
      md: "8px",
      lg: "12px",
      xl: "16px",
      xxl: "20px",
    };
    return marginMap[margin || "none"] || "8px";
  }

  private static getIconSizeInPx(size?: string): string {
    const iconSizeMap: { [key: string]: string } = {
      xs: "12px",
      sm: "16px",
      md: "20px",
      lg: "24px",
      xl: "28px",
      xxl: "32px",
      "3xl": "40px",
      "4xl": "48px",
      "5xl": "56px",
    };
    return iconSizeMap[size || "md"] || "20px";
  }

  private static getOffsetStyles(item: Record<string, unknown>): string {
    const styles: string[] = [];
    
    if (item.position === "absolute") {
      styles.push("position: absolute");
    } else {
      styles.push("position: relative");
    }
    
    if (item.offsetTop && item.offsetTop !== "0px") {
      styles.push(`top: ${item.offsetTop}`);
    }
    if (item.offsetBottom && item.offsetBottom !== "0px") {
      styles.push(`bottom: ${item.offsetBottom}`);
    }
    if (item.offsetStart && item.offsetStart !== "0px") {
      styles.push(`left: ${item.offsetStart}`);
    }
    if (item.offsetEnd && item.offsetEnd !== "0px") {
      styles.push(`right: ${item.offsetEnd}`);
    }
    
    return styles.join("; ");
  }

  private static renderSpanContent(span: Record<string, unknown>): string {
    const color = span.color || "inherit";
    const size = this.getSizeInPx(span.size);
    const weight = span.weight || "normal";
    const decoration = span.decoration || "none";
    const style = span.style || "normal";
    
    const spanStyles = `color: ${color}; font-size: ${size}; font-weight: ${weight}; text-decoration: ${decoration}; font-style: ${style};`;
    
    return `<span style="${spanStyles}">${this.formatText(span.text || "")}</span>`;
  }

  private static getActionInfo(action: Record<string, unknown>): { type: string; icon: string; description: string } {
    switch (action.type) {
      case "uri":
        return {
          type: "連結",
          icon: "🔗",
          description: `開啟連結: ${action.uri || ""}`
        };
      case "camera":
        return {
          type: "相機",
          icon: "📷",
          description: "開啟相機拍照"
        };
      case "cameraRoll":
        return {
          type: "相簿",
          icon: "🖼️",
          description: "從相簿選擇照片"
        };
      case "location":
        return {
          type: "位置",
          icon: "📍",
          description: "分享當前位置"
        };
      case "clipboard":
        return {
          type: "剪貼簿",
          icon: "📋",
          description: "複製到剪貼簿"
        };
      case "datetimePicker":
        return {
          type: "日期時間",
          icon: "📅",
          description: "選擇日期或時間"
        };
      case "richMenuSwitch":
        return {
          type: "選單切換",
          icon: "📱",
          description: "切換Rich Menu"
        };
      case "postback":
        return {
          type: "回傳",
          icon: "↩️",
          description: `回傳資料: ${action.data || ""}`
        };
      case "message":
        return {
          type: "訊息",
          icon: "💬",
          description: `發送訊息: ${action.text || ""}`
        };
      default:
        return {
          type: "未知",
          icon: "❓",
          description: "未知的Action類型"
        };
    }
  }

  private static getActionData(action: Record<string, unknown>): string {
    switch (action.type) {
      case "uri":
        return action.uri as string || "";
      case "postback":
        return action.data as string || "";
      case "message":
        return action.text as string || "";
      case "clipboard":
        return action.clipboardText as string || "";
      default:
        return "";
    }
  }
}

const LineBotSimulator: React.FC<LineBotSimulatorProps> = ({ blocks }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      type: "bot",
      content: "歡迎使用 LINE Bot 模擬器！請輸入訊息來測試您的 Bot 邏輯。",
      messageType: "text",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [flexMessages, setFlexMessages] = useState<FlexMessage[]>([]);
  const [loadingFlexMessages, setLoadingFlexMessages] = useState(false);

  // 載入FLEX訊息列表
  useEffect(() => {
    const loadFlexMessages = async () => {
      setLoadingFlexMessages(true);
      try {
        // 嘗試載入FLEX訊息
        console.log("開始載入FLEX訊息...");
        const messages = await DataCacheService.getInstance().getUserFlexMessages();
        setFlexMessages(messages);
        console.log("成功載入FLEX訊息:", messages.length, "個");
      } catch (error) {
        console.error("Error occurred:", error);

        // 檢查錯誤類型並提供詳細信息
        if (error instanceof Error) {
          console.error("錯誤訊息:", error.message);
          if (error.message.includes("400")) {
            console.error("API返回400錯誤: 這可能是認證問題或請求格式錯誤");
          } else if (error.message.includes("401")) {
            console.error("API返回401錯誤: 認證失敗，請檢查登入狀態");
          } else if (error.message.includes("404")) {
            console.error("API返回404錯誤: API端點不存在");
          } else if (error.message.includes("500")) {
            console.error("API返回500錯誤: 服務器內部錯誤");
          }
        }

        // 設置空的FLEX訊息列表，不使用模擬數據
        setFlexMessages([]);
        console.log("由於API錯誤，FLEX訊息列表設為空，用戶需要先創建FLEX訊息");
      } finally {
        setLoadingFlexMessages(false);
      }
    };

    // 延遲載入，避免在組件還沒完全準備好時就調用API
    const timer = setTimeout(loadFlexMessages, 500);
    return () => clearTimeout(timer);
  }, []);

  // 添加按鈕點擊事件處理
  useEffect(() => {
    const handleButtonClick = (event: Event) => {
      const target = event.target as HTMLElement;
      const button = target.closest('.line-bot-button') as HTMLElement;
      
      if (button) {
        event.preventDefault();
        const actionType = button.dataset.actionType;
        const actionData = button.dataset.actionData;
        
        let simulatedMessage = "";
        
        switch (actionType) {
          case "uri":
            simulatedMessage = `🔗 模擬開啟連結: ${actionData}`;
            break;
          case "camera":
            simulatedMessage = "📷 模擬開啟相機拍照";
            break;
          case "cameraRoll":
            simulatedMessage = "🖼️ 模擬從相簿選擇照片";
            break;
          case "location":
            simulatedMessage = "📍 模擬分享位置資訊";
            break;
          case "clipboard":
            simulatedMessage = `📋 模擬複製到剪貼簿: ${actionData}`;
            break;
          case "datetimePicker":
            simulatedMessage = "📅 模擬開啟日期時間選擇器";
            break;
          case "richMenuSwitch":
            simulatedMessage = "📱 模擬切換Rich Menu";
            break;
          case "postback":
            simulatedMessage = `↩️ 模擬Postback事件: ${actionData}`;
            break;
          case "message":
            simulatedMessage = `💬 模擬發送訊息: ${actionData}`;
            break;
          default:
            simulatedMessage = "❓ 未知的Action類型";
        }
        
        // 添加模擬回應到聊天記錄
        const newMessage: Message = {
          type: "bot",
          content: simulatedMessage,
          messageType: "text"
        };
        
        setMessages(prev => [...prev, newMessage]);
      }
    };
    
    // 使用事件委託監聽按鈕點擊
    document.addEventListener('click', handleButtonClick);
    
    return () => {
      document.removeEventListener('click', handleButtonClick);
    };
  }, []);

  // 根據ID查找FLEX訊息
  const getFlexMessageById = (id: string): LocalFlexMessage | null => {
    const msg = flexMessages.find((msg) => msg.id === id);
    if (!msg) return null;
    
    // 轉換為LocalFlexMessage格式
    return {
      type: msg.type || "flex",
      altText: msg.altText,
      content: msg.contents || {}
    };
  };

  const simulateBot = (userMessage: string): Message => {
    // 預設回應
    let botResponse: Message = {
      type: "bot",
      content: "我還不知道如何回應這個訊息。",
      messageType: "text",
    };

    // 檢查是否為特殊命令（模擬Action積木觸發）
    if (userMessage.startsWith("ACTION:")) {
      const actionType = userMessage.replace("ACTION:", "").trim();
      return {
        type: "bot",
        content: `✅ 已執行 ${actionType} 動作！`,
        messageType: "text",
      };
    }

    // 根據積木邏輯生成回應
    blocks.forEach((block) => {
      if (
        block.blockType === "event" &&
        block.blockData.eventType === "message.text"
      ) {
        const condition = block.blockData.condition;
        if (!condition || userMessage.includes(condition)) {
          // 尋找對應的回覆積木
          const replyBlock = blocks.find((b) => b.blockType === "reply");

          if (replyBlock) {
            if (
              replyBlock.blockData.replyType === "text" &&
              replyBlock.blockData.content
            ) {
              // 文字回覆
              botResponse = {
                type: "bot",
                content: replyBlock.blockData.content,
                messageType: "text",
              };
            } else if (
              replyBlock.blockData.replyType === "flex" &&
              replyBlock.blockData.flexMessageId
            ) {
              // FLEX訊息回覆
              const flexMessage = getFlexMessageById(
                replyBlock.blockData.flexMessageId
              );
              if (flexMessage) {
                botResponse = {
                  type: "bot",
                  content: `FLEX訊息: ${flexMessage.name}`,
                  messageType: "flex",
                  flexMessage: flexMessage,
                };
              } else {
                botResponse = {
                  type: "bot",
                  content: `無法載入FLEX訊息 (ID: ${replyBlock.blockData.flexMessageId})`,
                  messageType: "text",
                };
              }
            }
          }
        }
      }
    });

    return botResponse;
  };

  const sendMessage = () => {
    if (!inputMessage.trim()) return;

    // 加入用戶訊息
    const newMessages: Message[] = [
      ...messages,
      { type: "user", content: inputMessage, messageType: "text" },
    ];

    // 模擬 Bot 回應
    const botResponse = simulateBot(inputMessage);
    newMessages.push(botResponse);

    setMessages(newMessages);
    setInputMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 h-full flex flex-col">
      <h3 className="text-lg font-medium text-gray-600 mb-4">
        LINE Bot 模擬器
      </h3>

      {/* 訊息區域 */}
      <div className="flex-1 bg-gray-50 rounded-lg p-4 overflow-y-auto mb-4 space-y-3">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex items-start space-x-2 ${
              message.type === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.type === "bot" && (
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}

            <div
              className={`max-w-xs rounded-lg ${
                message.type === "user"
                  ? "bg-blue-500 text-white px-3 py-2"
                  : "bg-white border border-gray-200"
              }`}
            >
              {message.messageType === "flex" && message.flexMessage ? (
                // FLEX訊息渲染
                <div
                  className="flex-message-container"
                  dangerouslySetInnerHTML={{
                    __html: FlexMessageRenderer.renderFlexMessage(
                      message.flexMessage
                    ),
                  }}
                />
              ) : (
                // 一般文字訊息
                <div className="px-3 py-2">
                  <p className="text-sm">{message.content}</p>
                </div>
              )}
            </div>

            {message.type === "user" && (
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 輸入區域 */}
      <div className="flex space-x-2">
        <Input
          placeholder="輸入訊息..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1"
        />
        <Button onClick={sendMessage}>
          <Send className="w-4 h-4" />
        </Button>
      </div>

      <div className="mt-2 text-xs text-gray-500 space-y-1">
        <div>💡 升級版模擬器 - 支援Video、Icon、Span組件和新Action積木互動</div>
        <div>🔄 點擊FLEX訊息中的按鈕可體驗Action積木的模擬功能</div>
        {loadingFlexMessages && (
          <div className="text-blue-600">🔄 載入FLEX訊息中...</div>
        )}
        {!loadingFlexMessages && flexMessages.length === 0 && (
          <div className="text-orange-600">
            ⚠️ 沒有可用的FLEX訊息模板，請先在FLEX編輯器中創建
          </div>
        )}
        {!loadingFlexMessages && flexMessages.length > 0 && (
          <div className="text-green-600">
            ✅ 已載入 {flexMessages.length} 個FLEX訊息模板
          </div>
        )}
        {!loadingFlexMessages && flexMessages.length > 0 && (
          <div className="text-gray-400">
            📋 可用的FLEX訊息: {flexMessages.map((msg) => msg.name).join(", ")}
          </div>
        )}
        <div className="text-purple-600">
          🎯 支援的新組件: Video影片、Icon圖示、Span多樣式文字
        </div>
        <div className="text-cyan-600">
          ⚡ 支援的新Action: URI連結、Camera相機、Location位置、Clipboard剪貼簿等
        </div>
      </div>
    </div>
  );
};

export default LineBotSimulator;
