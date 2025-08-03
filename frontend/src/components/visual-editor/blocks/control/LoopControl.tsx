/**
 * 迴圈控制積木
 * 重複執行一組動作
 */

import { RotateCcw } from "lucide-react";
import { BlockDefinition } from "../types";
import { BlockCategory, WorkspaceContext } from "../../../../types/block";

export const loopControl: BlockDefinition = {
  id: "loop-control",
  blockType: "control",
  category: BlockCategory.CONTROL,
  displayName: "重複執行",
  description: "重複執行一組動作指定的次數或直到條件滿足",
  icon: RotateCcw,
  color: "bg-purple-500",
  compatibility: [WorkspaceContext.LOGIC, WorkspaceContext.FLEX],
  defaultData: {
    title: "重複執行",
    controlType: "loop",
    loopType: "count", // count, while, foreach
    settings: {
      count: 1,
      maxIterations: 100,
      condition: "",
      breakOnError: true,
      delayBetweenIterations: 0, // 毫秒
    },
    actions: [],
  },
  tags: ["控制", "迴圈", "重複", "循環"],
  version: "1.0.0",
  usageHints: [
    "用於重複執行一組動作",
    "支援固定次數迴圈和條件迴圈",
    "可以設定迭代之間的延遲時間",
    "建議設定最大迭代次數以避免無限迴圈",
  ],
  configOptions: [
    {
      key: "loopType",
      label: "迴圈類型",
      type: "select",
      defaultValue: "count",
      options: [
        { label: "固定次數", value: "count" },
        { label: "條件迴圈", value: "while" },
        { label: "陣列遍歷", value: "foreach" },
      ],
      required: true,
      description: "選擇迴圈的執行方式",
    },
    {
      key: "count",
      label: "重複次數",
      type: "number",
      defaultValue: 1,
      description: "固定迴圈的重複執行次數",
      validation: {
        min: 1,
        max: 1000,
        message: "重複次數必須在 1-1000 之間",
      },
    },
    {
      key: "condition",
      label: "迴圈條件",
      type: "text",
      defaultValue: "",
      description: "條件迴圈的判斷條件（當條件為 true 時繼續執行）",
    },
    {
      key: "maxIterations",
      label: "最大迭代次數",
      type: "number",
      defaultValue: 100,
      description: "防止無限迴圈的最大迭代次數限制",
      validation: {
        min: 1,
        max: 10000,
        message: "最大迭代次數必須在 1-10000 之間",
      },
    },
    {
      key: "delayBetweenIterations",
      label: "迭代延遲 (毫秒)",
      type: "number",
      defaultValue: 0,
      description: "每次迭代之間的延遲時間",
      validation: {
        min: 0,
        max: 60000,
        message: "延遲時間必須在 0-60000 毫秒之間",
      },
    },
    {
      key: "breakOnError",
      label: "錯誤時中斷",
      type: "boolean",
      defaultValue: true,
      description: "當迴圈內發生錯誤時是否立即中斷迴圈",
    },
    {
      key: "arrayVariable",
      label: "陣列變數",
      type: "text",
      defaultValue: "",
      description: "陣列遍歷時要遍歷的陣列變數名稱",
    },
  ],
};
