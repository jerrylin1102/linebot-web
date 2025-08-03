/**
 * 好友封鎖事件積木
 * 當用戶封鎖或取消追蹤 LINE Bot 時觸發
 */

import { UserMinus } from "lucide-react";
import { BlockDefinition } from "../types";
import { BlockCategory, WorkspaceContext } from "../../../../types/block";

export const unfollowEvent: BlockDefinition = {
  id: "unfollow-event",
  blockType: "event",
  category: BlockCategory.EVENT,
  displayName: "當用戶取消追蹤時",
  description: "當用戶封鎖或取消追蹤 LINE Bot 時觸發此事件",
  icon: UserMinus,
  color: "bg-orange-500",
  compatibility: [WorkspaceContext.LOGIC],
  defaultData: {
    title: "當用戶取消追蹤時",
    eventType: "unfollow",
    settings: {
      saveUserInfo: true,
      trackUnfollowReason: false,
      sendFeedbackSurvey: false,
      notifyAdmins: false,
      enableRetentionAnalysis: true,
    },
    cleanup: {
      removeUserData: false,
      archiveConversations: true,
      retentionPeriod: 90, // days
    },
  },
  tags: ["事件", "好友", "封鎖", "取消追蹤", "離開", "觸發"],
  version: "1.0.0",
  usageHints: [
    "此積木在用戶封鎖或取消追蹤 LINE Bot 時觸發",
    "可以記錄用戶取消追蹤的資訊供後續分析",
    "支援數據清理和歸檔功能",
    "有助於了解用戶流失的原因和模式",
  ],
  configOptions: [
    {
      key: "saveUserInfo",
      label: "儲存用戶資訊",
      type: "boolean",
      defaultValue: true,
      description: "是否在用戶取消追蹤前儲存其基本資訊",
    },
    {
      key: "trackUnfollowReason",
      label: "追蹤取消原因",
      type: "boolean",
      defaultValue: false,
      description: "是否嘗試分析用戶取消追蹤的可能原因",
    },
    {
      key: "sendFeedbackSurvey",
      label: "發送意見調查",
      type: "boolean",
      defaultValue: false,
      description: "是否在取消追蹤前嘗試發送意見調查（可能無法送達）",
    },
    {
      key: "notifyAdmins",
      label: "通知管理員",
      type: "boolean",
      defaultValue: false,
      description: "是否通知 Bot 管理員有用戶取消追蹤",
    },
    {
      key: "enableRetentionAnalysis",
      label: "啟用留存分析",
      type: "boolean",
      defaultValue: true,
      description: "是否啟用用戶留存率分析功能",
    },
    {
      key: "removeUserData",
      label: "移除用戶資料",
      type: "boolean",
      defaultValue: false,
      description: "是否立即移除用戶的個人資料（符合隱私法規要求）",
    },
    {
      key: "archiveConversations",
      label: "歸檔對話記錄",
      type: "boolean",
      defaultValue: true,
      description: "是否將用戶的對話記錄歸檔保存",
    },
    {
      key: "retentionPeriod",
      label: "資料保存期間 (天)",
      type: "number",
      defaultValue: 90,
      description: "用戶資料的保存天數，0 表示立即刪除",
      validation: {
        min: 0,
        max: 365,
        message: "保存期間必須在 0-365 天之間",
      },
    },
    {
      key: "anonymizeData",
      label: "匿名化資料",
      type: "boolean",
      defaultValue: true,
      description: "是否將保存的資料進行匿名化處理",
    },
    {
      key: "triggerWinbackCampaign",
      label: "觸發回流活動",
      type: "boolean",
      defaultValue: false,
      description: "是否觸發用戶回流活動（透過其他管道）",
    },
    {
      key: "enableAnalytics",
      label: "啟用分析",
      type: "boolean",
      defaultValue: true,
      description: "是否記錄取消追蹤事件的統計資料",
    },
  ],
};