/**
 * 取得變數積木
 * 讀取變數的值
 */

import { Search } from "lucide-react";
import { BlockDefinition } from "../types";
import { BlockCategory, WorkspaceContext } from "../../../../types/block";

export const getVariableSetting: BlockDefinition = {
  id: "get-variable-setting",
  blockType: "setting",
  category: BlockCategory.SETTING,
  displayName: "取得變數",
  description: "讀取變數的值",
  icon: Search,
  color: "bg-gray-500",
  compatibility: [WorkspaceContext.LOGIC],
  defaultData: {
    title: "取得變數",
    settingType: "getVariable",
    variableName: "",
    defaultValue: "",
    scope: "session",
  },
  tags: ["設定", "變數", "讀取", "取得"],
  version: "1.0.0",
  usageHints: [
    "用於讀取變數的值",
    "可以設定預設值，當變數不存在時使用",
    "支援不同作用域的變數讀取",
    "可以與其他積木結合使用進行條件判斷",
  ],
  configOptions: [
    {
      key: "variableName",
      label: "變數名稱",
      type: "text",
      defaultValue: "",
      required: true,
      description: "要讀取的變數名稱",
    },
    {
      key: "defaultValue",
      label: "預設值",
      type: "text",
      defaultValue: "",
      description: "當變數不存在時的預設值",
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
      description: "要讀取的變數作用域",
    },
  ],
};
