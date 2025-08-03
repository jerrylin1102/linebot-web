/**
 * 貼圖訊息事件積木
 * 當用戶傳送貼圖訊息時觸發
 */

import { Smile } from "lucide-react";
import { BlockDefinition } from "../types";
import { BlockCategory, WorkspaceContext } from "../../../../types/block";

export const stickerMessageEvent: BlockDefinition = {
  id: "sticker-message-event",
  blockType: "event",
  category: BlockCategory.EVENT,
  displayName: "當收到貼圖訊息時",
  description: "當用戶傳送貼圖訊息給 LINE Bot 時觸發此事件",
  icon: Smile,
  color: "bg-orange-500",
  compatibility: [WorkspaceContext.LOGIC],
  defaultData: {
    title: "當收到貼圖訊息時",
    eventType: "message.sticker",
    filters: {
      matchType: "any", // any, packageId, stickerId, keywords
      packageIds: [] as string[],
      stickerIds: [] as string[],
      keywords: [] as string[],
      includeAnimated: true,
      includeSound: true,
    },
    settings: {
      saveSticker: false,
      trackUsage: true,
      enableAnalytics: false,
    },
  },
  tags: ["事件", "訊息", "貼圖", "表情", "觸發"],
  version: "1.0.0",
  usageHints: [
    "此積木在用戶傳送貼圖訊息時觸發",
    "可以根據貼圖包 ID 或貼圖 ID 來篩選特定的貼圖",
    "支援動態貼圖和聲音貼圖的處理",
    "可以追蹤貼圖使用情況來了解用戶偏好",
  ],
  configOptions: [
    {
      key: "matchType",
      label: "匹配方式",
      type: "select",
      defaultValue: "any",
      options: [
        { label: "任何貼圖", value: "any" },
        { label: "特定貼圖包", value: "packageId" },
        { label: "特定貼圖", value: "stickerId" },
        { label: "關鍵字匹配", value: "keywords" },
      ],
      required: true,
      description: "如何匹配接收到的貼圖",
    },
    {
      key: "packageIds",
      label: "貼圖包 ID 列表",
      type: "textarea",
      defaultValue: "",
      description: '要匹配的貼圖包 ID，每行一個。當匹配方式為"特定貼圖包"時使用',
    },
    {
      key: "stickerIds",
      label: "貼圖 ID 列表",
      type: "textarea",
      defaultValue: "",
      description: '要匹配的貼圖 ID，每行一個。當匹配方式為"特定貼圖"時使用',
    },
    {
      key: "keywords",
      label: "關鍵字列表",
      type: "textarea",
      defaultValue: "",
      description: '要匹配的貼圖關鍵字，每行一個。當匹配方式為"關鍵字匹配"時使用',
    },
    {
      key: "includeAnimated",
      label: "包含動態貼圖",
      type: "boolean",
      defaultValue: true,
      description: "是否處理動態貼圖（有動畫效果的貼圖）",
    },
    {
      key: "includeSound",
      label: "包含聲音貼圖",
      type: "boolean",
      defaultValue: true,
      description: "是否處理聲音貼圖（有音效的貼圖）",
    },
    {
      key: "saveSticker",
      label: "儲存貼圖資訊",
      type: "boolean",
      defaultValue: false,
      description: "是否儲存貼圖的詳細資訊（ID、包ID、關鍵字等）",
    },
    {
      key: "trackUsage",
      label: "追蹤使用狀況",
      type: "boolean",
      defaultValue: true,
      description: "是否追蹤貼圖使用頻率和偏好",
    },
    {
      key: "enableAnalytics",
      label: "啟用分析",
      type: "boolean",
      defaultValue: false,
      description: "是否記錄貼圖訊息的使用統計資料",
    },
    {
      key: "autoReply",
      label: "自動回覆模式",
      type: "select",
      defaultValue: "none",
      options: [
        { label: "無回覆", value: "none" },
        { label: "回傳相同貼圖", value: "same" },
        { label: "回傳隨機貼圖", value: "random" },
        { label: "自訂回覆", value: "custom" },
      ],
      description: "接收到貼圖後的自動回覆行為",
    },
  ],
};