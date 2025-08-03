/**
 * Bubble 容器積木
 * Flex Message 的 Bubble 容器
 */

import { MessageCircle } from "lucide-react";
import { BlockDefinition } from "../types";
import { BlockCategory, WorkspaceContext } from "../../../../types/block";

export const bubbleContainer: BlockDefinition = {
  id: "bubble-container",
  blockType: "flex-container",
  category: BlockCategory.FLEX_CONTAINER,
  displayName: "Bubble 容器",
  description: "Flex Message 的基本 Bubble 容器",
  icon: MessageCircle,
  color: "bg-indigo-500",
  compatibility: [WorkspaceContext.LOGIC, WorkspaceContext.FLEX],
  defaultData: {
    title: "Bubble 容器",
    containerType: "bubble",
    size: "kilo", // nano, micro, kilo, mega, giga
    direction: "ltr", // ltr, rtl
    action: null,
    header: null,
    body: {
      type: "box",
      layout: "vertical",
      contents: [],
      spacing: "md",
      paddingAll: "lg",
    },
    footer: null,
    styles: {
      header: {
        backgroundColor: "#FFFFFF",
        separator: false,
        separatorColor: "#000000",
      },
      body: {
        backgroundColor: "#FFFFFF",
        separator: false,
        separatorColor: "#000000",
      },
      footer: {
        backgroundColor: "#FFFFFF",
        separator: true,
        separatorColor: "#000000",
      },
    },
    options: {
      enableHeader: false,
      enableFooter: false,
      enableAction: false,
      maxContentHeight: "auto", // auto, 或具體高度值
      cornerRadius: "none", // none, xs, sm, md, lg, xl, xxl
    },
  },
  tags: ["flex", "容器", "bubble", "版面", "結構"],
  version: "1.0.0",
  usageHints: [
    "用於創建 Flex Message 的基本 Bubble 容器",
    "可以配置標題、內容、底部區域",
    "支援不同的尺寸和樣式設定",
    "可以新增容器級別的動作（如點擊整個卡片）",
    "支援從右到左的文字方向設定",
  ],
  configOptions: [
    {
      key: "size",
      label: "容器尺寸",
      type: "select",
      defaultValue: "kilo",
      options: [
        { label: "超小 (nano)", value: "nano" },
        { label: "小 (micro)", value: "micro" },
        { label: "中 (kilo)", value: "kilo" },
        { label: "大 (mega)", value: "mega" },
        { label: "超大 (giga)", value: "giga" },
      ],
      required: true,
      description: "Bubble 容器的整體尺寸",
    },
    {
      key: "direction",
      label: "文字方向",
      type: "select",
      defaultValue: "ltr",
      options: [
        { label: "從左到右 (LTR)", value: "ltr" },
        { label: "從右到左 (RTL)", value: "rtl" },
      ],
      description: "容器內文字的閱讀方向",
    },
    {
      key: "enableHeader",
      label: "啟用標題區域",
      type: "boolean",
      defaultValue: false,
      description: "是否顯示 Bubble 的標題區域",
    },
    {
      key: "enableFooter",
      label: "啟用底部區域",
      type: "boolean",
      defaultValue: false,
      description: "是否顯示 Bubble 的底部區域",
    },
    {
      key: "enableAction",
      label: "啟用容器動作",
      type: "boolean",
      defaultValue: false,
      description: "是否為整個 Bubble 容器新增點擊動作",
    },
    {
      key: "cornerRadius",
      label: "圓角設定",
      type: "select",
      defaultValue: "none",
      options: [
        { label: "無圓角", value: "none" },
        { label: "超小 (xs)", value: "xs" },
        { label: "小 (sm)", value: "sm" },
        { label: "中 (md)", value: "md" },
        { label: "大 (lg)", value: "lg" },
        { label: "超大 (xl)", value: "xl" },
        { label: "最大 (xxl)", value: "xxl" },
      ],
      description: "容器的圓角大小",
    },
    {
      key: "bodyLayout",
      label: "主體佈局",
      type: "select",
      defaultValue: "vertical",
      options: [
        { label: "垂直排列", value: "vertical" },
        { label: "水平排列", value: "horizontal" },
        { label: "基準線排列", value: "baseline" },
      ],
      description: "主體內容的排列方式",
    },
    {
      key: "bodySpacing",
      label: "主體間距",
      type: "select",
      defaultValue: "md",
      options: [
        { label: "無間距", value: "none" },
        { label: "極小 (xs)", value: "xs" },
        { label: "小 (sm)", value: "sm" },
        { label: "中 (md)", value: "md" },
        { label: "大 (lg)", value: "lg" },
        { label: "極大 (xl)", value: "xl" },
        { label: "最大 (xxl)", value: "xxl" },
      ],
      description: "主體內容元素之間的間距",
    },
    {
      key: "bodyPadding",
      label: "主體內邊距",
      type: "select",
      defaultValue: "lg",
      options: [
        { label: "無內邊距", value: "none" },
        { label: "極小 (xs)", value: "xs" },
        { label: "小 (sm)", value: "sm" },
        { label: "中 (md)", value: "md" },
        { label: "大 (lg)", value: "lg" },
        { label: "極大 (xl)", value: "xl" },
        { label: "最大 (xxl)", value: "xxl" },
      ],
      description: "主體內容的內邊距",
    },
    {
      key: "headerBackgroundColor",
      label: "標題背景色",
      type: "color",
      defaultValue: "#FFFFFF",
      description: "標題區域的背景顏色",
    },
    {
      key: "bodyBackgroundColor",
      label: "主體背景色",
      type: "color",
      defaultValue: "#FFFFFF",
      description: "主體區域的背景顏色",
    },
    {
      key: "footerBackgroundColor",
      label: "底部背景色",
      type: "color",
      defaultValue: "#FFFFFF",
      description: "底部區域的背景顏色",
    },
    {
      key: "headerSeparator",
      label: "標題分隔線",
      type: "boolean",
      defaultValue: false,
      description: "是否在標題區域下方顯示分隔線",
    },
    {
      key: "footerSeparator",
      label: "底部分隔線",
      type: "boolean",
      defaultValue: true,
      description: "是否在底部區域上方顯示分隔線",
    },
    {
      key: "separatorColor",
      label: "分隔線顏色",
      type: "color",
      defaultValue: "#000000",
      description: "分隔線的顏色",
    },
    {
      key: "maxContentHeight",
      label: "最大內容高度",
      type: "text",
      defaultValue: "auto",
      description: "容器內容的最大高度 (如: 300px, auto)",
      validation: {
        pattern: "^(auto|\\d+px)$",
        message: "請輸入有效的高度值 (如: 300px 或 auto)",
      },
    },
  ],
};
