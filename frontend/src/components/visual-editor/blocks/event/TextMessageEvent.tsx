/**
 * 文字訊息事件積木
 * 當用戶傳送文字訊息時觸發
 */

import { MessageSquareText } from "lucide-react";
import { BlockDefinition } from "../types";
import { BlockCategory, WorkspaceContext } from "../../../../types/block";

export const textMessageEvent: BlockDefinition = {
  id: "text-message-event",
  blockType: "event",
  category: BlockCategory.EVENT,
  displayName: "當收到文字訊息時",
  description: "當用戶傳送文字訊息給 LINE Bot 時觸發此事件",
  icon: MessageSquareText,
  color: "bg-orange-500",
  compatibility: [WorkspaceContext.LOGIC],
  defaultData: {
    title: "當收到文字訊息時",
    eventType: "message.text",
    conditions: {
      matchType: "any", // any, exact, contains, regex
      keywords: [] as string[],
      caseSensitive: false,
    },
  },
  tags: ["事件", "訊息", "文字", "觸發"],
  version: "1.0.0",
  usageHints: [
    "此積木作為邏輯流程的起點，當用戶傳送文字訊息時執行",
    "可以設定關鍵字條件來過濾特定的文字訊息",
    "支援完全匹配、包含匹配和正規表達式匹配",
  ],
  configOptions: [
    {
      key: "matchType",
      label: "匹配方式",
      type: "select",
      defaultValue: "any",
      options: [
        { label: "任何文字", value: "any" },
        { label: "完全匹配", value: "exact" },
        { label: "包含關鍵字", value: "contains" },
        { label: "正規表達式", value: "regex" },
      ],
      required: true,
    },
    {
      key: "keywords",
      label: "關鍵字列表",
      type: "textarea",
      defaultValue: "",
      description: '每行一個關鍵字，當匹配方式不是"任何文字"時使用',
    },
    {
      key: "caseSensitive",
      label: "區分大小寫",
      type: "boolean",
      defaultValue: false,
      description: "是否在匹配時區分英文字母的大小寫",
    },
  ],
};
