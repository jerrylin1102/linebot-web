/**
 * 圖片內容積木
 * Flex Message 中的圖片元件，支援進階圖片效果
 */

import { ImageIcon } from "lucide-react";
import { BlockDefinition } from "../types";
import { BlockCategory, WorkspaceContext } from "../../../../types/block";
import { 
  DEFAULT_IMAGE_PROPERTIES, 
  ImageAdvancedProperties 
} from "../../../../types/flexProperties";
import { LineAction } from "../../../../types/lineActions";

export const imageContent: BlockDefinition = {
  id: "image-content",
  blockType: "flex-content",
  category: BlockCategory.FLEX_CONTENT,
  displayName: "圖片",
  description: "Flex Message 中的圖片內容元件，支援進階圖片效果",
  icon: ImageIcon,
  color: "bg-blue-500",
  compatibility: [WorkspaceContext.LOGIC, WorkspaceContext.FLEX],
  defaultData: {
    title: "圖片",
    contentType: "image",
    url: "https://example.com/image.jpg",
    properties: {
      ...DEFAULT_IMAGE_PROPERTIES,
      aspectRatio: "1:1",
      aspectMode: "cover",
      size: "full",
      align: "center",
      gravity: "center"
    } as ImageAdvancedProperties,
    action: null as LineAction | null,
  },
  tags: ["flex", "內容", "圖片", "進階", "效果"],
  version: "2.0.0",
  usageHints: [
    "用於在 Flex Message 中顯示圖片內容",
    "支援多種尺寸和長寬比設定",
    "可設定圖片對齊和填充模式",
    "支援圓角、邊框和陰影效果",
    "支援定位和進階視覺效果",
    "可設定背景色和透明度"
  ],
  configOptions: [
    // 基礎圖片設定
    {
      key: "url",
      label: "圖片網址",
      type: "text",
      defaultValue: "https://example.com/image.jpg",
      description: "設定要顯示的圖片網址",
      required: true,
      validation: {
        pattern: "^https?://.*\\.(jpg|jpeg|png|gif|webp)$",
        message: "請輸入有效的圖片網址"
      }
    },
    {
      key: "properties.size",
      label: "圖片尺寸",
      type: "select",
      defaultValue: "full",
      description: "設定圖片的顯示尺寸",
      options: [
        { label: "超小 (xs)", value: "xs" },
        { label: "小 (sm)", value: "sm" },
        { label: "中等 (md)", value: "md" },
        { label: "大 (lg)", value: "lg" },
        { label: "超大 (xl)", value: "xl" },
        { label: "極大 (xxl)", value: "xxl" },
        { label: "3倍大 (3xl)", value: "3xl" },
        { label: "4倍大 (4xl)", value: "4xl" },
        { label: "5倍大 (5xl)", value: "5xl" },
        { label: "滿版 (full)", value: "full" }
      ]
    },
    {
      key: "properties.aspectRatio",
      label: "長寬比",
      type: "select",
      defaultValue: "1:1",
      description: "設定圖片的長寬比例",
      options: [
        { label: "正方形 (1:1)", value: "1:1" },
        { label: "橫向 (16:9)", value: "16:9" },
        { label: "橫向 (4:3)", value: "4:3" },
        { label: "橫向 (3:2)", value: "3:2" },
        { label: "直向 (2:3)", value: "2:3" },
        { label: "直向 (3:4)", value: "3:4" },
        { label: "直向 (9:16)", value: "9:16" },
        { label: "自動", value: "auto" }
      ]
    },
    {
      key: "properties.aspectMode",
      label: "填充模式",
      type: "select",
      defaultValue: "cover",
      description: "設定圖片的填充模式",
      options: [
        { label: "覆蓋 (cover)", value: "cover" },
        { label: "適合 (fit)", value: "fit" }
      ]
    },
    
    // 對齊設定
    {
      key: "properties.align",
      label: "水平對齊",
      type: "select",
      defaultValue: "center",
      description: "設定圖片的水平對齊方式",
      options: [
        { label: "起始對齊", value: "start" },
        { label: "結束對齊", value: "end" },
        { label: "居中對齊", value: "center" }
      ]
    },
    {
      key: "properties.gravity",
      label: "垂直對齊",
      type: "select",
      defaultValue: "center",
      description: "設定圖片的垂直對齊方式",
      options: [
        { label: "頂部對齊", value: "top" },
        { label: "底部對齊", value: "bottom" },
        { label: "居中對齊", value: "center" }
      ]
    },
    
    // 尺寸和間距
    {
      key: "properties.flex",
      label: "Flex 係數",
      type: "number",
      description: "設定圖片容器的 flex 增長係數",
      validation: {
        min: 0,
        max: 10,
        message: "Flex 係數必須在 0 到 10 之間"
      }
    },
    {
      key: "properties.margin",
      label: "外邊距",
      type: "select",
      description: "設定圖片的外邊距",
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
    
    // 外觀設定
    {
      key: "properties.backgroundColor",
      label: "背景顏色",
      type: "text",
      description: "設定圖片背景顏色（十六進位色碼）",
      validation: {
        pattern: "^#[0-9A-Fa-f]{6}$",
        message: "背景顏色必須是有效的十六進位色碼"
      }
    },
    {
      key: "properties.cornerRadius",
      label: "圓角半徑",
      type: "text",
      defaultValue: "0px",
      description: "設定圖片的圓角半徑",
      validation: {
        pattern: "^\\d+px$",
        message: "圓角半徑必須是像素值，例如: 4px"
      }
    },
    
    // 邊框設定
    {
      key: "properties.borderWidth",
      label: "邊框寬度",
      type: "text",
      defaultValue: "0px",
      description: "設定圖片的邊框寬度",
      validation: {
        pattern: "^\\d+px$",
        message: "邊框寬度必須是像素值，例如: 1px"
      }
    },
    {
      key: "properties.borderColor",
      label: "邊框顏色",
      type: "text",
      defaultValue: "#000000",
      description: "設定圖片的邊框顏色（十六進位色碼）",
      validation: {
        pattern: "^#[0-9A-Fa-f]{6}$",
        message: "邊框顏色必須是有效的十六進位色碼"
      }
    },
    
    // 定位設定
    {
      key: "properties.position",
      label: "定位類型",
      type: "select",
      description: "設定圖片的定位類型",
      options: [
        { label: "相對定位", value: "relative" },
        { label: "絕對定位", value: "absolute" }
      ]
    },
    {
      key: "properties.offsetTop",
      label: "上偏移",
      type: "text",
      description: "設定圖片的上偏移量（支援 px 和 %）"
    },
    {
      key: "properties.offsetBottom",
      label: "下偏移",
      type: "text",
      description: "設定圖片的下偏移量（支援 px 和 %）"
    },
    {
      key: "properties.offsetStart",
      label: "起始偏移",
      type: "text",
      description: "設定圖片的起始偏移量（支援 px 和 %）"
    },
    {
      key: "properties.offsetEnd",
      label: "結束偏移",
      type: "text",
      description: "設定圖片的結束偏移量（支援 px 和 %）"
    },
    
    // 效果設定
    {
      key: "properties.boxShadow",
      label: "圖片陰影",
      type: "text",
      description: "設定圖片陰影效果（CSS box-shadow 格式）"
    },
    
    // 互動設定
    {
      key: "action",
      label: "點擊動作",
      type: "action",
      description: "設定點擊圖片時的互動行為",
      component: "ActionSelector"
    }
  ],
  validation: {
    required: ["url"],
    rules: [
      {
        field: "url",
        type: "pattern",
        pattern: /^https?:\/\/.*\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i,
        message: "請輸入有效的圖片網址（支援 jpg, jpeg, png, gif, webp 格式）"
      },
      {
        field: "properties.size",
        type: "enum",
        values: ["xs", "sm", "md", "lg", "xl", "xxl", "3xl", "4xl", "5xl", "full"],
        message: "圖片尺寸必須是有效值"
      },
      {
        field: "properties.aspectRatio",
        type: "enum",
        values: ["1:1", "16:9", "4:3", "3:2", "2:3", "3:4", "9:16", "auto"],
        message: "長寬比必須是有效值"
      },
      {
        field: "properties.aspectMode",
        type: "enum",
        values: ["cover", "fit"],
        message: "填充模式必須是有效值"
      },
      {
        field: "properties.align",
        type: "enum",
        values: ["start", "end", "center"],
        message: "水平對齊必須是有效值"
      },
      {
        field: "properties.gravity",
        type: "enum",
        values: ["top", "bottom", "center"],
        message: "垂直對齊必須是有效值"
      },
      {
        field: "properties.backgroundColor",
        type: "pattern",
        pattern: /^#[0-9A-Fa-f]{6}$/,
        message: "背景顏色必須是有效的十六進位色碼"
      },
      {
        field: "properties.borderColor",
        type: "pattern",
        pattern: /^#[0-9A-Fa-f]{6}$/,
        message: "邊框顏色必須是有效的十六進位色碼"
      }
    ]
  }
};
