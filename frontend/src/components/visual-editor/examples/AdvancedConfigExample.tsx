import React, { useState } from "react";
import { BlockConfigOption } from "../blocks/types";
import ConfigForm from "../ConfigForm";

/**
 * 進階配置範例組件
 * 
 * 展示所有新的配置類型的使用方式
 * 包含條件顯示邏輯、驗證規則等
 */
const AdvancedConfigExample: React.FC = () => {
  // 示例配置定義
  const exampleOptions: BlockConfigOption[] = [
    // 基本設定組
    {
      key: "basic.title",
      label: "標題",
      type: "text",
      defaultValue: "",
      required: true,
      description: "輸入元件標題",
      validation: {
        min: 1,
        max: 50,
        message: "標題長度必須在 1-50 字元之間",
      },
    },
    {
      key: "basic.description",
      label: "描述",
      type: "textarea",
      defaultValue: "",
      description: "輸入詳細描述",
      validation: {
        max: 200,
      },
    },
    {
      key: "basic.enabled",
      label: "啟用此功能",
      type: "boolean",
      defaultValue: true,
      description: "是否啟用此功能",
    },
    {
      key: "basic.category",
      label: "類別",
      type: "select",
      defaultValue: "general",
      options: [
        { label: "一般", value: "general" },
        { label: "進階", value: "advanced" },
        { label: "專業", value: "professional" },
      ],
      required: true,
    },

    // 多選示例
    {
      key: "basic.tags",
      label: "標籤",
      type: "multi-select",
      defaultValue: [],
      options: [
        { label: "重要", value: "important" },
        { label: "緊急", value: "urgent" },
        { label: "推薦", value: "featured" },
        { label: "新功能", value: "new" },
        { label: "測試", value: "beta" },
      ],
      multiSelect: {
        maxSelections: 3,
        allowCustomTags: true,
        searchable: true,
      },
      description: "選擇或新增自定義標籤（最多3個）",
    },

    // 檔案上傳示例
    {
      key: "appearance.logo",
      label: "Logo 圖片",
      type: "file-upload",
      defaultValue: null,
      fileUpload: {
        accept: "image/*",
        maxSize: 2 * 1024 * 1024, // 2MB
        multiple: false,
      },
      description: "上傳 Logo 圖片（最大 2MB）",
    },

    // 拖拽上傳示例
    {
      key: "appearance.gallery",
      label: "圖片庫",
      type: "drag-drop-zone",
      defaultValue: [],
      dragDropZone: {
        accept: "image/*",
        maxSize: 5 * 1024 * 1024, // 5MB
        multiple: true,
        placeholder: "拖拽圖片到這裡或點擊選擇",
        previewMode: "grid",
      },
      description: "上傳多張圖片建立圖片庫",
      conditionalLogic: {
        dependsOn: "basic.category",
        condition: "not-equals",
        value: "general",
      },
    },

    // 滑桿示例
    {
      key: "behavior.opacity",
      label: "透明度",
      type: "slider",
      defaultValue: 100,
      slider: {
        min: 0,
        max: 100,
        step: 5,
        showMarks: true,
        marks: [
          { value: 0, label: "透明" },
          { value: 50, label: "半透明" },
          { value: 100, label: "不透明" },
        ],
      },
      description: "調整元件透明度",
    },

    {
      key: "behavior.speed",
      label: "動畫速度",
      type: "slider",
      defaultValue: 1,
      slider: {
        min: 0.1,
        max: 3,
        step: 0.1,
        showMarks: false,
      },
      description: "調整動畫播放速度",
      conditionalLogic: {
        dependsOn: "basic.enabled",
        condition: "equals",
        value: true,
      },
    },

    // 按鈕配置示例
    {
      key: "advanced.designerButton",
      label: "開啟設計器",
      type: "button",
      defaultValue: false,
      button: {
        variant: "outline",
        size: "default",
        actionType: "open-dialog",
        actionParams: {
          title: "進階設計器",
          description: "使用進階設計器來配置複雜設定",
          buttonText: "開啟設計器",
        },
      },
      description: "開啟進階設計器進行詳細配置",
    },

    {
      key: "advanced.documentationButton",
      label: "檢視文檔",
      type: "button",
      defaultValue: null,
      button: {
        variant: "ghost",
        size: "sm",
        actionType: "navigate",
        actionParams: {
          url: "https://example.com/docs",
          buttonText: "開啟文檔",
        },
      },
      description: "開啟相關說明文檔",
    },

    // 陣列編輯器示例 - 簡單陣列
    {
      key: "behavior.keywords",
      label: "關鍵字",
      type: "array-editor",
      defaultValue: [],
      arrayEditor: {
        itemType: "text",
        maxItems: 10,
        minItems: 0,
        sortable: true,
        addItemText: "新增關鍵字",
      },
      description: "新增相關關鍵字",
    },

    // 陣列編輯器示例 - 複雜物件陣列
    {
      key: "advanced.quickReplies",
      label: "快速回覆",
      type: "array-editor",
      defaultValue: [],
      arrayEditor: {
        itemType: "object",
        maxItems: 5,
        sortable: true,
        addItemText: "新增快速回覆",
        itemTemplate: [
          {
            key: "title",
            label: "標題",
            type: "text",
            required: true,
            validation: { max: 20 },
          },
          {
            key: "message",
            label: "回覆內容",
            type: "textarea",
            required: true,
            validation: { max: 100 },
          },
          {
            key: "enabled",
            label: "啟用",
            type: "boolean",
            defaultValue: true,
          },
        ],
      },
      description: "設定快速回覆選項",
      conditionalLogic: {
        dependsOn: "basic.category",
        condition: "equals",
        value: "advanced",
      },
    },

    // 數字範圍驗證
    {
      key: "advanced.priority",
      label: "優先級",
      type: "number",
      defaultValue: 1,
      required: true,
      validation: {
        min: 1,
        max: 10,
        message: "優先級必須在 1-10 之間",
      },
      description: "設定處理優先級（1-10）",
    },

    // 正則表達式驗證
    {
      key: "advanced.pattern",
      label: "匹配模式",
      type: "text",
      defaultValue: "",
      validation: {
        pattern: "^[a-zA-Z0-9_-]+$",
        message: "只能包含字母、數字、底線和短橫線",
      },
      description: "輸入匹配模式（英數字、_、-）",
      conditionalLogic: {
        dependsOn: "basic.category",
        condition: "equals",
        value: "professional",
      },
    },
  ];

  // 預設配置值
  const [configValues, setConfigValues] = useState<Record<string, unknown>>({
    "basic.title": "範例元件",
    "basic.description": "這是一個展示所有配置類型的範例元件",
    "basic.enabled": true,
    "basic.category": "general",
    "basic.tags": ["important"],
    "appearance.logo": null,
    "appearance.gallery": [],
    "behavior.opacity": 100,
    "behavior.speed": 1,
    "behavior.keywords": ["範例", "測試"],
    "advanced.quickReplies": [
      {
        title: "範例回覆",
        message: "這是一個範例快速回覆",
        enabled: true,
      },
    ],
    "advanced.priority": 5,
    "advanced.pattern": "example_pattern",
    "advanced.designerButton": false,
    "advanced.documentationButton": null,
  });

  /**
   * 處理配置變更
   */
  const handleConfigChange = (newValues: Record<string, unknown>) => {
    setConfigValues(newValues);
  };

  /**
   * 處理儲存
   */
  const handleSave = (values: Record<string, unknown>) => {
    console.log("儲存配置:", values);
    alert("配置已儲存！請檢查控制台查看詳細內容。");
  };

  /**
   * 處理重置
   */
  const handleReset = () => {
    console.log("重置配置");
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white/90 mb-2">
          進階配置系統範例
        </h1>
        <p className="text-white/60">
          展示所有新配置類型的功能，包含條件顯示、驗證規則和各種輸入控件。
        </p>
      </div>

      <ConfigForm
        options={exampleOptions}
        values={configValues}
        onChange={handleConfigChange}
        onSave={handleSave}
        onReset={handleReset}
        title="元件配置"
        description="使用進階配置系統來自定義元件行為和外觀"
        showSaveButton={true}
        showResetButton={true}
      />

      {/* 即時預覽區域 */}
      <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded">
        <h3 className="text-lg font-semibold text-white/90 mb-3">即時預覽</h3>
        <div className="text-sm text-white/70 space-y-2">
          <div>
            <span className="font-medium">標題:</span> {configValues["basic.title"] as string}
          </div>
          <div>
            <span className="font-medium">啟用狀態:</span> {configValues["basic.enabled"] ? "是" : "否"}
          </div>
          <div>
            <span className="font-medium">類別:</span> {configValues["basic.category"] as string}
          </div>
          <div>
            <span className="font-medium">透明度:</span> {configValues["behavior.opacity"]}%
          </div>
          <div>
            <span className="font-medium">標籤:</span> {(configValues["basic.tags"] as string[])?.join(", ") || "無"}
          </div>
          <div>
            <span className="font-medium">關鍵字:</span> {(configValues["behavior.keywords"] as string[])?.join(", ") || "無"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedConfigExample;