/**
 * Flex 回覆積木
 * 回覆 Flex Message 給用戶
 */

import { Layout } from "lucide-react";
import { BlockDefinition } from "../types";
import { BlockCategory, WorkspaceContext } from "../../../../types/block";

export const flexReply: BlockDefinition = {
  id: "flex-reply",
  blockType: "reply",
  category: BlockCategory.REPLY,
  displayName: "回覆 Flex 訊息",
  description: "發送豐富互動的 Flex Message 回覆給用戶",
  icon: Layout,
  color: "bg-green-500",
  compatibility: [WorkspaceContext.LOGIC],
  defaultData: {
    title: "回覆 Flex 訊息",
    replyType: "flex",
    flexMessage: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "這是一個 Flex Message",
            weight: "bold",
            size: "xl",
          },
        ],
      },
    },
    options: {
      enableQuickReply: false,
      enableNotification: true,
      templateSource: "custom", // custom, template, flexDesigner
      flexDesignerEnabled: false,
      designerIntegration: {
        openInNewTab: true,
        autoSync: false,
        previewMode: "desktop", // desktop, mobile, both
      },
      templatePresets: {
        lastUsedTemplate: "",
        customTemplates: [],
        favoriteTemplates: [],
      },
    },
  },
  tags: ["回覆", "flex", "豐富訊息", "互動", "版面"],
  version: "1.0.0",
  usageHints: [
    "用於發送豐富的互動式訊息給用戶",
    "支援複雜的版面配置、按鈕、圖片等元素",
    "可以連接到 Flex 設計器來視覺化編輯",
    "適合用於選單、商品展示、表單等場景",
  ],
  configOptions: [
    {
      key: "templateSource",
      label: "模板來源",
      type: "select",
      defaultValue: "custom",
      options: [
        { label: "自定義 JSON", value: "custom" },
        { label: "預設模板", value: "template" },
        { label: "Flex 設計器", value: "flexDesigner" },
      ],
      required: true,
      description: "Flex Message 的來源方式",
    },
    {
      key: "flexMessage",
      label: "Flex Message JSON",
      type: "textarea",
      defaultValue: "{}",
      description: "完整的 Flex Message JSON 結構",
      validation: {
        message: "必須是有效的 JSON 格式",
      },
    },
    {
      key: "templateId",
      label: "模板 ID",
      type: "select",
      defaultValue: "",
      options: [
        { label: "無模板", value: "" },
        { label: "基本文字卡片", value: "basic-text-card" },
        { label: "圖文卡片", value: "image-text-card" },
        { label: "按鈕選單", value: "button-menu" },
        { label: "產品展示", value: "product-showcase" },
        { label: "活動通知", value: "event-notification" },
        { label: "優惠券", value: "coupon-card" },
        { label: "聯絡資訊", value: "contact-info" },
        { label: "時間表", value: "schedule-card" },
      ],
      description: "當使用預設模板時的模板識別符",
    },
    {
      key: "flexDesignerEnabled",
      label: "啟用 Flex 設計器",
      type: "boolean",
      defaultValue: false,
      description: "是否啟用視覺化 Flex 設計器進行設計",
    },
    {
      key: "openFlexDesigner",
      label: "開啟 Flex 設計器",
      type: "button",
      buttonText: "開啟設計器",
      description: "點擊開啟視覺化 Flex Message 設計器",
      action: "openFlexDesigner",
    },
    {
      key: "loadTemplate",
      label: "載入預設模板",
      type: "button",
      buttonText: "載入模板",
      description: "根據選擇的模板 ID 載入預設的 Flex Message 結構",
      action: "loadTemplate",
    },
    {
      key: "enableQuickReply",
      label: "啟用快速回覆",
      type: "boolean",
      defaultValue: false,
      description: "是否在訊息下方顯示快速回覆按鈕",
    },
    {
      key: "enableNotification",
      label: "啟用通知",
      type: "boolean",
      defaultValue: true,
      description: "是否在用戶裝置上顯示推播通知",
    },
    {
      key: "altText",
      label: "替代文字",
      type: "text",
      defaultValue: "Flex Message",
      required: true,
      description: "在不支援 Flex Message 的環境中顯示的文字",
      validation: {
        min: 1,
        max: 400,
        message: "替代文字長度必須在 1-400 字元之間",
      },
    },
  ],
};
