/**
 * 進階貼圖回覆積木
 * 回覆貼圖訊息給用戶（增強版）
 */

import { Smile } from "lucide-react";
import { BlockDefinition } from "../types";
import { BlockCategory, WorkspaceContext } from "../../../../types/block";

export const stickerMessage: BlockDefinition = {
  id: "sticker-message",
  blockType: "reply",
  category: BlockCategory.REPLY,
  displayName: "回覆貼圖訊息",
  description: "發送 LINE 貼圖回覆給用戶（增強版）",
  icon: Smile,
  color: "bg-green-500",
  compatibility: [WorkspaceContext.LOGIC],
  defaultData: {
    title: "回覆貼圖訊息",
    replyType: "sticker",
    packageId: "446",
    stickerId: "1988",
    stickerResourceType: "STATIC", // STATIC, ANIMATION, SOUND
    options: {
      randomSticker: false,
      stickerSet: "basic", // basic, premium, custom
      enableEmotionDetection: false,
      enableStickerInfo: false,
      preferAnimated: false,
      enableSoundEffect: false,
    },
  },
  tags: ["回覆", "貼圖", "表情", "互動", "動畫"],
  version: "2.0.0",
  usageHints: [
    "用於發送 LINE 官方貼圖給用戶",
    "支援靜態、動畫和聲音貼圖",
    "需要指定貼圖包 ID 和貼圖 ID",
    "可以設定隨機選擇貼圖來增加趣味性",
    "支援基本貼圖包，部分進階貼圖可能需要付費",
    "動畫和聲音貼圖需要用戶裝置支援",
  ],
  configOptions: [
    {
      key: "packageId",
      label: "貼圖包 ID",
      type: "text",
      defaultValue: "446",
      required: true,
      description: "LINE 貼圖包的識別號碼",
      validation: {
        pattern: "^\\d+$",
        message: "貼圖包 ID 必須是數字",
      },
    },
    {
      key: "stickerId",
      label: "貼圖 ID",
      type: "text",
      defaultValue: "1988",
      required: true,
      description: "貼圖包中特定貼圖的識別號碼",
      validation: {
        pattern: "^\\d+$",
        message: "貼圖 ID 必須是數字",
      },
    },
    {
      key: "stickerResourceType",
      label: "貼圖類型",
      type: "select",
      defaultValue: "STATIC",
      options: [
        { label: "靜態貼圖", value: "STATIC" },
        { label: "動畫貼圖", value: "ANIMATION" },
        { label: "聲音貼圖", value: "SOUND" },
        { label: "彈出效果", value: "POPUP" },
        { label: "動畫聲音", value: "ANIMATION_SOUND" },
      ],
      description: "貼圖的資源類型",
    },
    {
      key: "randomSticker",
      label: "隨機貼圖",
      type: "boolean",
      defaultValue: false,
      description: "是否從指定貼圖包中隨機選擇貼圖",
    },
    {
      key: "stickerSet",
      label: "貼圖組",
      type: "select",
      defaultValue: "basic",
      options: [
        { label: "基本貼圖", value: "basic" },
        { label: "進階貼圖", value: "premium" },
        { label: "動畫貼圖", value: "animated" },
        { label: "聲音貼圖", value: "sound" },
        { label: "自訂貼圖", value: "custom" },
      ],
      description: "要使用的貼圖組類型",
    },
    {
      key: "enableEmotionDetection",
      label: "啟用情緒偵測",
      type: "boolean",
      defaultValue: false,
      description: "是否根據用戶訊息情緒自動選擇相應的貼圖",
    },
    {
      key: "enableStickerInfo",
      label: "顯示貼圖資訊",
      type: "boolean",
      defaultValue: false,
      description: "是否顯示貼圖包名稱和作者資訊",
    },
    {
      key: "preferAnimated",
      label: "優先動畫",
      type: "boolean",
      defaultValue: false,
      description: "當隨機選擇時，是否優先選擇動畫貼圖",
    },
    {
      key: "enableSoundEffect",
      label: "啟用音效",
      type: "boolean",
      defaultValue: false,
      description: "是否播放貼圖的聲音效果（如果支援）",
    },
    {
      key: "fallbackText",
      label: "備用文字",
      type: "text",
      defaultValue: "(貼圖)",
      description: "當貼圖無法顯示時的替代文字",
      validation: {
        max: 400,
        message: "備用文字不能超過 400 字元",
      },
    },
  ],
};