/**
 * 群組成員加入事件積木
 * 當有新成員加入群組或聊天室時觸發
 */

import { UserPlus2 } from "lucide-react";
import { BlockDefinition } from "../types";
import { BlockCategory, WorkspaceContext } from "../../../../types/block";

export const memberJoinedEvent: BlockDefinition = {
  id: "member-joined-event",
  blockType: "event",
  category: BlockCategory.EVENT,
  displayName: "當成員加入群組時",
  description: "當新成員加入群組或聊天室時觸發此事件",
  icon: UserPlus2,
  color: "bg-orange-500",
  compatibility: [WorkspaceContext.LOGIC],
  defaultData: {
    title: "當成員加入群組時",
    eventType: "memberJoined",
    settings: {
      sourceType: "both", // group, room, both
      sendWelcomeMessage: true,
      getMemberInfo: true,
      notifyAdmins: false,
      trackJoinSource: false,
    },
    filters: {
      specificGroups: [] as string[],
      excludeGroups: [] as string[],
      memberCountLimit: 0, // 0 = no limit
    },
  },
  tags: ["事件", "群組", "成員", "加入", "歡迎", "觸發"],
  version: "1.0.0",
  usageHints: [
    "此積木在新成員加入群組或聊天室時觸發",
    "可以區分群組和聊天室的加入事件",
    "支援發送歡迎訊息和收集成員資訊",
    "可以設定特定群組的過濾條件",
  ],
  configOptions: [
    {
      key: "sourceType",
      label: "來源類型",
      type: "select",
      defaultValue: "both",
      options: [
        { label: "群組和聊天室", value: "both" },
        { label: "僅群組", value: "group" },
        { label: "僅聊天室", value: "room" },
      ],
      required: true,
      description: "觸發此事件的來源類型",
    },
    {
      key: "sendWelcomeMessage",
      label: "發送歡迎訊息",
      type: "boolean",
      defaultValue: true,
      description: "是否向新加入的成員發送歡迎訊息",
    },
    {
      key: "getMemberInfo",
      label: "獲取成員資訊",
      type: "boolean",
      defaultValue: true,
      description: "是否自動獲取新成員的基本資訊（顯示名稱、頭像等）",
    },
    {
      key: "notifyAdmins",
      label: "通知管理員",
      type: "boolean",
      defaultValue: false,
      description: "是否通知群組管理員有新成員加入",
    },
    {
      key: "trackJoinSource",
      label: "追蹤加入來源",
      type: "boolean",
      defaultValue: false,
      description: "是否追蹤成員是如何加入群組的（邀請、QR Code等）",
    },
    {
      key: "specificGroups",
      label: "特定群組 ID",
      type: "textarea",
      defaultValue: "",
      description: "僅在指定的群組 ID 中觸發，每行一個群組 ID（空白表示所有群組）",
    },
    {
      key: "excludeGroups",
      label: "排除群組 ID",
      type: "textarea",
      defaultValue: "",
      description: "不在指定的群組 ID 中觸發，每行一個群組 ID",
    },
    {
      key: "memberCountLimit",
      label: "成員數量限制",
      type: "number",
      defaultValue: 0,
      description: "僅在群組成員數量達到指定數量時觸發，0 表示無限制",
      validation: {
        min: 0,
        max: 10000,
        message: "成員數量限制必須在 0-10000 之間",
      },
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
    {
      key: "enableAnalytics",
      label: "啟用分析",
      type: "boolean",
      defaultValue: false,
      description: "是否記錄成員加入事件的統計資料",
    },
  ],
};