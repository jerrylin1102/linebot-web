# 積木配置渲染系統

## 概述

這個配置渲染系統解決了積木編輯設定顯示的問題，提供了一個統一的、可擴展的積木配置介面。

## 系統架構

### 核心組件

#### 1. BlockConfigRenderer
- **路徑**: `/src/components/visual-editor/BlockConfigRenderer.tsx`
- **功能**: 動態渲染 `BlockConfigOption[]` 陣列為表單控件
- **特點**:
  - 支援多種配置類型：text, number, boolean, select, textarea
  - 自動處理配置值的讀取和更新
  - 提供空狀態顯示
  - 支援只讀模式

#### 2. ConfigFormField
- **路徑**: `/src/components/visual-editor/ConfigFormField.tsx`
- **功能**: 個別配置欄位的渲染邏輯
- **特點**:
  - 統一的欄位樣式和布局
  - 支援驗證規則和錯誤顯示
  - 實時驗證和錯誤提示
  - 類型安全的值處理

#### 3. DroppedBlock (修改版)
- **路徑**: `/src/components/visual-editor/DroppedBlock.tsx`
- **功能**: 整合了新的配置渲染系統
- **特點**:
  - 自動檢測積木是否有配置選項
  - 優先使用新的配置系統
  - 保持向後相容性
  - 顯示積木配置摘要

### 測試組件

#### 4. ConfigSystemTest
- **路徑**: `/src/components/visual-editor/ConfigSystemTest.tsx`
- **功能**: 配置系統的完整測試介面
- **特點**:
  - 自動初始化積木系統
  - 顯示有配置選項的積木
  - 實時配置測試和數據預覽
  - 錯誤處理和狀態顯示

#### 5. 測試腳本
- **路徑**: `/src/components/visual-editor/test-config-system.ts`
- **功能**: 控制台測試函數
- **使用方式**:
  ```javascript
  // 在瀏覽器控制台中運行
  testConfigSystem()
  testConfigDataManipulation()
  ```

## 使用方式

### 基本使用

```tsx
import BlockConfigRenderer from './BlockConfigRenderer';

function MyComponent() {
  const [blockData, setBlockData] = useState({});
  
  const handleConfigChange = (key: string, value: unknown) => {
    setBlockData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <BlockConfigRenderer
      configOptions={block.configOptions}
      blockData={blockData}
      onDataChange={handleConfigChange}
    />
  );
}
```

### 積木定義示例

```typescript
export const myBlock: BlockDefinition = {
  id: "my-block",
  blockType: "custom",
  category: BlockCategory.CUSTOM,
  displayName: "我的積木",
  // ... 其他屬性
  configOptions: [
    {
      key: "text",
      label: "文字內容",
      type: "text",
      defaultValue: "預設文字",
      required: true
    },
    {
      key: "size",
      label: "大小",
      type: "select",
      defaultValue: "md",
      options: [
        { label: "小", value: "sm" },
        { label: "中", value: "md" },
        { label: "大", value: "lg" }
      ]
    }
  ]
};
```

## 支援的配置類型

| 類型 | 說明 | 組件 |
|------|------|------|
| `text` | 單行文字輸入 | Input |
| `textarea` | 多行文字輸入 | Textarea |
| `number` | 數字輸入 | Input[type=number] |
| `boolean` | 布林值選擇 | Checkbox |
| `select` | 下拉選單 | Select |

## 驗證規則

配置欄位支援以下驗證規則：

- `required`: 必填欄位
- `min/max`: 數字範圍或字串長度限制
- `pattern`: 正則表達式驗證
- `message`: 自定義錯誤訊息

## 測試指南

### 1. 類型檢查
```bash
npx tsc --noEmit --project tsconfig.json
```

### 2. 運行測試組件
將 `ConfigSystemTest` 組件添加到路由中，訪問測試頁面。

### 3. 控制台測試
在瀏覽器開發者工具中運行：
```javascript
await testConfigSystem()
```

## 功能特點

### ✅ 已實現
- 動態配置渲染
- 類型安全的數據處理
- 實時驗證和錯誤顯示
- 向後相容性
- 完整的測試套件

### 🔄 待擴展
- 自定義配置組件類型
- 條件顯示邏輯
- 配置組分組
- 拖拽排序支援
- 國際化支援

## 故障排除

### 常見問題

1. **配置選項不顯示**
   - 檢查積木定義是否包含 `configOptions` 屬性
   - 確認積木已正確註冊到 `blockRegistry`

2. **驗證錯誤**
   - 檢查驗證規則配置
   - 確認資料類型匹配

3. **樣式問題**
   - 確認 UI 組件已正確導入
   - 檢查 CSS 類名是否正確

### 調試技巧

1. 使用 `console.log` 檢查積木註冊狀態
2. 運行測試腳本驗證系統初始化
3. 檢查瀏覽器開發者工具的錯誤訊息

## 貢獻指南

### 添加新的配置類型

1. 在 `ConfigFormField.tsx` 的 `renderInput()` 方法中添加新的 case
2. 更新 `BlockConfigOption` 介面的 `type` 聯合類型
3. 添加相應的驗證邏輯
4. 更新文檔和測試

### 最佳實踐

- 保持配置選項簡潔明瞭
- 提供有意義的標籤和描述
- 使用適當的預設值
- 添加必要的驗證規則
- 測試所有配置組合

## 更新日誌

### v1.0.0 (2025-01-03)
- ✨ 建立核心配置渲染系統
- ✨ 支援基本配置類型
- ✨ 整合到 DroppedBlock 組件
- ✨ 建立完整測試套件
- ✨ 向後相容性保證