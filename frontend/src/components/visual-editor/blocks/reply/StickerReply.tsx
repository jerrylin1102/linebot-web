/**
 * 貼圖回覆積木
 * 回覆貼圖訊息給用戶
 */

import { Smile } from "lucide-react";
import { BlockDefinition } from "../types";
import { BlockCategory, WorkspaceContext } from "../../../../types/block";

export const stickerReply: BlockDefinition = {
  id: "sticker-reply",
  blockType: "reply",
  category: BlockCategory.REPLY,
  displayName: "回覆貼圖",
  description: "發送 LINE 貼圖回覆給用戶",
  icon: Smile,
  color: "bg-green-500",
  compatibility: [WorkspaceContext.LOGIC],
  defaultData: {
    title: "回覆貼圖",
    replyType: "sticker",
    packageId: "446",
    stickerId: "1988",
    options: {
      randomSticker: false,
      stickerSet: "basic", // basic, premium, custom
      enableEmotionDetection: false,
    },
  },
  tags: ["回覆", "貼圖", "表情", "互動"],
  version: "1.0.0",
  usageHints: [
    "用於發送 LINE 官方貼圖給用戶",
    "需要指定貼圖包 ID 和貼圖 ID",
    "可以設定隨機選擇貼圖來增加趣味性",
    "支援基本貼圖包，部分進階貼圖可能需要付費",
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
      key: "fallbackText",
      label: "備用文字",
      type: "text",
      defaultValue: "(貼圖)",
      description: "當貼圖無法顯示時的替代文字",
    },
  ],
};
