# LINE Bot Visual Editor 積木系統

## 概述

這是一個模組化的積木系統，用於 LINE Bot Visual Editor。每個積木都被拆分成獨立的檔案，使得新增、刪除和修改積木變得更加容易。

## 目錄結構

```
blocks/
├── types.ts                 # 積木定義類型系統
├── registry.ts              # 積木註冊系統
├── index.ts                 # 統一導出和初始化
├── event/                   # 事件積木
│   ├── TextMessageEvent.tsx
│   ├── ImageMessageEvent.tsx
│   ├── FollowEvent.tsx
│   ├── PostbackEvent.tsx
│   └── index.ts
├── reply/                   # 回覆積木
│   ├── TextReply.tsx
│   ├── ImageReply.tsx
│   ├── FlexReply.tsx
│   ├── StickerReply.tsx
│   └── index.ts
├── control/                 # 控制積木
│   ├── IfThenControl.tsx
│   ├── LoopControl.tsx
│   ├── WaitControl.tsx
│   └── index.ts
├── setting/                 # 設定積木
│   ├── SetVariableSetting.tsx
│   ├── GetVariableSetting.tsx
│   ├── SaveUserDataSetting.tsx
│   └── index.ts
├── flex-container/          # Flex 容器積木
│   ├── BubbleContainer.tsx
│   ├── CarouselContainer.tsx
│   ├── BoxContainer.tsx
│   └── index.ts
├── flex-content/            # Flex 內容積木
│   ├── TextContent.tsx
│   ├── ImageContent.tsx
│   ├── ButtonContent.tsx
│   ├── SeparatorContent.tsx
│   └── index.ts
└── flex-layout/             # Flex 佈局積木
    ├── SpacerLayout.tsx
    ├── FillerLayout.tsx
    ├── AlignLayout.tsx
    └── index.ts
```

## 主要功能

### 1. 積木註冊系統

- **自動發現**：系統會自動掃描並註冊所有積木
- **動態載入**：支援按需載入積木
- **類型安全**：完整的 TypeScript 支援
- **相容性檢查**：自動檢查積木在不同模式下的相容性

### 2. 積木定義標準化

每個積木檔案包含：
- 積木配置（類型、數據、顏色、相容性）
- 顯示名稱和圖示
- 使用說明和提示
- 配置選項
- 預設數據值

### 3. 類別管理

積木按以下類別組織：
- **EVENT**: 事件積木（觸發器）
- **REPLY**: 回覆積木（回應動作）
- **CONTROL**: 控制積木（流程控制）
- **SETTING**: 設定積木（變數和資料）
- **FLEX_CONTAINER**: Flex 容器積木
- **FLEX_CONTENT**: Flex 內容積木
- **FLEX_LAYOUT**: Flex 佈局積木

## 積木定義範例

```typescript
import { MessageSquare } from 'lucide-react';
import { BlockDefinition } from '../types';
import { BlockCategory, WorkspaceContext } from '../../../../types/block';

export const textReply: BlockDefinition = {
  id: 'text-reply',
  blockType: 'reply',
  category: BlockCategory.REPLY,
  displayName: '回覆文字訊息',
  description: '發送純文字訊息回覆給用戶',
  icon: MessageSquare,
  color: 'bg-green-500',
  compatibility: [WorkspaceContext.LOGIC],
  defaultData: {
    title: '回覆文字訊息',
    replyType: 'text',
    text: '您好！這是一則文字回覆訊息。'
  },
  tags: ['回覆', '文字', '訊息'],
  version: '1.0.0',
  usageHints: [
    '最基本的回覆積木，用於發送純文字訊息',
    '支援 LINE 表情符號和變數替換'
  ],
  configOptions: [
    {
      key: 'text',
      label: '回覆文字',
      type: 'textarea',
      required: true,
      description: '要發送給用戶的文字內容'
    }
  ]
};
```

## 新增積木的步驟

1. **創建積木檔案**：在對應的類別資料夾中創建新檔案
2. **定義積木結構**：實現 `BlockDefinition` 介面
3. **更新索引檔案**：在該類別的 `index.ts` 中導出新積木
4. **測試積木**：確保積木能正確註冊和顯示

## 修改現有積木

1. 直接編輯對應的積木檔案
2. 修改配置、顯示名稱、圖示等屬性
3. 系統會自動重新註冊積木

## 刪除積木

1. 刪除積木檔案
2. 從對應的索引檔案中移除導出
3. 系統會自動從註冊表中移除

## 優勢

1. **維護性提升**：單一積木修改不影響其他積木
2. **擴展性改善**：新增積木只需創建單一檔案
3. **代碼組織**：清晰的分類和結構
4. **團隊協作**：避免大檔案衝突
5. **性能優化**：支援按需載入積木

## 向後相容性

- 保持現有專案和數據格式不變
- 原有的積木仍然正常運作
- 漸進式升級，無需重寫現有邏輯

## 技術特點

- **TypeScript 完全支援**：完整的類型檢查和智慧提示
- **React 18 相容**：使用最新的 React Hook
- **效能優化**：動態載入和快取機制
- **錯誤處理**：完善的錯誤處理和恢復機制
- **開發者友善**：豐富的開發工具和調試資訊