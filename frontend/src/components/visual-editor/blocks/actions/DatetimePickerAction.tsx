/**
 * Datetime Picker Action 積木
 * 點擊後開啟日期時間選擇器
 */

import { Calendar } from "lucide-react";
import { BlockDefinition } from "../types";
import { BlockCategory, WorkspaceContext } from "../../../../types/block";
import { ActionType } from "../../../../types/lineActions";

export const datetimePickerAction: BlockDefinition = {
  id: "datetime-picker-action",
  blockType: "action",
  category: BlockCategory.ACTION,
  displayName: "選擇日期時間",
  description: "點擊後開啟日期時間選擇器",
  icon: Calendar,
  color: "bg-indigo-500",
  compatibility: [WorkspaceContext.LOGIC, WorkspaceContext.FLEX],
  defaultData: {
    title: "選擇日期時間",
    actionType: ActionType.DATETIME_PICKER,
    action: {
      type: "datetimepicker",
      label: "選擇日期時間",
      data: "datetime_selected",
      mode: "datetime",
      initial: new Date().toISOString().slice(0, 16),
      max: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // 一年後
      min: new Date().toISOString().slice(0, 16) // 現在
    },
    properties: {
      style: "primary",
      color: "#6366f1",
    },
  },
  tags: ["action", "日期", "時間", "選擇器", "datetime"],
  version: "1.0.0",
  usageHints: [
    "用於創建日期時間選擇的按鈕",
    "可選擇日期、時間或兩者",
    "適合預約、排程等需要時間選擇的場景",
    "可設定最小值和最大值限制選擇範圍"
  ],
  validation: {
    required: ["data", "mode"],
    rules: [
      {
        field: "mode",
        type: "enum",
        values: ["date", "time", "datetime"],
        message: "模式必須是 date、time 或 datetime"
      },
      {
        field: "data",
        type: "string",
        message: "請輸入回傳數據"
      }
    ]
  }
};