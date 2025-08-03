# Flex Message 預覽功能改進報告

## 改進概要
完善了 Flex Message 預覽功能，新增對 Video、Icon 和 Span 組件的完整支援。

## 主要改進內容

### 1. Panels/FlexMessagePreview.tsx 更新

#### Video 組件支援
- **新增功能**：完整的影片組件預覽渲染
- **支援屬性**：
  - `aspectRatio`: 寬高比設定 (如 "16:9", "4:3")
  - `aspectMode`: 顯示模式 ("cover" 或 "fit")
  - `backgroundColor`: 背景顏色
  - `previewUrl`: 預覽圖片網址
  - `url`: 影片檔案網址
- **預覽效果**：顯示預覽圖片 + 播放按鈕覆蓋層
- **錯誤處理**：支援 altContent 替代內容（在預覽中準備但不顯示）

#### Icon 組件支援增強
- **新增功能**：擴展原有 Icon 組件支援更多屬性
- **支援屬性**：
  - `size`: 圖示大小 (xs, sm, md, lg, xl, xxl, 3xl, 4xl, 5xl)
  - `margin`: 外邊距設定
  - `position`: 定位方式 (relative/absolute)
  - `offsetTop/Bottom/Start/End`: 精確位置偏移
- **尺寸映射**：智能轉換 LINE 尺寸規格為像素值

#### Span 組件支援
- **新增功能**：內嵌文字樣式組件
- **支援屬性**：
  - `size`: 文字大小
  - `weight`: 文字粗細 (regular/bold)
  - `color`: 文字顏色
  - `decoration`: 文字裝飾 (none/underline/line-through)
  - `style`: 文字樣式 (normal/italic)
- **整合機制**：在 Text 組件的 contents 屬性中渲染

#### Text 組件增強
- **新增功能**：支援 contents 屬性包含多個 Span 元素
- **智能渲染**：自動檢測是否有 contents 屬性，優先渲染 Span 元素
- **向後相容**：保持對純文字內容的支援

### 2. visual-editor/FlexMessagePreview.tsx 更新

#### FlexMessage 生成器擴展
- **Video 生成**：自動生成 Video 組件的 JSON 結構
- **Icon 生成**：支援 Icon 組件的屬性配置
- **Span 生成**：將 Span 組件包裝在 Text 組件的 contents 中

#### HTML 預覽生成器增強
- **Video HTML**：生成響應式影片預覽 HTML
  - 支援 aspect-ratio CSS 屬性
  - 顯示預覽圖片和播放按鈕
  - 背景顏色和顯示模式配置
- **Icon HTML**：生成具有正確尺寸的圖示 HTML
  - 智能尺寸映射 (LINE 規格 → 像素值)
  - 邊距和間距處理
- **Text with Span**：增強文字 HTML 生成
  - 處理 contents 屬性中的 Span 元素
  - 保留每個 Span 的獨立樣式
  - 組合渲染多樣式文字

### 3. 測試檔案創建

#### 綜合測試檔案
- **檔案位置**：`src/test/flex-components-test.tsx`
- **測試範圍**：
  - Video 組件單獨測試
  - Icon 組件不同尺寸測試
  - Span 組件多樣式文字測試
  - 混合組件綜合測試
- **驗證內容**：所有新組件的屬性和樣式正確性

## 技術特點

### 向後相容性
- 所有改進都保持與現有代碼的相容性
- 不影響已有組件的預覽功能
- 支援漸進式採用新組件

### 錯誤處理
- 缺失屬性的預設值處理
- 無效資料的容錯機制
- 優雅的降級顯示

### 效能考量
- 條件渲染避免不必要的計算
- 樣式對象重用減少記憶體使用
- 智能的屬性映射提升渲染效率

## 使用方式

### Video 組件
```json
{
  "type": "video",
  "url": "https://example.com/video.mp4",
  "previewUrl": "https://example.com/preview.jpg",
  "aspectRatio": "16:9",
  "aspectMode": "cover",
  "backgroundColor": "#000000"
}
```

### Icon 組件
```json
{
  "type": "icon",
  "url": "https://example.com/icon.png",
  "size": "lg",
  "margin": "md",
  "position": "relative"
}
```

### Span 組件（在 Text 中使用）
```json
{
  "type": "text",
  "contents": [
    {
      "type": "span",
      "text": "粗體文字",
      "weight": "bold",
      "color": "#FF0000"
    },
    {
      "type": "span", 
      "text": " 和斜體文字",
      "style": "italic",
      "color": "#0000FF"
    }
  ]
}
```

## 結論
本次改進完整實現了對新 Flex 組件的預覽支援，確保 Flex Message 設計工具能夠準確預覽所有支援的組件類型，為使用者提供完整的設計體驗。