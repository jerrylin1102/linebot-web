/**
 * 影片回覆積木
 * 回覆影片訊息給用戶
 */

import { Video } from "lucide-react";
import { BlockDefinition } from "../types";
import { BlockCategory, WorkspaceContext } from "../../../../types/block";

export const videoReply: BlockDefinition = {
  id: "video-reply",
  blockType: "reply",
  category: BlockCategory.REPLY,
  displayName: "回覆影片訊息",
  description: "發送影片檔案回覆給用戶",
  icon: Video,
  color: "bg-green-500",
  compatibility: [WorkspaceContext.LOGIC],
  defaultData: {
    title: "回覆影片訊息",
    replyType: "video",
    videoUrl: "",
    previewImageUrl: "",
    trackingId: "",
    options: {
      enablePreview: true,
      enableDownload: false,
      maxFileSize: 200, // MB
      allowedFormats: ["mp4", "mov", "avi"],
      autoPlay: false,
      showControls: true,
      trackViews: false,
      uploadMethod: "url", // url, file, drag-drop
      fileUpload: {
        enableDragDrop: true,
        enableMultiple: false,
        autoUpload: true,
        enableVideoProcessing: false,
        enableThumbnailGeneration: true,
        enableCompression: false,
        targetResolution: "720p", // 480p, 720p, 1080p, original
      },
      urlValidation: {
        enableUrlCheck: true,
        enableVideoMetaCheck: true,
        enableFormatCheck: true,
        enableThumbnailCheck: true,
      },
    },
  },
  tags: ["回覆", "影片", "視頻", "多媒體"],
  version: "1.0.0",
  usageHints: [
    "用於發送影片檔案回覆給用戶",
    "需要提供影片檔案的 URL 位址和預覽圖片",
    "支援 MP4、MOV、AVI 格式，檔案大小限制 200MB",
    "必須提供預覽圖片 URL 以供縮圖顯示",
    "影片檔案必須使用 HTTPS 協議",
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
      description: "選擇影片檔案的提供方式",
    },
    {
      key: "videoUrl",
      label: "影片 URL",
      type: "text",
      defaultValue: "",
      required: true,
      description: "要發送的影片檔案 URL 位址（必須是 HTTPS）",
      validation: {
        pattern: "^https://.*\\.(mp4|mov|avi)$",
        message: "必須是有效的 HTTPS 影片檔案 URL",
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
      accept: "video/mp4,video/quicktime,video/x-msvideo",
      maxSize: 209715200, // 200MB in bytes
      description: "選擇要上傳的影片檔案",
      conditional: {
        dependsOn: "uploadMethod",
        showWhen: ["file"],
      },
      uploadConfig: {
        enablePreview: true,
        enableThumbnailGeneration: true,
        enableCompression: false,
        targetResolution: "720p",
        enableMetadata: true,
      },
    },
    {
      key: "dragDropUpload",
      label: "拖拽上傳區域",
      type: "drag-drop-zone",
      accept: "video/mp4,video/quicktime,video/x-msvideo",
      maxSize: 209715200, // 200MB in bytes
      description: "將影片檔案拖拽到此區域進行上傳",
      conditional: {
        dependsOn: "uploadMethod",
        showWhen: ["drag-drop"],
      },
      zoneConfig: {
        enableMultiple: false,
        autoUpload: true,
        showProgress: true,
        enablePreview: true,
        enableThumbnailGeneration: true,
      },
    },
    {
      key: "previewImageUrl",
      label: "預覽圖片 URL",
      type: "text",
      defaultValue: "",
      required: true,
      description: "影片縮圖的 URL 位址（必須是 HTTPS 的 JPEG 圖片）",
      validation: {
        pattern: "^https://.*\\.(jpg|jpeg)$",
        message: "必須是有效的 HTTPS JPEG 圖片 URL",
      },
    },
    {
      key: "trackingId",
      label: "追蹤 ID",
      type: "text",
      defaultValue: "",
      description: "用於追蹤影片觀看統計的識別碼（選填）",
      validation: {
        max: 100,
        message: "追蹤 ID 不能超過 100 字元",
      },
    },
    {
      key: "enablePreview",
      label: "啟用預覽",
      type: "boolean",
      defaultValue: true,
      description: "是否在聊天室中顯示影片預覽縮圖",
    },
    {
      key: "enableDownload",
      label: "允許下載",
      type: "boolean",
      defaultValue: false,
      description: "是否允許用戶下載影片檔案到裝置",
    },
    {
      key: "autoPlay",
      label: "自動播放",
      type: "boolean",
      defaultValue: false,
      description: "是否在用戶點擊時自動播放影片（依裝置設定而定）",
    },
    {
      key: "showControls",
      label: "顯示控制器",
      type: "boolean",
      defaultValue: true,
      description: "是否顯示影片播放控制器（播放、暫停、進度條等）",
    },
    {
      key: "trackViews",
      label: "追蹤觀看",
      type: "boolean",
      defaultValue: false,
      description: "是否啟用影片觀看統計追蹤",
    },
    {
      key: "altText",
      label: "替代文字",
      type: "text",
      defaultValue: "影片訊息",
      description: "當影片無法播放時的替代文字",
      validation: {
        max: 400,
        message: "替代文字不能超過 400 字元",
      },
    },
  ],
};