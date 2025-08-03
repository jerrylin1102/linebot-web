/**
 * 按鈕點擊事件積木
 * 當用戶點擊 Postback 按鈕時觸發
 */

import { MousePointer } from "lucide-react";
import { BlockDefinition } from "../types";
import { BlockCategory, WorkspaceContext } from "../../../../types/block";

export const postbackEvent: BlockDefinition = {
  id: "postback-event",
  blockType: "event",
  category: BlockCategory.EVENT,
  displayName: "當按鈕被點擊時",
  description: "當用戶點擊 Postback 按鈕或執行 Postback 動作時觸發此事件",
  icon: MousePointer,
  color: "bg-orange-500",
  compatibility: [WorkspaceContext.LOGIC],
  defaultData: {
    title: "當按鈕被點擊時",
    eventType: "postback",
    filters: {
      matchType: "any", // any, exact, startsWith, contains
      postbackData: [] as string[],
      requireDisplayText: false,
    },
  },
  tags: ["事件", "按鈕", "點擊", "postback", "互動"],
  version: "1.0.0",
  usageHints: [
    "此積木在用戶點擊 Postback 按鈕時觸發",
    "可以根據按鈕的 data 值來篩選特定的按鈕點擊",
    "通常與 Flex Message 中的按鈕組件搭配使用",
    "支援多種匹配模式來處理不同的按鈕行為",
  ],
  configOptions: [
    {
      key: "matchType",
      label: "匹配方式",
      type: "select",
      defaultValue: "any",
      options: [
        { label: "任何按鈕", value: "any" },
        { label: "完全匹配", value: "exact" },
        { label: "開頭匹配", value: "startsWith" },
        { label: "包含匹配", value: "contains" },
      ],
      required: true,
      description: "如何匹配按鈕的 postback data 值",
    },
    {
      key: "postbackData",
      label: "Postback Data 列表",
      type: "textarea",
      defaultValue: "",
      description:
        '要匹配的 postback data 值，每行一個。當匹配方式不是"任何按鈕"時使用',
    },
    {
      key: "requireDisplayText",
      label: "需要顯示文字",
      type: "boolean",
      defaultValue: false,
      description: "是否要求按鈕必須有顯示文字",
    },
    {
      key: "enableLogging",
      label: "啟用日誌記錄",
      type: "boolean",
      defaultValue: true,
      description: "是否記錄按鈕點擊事件以供分析",
    },
    {
      key: "responseDelay",
      label: "回應延遲 (毫秒)",
      type: "number",
      defaultValue: 0,
      description: "處理按鈕點擊後的回應延遲時間",
      validation: {
        min: 0,
        max: 5000,
        message: "延遲時間必須在 0-5000 毫秒之間",
      },
    },
  ],
};
