/**
 * 群組成員離開事件積木
 * 當成員離開群組或聊天室時觸發
 */

import { UserMinus2 } from "lucide-react";
import { BlockDefinition } from "../types";
import { BlockCategory, WorkspaceContext } from "../../../../types/block";

export const memberLeftEvent: BlockDefinition = {
  id: "member-left-event",
  blockType: "event",
  category: BlockCategory.EVENT,
  displayName: "當成員離開群組時",
  description: "當成員離開群組或聊天室時觸發此事件",
  icon: UserMinus2,
  color: "bg-orange-500",
  compatibility: [WorkspaceContext.LOGIC],
  defaultData: {
    title: "當成員離開群組時",
    eventType: "memberLeft",
    settings: {
      sourceType: "both", // group, room, both
      sendGoodbyeMessage: false,
      saveMemberInfo: true,
      notifyAdmins: true,
      trackLeaveReason: false,
    },
    filters: {
      specificGroups: [] as string[],
      excludeGroups: [] as string[],
      memberCountThreshold: 0, // 0 = no threshold
    },
  },
  tags: ["事件", "群組", "成員", "離開", "退出", "觸發"],
  version: "1.0.0",
  usageHints: [
    "此積木在成員離開群組或聊天室時觸發",
    "可以區分群組和聊天室的離開事件",
    "支援記錄離開成員的資訊供後續分析",
    "可以通知管理員有成員離開",
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
      key: "sendGoodbyeMessage",
      label: "發送告別訊息",
      type: "boolean",
      defaultValue: false,
      description: "是否在群組中發送告別訊息（注意：離開的成員無法收到）",
    },
    {
      key: "saveMemberInfo",
      label: "儲存成員資訊",
      type: "boolean",
      defaultValue: true,
      description: "是否儲存離開成員的基本資訊以供後續分析",
    },
    {
      key: "notifyAdmins",
      label: "通知管理員",
      type: "boolean",
      defaultValue: true,
      description: "是否通知群組管理員有成員離開",
    },
    {
      key: "trackLeaveReason",
      label: "追蹤離開原因",
      type: "boolean",
      defaultValue: false,
      description: "是否嘗試追蹤成員離開的可能原因（主動退出或被移除）",
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
      key: "memberCountThreshold",
      label: "成員數量閾值",
      type: "number",
      defaultValue: 0,
      description: "僅在群組成員數量低於指定數量時觸發警告，0 表示無閾值",
      validation: {
        min: 0,
        max: 1000,
        message: "成員數量閾值必須在 0-1000 之間",
      },
    },
    {
      key: "alertWhenBelowThreshold",
      label: "低於閾值時警告",
      type: "boolean",
      defaultValue: false,
      description: "當群組成員數量低於設定閾值時發送警告",
    },
    {
      key: "retentionPeriod",
      label: "資料保存期間 (天)",
      type: "number",
      defaultValue: 30,
      description: "離開成員資料的保存天數，0 表示永久保存",
      validation: {
        min: 0,
        max: 365,
        message: "保存期間必須在 0-365 天之間",
      },
    },
    {
      key: "enableAnalytics",
      label: "啟用分析",
      type: "boolean",
      defaultValue: true,
      description: "是否記錄成員離開事件的統計資料",
    },
  ],
};