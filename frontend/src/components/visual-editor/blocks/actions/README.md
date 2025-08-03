# LINE Bot Action 積木

本模組實作了完整的 LINE Bot Action 系統，支援 LINE Messaging API 的所有主要 Action 類型。

## 功能概述

### 支援的 Action 類型

1. **URI Action** - 開啟網頁連結
   - 支援桌面版和行動版不同連結
   - 檔案：`UriAction.tsx`

2. **Camera Action** - 開啟相機拍照
   - 啟動裝置相機功能
   - 檔案：`CameraAction.tsx`

3. **Camera Roll Action** - 選擇照片
   - 開啟相機膠卷或相簿
   - 檔案：`CameraRollAction.tsx`

4. **Location Action** - 分享位置
   - 請求用戶分享當前位置
   - 檔案：`LocationAction.tsx`

5. **Datetime Picker Action** - 日期時間選擇器
   - 支援日期、時間或兩者選擇
   - 可設定最小值和最大值
   - 檔案：`DatetimePickerAction.tsx`

6. **Rich Menu Switch Action** - 豐富選單切換
   - 切換到不同的豐富選單佈局
   - 檔案：`RichMenuSwitchAction.tsx`

7. **Clipboard Action** - 剪貼板動作
   - 複製指定文字到剪貼板
   - 檔案：`ClipboardAction.tsx`

## 檔案結構

```
actions/
├── README.md                    # 說明文件
├── index.ts                     # 模組導出
├── UriAction.tsx               # URI Action 積木
├── CameraAction.tsx            # Camera Action 積木
├── CameraRollAction.tsx        # Camera Roll Action 積木
├── LocationAction.tsx          # Location Action 積木
├── DatetimePickerAction.tsx    # Datetime Picker Action 積木
├── RichMenuSwitchAction.tsx    # Rich Menu Switch Action 積木
├── ClipboardAction.tsx         # Clipboard Action 積木
└── ActionBlocksTest.tsx        # 測試組件
```

## 相關檔案

### 類型定義
- `src/types/lineActions.ts` - Action 類型定義和驗證邏輯

### UI 組件
- `src/components/visual-editor/ActionSelector.tsx` - Action 選擇器組件

### 更新的組件
- `src/components/visual-editor/blocks/flex-content/ButtonContent.tsx` - 更新以支援新 Action 類型
- `src/utils/unifiedCodeGenerator.ts` - 更新代碼生成器以支援新 Action

## 使用方式

### 1. 基本使用

```typescript
import { createDefaultAction, ActionType } from '@/types/lineActions';

// 創建預設的 URI Action
const uriAction = createDefaultAction(ActionType.URI);

// 創建預設的 Camera Action
const cameraAction = createDefaultAction(ActionType.CAMERA);
```

### 2. Action 驗證

```typescript
import { validateAction } from '@/types/lineActions';

const action = {
  type: 'uri',
  label: '開啟連結',
  uri: 'https://example.com'
};

const validation = validateAction(action);
if (validation.isValid) {
  console.log('Action 有效');
} else {
  console.log('驗證錯誤:', validation.errors);
}
```

### 3. 在 Button 組件中使用

Button 組件已經更新為支援所有 Action 類型。在 Flex Message 中創建按鈕時，可以選擇任何支援的 Action 類型。

### 4. 測試組件

```typescript
import { ActionBlocksTest } from './actions/ActionBlocksTest';

// 在開發環境中使用測試組件
<ActionBlocksTest />
```

## 積木配置

每個 Action 積木都遵循統一的配置結構：

```typescript
{
  id: string;                    // 唯一識別碼
  blockType: "action";           // 積木類型
  category: BlockCategory;       // 積木類別
  displayName: string;           // 顯示名稱
  description: string;           // 描述
  icon: LucideIcon;             // 圖標
  color: string;                // 顏色
  compatibility: WorkspaceContext[]; // 相容性
  defaultData: {
    actionType: ActionType;      // Action 類型
    action: LineAction;          // 預設 Action 數據
    properties: object;          // 樣式屬性
  };
  validation: {                  // 驗證規則
    required: string[];
    rules: ValidationRule[];
  };
}
```

## 開發指南

### 新增 Action 類型

1. 在 `lineActions.ts` 中定義新的 Action 介面
2. 更新 `ActionType` 枚舉
3. 在 `ACTION_TYPE_CONFIG` 中添加配置
4. 創建對應的積木定義文件
5. 更新 `index.ts` 導出
6. 更新測試組件

### 驗證規則

每個 Action 都有相應的驗證規則，確保：
- 必要欄位不為空
- 數據格式正確
- URL 格式有效
- 枚舉值在有效範圍內

### 代碼生成

系統會自動生成對應的 Python 代碼，支援：
- Flex Message JSON 結構
- Action 物件序列化
- 適當的參數傳遞

## 注意事項

1. **權限要求**：某些 Action 類型需要特定權限（如相機、位置）
2. **平台限制**：某些 Action 在不同平台可能有不同行為
3. **驗證重要性**：使用前請務必驗證 Action 配置
4. **測試建議**：建議在實際環境中測試所有 Action 類型

## 更新歷史

- v2.0.0 - 首次實作完整的 Action 系統
- 支援所有主要 LINE Bot Action 類型
- 整合驗證和測試機制
- 更新相關組件和生成器