/**
 * 間距佈局積木
 * Flex Message 中的間距元件
 */

import { Square } from "lucide-react";
import { BlockDefinition } from "../types";
import { BlockCategory, WorkspaceContext } from "../../../../types/block";
import { FlexSpacing } from "../../../../types/flexProperties";

export const spacerLayout: BlockDefinition = {
  id: "spacer-layout",
  blockType: "flex-layout",
  category: BlockCategory.FLEX_LAYOUT,
  displayName: "間距",
  description: "Flex Message 中的間距佈局元件，支援多種大小設定",
  icon: Square,
  color: "bg-teal-500",
  compatibility: [WorkspaceContext.FLEX, WorkspaceContext.LOGIC],
  defaultData: {
    title: "間距",
    layoutType: "spacer",
    properties: {
      size: "md" as FlexSpacing,
      customSize: "",
    },
  },
  tags: ["flex", "佈局", "間距"],
  version: "2.0.0",
  usageHints: [
    "用於在 Flex Message 中創建空白間距",
    "可選擇預設大小或設定自訂數值",
    "有助於控制元件之間的間距"
  ],
  configOptions: [
    // 基礎設定
    {
      key: "properties.size",
      label: "間距大小",
      type: "select",
      defaultValue: "md",
      description: "設定間距的大小",
      options: [
        { label: "極小 (xs)", value: "xs" },
        { label: "小 (sm)", value: "sm" },
        { label: "中等 (md)", value: "md" },
        { label: "大 (lg)", value: "lg" },
        { label: "極大 (xl)", value: "xl" },
        { label: "超大 (xxl)", value: "xxl" },
        { label: "自訂大小", value: "custom" }
      ]
    },
    {
      key: "properties.customSize",
      label: "自訂大小",
      type: "text",
      description: "設定自訂的間距大小（支援 px 或 %）",
      placeholder: "例如: 20px 或 5%",
      showWhen: {
        field: "properties.size",
        value: "custom"
      },
      validation: {
        pattern: "^\\d+(%|px)$",
        message: "自訂大小必須是有效的數值（如 20px 或 5%）"
      }
    }
  ],
  validation: {
    required: ["properties.size"],
    rules: [
      {
        field: "properties.size",
        type: "enum",
        values: ["xs", "sm", "md", "lg", "xl", "xxl", "custom"],
        message: "間距大小必須是有效值"
      },
      {
        field: "properties.customSize", 
        type: "custom",
        message: "當選擇自訂大小時，必須設定自訂大小值",
        validator: (value: string, data: any) => {
          if (data.properties?.size === "custom") {
            return value && value.trim().length > 0;
          }
          return true;
        }
      }
    ]
  }
};
