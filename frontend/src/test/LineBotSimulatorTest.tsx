/**
 * LineBotSimulator 測試組件
 * 測試升級後的模擬器是否正確支援新組件和Action積木
 */

import React from 'react';
import LineBotSimulator from '../components/visual-editor/LineBotSimulator';

// 模擬包含新組件的FLEX訊息
const _mockFlexMessage = {
  id: "test-flex-1",
  name: "新組件測試",
  type: "flex",
  altText: "新組件測試訊息",
  content: {
    type: "bubble",
    body: {
      type: "box",
      layout: "vertical",
      contents: [
        // Video 組件測試
        {
          type: "video",
          url: "https://example.com/test-video.mp4",
          previewUrl: "https://example.com/video-preview.jpg",
          aspectRatio: "16:9",
          backgroundColor: "#000000"
        },
        // Text 組件包含 Span 測試
        {
          type: "text",
          text: "這是包含 ",
          contents: [
            {
              type: "span",
              text: "特殊樣式",
              color: "#FF5733",
              weight: "bold",
              decoration: "underline"
            },
            {
              type: "span", 
              text: " 和 ",
              color: "#000000"
            },
            {
              type: "span",
              text: "斜體文字",
              style: "italic",
              color: "#3366FF"
            }
          ]
        },
        // Icon 組件測試
        {
          type: "box",
          layout: "horizontal",
          contents: [
            {
              type: "icon",
              url: "https://example.com/star-icon.png",
              size: "md",
              margin: "sm"
            },
            {
              type: "text",
              text: "圖示搭配文字",
              flex: 1
            }
          ]
        }
      ]
    },
    footer: {
      type: "box",
      layout: "vertical",
      spacing: "sm",
      contents: [
        // URI Action 按鈕測試
        {
          type: "button",
          action: {
            type: "uri",
            label: "開啟網站",
            uri: "https://example.com"
          },
          color: "#6366f1"
        },
        // Camera Action 按鈕測試
        {
          type: "button",
          action: {
            type: "camera",
            label: "拍照"
          },
          color: "#ef4444"
        },
        // Location Action 按鈕測試
        {
          type: "button",
          action: {
            type: "location", 
            label: "分享位置"
          },
          color: "#06b6d4"
        },
        // Postback Action 按鈕測試
        {
          type: "button",
          action: {
            type: "postback",
            label: "選擇選項",
            data: "action=select&value=option1"
          },
          color: "#10b981"
        }
      ]
    }
  }
};

// 模擬積木資料
const mockBlocks = [
  {
    blockType: "event",
    blockData: {
      eventType: "message.text",
      condition: "測試"
    }
  },
  {
    blockType: "reply",
    blockData: {
      replyType: "flex",
      flexMessageId: "test-flex-1",
      flexMessageName: "新組件測試"
    }
  }
];

const LineBotSimulatorTest: React.FC = () => {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          LineBotSimulator 升級測試
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            新功能測試說明
          </h2>
          <div className="space-y-2 text-gray-600">
            <p>• <strong>Video組件</strong>: 測試影片預覽和播放按鈕顯示</p>
            <p>• <strong>Icon組件</strong>: 測試圖示大小、位置偏移和邊距</p>
            <p>• <strong>Span組件</strong>: 測試多樣式內嵌文字（顏色、粗細、裝飾）</p>
            <p>• <strong>新Action積木</strong>: 測試URI、Camera、Location、Postback等互動功能</p>
            <p>• <strong>互動模擬</strong>: 點擊按鈕應該顯示相應的模擬回應</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            測試步驟
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-600">
            <li>在下方模擬器中輸入 "測試" 來觸發FLEX訊息</li>
            <li>觀察Video組件是否正確顯示預覽圖和播放按鈕</li>
            <li>檢查Span組件是否顯示不同樣式的文字</li>
            <li>確認Icon組件是否正確對齊文字</li>
            <li>點擊各種Action按鈕測試互動功能</li>
            <li>驗證每個Action都有正確的模擬回應</li>
          </ol>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 模擬器測試區域 */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 bg-blue-600 text-white">
              <h3 className="text-lg font-semibold">升級版 LINE Bot 模擬器</h3>
            </div>
            <div className="h-96">
              <LineBotSimulator blocks={mockBlocks} />
            </div>
          </div>

          {/* 測試結果記錄區域 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              測試檢查清單
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="video-test" className="rounded" />
                <label htmlFor="video-test" className="text-gray-700">
                  Video組件正確顯示
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="span-test" className="rounded" />
                <label htmlFor="span-test" className="text-gray-700">
                  Span多樣式文字正確顯示
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="icon-test" className="rounded" />
                <label htmlFor="icon-test" className="text-gray-700">
                  Icon組件正確對齊
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="uri-action-test" className="rounded" />
                <label htmlFor="uri-action-test" className="text-gray-700">
                  URI Action按鈕可點擊
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="camera-action-test" className="rounded" />
                <label htmlFor="camera-action-test" className="text-gray-700">
                  Camera Action按鈕可點擊
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="location-action-test" className="rounded" />
                <label htmlFor="location-action-test" className="text-gray-700">
                  Location Action按鈕可點擊
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="postback-action-test" className="rounded" />
                <label htmlFor="postback-action-test" className="text-gray-700">
                  Postback Action按鈕可點擊
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="hover-tooltip-test" className="rounded" />
                <label htmlFor="hover-tooltip-test" className="text-gray-700">
                  按鈕Hover顯示Action類型
                </label>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">預期結果：</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• 所有新組件都能正確渲染</li>
                <li>• 按鈕點擊後顯示模擬回應</li>
                <li>• 樣式和佈局符合設計規範</li>
                <li>• 沒有JavaScript錯誤</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LineBotSimulatorTest;