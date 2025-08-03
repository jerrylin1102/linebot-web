/**
 * 模板回覆積木
 * 回覆模板訊息給用戶（按鈕、確認、輪播等模板）
 */

import { Layout } from "lucide-react";
import { BlockDefinition } from "../types";
import { BlockCategory, WorkspaceContext } from "../../../../types/block";

export const templateReply: BlockDefinition = {
  id: "template-reply",
  blockType: "reply",
  category: BlockCategory.REPLY,
  displayName: "回覆模板訊息",
  description: "發送互動式模板訊息給用戶",
  icon: Layout,
  color: "bg-green-500",
  compatibility: [WorkspaceContext.LOGIC],
  defaultData: {
    title: "回覆模板訊息",
    replyType: "template",
    templateType: "buttons", // buttons, confirm, carousel, image_carousel
    altText: "這是一個模板訊息",
    text: "請選擇一個選項：",
    actions: [
      {
        type: "message",
        label: "選項1",
        text: "用戶選擇了選項1",
      },
      {
        type: "uri",
        label: "開啟連結",
        uri: "https://example.com",
      },
    ],
    options: {
      enableThumbnail: false,
      thumbnailImageUrl: "",
      imageAspectRatio: "rectangle", // rectangle, square
      imageSize: "cover", // cover, contain
      imageBackgroundColor: "#FFFFFF",
      defaultAction: null,
    },
  },
  tags: ["回覆", "模板", "按鈕", "互動", "選單"],
  version: "1.0.0",
  usageHints: [
    "用於建立互動式的模板訊息",
    "支援按鈕模板、確認模板、輪播模板等",
    "可以添加多種動作類型：文字回覆、網址、回傳資料",
    "按鈕模板最多支援 4 個按鈕",
    "輪播模板最多支援 10 個項目",
  ],
  configOptions: [
    {
      key: "templateType",
      label: "模板類型",
      type: "select",
      defaultValue: "buttons",
      required: true,
      options: [
        { label: "按鈕模板", value: "buttons" },
        { label: "確認模板", value: "confirm" },
        { label: "輪播模板", value: "carousel" },
        { label: "圖片輪播", value: "image_carousel" },
      ],
      description: "選擇要使用的模板類型",
    },
    {
      key: "altText",
      label: "替代文字",
      type: "text",
      defaultValue: "這是一個模板訊息",
      required: true,
      description: "在不支援模板訊息的環境中顯示的替代文字",
      validation: {
        min: 1,
        max: 400,
        message: "替代文字長度必須在 1-400 字元之間",
      },
    },
    {
      key: "text",
      label: "主要文字",
      type: "textarea",
      defaultValue: "請選擇一個選項：",
      description: "模板訊息的主要文字內容",
      validation: {
        max: 160,
        message: "主要文字不能超過 160 字元",
      },
    },
    {
      key: "thumbnailImageUrl",
      label: "縮圖 URL",
      type: "text",
      defaultValue: "",
      description: "模板訊息的縮圖圖片 URL（選填，必須是 HTTPS）",
      validation: {
        pattern: "^(https://.*\\.(jpg|jpeg|png)|)$",
        message: "必須是有效的 HTTPS 圖片 URL 或空白",
      },
    },
    {
      key: "imageAspectRatio",
      label: "圖片比例",
      type: "select",
      defaultValue: "rectangle",
      options: [
        { label: "矩形 (1.51:1)", value: "rectangle" },
        { label: "正方形 (1:1)", value: "square" },
      ],
      description: "縮圖的顯示比例",
    },
    {
      key: "imageSize",
      label: "圖片尺寸",
      type: "select",
      defaultValue: "cover",
      options: [
        { label: "覆蓋", value: "cover" },
        { label: "包含", value: "contain" },
      ],
      description: "圖片在容器中的顯示方式",
    },
    {
      key: "imageBackgroundColor",
      label: "圖片背景色",
      type: "text",
      defaultValue: "#FFFFFF",
      description: "圖片背景顏色（十六進位色碼）",
      validation: {
        pattern: "^#[0-9a-fA-F]{6}$",
        message: "必須是有效的十六進位色碼（如 #FFFFFF）",
      },
    },
    {
      key: "enableThumbnail",
      label: "啟用縮圖",
      type: "boolean",
      defaultValue: false,
      description: "是否顯示縮圖圖片",
    },
    {
      key: "maxActions",
      label: "最大按鈕數",
      type: "number",
      defaultValue: 4,
      description: "模板中最多可包含的按鈕數量",
      validation: {
        min: 1,
        max: 4,
        message: "按鈕數量必須在 1-4 之間",
      },
    },
  ],
};