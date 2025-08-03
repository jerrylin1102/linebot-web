/**
 * 跨段文字內容積木
 * Flex Message 中的 Span 元件，用於在單一文字元件中創建多種樣式
 */

import { Italic } from "lucide-react";
import { BlockDefinition } from "../types";
import { BlockCategory, WorkspaceContext } from "../../../../types/block";

export const spanContent: BlockDefinition = {
  id: "span-content",
  blockType: "flex-content",
  category: BlockCategory.FLEX_CONTENT,
  displayName: "跨段文字",
  description: "Flex Message 中的 Span 內容元件，用於創建多樣式的內嵌文字",
  icon: Italic,
  color: "bg-blue-500",
  compatibility: [WorkspaceContext.LOGIC, WorkspaceContext.FLEX],
  defaultData: {
    title: "跨段文字",
    contentType: "span",
    text: "範例文字",
    properties: {
      size: "md",
      weight: "regular",
      color: "#000000",
      decoration: "none",
      style: "normal",
      action: null
    },
    parentText: {
      text: "這是包含 [跨段文字] 的完整文字",
      wrap: true,
      align: "start",
      contents: []
    }
  },
  tags: ["flex", "內容", "文字", "樣式", "內嵌"],
  version: "1.0.0", 
  usageHints: [
    "用於在文字元件中創建不同樣式的內嵌文字",
    "只能作為 Text 元件的 contents 屬性使用",
    "支援獨立的字體、顏色和裝飾設定",
    "可與其他 Span 組合創建豐富的文字效果"
  ],
  configOptions: [
    {
      key: "text",
      label: "文字內容",
      type: "textarea",
      required: true,
      description: "要顯示的文字內容，支援換行符號 \\n"
    },
    {
      key: "properties.size",
      label: "文字大小",
      type: "select",
      defaultValue: "md",
      description: "文字的顯示大小",
      options: [
        { label: "XS (極小)", value: "xs" },
        { label: "SM (小)", value: "sm" },
        { label: "MD (中等)", value: "md" },
        { label: "LG (大)", value: "lg" },
        { label: "XL (極大)", value: "xl" },
        { label: "XXL (超大)", value: "xxl" },
        { label: "3XL (巨大)", value: "3xl" },
        { label: "4XL (超巨大)", value: "4xl" },
        { label: "5XL (極巨大)", value: "5xl" }
      ]
    },
    {
      key: "properties.weight",
      label: "文字粗細",
      type: "select",
      defaultValue: "regular",
      description: "文字的粗細程度",
      options: [
        { label: "標準", value: "regular" },
        { label: "粗體", value: "bold" }
      ]
    },
    {
      key: "properties.color",
      label: "文字顏色",
      type: "text",
      defaultValue: "#000000",
      description: "文字顏色 (十六進位色碼)",
      validation: {
        pattern: "^#[0-9A-Fa-f]{6}$",
        message: "請輸入有效的十六進位色碼 (例如: #FF0000)"
      }
    },
    {
      key: "properties.decoration",
      label: "文字裝飾",
      type: "select",
      defaultValue: "none",
      description: "文字的裝飾效果",
      options: [
        { label: "無裝飾", value: "none" },
        { label: "底線", value: "underline" },
        { label: "刪除線", value: "line-through" }
      ]
    },
    {
      key: "properties.style",
      label: "文字樣式",
      type: "select",
      defaultValue: "normal",
      description: "文字的樣式設定",
      options: [
        { label: "標準", value: "normal" },
        { label: "斜體", value: "italic" }
      ]
    },
    {
      key: "parentText.text",
      label: "父級文字內容",
      type: "textarea",
      description: "包含此 Span 的完整文字內容，用 [文字] 標記 Span 位置"
    },
    {
      key: "parentText.wrap",
      label: "文字換行",
      type: "boolean",
      defaultValue: true,
      description: "是否允許文字自動換行"
    },
    {
      key: "parentText.align",
      label: "文字對齊",
      type: "select",
      defaultValue: "start",
      description: "文字的對齊方式",
      options: [
        { label: "靠左", value: "start" },
        { label: "置中", value: "center" },
        { label: "靠右", value: "end" }
      ]
    }
  ]
};