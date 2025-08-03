/**
 * 條件控制積木
 * 根據條件執行不同的邏輯分支
 */

import { GitBranch } from "lucide-react";
import { BlockDefinition } from "../types";
import { BlockCategory, WorkspaceContext } from "../../../../types/block";

export const ifThenControl: BlockDefinition = {
  id: "if-then-control",
  blockType: "control",
  category: BlockCategory.CONTROL,
  displayName: "如果...那麼",
  description: "根據條件判斷執行不同的邏輯分支",
  icon: GitBranch,
  color: "bg-purple-500",
  compatibility: [WorkspaceContext.LOGIC, WorkspaceContext.FLEX],
  defaultData: {
    title: "如果...那麼",
    controlType: "if",
    condition: {
      type: "simple", // simple, advanced, custom
      operator: "equals", // equals, notEquals, contains, startsWith, endsWith, greater, less
      leftValue: "",
      rightValue: "",
      caseSensitive: false,
    },
    branches: {
      trueBranch: {
        enabled: true,
        actions: [],
      },
      falseBranch: {
        enabled: false,
        actions: [],
      },
    },
  },
  tags: ["控制", "條件", "分支", "邏輯", "判斷"],
  version: "1.0.0",
  usageHints: [
    "用於根據條件執行不同的邏輯分支",
    "支援多種比較運算子（等於、不等於、包含等）",
    "可以設定 true 和 false 兩個分支的執行內容",
    "支援變數比較和字串匹配",
  ],
  configOptions: [
    {
      key: "conditionType",
      label: "條件類型",
      type: "select",
      defaultValue: "simple",
      options: [
        { label: "簡單條件", value: "simple" },
        { label: "進階條件", value: "advanced" },
        { label: "自訂表達式", value: "custom" },
      ],
      required: true,
      description: "選擇條件判斷的複雜程度",
    },
    {
      key: "operator",
      label: "比較運算子",
      type: "select",
      defaultValue: "equals",
      options: [
        { label: "等於", value: "equals" },
        { label: "不等於", value: "notEquals" },
        { label: "包含", value: "contains" },
        { label: "開頭是", value: "startsWith" },
        { label: "結尾是", value: "endsWith" },
        { label: "大於", value: "greater" },
        { label: "小於", value: "less" },
      ],
      description: "用於比較左右值的運算子",
    },
    {
      key: "leftValue",
      label: "左值",
      type: "text",
      defaultValue: "",
      required: true,
      description: "條件比較的左側值，可以是變數或固定值",
    },
    {
      key: "rightValue",
      label: "右值",
      type: "text",
      defaultValue: "",
      required: true,
      description: "條件比較的右側值，可以是變數或固定值",
    },
    {
      key: "caseSensitive",
      label: "區分大小寫",
      type: "boolean",
      defaultValue: false,
      description: "在文字比較時是否區分英文字母大小寫",
    },
    {
      key: "enableElseBranch",
      label: "啟用 Else 分支",
      type: "boolean",
      defaultValue: false,
      description: "是否啟用條件為 false 時的執行分支",
    },
  ],
};
