/**
 * 圖示內容積木
 * Flex Message 中的圖示元件，用於裝飾文字或作為視覺元素
 */

import { Star } from "lucide-react";
import { BlockDefinition } from "../types";
import { BlockCategory, WorkspaceContext } from "../../../../types/block";

export const iconContent: BlockDefinition = {
  id: "icon-content",
  blockType: "flex-content",
  category: BlockCategory.FLEX_CONTENT,
  displayName: "圖示",
  description: "Flex Message 中的圖示內容元件，用於裝飾相鄰文字",
  icon: Star,
  color: "bg-blue-500",
  compatibility: [WorkspaceContext.LOGIC, WorkspaceContext.FLEX],
  defaultData: {
    title: "圖示",
    contentType: "icon",
    url: "https://example.com/icon.png",
    properties: {
      size: "md",
      margin: "none",
      position: "relative",
      offsetTop: "0px",
      offsetBottom: "0px", 
      offsetStart: "0px",
      offsetEnd: "0px",
      action: null
    },
  },
  tags: ["flex", "內容", "圖示", "裝飾", "視覺"],
  version: "1.0.0",
  usageHints: [
    "用於在 Flex Message 中顯示裝飾性圖示",
    "只能在 baseline 佈局的 box 中使用",
    "適合與文字元件搭配使用",
    "支援精確的位置調整和邊距設定"
  ],
  configOptions: [
    {
      key: "url",
      label: "圖示網址",
      type: "text",
      required: true,
      description: "圖示圖片的網址，建議使用 PNG 或 SVG 格式"
    },
    {
      key: "properties.size",
      label: "圖示大小",
      type: "select",
      defaultValue: "md",
      description: "圖示的顯示大小",
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
      key: "properties.margin",
      label: "外邊距",
      type: "select",
      defaultValue: "none",
      description: "圖示的外邊距設定",
      options: [
        { label: "無", value: "none" },
        { label: "XS", value: "xs" },
        { label: "SM", value: "sm" },
        { label: "MD", value: "md" },
        { label: "LG", value: "lg" },
        { label: "XL", value: "xl" },
        { label: "XXL", value: "xxl" }
      ]
    },
    {
      key: "properties.position",
      label: "定位方式",
      type: "select", 
      defaultValue: "relative",
      description: "圖示的定位方式",
      options: [
        { label: "相對定位", value: "relative" },
        { label: "絕對定位", value: "absolute" }
      ]
    },
    {
      key: "properties.offsetTop",
      label: "頂部偏移",
      type: "text",
      defaultValue: "0px",
      description: "圖示相對於容器頂部的偏移量 (如: 10px, 5%)",
      validation: {
        pattern: "^-?\\d+(\\.\\d+)?(px|%)?$"
      }
    },
    {
      key: "properties.offsetBottom",
      label: "底部偏移", 
      type: "text",
      defaultValue: "0px",
      description: "圖示相對於容器底部的偏移量 (如: 10px, 5%)",
      validation: {
        pattern: "^-?\\d+(\\.\\d+)?(px|%)?$"
      }
    },
    {
      key: "properties.offsetStart",
      label: "起始偏移",
      type: "text", 
      defaultValue: "0px",
      description: "圖示相對於容器起始位置的偏移量 (如: 10px, 5%)",
      validation: {
        pattern: "^-?\\d+(\\.\\d+)?(px|%)?$"
      }
    },
    {
      key: "properties.offsetEnd",
      label: "結束偏移",
      type: "text",
      defaultValue: "0px", 
      description: "圖示相對於容器結束位置的偏移量 (如: 10px, 5%)",
      validation: {
        pattern: "^-?\\d+(\\.\\d+)?(px|%)?$"
      }
    }
  ]
};