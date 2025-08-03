/**
 * 用戶加入好友事件積木
 * 當用戶加入 LINE Bot 為好友時觸發
 */

import { UserPlus } from "lucide-react";
import { BlockDefinition } from "../types";
import { BlockCategory, WorkspaceContext } from "../../../../types/block";

export const followEvent: BlockDefinition = {
  id: "follow-event",
  blockType: "event",
  category: BlockCategory.EVENT,
  displayName: "當用戶加入好友時",
  description: "當用戶將 LINE Bot 加入好友時觸發此事件",
  icon: UserPlus,
  color: "bg-orange-500",
  compatibility: [WorkspaceContext.LOGIC],
  defaultData: {
    title: "當用戶加入好友時",
    eventType: "follow",
    actions: {
      sendWelcomeMessage: true,
      saveUserInfo: true,
      trackUserSource: false,
      sendToAnalytics: false,
    },
  },
  tags: ["事件", "好友", "加入", "歡迎", "觸發"],
  version: "1.0.0",
  usageHints: [
    "此積木在用戶首次加入 LINE Bot 好友時觸發",
    "通常用於發送歡迎訊息和收集用戶基本資訊",
    "可以追蹤用戶來源和進行數據分析",
    "建議搭配歡迎訊息積木使用",
  ],
  configOptions: [
    {
      key: "sendWelcomeMessage",
      label: "發送歡迎訊息",
      type: "boolean",
      defaultValue: true,
      description: "是否自動發送歡迎訊息給新加入的好友",
    },
    {
      key: "saveUserInfo",
      label: "儲存用戶資訊",
      type: "boolean",
      defaultValue: true,
      description: "是否儲存用戶的基本資訊（如顯示名稱、頭像等）",
    },
    {
      key: "trackUserSource",
      label: "追蹤用戶來源",
      type: "boolean",
      defaultValue: false,
      description: "是否追蹤用戶是如何發現和加入 Bot 的",
    },
    {
      key: "sendToAnalytics",
      label: "發送分析事件",
      type: "boolean",
      defaultValue: false,
      description: "是否將此事件發送到分析平台（如 Google Analytics）",
    },
    {
      key: "welcomeDelay",
      label: "歡迎訊息延遲 (秒)",
      type: "number",
      defaultValue: 0,
      description: "發送歡迎訊息前的延遲時間，0 表示立即發送",
      validation: {
        min: 0,
        max: 300,
        message: "延遲時間必須在 0-300 秒之間",
      },
    },
  ],
};
