/**
 * 文字回覆積木
 * 回覆純文字訊息給用戶
 */

import { MessageSquare } from "lucide-react";
import { BlockDefinition } from "../types";
import { BlockCategory, WorkspaceContext } from "../../../../types/block";

export const textReply: BlockDefinition = {
  id: "text-reply",
  blockType: "reply",
  category: BlockCategory.REPLY,
  displayName: "回覆文字訊息",
  description: "發送純文字訊息回覆給用戶",
  icon: MessageSquare,
  color: "bg-green-500",
  compatibility: [WorkspaceContext.LOGIC],
  defaultData: {
    title: "回覆文字訊息",
    replyType: "text",
    text: "您好！這是一則文字回覆訊息。",
    options: {
      enableEmoji: true,
      enableVariables: true,
      maxLength: 5000,
    },
  },
  tags: ["回覆", "文字", "訊息", "基本"],
  version: "1.0.0",
  usageHints: [
    "最基本的回覆積木，用於發送純文字訊息",
    "支援 LINE 表情符號和變數替換",
    "文字長度限制為 5000 個字元",
    "可以使用 \\n 來換行",
  ],
  configOptions: [
    {
      key: "text",
      label: "回覆文字",
      type: "textarea",
      defaultValue: "您好！這是一則文字回覆訊息。",
      required: true,
      description: "要發送給用戶的文字內容，支援 LINE 表情符號",
      validation: {
        min: 1,
        max: 5000,
        message: "文字內容長度必須在 1-5000 字元之間",
      },
    },
    {
      key: "enableEmoji",
      label: "啟用表情符號",
      type: "boolean",
      defaultValue: true,
      description: "是否啟用 LINE 表情符號的解析和顯示",
    },
    {
      key: "enableVariables",
      label: "啟用變數替換",
      type: "boolean",
      defaultValue: true,
      description: "是否啟用文字中的變數替換功能（如用戶名稱、時間等）",
    },
    {
      key: "replyToken",
      label: "回覆Token來源",
      type: "select",
      defaultValue: "auto",
      options: [
        { label: "自動取得", value: "auto" },
        { label: "指定變數", value: "variable" },
        { label: "手動輸入", value: "manual" },
      ],
      description: "指定回覆 token 的來源方式",
    },
  ],
};
