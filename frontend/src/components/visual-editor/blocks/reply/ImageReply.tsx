/**
 * 圖片回覆積木
 * 回覆圖片訊息給用戶
 */

import { ImageIcon } from "lucide-react";
import { BlockDefinition } from "../types";
import { BlockCategory, WorkspaceContext } from "../../../../types/block";

export const imageReply: BlockDefinition = {
  id: "image-reply",
  blockType: "reply",
  category: BlockCategory.REPLY,
  displayName: "回覆圖片訊息",
  description: "發送圖片訊息回覆給用戶",
  icon: ImageIcon,
  color: "bg-green-500",
  compatibility: [WorkspaceContext.LOGIC],
  defaultData: {
    title: "回覆圖片訊息",
    replyType: "image",
    imageUrl: "",
    previewImageUrl: "",
    options: {
      enablePreview: true,
      enableDownload: false,
      maxFileSize: 10, // MB
      allowedFormats: ["jpg", "jpeg", "png", "gif"],
    },
  },
  tags: ["回覆", "圖片", "訊息", "多媒體"],
  version: "1.0.0",
  usageHints: [
    "用於發送圖片訊息回覆給用戶",
    "需要提供圖片的 URL 位址",
    "建議同時提供預覽圖片以提升載入速度",
    "支援 JPEG、PNG、GIF 格式，檔案大小限制 10MB",
  ],
  configOptions: [
    {
      key: "imageUrl",
      label: "圖片 URL",
      type: "text",
      defaultValue: "",
      required: true,
      description: "要發送的圖片 URL 位址（必須是 HTTPS）",
      validation: {
        pattern: "^https://.*\\.(jpg|jpeg|png|gif)$",
        message: "必須是有效的 HTTPS 圖片 URL",
      },
    },
    {
      key: "previewImageUrl",
      label: "預覽圖片 URL",
      type: "text",
      defaultValue: "",
      description: "預覽圖片 URL（建議使用較小的圖片以提升載入速度）",
    },
    {
      key: "enablePreview",
      label: "啟用預覽",
      type: "boolean",
      defaultValue: true,
      description: "是否在聊天室中顯示圖片預覽",
    },
    {
      key: "enableDownload",
      label: "允許下載",
      type: "boolean",
      defaultValue: false,
      description: "是否允許用戶下載圖片到裝置",
    },
    {
      key: "altText",
      label: "替代文字",
      type: "text",
      defaultValue: "圖片",
      description: "當圖片無法顯示時的替代文字",
      validation: {
        max: 400,
        message: "替代文字不能超過 400 字元",
      },
    },
  ],
};
