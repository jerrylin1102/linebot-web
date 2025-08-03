/**
 * 文字內容積木
 * Flex Message 中的文字元件，支援進階文字效果
 */

import { Type } from "lucide-react";
import { BlockDefinition } from "../types";
import { BlockCategory, WorkspaceContext } from "../../../../types/block";
import { 
  DEFAULT_TEXT_PROPERTIES, 
  TextAdvancedProperties 
} from "../../../../types/flexProperties";
import { LineAction } from "../../../../types/lineActions";

export const textContent: BlockDefinition = {
  id: "text-content",
  blockType: "flex-content",
  category: BlockCategory.FLEX_CONTENT,
  displayName: "文字",
  description: "Flex Message 中的文字內容元件，支援進階文字效果",
  icon: Type,
  color: "bg-blue-500",
  compatibility: [WorkspaceContext.LOGIC, WorkspaceContext.FLEX],
  defaultData: {
    title: "文字",
    contentType: "text",
    text: "範例文字",
    useSpanContents: false,
    properties: {
      ...DEFAULT_TEXT_PROPERTIES,
      size: "md",
      weight: "regular",
      color: "#000000",
      align: "start",
      gravity: "center",
      contents: []
    } as TextAdvancedProperties,
    action: null as LineAction | null,
  },
  tags: ["flex", "內容", "文字", "進階", "效果"],
  version: "2.0.0",
  usageHints: [
    "用於在 Flex Message 中顯示文字內容",
    "支援不同字體大小、粗細和顏色",
    "可設定文字對齊、裝飾和樣式",
    "支援陰影效果和進階排版",
    "可嵌入 span 元件進行局部樣式設定"
  ],
  configOptions: [
    // 基礎文字設定
    {
      key: "text",
      label: "文字內容",
      type: "textarea",
      defaultValue: "範例文字",
      description: "設定要顯示的文字內容（單一樣式）",
      required: true,
      validation: {
        message: "文字內容不能為空"
      }
    },
    
    // Span 混合樣式設定
    {
      key: "properties.contents",
      label: "混合樣式設定",
      type: "custom",
      description: "設定包含多種樣式的文字內容（進階功能）",
      component: "SpanEditor",
      showWhen: {
        field: "useSpanContents",
        value: true
      }
    },
    {
      key: "useSpanContents",
      label: "使用混合樣式",
      type: "boolean",
      defaultValue: false,
      description: "啟用後可以設定包含多種樣式的文字內容"
    },
    {
      key: "properties.size",
      label: "字體大小",
      type: "select",
      defaultValue: "md",
      description: "設定文字的字體大小",
      options: [
        { label: "超小 (xs)", value: "xs" },
        { label: "小 (sm)", value: "sm" },
        { label: "中等 (md)", value: "md" },
        { label: "大 (lg)", value: "lg" },
        { label: "超大 (xl)", value: "xl" },
        { label: "極大 (xxl)", value: "xxl" },
        { label: "3倍大 (3xl)", value: "3xl" },
        { label: "4倍大 (4xl)", value: "4xl" },
        { label: "5倍大 (5xl)", value: "5xl" }
      ]
    },
    {
      key: "properties.weight",
      label: "字體粗細",
      type: "select",
      defaultValue: "regular",
      description: "設定文字的字體粗細",
      options: [
        { label: "超細 (ultralight)", value: "ultralight" },
        { label: "細 (light)", value: "light" },
        { label: "一般 (regular)", value: "regular" },
        { label: "粗體 (bold)", value: "bold" }
      ]
    },
    {
      key: "properties.color",
      label: "文字顏色",
      type: "text",
      defaultValue: "#000000",
      description: "設定文字顏色（十六進位色碼）",
      validation: {
        pattern: "^#[0-9A-Fa-f]{6}$",
        message: "文字顏色必須是有效的十六進位色碼"
      }
    },
    
    // 對齊和排版
    {
      key: "properties.align",
      label: "水平對齊",
      type: "select",
      defaultValue: "start",
      description: "設定文字的水平對齊方式",
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
      description: "設定文字的垂直對齊方式",
      options: [
        { label: "頂部對齊", value: "top" },
        { label: "底部對齊", value: "bottom" },
        { label: "居中對齊", value: "center" }
      ]
    },
    {
      key: "properties.wrap",
      label: "自動換行",
      type: "boolean",
      defaultValue: true,
      description: "是否允許文字自動換行"
    },
    {
      key: "properties.maxLines",
      label: "最大行數",
      type: "number",
      description: "限制文字顯示的最大行數",
      validation: {
        min: 1,
        max: 20,
        message: "最大行數必須在 1 到 20 之間"
      }
    },
    {
      key: "properties.lineSpacing",
      label: "行間距",
      type: "select",
      description: "設定文字的行間距",
      options: [
        { label: "無行間距", value: "none" },
        { label: "極小", value: "xs" },
        { label: "小", value: "sm" },
        { label: "中等", value: "md" },
        { label: "大", value: "lg" },
        { label: "極大", value: "xl" },
        { label: "超大", value: "xxl" }
      ]
    },
    
    // 文字樣式和裝飾
    {
      key: "properties.style",
      label: "文字樣式",
      type: "select",
      defaultValue: "normal",
      description: "設定文字樣式",
      options: [
        { label: "正常", value: "normal" },
        { label: "斜體", value: "italic" }
      ]
    },
    {
      key: "properties.decoration",
      label: "文字裝飾",
      type: "select",
      defaultValue: "none",
      description: "設定文字裝飾效果",
      options: [
        { label: "無裝飾", value: "none" },
        { label: "底線", value: "underline" },
        { label: "刪除線", value: "line-through" }
      ]
    },
    
    // 尺寸和間距
    {
      key: "properties.flex",
      label: "Flex 係數",
      type: "number",
      description: "設定文字容器的 flex 增長係數",
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
      description: "設定文字容器的外邊距",
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
    
    // 定位設定
    {
      key: "properties.position",
      label: "定位類型",
      type: "select",
      description: "設定文字容器的定位類型",
      options: [
        { label: "相對定位", value: "relative" },
        { label: "絕對定位", value: "absolute" }
      ]
    },
    {
      key: "properties.offsetTop",
      label: "上偏移",
      type: "text",
      description: "設定文字容器的上偏移量（支援 px 和 %）"
    },
    {
      key: "properties.offsetBottom",
      label: "下偏移",
      type: "text",
      description: "設定文字容器的下偏移量（支援 px 和 %）"
    },
    {
      key: "properties.offsetStart",
      label: "起始偏移",
      type: "text",
      description: "設定文字容器的起始偏移量（支援 px 和 %）"
    },
    {
      key: "properties.offsetEnd",
      label: "結束偏移",
      type: "text",
      description: "設定文字容器的結束偏移量（支援 px 和 %）"
    },
    
    // 效果設定
    {
      key: "properties.textShadow",
      label: "文字陰影",
      type: "text",
      description: "設定文字陰影效果（CSS text-shadow 格式）"
    },
    
    // 互動設定
    {
      key: "action",
      label: "點擊動作",
      type: "action",
      description: "設定點擊文字時的互動行為",
      component: "ActionSelector"
    }
  ],
  validation: {
    required: ["text"],
    rules: [
      {
        field: "text",
        type: "custom",
        message: "文字內容不能為空",
        validator: (value: string) => value && value.trim().length > 0
      },
      {
        field: "properties.size",
        type: "enum",
        values: ["xs", "sm", "md", "lg", "xl", "xxl", "3xl", "4xl", "5xl"],
        message: "字體大小必須是有效值"
      },
      {
        field: "properties.weight",
        type: "enum",
        values: ["ultralight", "light", "regular", "bold"],
        message: "字體粗細必須是有效值"
      },
      {
        field: "properties.color",
        type: "pattern",
        pattern: /^#[0-9A-Fa-f]{6}$/,
        message: "文字顏色必須是有效的十六進位色碼"
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
        field: "properties.style",
        type: "enum",
        values: ["normal", "italic"],
        message: "文字樣式必須是有效值"
      },
      {
        field: "properties.decoration",
        type: "enum",
        values: ["none", "underline", "line-through"],
        message: "文字裝飾必須是有效值"
      }
    ]
  }
};
