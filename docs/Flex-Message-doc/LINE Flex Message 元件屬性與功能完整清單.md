以下是根據先前對話內容整理的 **LINE Flex Message 支援屬性與功能說明.md**，採用 Markdown 格式撰寫，適合參考、說明或做為設計開發文件模板：

# LINE Flex Message 元件屬性與功能完整清單  
> 2025 年最新，僅收錄現行支援、無棄用功能

## 1. 容器類型（Container Types）f

- **bubble**  
  - 單一訊息泡泡  
  - 屬性：  
    - `size`: nano, micro, kilo, mega, giga  
    - `direction`: ltr, rtl  
    - `action`: 點擊整個 bubble 可觸發互動  
- **carousel**  
  - 多個 bubble 水平輪播  
  - 屬性：  
    - `contents`: bubbles 陣列（最多 10 個）

## 2. Bubble 區塊（Blocks in Bubble）

- 最多四個區塊，均可選用：
  - **header**（box 組件，常放標題資訊）
  - **hero**（可放 image、box 或 video，支持 aspectRatio, aspectMode, backgroundColor）
  - **body**（box 組件，放多元元素）
  - **footer**（box 組件，多置按鈕或註解）

- 每區塊可獨立設 style（如 `backgroundColor`、`separator`、`separatorColor`）

## 3. 組件種類與屬性（Component Types & Properties）

| 元件       | 主要屬性/補充                                              |
|------------|------------------------------------------------------|
| **box**    | layout（vertical/horizontal/baseline）、contents、spacing、padding、backgroundColor、cornerRadius、borderColor、borderWidth、width、height、flex、margin、paddingAll、paddingTop、paddingBottom、paddingStart、paddingEnd、action、justifyContent、alignItems、background（linearGradient）、position（relative/absolute）、offsetTop/Bottom/Start/End、maxWidth、maxHeight |
| **text**   | text、size（xs~5xl）、color、weight、decoration（underline/line-through）、style（normal/italic）、margin、align、gravity、wrap、maxLines、flex、action、lineSpacing，可嵌入 span |
| **span**   | 僅限 text 內；text、size、color、weight、decoration、style |
| **image**  | url、size（xs~full）、aspectRatio、aspectMode（cover/fit）、backgroundColor、margin、align、gravity、flex、action、cornerRadius、position、offsetTop/Bottom/Start/End |
| **icon**   | url、size、margin、align、position、offsetTop/Bottom/Start/End、action |
| **button** | style（primary/secondary/link）、color、height、margin、flex、gravity、justifyContent、alignItems、action |
| **separator** | color、margin                                 |
| **filler**    | flex                                           |

## 4. 支援互動動作（Action Types）

可配置於幾乎所有元件（separator、filler 除外）  
- **uri**：開啟連結（支援桌機分流 altUri）  
- **message**：回傳文字訊息  
- **postback**：回傳隱藏資料  
- **datetimepicker**：彈出日期／時間選擇器  
- **camera**：啟動相機  
- **camera roll**：呼叫相簿  
- **location**：傳送地點資訊  
- **richmenu switch**：切換豐富選單  

## 5. 版面與進階屬性/功能

- **Flex 屬性**（百分比/px 混用皆支援）
- **巢狀 box**（彈性的多層結構）
- **position: relative/absolute** 搭配 offset（top/bottom/start/end）做絕對定位
- **linearGradient**：box 支援線性背景漸層
- **direction**：ltr/rtl 適應多語系需求
- **altUri**：行動/桌機不同連結分流
- **四區塊 style**：header, hero, body, footer 可獨立設 style
- **空 box、filler 充當佔位/推擠元素**
- **訊息上限**：bubble 最多 10 個，payload 上限約 24KB
- **完整多裝置自適應**、Flex Simulator 編輯、JSON 匯出匯入

## 6. 官方功能狀態與使用建議

- 目前 ❗**沒有任何 Flex Message 元件、屬性或 action 被棄用**  
- 建議設計時隨時查閱 LINE 官方 OpenAPI、Messaging API 文件、或 Flex Message Simulator  
- Flex Message 適用於產品輪播、圖片卡片、RWD 選單、表單/評分/訊息交互等各種豐富設計場景

## 7. 常見應用舉例

- 商品卡片水平輪播
- 複合圖文行銷／活動推播
- 客製表單/快速選單
- 快速導覽 RWD UI
- 星級評價/問卷
- 多裝置適應訊息內容

> **最後更新：2025 年，僅收錄 LINE 官方現行支援、無棄用功能。**

如需進一步設計範例或詳細結構，建議直接於 LINE 官方 Flex Message Simulator 操作、產出標準 JSON 樣本。

如果需要 .md 原始檔格式，可以直接複製這份內容。