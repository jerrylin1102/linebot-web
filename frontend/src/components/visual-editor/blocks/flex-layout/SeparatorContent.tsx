/**
 * 分隔線內容積木
 * Flex Message 中的分隔線元件
 */

import { Minus } from "lucide-react";
import { BlockDefinition } from "../types";
import { BlockCategory, WorkspaceContext } from "../../../../types/block";
import { DEFAULT_SEPARATOR_PROPERTIES, SeparatorAdvancedProperties } from "../../../../types/flexProperties";

export const separatorContent: BlockDefinition = {
  id: "separator-content",
  blockType: "flex-layout",
  category: BlockCategory.FLEX_LAYOUT,
  displayName: "分隔線",
  description: "Flex Message 中的分隔線元件，支援顏色和間距設定",
  icon: Minus,
  color: "bg-teal-500",
  compatibility: [WorkspaceContext.LOGIC, WorkspaceContext.FLEX],
  defaultData: {
    title: "分隔線",
    contentType: "separator",
    properties: {
      ...DEFAULT_SEPARATOR_PROPERTIES,
      margin: "md",
      color: "#CCCCCC",
    } as SeparatorAdvancedProperties,
  },
  tags: ["flex", "內容", "分隔線", "佈局"],
  version: "2.0.0",
  usageHints: [
    "用於在 Flex Message 中創建視覺分隔線",
    "可自訂分隔線顏色和外邊距",
    "有助於視覺區分不同內容區塊"
  ],
  configOptions: [
    // 基礎設定
    {
      key: "properties.color",
      label: "分隔線顏色",
      type: "text",
      defaultValue: "#CCCCCC",
      description: "設定分隔線的顏色（十六進位色碼）",
      validation: {
        pattern: "^#[0-9A-Fa-f]{6}$",
        message: "分隔線顏色必須是有效的十六進位色碼"
      }
    },
    {
      key: "properties.margin",
      label: "外邊距",
      type: "select",
      defaultValue: "md",
      description: "設定分隔線的外邊距",
      options: [
        { label: "無外邊距", value: "none" },
        { label: "極小", value: "xs" },
        { label: "小", value: "sm" },
        { label: "中等", value: "md" },
        { label: "大", value: "lg" },
        { label: "極大", value: "xl" },
        { label: "超大", value: "xxl" }
      ]
    },
    {
      key: "properties.marginTop",
      label: "上外邊距",
      type: "select",
      description: "設定分隔線的上外邊距",
      options: [
        { label: "繼承統一設定", value: undefined },
        { label: "無", value: "none" },
        { label: "極小", value: "xs" },
        { label: "小", value: "sm" },
        { label: "中等", value: "md" },
        { label: "大", value: "lg" },
        { label: "極大", value: "xl" },
        { label: "超大", value: "xxl" }
      ]
    },
    {
      key: "properties.marginBottom",
      label: "下外邊距",
      type: "select",
      description: "設定分隔線的下外邊距",
      options: [
        { label: "繼承統一設定", value: undefined },
        { label: "無", value: "none" },
        { label: "極小", value: "xs" },
        { label: "小", value: "sm" },
        { label: "中等", value: "md" },
        { label: "大", value: "lg" },
        { label: "極大", value: "xl" },
        { label: "超大", value: "xxl" }
      ]
    }
  ],
  validation: {
    required: [],
    rules: [
      {
        field: "properties.color",
        type: "pattern",
        pattern: /^#[0-9A-Fa-f]{6}$/,
        message: "分隔線顏色必須是有效的十六進位色碼"
      },
      {
        field: "properties.margin",
        type: "enum",
        values: ["none", "xs", "sm", "md", "lg", "xl", "xxl"],
        message: "外邊距必須是有效的間距值"
      }
    ]
  }
};
