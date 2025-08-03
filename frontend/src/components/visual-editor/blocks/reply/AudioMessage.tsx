/**
 * 音頻回覆積木
 * 回覆音頻訊息給用戶
 */

import { Music } from "lucide-react";
import { BlockDefinition } from "../types";
import { BlockCategory, WorkspaceContext } from "../../../../types/block";

export const audioReply: BlockDefinition = {
  id: "audio-reply",
  blockType: "reply",
  category: BlockCategory.REPLY,
  displayName: "回覆音頻訊息",
  description: "發送音頻檔案回覆給用戶",
  icon: Music,
  color: "bg-green-500",
  compatibility: [WorkspaceContext.LOGIC],
  defaultData: {
    title: "回覆音頻訊息",
    replyType: "audio",
    audioUrl: "",
    duration: 60000, // 預設60秒，以毫秒為單位
    options: {
      enablePreview: true,
      enableDownload: false,
      maxFileSize: 100, // MB
      allowedFormats: ["m4a", "mp3", "wav"],
      autoPlay: false,
      showDuration: true,
      uploadMethod: "url", // url, file, drag-drop
      fileUpload: {
        enableDragDrop: true,
        enableMultiple: false,
        autoUpload: true,
        enableAudioProcessing: false,
        volumeNormalization: false,
        enableTrimming: false,
      },
      urlValidation: {
        enableUrlCheck: true,
        enableAudioMetaCheck: true,
        enableFormatCheck: true,
      },
    },
  },
  tags: ["回覆", "音頻", "語音", "多媒體"],
  version: "1.0.0",
  usageHints: [
    "用於發送音頻檔案回覆給用戶",
    "需要提供音頻檔案的 URL 位址",
    "支援 M4A、MP3、WAV 格式，檔案大小限制 100MB",
    "播放時長最長 10 分鐘（600秒）",
    "音頻檔案必須使用 HTTPS 協議",
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
      description: "選擇音頻檔案的提供方式",
    },
    {
      key: "audioUrl",
      label: "音頻 URL",
      type: "text",
      defaultValue: "",
      required: true,
      description: "要發送的音頻檔案 URL 位址（必須是 HTTPS）",
      validation: {
        pattern: "^https://.*\\.(m4a|mp3|wav)$",
        message: "必須是有效的 HTTPS 音頻檔案 URL",
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
      accept: "audio/mp4,audio/mpeg,audio/wav",
      maxSize: 104857600, // 100MB in bytes
      description: "選擇要上傳的音頻檔案",
      conditional: {
        dependsOn: "uploadMethod",
        showWhen: ["file"],
      },
      uploadConfig: {
        enablePreview: true,
        enableTrimming: false,
        volumeNormalization: false,
        enableMetadata: true,
      },
    },
    {
      key: "dragDropUpload",
      label: "拖拽上傳區域",
      type: "drag-drop-zone",
      accept: "audio/mp4,audio/mpeg,audio/wav",
      maxSize: 104857600, // 100MB in bytes
      description: "將音頻檔案拖拽到此區域進行上傳",
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
      key: "duration",
      label: "播放時長（毫秒）",
      type: "number",
      defaultValue: 60000,
      required: true,
      description: "音頻檔案的播放時長（毫秒），最長 600000 毫秒（10分鐘）",
      validation: {
        min: 1000,
        max: 600000,
        message: "播放時長必須在 1000-600000 毫秒之間",
      },
    },
    {
      key: "enablePreview",
      label: "啟用預覽",
      type: "boolean",
      defaultValue: true,
      description: "是否在聊天室中顯示音頻播放器",
    },
    {
      key: "enableDownload",
      label: "允許下載",
      type: "boolean",
      defaultValue: false,
      description: "是否允許用戶下載音頻檔案到裝置",
    },
    {
      key: "autoPlay",
      label: "自動播放",
      type: "boolean",
      defaultValue: false,
      description: "是否在訊息到達時自動播放音頻",
    },
    {
      key: "showDuration",
      label: "顯示播放時長",
      type: "boolean",
      defaultValue: true,
      description: "是否在音頻播放器中顯示播放時長",
    },
    {
      key: "altText",
      label: "替代文字",
      type: "text",
      defaultValue: "音頻訊息",
      description: "當音頻無法播放時的替代文字",
      validation: {
        max: 400,
        message: "替代文字不能超過 400 字元",
      },
    },
  ],
};