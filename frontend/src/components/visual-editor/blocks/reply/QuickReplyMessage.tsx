/**
 * 快速回覆積木
 * 在訊息下方顯示快速回覆按鈕
 */

import { Zap } from "lucide-react";
import { BlockDefinition } from "../types";
import { BlockCategory, WorkspaceContext } from "../../../../types/block";

export const quickReply: BlockDefinition = {
  id: "quick-reply",
  blockType: "reply",
  category: BlockCategory.REPLY,
  displayName: "快速回覆",
  description: "在訊息下方添加快速回覆按鈕",
  icon: Zap,
  color: "bg-green-500",
  compatibility: [WorkspaceContext.LOGIC],
  defaultData: {
    title: "快速回覆",
    replyType: "text", // 快速回覆是附加在其他訊息上的
    text: "請選擇：",
    quickReplyItems: [
      {
        type: "action",
        action: {
          type: "message",
          label: "是",
          text: "是",
        },
      },
      {
        type: "action",
        action: {
          type: "message",
          label: "否",
          text: "否",
        },
      },
    ],
    options: {
      maxItems: 13,
      enableEmoji: true,
      enableIcon: false,
      itemDisplayMode: "compact", // compact, normal
      reorderMode: false,
      previewMode: "compact", // compact, full, line-style
      enableBulkActions: true,
      itemValidation: "standard", // standard, strict, loose
      dynamicEditor: {
        enableReorder: true,
        enableDuplicate: true,
        enablePreview: true,
        enableBulkEdit: true,
        enableTemplateImport: true,
        enableAutoGenerate: true,
      },
    },
  },
  tags: ["回覆", "快速", "按鈕", "選項", "互動"],
  version: "1.0.0",
  usageHints: [
    "在任何訊息類型下方添加快速回覆按鈕",
    "用戶點擊後按鈕會消失",
    "最多可以添加 13 個快速回覆選項",
    "支援文字、表情符號和圖示",
    "適合用於簡單的選擇和確認流程",
  ],
  configOptions: [
    {
      key: "text",
      label: "主要訊息",
      type: "textarea",
      defaultValue: "請選擇：",
      required: true,
      description: "顯示在快速回覆按鈕上方的主要訊息",
      validation: {
        min: 1,
        max: 5000,
        message: "主要訊息長度必須在 1-5000 字元之間",
      },
    },
    {
      key: "quickReplyEditor",
      label: "快速回覆編輯器",
      type: "dynamic-editor",
      description: "動態編輯快速回覆選項",
      editorConfig: {
        itemType: "quickReplyItem",
        maxItems: 13,
        minItems: 1,
        enableReorder: true,
        enableDuplicate: true,
        enablePreview: true,
      },
    },
    {
      key: "addQuickReplyItem",
      label: "新增快速回覆選項",
      type: "button",
      buttonText: "新增選項",
      description: "新增一個快速回覆選項",
      action: "addQuickReplyItem",
    },
    {
      key: "maxItems",
      label: "最大選項數",
      type: "number",
      defaultValue: 13,
      description: "快速回覆中可包含的最大選項數量",
      validation: {
        min: 1,
        max: 13,
        message: "選項數量必須在 1-13 之間",
      },
    },
    {
      key: "enableEmoji",
      label: "啟用表情符號",
      type: "boolean",
      defaultValue: true,
      description: "是否允許在快速回覆選項中使用表情符號",
    },
    {
      key: "enableIcon",
      label: "啟用圖示",
      type: "boolean",
      defaultValue: false,
      description: "是否在快速回覆選項中顯示圖示",
    },
    {
      key: "itemDisplayMode",
      label: "顯示模式",
      type: "select",
      defaultValue: "compact",
      options: [
        { label: "緊湊模式", value: "compact" },
        { label: "正常模式", value: "normal" },
      ],
      description: "快速回覆按鈕的顯示模式",
    },
    {
      key: "autoCloseTime",
      label: "自動關閉時間（秒）",
      type: "number",
      defaultValue: 0,
      description: "快速回覆按鈕自動關閉的時間（0 表示不自動關閉）",
      validation: {
        min: 0,
        max: 300,
        message: "自動關閉時間必須在 0-300 秒之間",
      },
    },
    {
      key: "allowMultipleSelection",
      label: "允許多選",
      type: "boolean",
      defaultValue: false,
      description: "是否允許用戶選擇多個快速回覆選項",
    },
    {
      key: "showSelectionCount",
      label: "顯示選擇計數",
      type: "boolean",
      defaultValue: false,
      description: "是否顯示已選擇的選項數量",
    },
    {
      key: "bulkEditItems",
      label: "批次編輯選項",
      type: "button",
      buttonText: "批次編輯",
      description: "開啟批次編輯模式，可以同時編輯多個選項",
      action: "bulkEditItems",
    },
    {
      key: "importFromTemplate",
      label: "從模板匯入",
      type: "button",
      buttonText: "匯入模板",
      description: "從預設模板匯入快速回覆選項",
      action: "importFromTemplate",
    },
    {
      key: "reorderMode",
      label: "啟用排序模式",
      type: "boolean",
      defaultValue: false,
      description: "啟用拖拽排序模式來調整選項順序",
    },
    {
      key: "previewMode",
      label: "預覽模式",
      type: "select",
      defaultValue: "compact",
      options: [
        { label: "緊湊預覽", value: "compact" },
        { label: "完整預覽", value: "full" },
        { label: "LINE 樣式預覽", value: "line-style" },
      ],
      description: "快速回覆選項的預覽顯示模式",
    },
    {
      key: "enableBulkActions",
      label: "啟用批次操作",
      type: "boolean",
      defaultValue: true,
      description: "是否啟用批次選擇、刪除、複製等操作",
    },
    {
      key: "itemValidation",
      label: "選項驗證",
      type: "select",
      defaultValue: "standard",
      options: [
        { label: "標準驗證", value: "standard" },
        { label: "嚴格驗證", value: "strict" },
        { label: "寬鬆驗證", value: "loose" },
      ],
      description: "快速回覆選項的驗證嚴格程度",
    },
    {
      key: "autoGenerateItems",
      label: "自動產生選項",
      type: "button",
      buttonText: "自動產生",
      description: "根據常用模式自動產生快速回覆選項",
      action: "autoGenerateItems",
    },
  ],
};