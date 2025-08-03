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
      type: "simple", // simple, compound, advanced, custom
      operator: "equals", // equals, notEquals, contains, startsWith, endsWith, greater, less, greaterEqual, lessEqual
      leftValue: "",
      rightValue: "",
      caseSensitive: false,
      // 複合條件設定
      compound: {
        enabled: false,
        logicalOperator: "and", // and, or
        conditions: [],
        groups: [],
      },
      // 條件分組設定
      grouping: {
        enabled: false,
        groups: [
          {
            id: "group1",
            name: "條件組1",
            operator: "and",
            conditions: [],
            nested: false,
          }
        ],
      },
    },
    branches: {
      trueBranch: {
        enabled: true,
        actions: [],
        label: "當條件為真時",
        visualConfig: {
          color: "#10b981",
          icon: "check",
        },
      },
      falseBranch: {
        enabled: false,
        actions: [],
        label: "當條件為假時",
        visualConfig: {
          color: "#ef4444",
          icon: "x",
        },
      },
      // 新增多分支支援
      additionalBranches: [],
    },
    // 視覺化設定
    visualization: {
      showFlowLines: true,
      compactMode: false,
      branchStyle: "tree", // tree, list, compact
    },
  },
  tags: ["控制", "條件", "分支", "邏輯", "判斷"],
  version: "1.0.0",
  usageHints: [
    "用於根據條件執行不同的邏輯分支",
    "支援多種比較運算子（等於、不等於、包含等）",
    "可以設定 true 和 false 兩個分支的執行內容",
    "支援變數比較和字串匹配",
    "支援複合條件（AND/OR 邏輯運算）",
    "支援條件分組和多層嵌套",
    "提供視覺化分支管理和流程顯示",
  ],
  configOptions: [
    {
      key: "conditionType",
      label: "條件類型",
      type: "select",
      defaultValue: "simple",
      options: [
        { label: "簡單條件", value: "simple" },
        { label: "複合條件", value: "compound" },
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
        { label: "大於等於", value: "greaterEqual" },
        { label: "小於等於", value: "lessEqual" },
        { label: "正規表達式", value: "regex" },
        { label: "為空", value: "isEmpty" },
        { label: "不為空", value: "isNotEmpty" },
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
      description: "條件比較的右側值，可以是變數或固定值",
    },
    {
      key: "caseSensitive",
      label: "區分大小寫",
      type: "boolean",
      defaultValue: false,
      description: "在文字比較時是否區分英文字母大小寫",
    },
    // 複合條件設定
    {
      key: "logicalOperator",
      label: "邏輯運算子",
      type: "select",
      defaultValue: "and",
      options: [
        { label: "且 (AND)", value: "and" },
        { label: "或 (OR)", value: "or" },
        { label: "互斥或 (XOR)", value: "xor" },
      ],
      description: "連接多個條件的邏輯運算子",
      showWhen: { conditionType: "compound" },
    },
    {
      key: "conditionGroup",
      label: "條件分組",
      type: "group",
      description: "將相關條件組合在一起",
      showWhen: { conditionType: ["compound", "advanced"] },
      groupConfig: {
        allowNesting: true,
        maxDepth: 3,
        defaultOperator: "and",
      },
    },
    // 分支設定
    {
      key: "enableElseBranch",
      label: "啟用 Else 分支",
      type: "boolean",
      defaultValue: false,
      description: "是否啟用條件為 false 時的執行分支",
    },
    {
      key: "enableElseIfBranch",
      label: "啟用 Else If 分支",
      type: "boolean",
      defaultValue: false,
      description: "是否啟用多重條件判斷分支",
    },
    {
      key: "branchLabels",
      label: "分支標籤",
      type: "object",
      description: "自訂各分支的顯示標籤",
      properties: {
        trueBranch: { type: "text", label: "真分支標籤", defaultValue: "當條件為真時" },
        falseBranch: { type: "text", label: "假分支標籤", defaultValue: "當條件為假時" },
      },
    },
    // 視覺化設定
    {
      key: "visualConfig",
      label: "視覺化設定",
      type: "object",
      description: "條件分支的視覺化顯示設定",
      properties: {
        showFlowLines: { type: "boolean", label: "顯示流程線", defaultValue: true },
        compactMode: { type: "boolean", label: "緊湊模式", defaultValue: false },
        branchStyle: {
          type: "select",
          label: "分支樣式",
          options: [
            { label: "樹狀結構", value: "tree" },
            { label: "列表形式", value: "list" },
            { label: "緊湊樣式", value: "compact" },
          ],
          defaultValue: "tree",
        },
        branchColors: {
          type: "object",
          label: "分支顏色",
          properties: {
            trueBranch: { type: "color", label: "真分支顏色", defaultValue: "#10b981" },
            falseBranch: { type: "color", label: "假分支顏色", defaultValue: "#ef4444" },
          },
        },
      },
    },
    // 進階設定
    {
      key: "advancedSettings",
      label: "進階設定",
      type: "object",
      description: "進階條件判斷設定",
      showWhen: { conditionType: ["advanced", "custom"] },
      properties: {
        shortCircuit: { type: "boolean", label: "短路評估", defaultValue: true },
        cacheResult: { type: "boolean", label: "快取結果", defaultValue: false },
        timeout: { type: "number", label: "評估逾時 (ms)", defaultValue: 5000, min: 100, max: 30000 },
        errorHandling: {
          type: "select",
          label: "錯誤處理",
          options: [
            { label: "拋出錯誤", value: "throw" },
            { label: "回傳假值", value: "false" },
            { label: "回傳真值", value: "true" },
            { label: "忽略錯誤", value: "ignore" },
          ],
          defaultValue: "false",
        },
      },
    },
  ],
};
