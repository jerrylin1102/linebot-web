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
      uploadMethod: "url", // url, file, drag-drop
      fileUpload: {
        enableDragDrop: true,
        enableMultiple: false,
        autoUpload: true,
        compressionQuality: 0.8,
        generateThumbnail: true,
        enableCrop: false,
        cropAspectRatio: "16:9", // 16:9, 4:3, 1:1, free
      },
      urlValidation: {
        enableUrlCheck: true,
        enableImageSizeCheck: true,
        enableFormatCheck: true,
      },
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
      key: "uploadMethod",
      label: "上傳方式",
      type: "select",
      defaultValue: "url",
      options: [
        { label: "URL 位址", value: "url" },
        { label: "檔案上傳", value: "file" },
        { label: "拖拽上傳", value: "drag-drop" },
      ],
      required: true,
      description: "選擇圖片的提供方式",
    },
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
      conditional: {
        dependsOn: "uploadMethod",
        showWhen: ["url"],
      },
    },
    {
      key: "fileUpload",
      label: "檔案上傳",
      type: "file-upload",
      accept: "image/jpeg,image/png,image/gif",
      maxSize: 10485760, // 10MB in bytes
      description: "選擇要上傳的圖片檔案",
      conditional: {
        dependsOn: "uploadMethod",
        showWhen: ["file"],
      },
      uploadConfig: {
        enablePreview: true,
        enableCrop: false,
        compressionQuality: 0.8,
        generateThumbnail: true,
      },
    },
    {
      key: "dragDropUpload",
      label: "拖拽上傳區域",
      type: "drag-drop-zone",
      accept: "image/jpeg,image/png,image/gif",
      maxSize: 10485760, // 10MB in bytes
      description: "將圖片檔案拖拽到此區域進行上傳",
      conditional: {
        dependsOn: "uploadMethod",
        showWhen: ["drag-drop"],
      },
      zoneConfig: {
        enableMultiple: false,
        autoUpload: true,
        showProgress: true,
        enablePreview: true,
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
      key: "enableImageProcessing",
      label: "啟用圖片處理",
      type: "boolean",
      defaultValue: false,
      description: "是否啟用圖片壓縮、裁剪等處理功能",
    },
    {
      key: "compressionQuality",
      label: "壓縮品質",
      type: "slider",
      defaultValue: 0.8,
      min: 0.1,
      max: 1.0,
      step: 0.1,
      description: "圖片壓縮品質（0.1-1.0）",
      conditional: {
        dependsOn: "enableImageProcessing",
        showWhen: [true],
      },
    },
    {
      key: "enableCrop",
      label: "啟用裁剪",
      type: "boolean",
      defaultValue: false,
      description: "是否啟用圖片裁剪功能",
      conditional: {
        dependsOn: "enableImageProcessing",
        showWhen: [true],
      },
    },
    {
      key: "cropAspectRatio",
      label: "裁剪比例",
      type: "select",
      defaultValue: "16:9",
      options: [
        { label: "16:9 (寬螢幕)", value: "16:9" },
        { label: "4:3 (標準)", value: "4:3" },
        { label: "1:1 (正方形)", value: "1:1" },
        { label: "自由裁剪", value: "free" },
      ],
      description: "圖片裁剪的長寬比例",
      conditional: {
        dependsOn: "enableCrop",
        showWhen: [true],
      },
    },
    {
      key: "generateThumbnail",
      label: "自動產生縮圖",
      type: "boolean",
      defaultValue: true,
      description: "是否自動產生預覽縮圖",
    },
    {
      key: "enableUrlValidation",
      label: "啟用 URL 驗證",
      type: "boolean",
      defaultValue: true,
      description: "是否驗證圖片 URL 的有效性",
    },
    {
      key: "maxFileSize",
      label: "最大檔案大小 (MB)",
      type: "number",
      defaultValue: 10,
      min: 1,
      max: 100,
      description: "允許上傳的最大檔案大小",
      validation: {
        min: 1,
        max: 100,
        message: "檔案大小必須在 1-100 MB 之間",
      },
    },
    {
      key: "allowedFormats",
      label: "允許的格式",
      type: "multi-select",
      defaultValue: ["jpg", "jpeg", "png", "gif"],
      options: [
        { label: "JPEG", value: "jpg" },
        { label: "JPEG", value: "jpeg" },
        { label: "PNG", value: "png" },
        { label: "GIF", value: "gif" },
        { label: "WebP", value: "webp" },
        { label: "BMP", value: "bmp" },
      ],
      description: "允許上傳的檔案格式",
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
