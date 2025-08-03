/**
 * Flex 組件預覽功能測試
 * 用於驗證新增組件（Video、Icon、Span）的預覽功能
 */

import React from "react";
import FlexMessagePreview from "../components/Panels/FlexMessagePreview";

// 測試用的 Flex Message 範例
const testFlexMessages = {
  // Video 組件測試
  videoTest: {
    type: "flex",
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "video",
            url: "https://example.com/video.mp4",
            previewUrl: "https://via.placeholder.com/400x225/FF6B6B/FFFFFF?text=Video+Preview",
            aspectRatio: "16:9",
            aspectMode: "cover",
            backgroundColor: "#000000"
          },
          {
            type: "text",
            text: "這是一個影片組件測試",
            size: "md",
            color: "#333333"
          }
        ]
      }
    }
  },

  // Icon 組件測試
  iconTest: {
    type: "flex",
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "box",
            layout: "baseline",
            contents: [
              {
                type: "icon",
                url: "https://via.placeholder.com/24x24/4ECDC4/FFFFFF?text=⭐",
                size: "md",
                margin: "sm"
              },
              {
                type: "text",
                text: "這是圖示組件測試",
                size: "md",
                color: "#333333",
                flex: 1
              }
            ]
          },
          {
            type: "box",
            layout: "horizontal",
            spacing: "sm",
            contents: [
              {
                type: "icon",
                url: "https://via.placeholder.com/16x16/FF6B6B/FFFFFF?text=🔥",
                size: "xs"
              },
              {
                type: "icon",
                url: "https://via.placeholder.com/20x20/45B7D1/FFFFFF?text=💧",
                size: "sm"
              },
              {
                type: "icon",
                url: "https://via.placeholder.com/32x32/96CEB4/FFFFFF?text=🌱",
                size: "xl"
              }
            ]
          }
        ]
      }
    }
  },

  // Span 組件測試
  spanTest: {
    type: "flex",
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            contents: [
              {
                type: "span",
                text: "這是粗體文字",
                weight: "bold",
                color: "#FF6B6B"
              },
              {
                type: "span",
                text: " 和 "
              },
              {
                type: "span",
                text: "斜體文字",
                style: "italic",
                color: "#4ECDC4"
              },
              {
                type: "span",
                text: " 以及 "
              },
              {
                type: "span",
                text: "底線文字",
                decoration: "underline",
                color: "#45B7D1"
              }
            ]
          },
          {
            type: "text", 
            contents: [
              {
                type: "span",
                text: "大字體",
                size: "xl",
                weight: "bold"
              },
              {
                type: "span",
                text: " 和 "
              },
              {
                type: "span",
                text: "小字體",
                size: "xs",
                color: "#666666"
              }
            ]
          }
        ]
      }
    }
  },

  // 綜合測試 - 包含多種組件
  combinedTest: {
    type: "flex",
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        spacing: "md",
        contents: [
          {
            type: "video",
            url: "https://example.com/promo.mp4",
            previewUrl: "https://via.placeholder.com/400x300/DDA0DD/FFFFFF?text=宣傳影片",
            aspectRatio: "4:3",
            aspectMode: "fit"
          },
          {
            type: "box",
            layout: "baseline",
            spacing: "sm",
            contents: [
              {
                type: "icon",
                url: "https://via.placeholder.com/20x20/FFD93D/FFFFFF?text=⭐",
                size: "sm"
              },
              {
                type: "text",
                contents: [
                  {
                    type: "span",
                    text: "評分：",
                    weight: "bold"
                  },
                  {
                    type: "span",
                    text: "4.8",
                    size: "lg",
                    color: "#FF6B6B",
                    weight: "bold"
                  },
                  {
                    type: "span",
                    text: "/5.0",
                    size: "sm",
                    color: "#666666"
                  }
                ],
                flex: 1
              }
            ]
          },
          {
            type: "text",
            contents: [
              {
                type: "span",
                text: "特色：",
                weight: "bold"
              },
              {
                type: "span",
                text: "高畫質",
                color: "#4ECDC4",
                decoration: "underline"
              },
              {
                type: "span",
                text: "、"
              },
              {
                type: "span",
                text: "互動式",
                color: "#45B7D1",
                style: "italic"
              },
              {
                type: "span",
                text: "、"
              },
              {
                type: "span",
                text: "即時串流",
                color: "#96CEB4",
                weight: "bold"
              }
            ]
          }
        ]
      }
    }
  }
};

// 測試組件
const FlexComponentsTest: React.FC = () => {
  return (
    <div className="p-4 space-y-8">
      <h1 className="text-2xl font-bold mb-6">Flex 組件預覽功能測試</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-3">Video 組件測試</h2>
          <FlexMessagePreview json={testFlexMessages.videoTest} />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Icon 組件測試</h2>
          <FlexMessagePreview json={testFlexMessages.iconTest} />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Span 組件測試</h2>
          <FlexMessagePreview json={testFlexMessages.spanTest} />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">綜合測試</h2>
          <FlexMessagePreview json={testFlexMessages.combinedTest} />
        </div>
      </div>

      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-2">測試指南：</h3>
        <ul className="text-sm space-y-1">
          <li>• Video 組件應該顯示預覽圖片和播放按鈕</li>
          <li>• Icon 組件應該支援不同大小和邊距</li>
          <li>• Span 組件應該在文字中顯示不同樣式</li>
          <li>• 所有組件應該正確處理屬性和樣式</li>
        </ul>
      </div>
    </div>
  );
};

export default FlexComponentsTest;