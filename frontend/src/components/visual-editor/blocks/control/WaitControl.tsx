/**
 * 等待控制積木
 * 暫停執行指定的時間
 */

import { Clock } from "lucide-react";
import { BlockDefinition } from "../types";
import { BlockCategory, WorkspaceContext } from "../../../../types/block";

export const waitControl: BlockDefinition = {
  id: "wait-control",
  blockType: "control",
  category: BlockCategory.CONTROL,
  displayName: "等待",
  description: "暫停執行指定的時間後繼續",
  icon: Clock,
  color: "bg-purple-500",
  compatibility: [WorkspaceContext.LOGIC, WorkspaceContext.FLEX],
  defaultData: {
    title: "等待",
    controlType: "wait",
    waitType: "fixed", // fixed, random, condition, event
    settings: {
      duration: 1000, // 毫秒
      unit: "seconds", // milliseconds, seconds, minutes
      minDuration: 500,
      maxDuration: 2000,
      condition: "",
      timeout: 30000,
    },
  },
  tags: ["控制", "等待", "延遲", "暫停"],
  version: "1.0.0",
  usageHints: [
    "用於在執行流程中插入等待時間",
    "支援固定時間等待和隨機時間等待",
    "可以等待特定條件滿足或事件觸發",
    "適合用於模擬真人回應時間或 API 限流",
  ],
  configOptions: [
    {
      key: "waitType",
      label: "等待類型",
      type: "select",
      defaultValue: "fixed",
      options: [
        { label: "固定時間", value: "fixed" },
        { label: "隨機時間", value: "random" },
        { label: "等待條件", value: "condition" },
        { label: "等待事件", value: "event" },
      ],
      required: true,
      description: "選擇等待的方式",
    },
    {
      key: "duration",
      label: "等待時間",
      type: "number",
      defaultValue: 1,
      description: "固定等待的時間長度",
      validation: {
        min: 0.1,
        max: 300,
        message: "等待時間必須在 0.1-300 秒之間",
      },
    },
    {
      key: "unit",
      label: "時間單位",
      type: "select",
      defaultValue: "seconds",
      options: [
        { label: "毫秒", value: "milliseconds" },
        { label: "秒", value: "seconds" },
        { label: "分鐘", value: "minutes" },
      ],
      description: "等待時間的單位",
    },
    {
      key: "minDuration",
      label: "最小等待時間 (秒)",
      type: "number",
      defaultValue: 0.5,
      description: "隨機等待的最小時間",
      validation: {
        min: 0.1,
        max: 60,
        message: "最小等待時間必須在 0.1-60 秒之間",
      },
    },
    {
      key: "maxDuration",
      label: "最大等待時間 (秒)",
      type: "number",
      defaultValue: 2,
      description: "隨機等待的最大時間",
      validation: {
        min: 0.1,
        max: 300,
        message: "最大等待時間必須在 0.1-300 秒之間",
      },
    },
    {
      key: "condition",
      label: "等待條件",
      type: "text",
      defaultValue: "",
      description: "條件等待時的判斷條件（當條件為 true 時停止等待）",
    },
    {
      key: "timeout",
      label: "超時時間 (秒)",
      type: "number",
      defaultValue: 30,
      description: "條件或事件等待的最大超時時間",
      validation: {
        min: 1,
        max: 3600,
        message: "超時時間必須在 1-3600 秒之間",
      },
    },
  ],
};
