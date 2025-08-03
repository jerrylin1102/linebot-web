# LINE BOT Token & Secret — 可獲取資訊與可用操作完整清單

---

## 一、可以獲取的資訊

- **用戶發送的訊息內容**（文字、圖片、貼圖、位置、影片、檔案等）
- **Webhook event 訊息內容**
  - 事件種類：follow、unfollow、join、leave、message、postback、beacon ...等
- **使用者的 userId**（唯一識別每位 LINE 用戶）
- **互動用戶的 profile 資訊**
  - 顯示名稱
  - 頭貼圖片
  - 個人狀態訊息
- **群組資訊**
  - groupId、roomId
  - 只會在 bot 被加入群組或聊天室時收到
- **群組成員 userId 列表**
  - 僅限與 BOT 有互動過的群組用戶
- **訊息 ID 指定檔案內容**
  - 用戶上傳的圖片、檔案、音訊、影片等（可下載）
- **BOT 自身基本設定資訊（需於 LINE Developers 平台查閱）**
  - Channel ID
  - Channel Name
- **Rich Menu 設定狀態與內容**
- **訊息發送統計資訊**
  - 例：每月發送總數等
- **帳號連結（Account Link）相關資訊**
- **用戶 Memberships 資訊**
  - 例如參與的活動會員身份

---

## 二、可使用的 Messaging API 操作

### 1. 訊息發送與事件處理

- **Reply Message**：回應 webhook 事件（多種訊息型態）
- **Push Message**：主動向指定用戶、群組、聊天室推送訊息
- **Multicast / Broadcast**
  - Multicast：一次推播多位用戶（指定 userId）
  - Broadcast：向所有 bot 好友廣播（需官方審核權限）
- **訊息型態支持：**
  - 純文字
  - 貼圖
  - 圖片
  - 影片
  - 聲音
  - 位置訊息
  - 訊息模板（buttons、confirm、carousel、image carousel）
  - Flex Message
  - Quick Reply
  - Imagemap
- **取得訊息原始內容**
  - 圖片、語音、影片、其他檔案
- **處理特殊事件**
  - postback、account link…等

### 2. 用戶資料與互動

- **取得用戶 profile**
- **取得群組資訊 summary**
  - 群組名稱與 ID
- **取得群組內互動用戶列表**
- **Account Link 狀態查詢與管理**
- **取得用戶的 Membership 資訊**

### 3. Rich Menu 與互動元件控制

- **Rich Menu 管理**
  - 建立、設定、取消、指派
  - 指派給特定用戶或群組
  - 取得 rich menu 詳細內容/圖檔/現有列表

### 4. 管理與統計

- **查詢訊息發送統計**
  - reply、push、multicast/broadcast 數量等
- **Webhook 設定與管理**

### 5. 其他進階功能

- **Beacon 支援**（藍牙 beacon 觸發事件）
- **推送行銷通知**
  - 依官方規範用量與同意機制
- **驗證與安全簽名**
  - Webhook callback 進行 channel secret 驗證防偽

---

## 三、注意事項

- 不能直接取得所有好友清單，只能獲得有互動過（發訊、加入好友等行為）的 userId。
- 不能主動取得用戶私密資料（如手機、email、真名），只能取公開 profile 資料，細節資訊需用戶明確授權。
- 部分操作（如 broadcast、大規模 multicast）需官方額外啟用權限。
- token & secret 務必安全保管，不得外洩。

---

**本文件涵蓋持有 LINE BOT Token & Secret 時，所有 Messaging API 可獲取的資訊與可用操作。**
