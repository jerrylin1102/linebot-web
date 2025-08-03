/**
 * 填充佈局積木
 * Flex Message 中的填充元件
 */

import { Maximize } from "lucide-react";
import { BlockDefinition } from "../types";
import { BlockCategory, WorkspaceContext } from "../../../../types/block";

export const fillerLayout: BlockDefinition = {
  id: "filler-layout",
  blockType: "flex-layout",
  category: BlockCategory.FLEX_LAYOUT,
  displayName: "填充",
  description: "Flex Message 中的填充佈局元件，支援彈性係數設定",
  icon: Maximize,
  color: "bg-teal-500",
  compatibility: [WorkspaceContext.FLEX, WorkspaceContext.LOGIC],
  defaultData: {
    title: "填充",
    layoutType: "filler",
    properties: {
      flex: 1,
    },
  },
  tags: ["flex", "佈局", "填充"],
  version: "2.0.0",
  usageHints: [
    "用於在 Flex Message 中填充剩餘空間",
    "調整 flex 係數可控制填充比例",
    "適合用於創建響應式佈局"
  ],
  configOptions: [
    // 基礎設定
    {
      key: "properties.flex",
      label: "彈性係數 (Flex)",
      type: "number",
      defaultValue: 1,
      description: "設定填充元件的彈性增長係數（數值越大佔用空間越多）",
      validation: {
        min: 0,
        max: 10,
        message: "彈性係數必須在 0 到 10 之間"
      }
    },
    {
      key: "properties.flexBehavior",
      label: "彈性行為",
      type: "select",
      defaultValue: "grow",
      description: "設定填充元件的彈性行為模式",
      options: [
        { label: "自動增長 (grow)", value: "grow", description: "自動填充可用空間" },
        { label: "固定比例 (ratio)", value: "ratio", description: "按照設定比例分配空間" },
        { label: "最小填充 (minimal)", value: "minimal", description: "佔用最少必要空間" }
      ]
    },
    {
      key: "properties.minWidth",
      label: "最小寬度",
      type: "text",
      description: "設定填充元件的最小寬度（支援 px 或 %）",
      placeholder: "例如: 50px 或 10%",
      validation: {
        pattern: "^\\d+(%|px)$",
        message: "最小寬度必須是有效的數值（如 50px 或 10%）"
      }
    },
    {
      key: "properties.maxWidth",
      label: "最大寬度",
      type: "text", 
      description: "設定填充元件的最大寬度（支援 px 或 %）",
      placeholder: "例如: 200px 或 80%",
      validation: {
        pattern: "^\\d+(%|px)$",
        message: "最大寬度必須是有效的數值（如 200px 或 80%）"
      }
    }
  ],
  validation: {
    required: ["properties.flex"],
    rules: [
      {
        field: "properties.flex",
        type: "custom",
        message: "彈性係數必須是 0 到 10 之間的數值",
        validator: (value: number) => {
          return typeof value === "number" && value >= 0 && value <= 10;
        }
      },
      {
        field: "properties.flexBehavior",
        type: "enum",
        values: ["grow", "ratio", "minimal"],
        message: "彈性行為必須是有效值"
      }
    ]
  }
};
