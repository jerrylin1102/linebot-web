/**
 * 設定變數積木
 * 設定或更新變數的值
 */

import { Variable } from "lucide-react";
import { BlockDefinition } from "../types";
import { BlockCategory, WorkspaceContext } from "../../../../types/block";

export const setVariableSetting: BlockDefinition = {
  id: "set-variable-setting",
  blockType: "setting",
  category: BlockCategory.SETTING,
  displayName: "設定變數",
  description: "設定或更新變數的值",
  icon: Variable,
  color: "bg-gray-500",
  compatibility: [WorkspaceContext.LOGIC],
  defaultData: {
    title: "設定變數",
    settingType: "setVariable",
    variableName: "",
    variableValue: "",
    valueType: "string", // string, number, boolean, object
    scope: "session", // session, global, user
  },
  tags: ["設定", "變數", "資料", "儲存"],
  version: "1.0.0",
  usageHints: [
    "用於設定或更新變數的值",
    "支援不同的資料類型（字串、數字、布林值、物件）",
    "可以設定變數的作用域（會話、全域、用戶）",
    "變數名稱建議使用英文和數字，避免特殊字元",
  ],
  configOptions: [
    {
      key: "variableName",
      label: "變數名稱",
      type: "text",
      defaultValue: "",
      required: true,
      description: "要設定的變數名稱",
      validation: {
        pattern: "^[a-zA-Z_][a-zA-Z0-9_]*$",
        message: "變數名稱只能包含英文字母、數字和底線，且不能以數字開頭",
      },
    },
    {
      key: "variableValue",
      label: "變數值",
      type: "textarea",
      defaultValue: "",
      required: true,
      description: "要設定的變數值",
    },
    {
      key: "valueType",
      label: "資料類型",
      type: "select",
      defaultValue: "string",
      options: [
        { label: "字串", value: "string" },
        { label: "數字", value: "number" },
        { label: "布林值", value: "boolean" },
        { label: "物件", value: "object" },
      ],
      description: "變數值的資料類型",
    },
    {
      key: "scope",
      label: "作用域",
      type: "select",
      defaultValue: "session",
      options: [
        { label: "會話", value: "session" },
        { label: "全域", value: "global" },
        { label: "用戶", value: "user" },
      ],
      description: "變數的作用域範圍",
    },
  ],
};
