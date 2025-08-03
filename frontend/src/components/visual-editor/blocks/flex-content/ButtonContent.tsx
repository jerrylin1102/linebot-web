/**
 * 按鈕內容積木
 * Flex Message 中的按鈕元件，支援多種 Action 類型和進階樣式
 */

import { MousePointer } from "lucide-react";
import { BlockDefinition } from "../types";
import { BlockCategory, WorkspaceContext } from "../../../../types/block";
import { ActionType, createDefaultAction } from "../../../../types/lineActions";
import { 
  DEFAULT_BUTTON_PROPERTIES, 
  ButtonAdvancedProperties 
} from "../../../../types/flexProperties";

export const buttonContent: BlockDefinition = {
  id: "button-content",
  blockType: "flex-content",
  category: BlockCategory.FLEX_CONTENT,
  displayName: "按鈕",
  description: "Flex Message 中的按鈕內容元件，支援多種互動類型和進階樣式",
  icon: MousePointer,
  color: "bg-blue-500",
  compatibility: [WorkspaceContext.LOGIC, WorkspaceContext.FLEX],
  defaultData: {
    title: "按鈕",
    contentType: "button",
    actionType: ActionType.POSTBACK,
    action: createDefaultAction(ActionType.POSTBACK),
    properties: {
      ...DEFAULT_BUTTON_PROPERTIES,
      style: "primary",
      color: "#0084ff",
      height: "md",
      margin: "none",
      gravity: "center",
      justifyContent: "center",
      alignItems: "center",
      adjustMode: "shrink-to-fit"
    } as ButtonAdvancedProperties,
    supportedActions: [
      ActionType.POSTBACK,
      ActionType.MESSAGE,
      ActionType.URI,
      ActionType.CAMERA,
      ActionType.CAMERA_ROLL,
      ActionType.LOCATION,
      ActionType.DATETIME_PICKER,
      ActionType.RICHMENU_SWITCH,
      ActionType.CLIPBOARD
    ]
  },
  tags: ["flex", "內容", "按鈕", "互動", "action", "進階", "樣式"],
  version: "3.0.0",
  usageHints: [
    "用於在 Flex Message 中創建互動按鈕",
    "支援多種 Action 類型，包括連結、相機、位置等",
    "可自訂按鈕樣式、顏色和尺寸",
    "支援邊框、陰影等進階視覺效果",
    "支援定位和精細對齊控制",
    "適合各種互動場景和設計需求"
  ],
  configOptions: [
    // Action 設定
    {
      key: "actionType",
      label: "互動類型",
      type: "select",
      defaultValue: ActionType.POSTBACK,
      description: "設定按鈕點擊後的互動行為",
      required: true,
      options: [
        { label: "回傳數據 (Postback)", value: ActionType.POSTBACK },
        { label: "發送訊息 (Message)", value: ActionType.MESSAGE },
        { label: "開啟連結 (URI)", value: ActionType.URI },
        { label: "開啟相機 (Camera)", value: ActionType.CAMERA },
        { label: "選擇照片 (Camera Roll)", value: ActionType.CAMERA_ROLL },
        { label: "分享位置 (Location)", value: ActionType.LOCATION },
        { label: "選擇日期時間", value: ActionType.DATETIME_PICKER },
        { label: "切換選單", value: ActionType.RICHMENU_SWITCH },
        { label: "複製文字", value: ActionType.CLIPBOARD }
      ]
    },
    
    // 基礎樣式設定
    {
      key: "properties.style",
      label: "按鈕樣式",
      type: "select",
      defaultValue: "primary",
      description: "設定按鈕的視覺樣式",
      options: [
        { label: "主要按鈕 (Primary)", value: "primary" },
        { label: "次要按鈕 (Secondary)", value: "secondary" },
        { label: "連結按鈕 (Link)", value: "link" }
      ]
    },
    {
      key: "properties.color",
      label: "按鈕顏色",
      type: "text",
      defaultValue: "#0084ff",
      description: "設定按鈕的顏色（十六進位色碼）",
      validation: {
        pattern: "^#[0-9A-Fa-f]{6}$",
        message: "按鈕顏色必須是有效的十六進位色碼"
      }
    },
    {
      key: "properties.height",
      label: "按鈕高度",
      type: "select",
      defaultValue: "md",
      description: "設定按鈕的高度",
      options: [
        { label: "小 (sm)", value: "sm" },
        { label: "中等 (md)", value: "md" },
        { label: "大 (lg)", value: "lg" }
      ]
    },
    
    // 對齊設定
    {
      key: "properties.gravity",
      label: "垂直對齊",
      type: "select",
      defaultValue: "center",
      description: "設定按鈕的垂直對齊方式",
      options: [
        { label: "頂部對齊", value: "top" },
        { label: "底部對齊", value: "bottom" },
        { label: "居中對齊", value: "center" }
      ]
    },
    {
      key: "properties.justifyContent",
      label: "水平對齊",
      type: "select",
      defaultValue: "center",
      description: "設定按鈕內容的水平對齊方式",
      options: [
        { label: "起始對齊", value: "start" },
        { label: "結束對齊", value: "end" },
        { label: "居中對齊", value: "center" }
      ]
    },
    {
      key: "properties.alignItems",
      label: "內容對齊",
      type: "select",
      defaultValue: "center",
      description: "設定按鈕內容的對齊方式",
      options: [
        { label: "起始對齊", value: "start" },
        { label: "結束對齊", value: "end" },
        { label: "居中對齊", value: "center" },
        { label: "拉伸填滿", value: "stretch" }
      ]
    },
    
    // 尺寸和間距
    {
      key: "properties.flex",
      label: "Flex 係數",
      type: "number",
      description: "設定按鈕的 flex 增長係數",
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
      defaultValue: "none",
      description: "設定按鈕的外邊距",
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
      key: "properties.adjustMode",
      label: "自適應模式",
      type: "select",
      defaultValue: "shrink-to-fit",
      description: "設定按鈕的自適應模式",
      options: [
        { label: "縮放適應", value: "shrink-to-fit" }
      ]
    },
    
    // 邊框設定
    {
      key: "properties.borderWidth",
      label: "邊框寬度",
      type: "text",
      defaultValue: "0px",
      description: "設定按鈕的邊框寬度",
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
      description: "設定按鈕的邊框顏色（十六進位色碼）",
      validation: {
        pattern: "^#[0-9A-Fa-f]{6}$",
        message: "邊框顏色必須是有效的十六進位色碼"
      }
    },
    {
      key: "properties.cornerRadius",
      label: "圓角半徑",
      type: "text",
      defaultValue: "4px",
      description: "設定按鈕的圓角半徑",
      validation: {
        pattern: "^\\d+px$",
        message: "圓角半徑必須是像素值，例如: 4px"
      }
    },
    
    // 定位設定
    {
      key: "properties.position",
      label: "定位類型",
      type: "select",
      description: "設定按鈕的定位類型",
      options: [
        { label: "相對定位", value: "relative" },
        { label: "絕對定位", value: "absolute" }
      ]
    },
    {
      key: "properties.offsetTop",
      label: "上偏移",
      type: "text",
      description: "設定按鈕的上偏移量（支援 px 和 %）"
    },
    {
      key: "properties.offsetBottom",
      label: "下偏移",
      type: "text",
      description: "設定按鈕的下偏移量（支援 px 和 %）"
    },
    {
      key: "properties.offsetStart",
      label: "起始偏移",
      type: "text",
      description: "設定按鈕的起始偏移量（支援 px 和 %）"
    },
    {
      key: "properties.offsetEnd",
      label: "結束偏移",
      type: "text",
      description: "設定按鈕的結束偏移量（支援 px 和 %）"
    },
    
    // 效果設定
    {
      key: "properties.boxShadow",
      label: "按鈕陰影",
      type: "text",
      description: "設定按鈕陰影效果（CSS box-shadow 格式）"
    }
  ],
  validation: {
    required: ["actionType", "action"],
    rules: [
      {
        field: "actionType",
        type: "enum",
        values: Object.values(ActionType),
        message: "請選擇有效的 Action 類型"
      },
      {
        field: "properties.style",
        type: "enum",
        values: ["primary", "secondary", "link"],
        message: "按鈕樣式必須是有效值"
      },
      {
        field: "properties.color",
        type: "pattern",
        pattern: /^#[0-9A-Fa-f]{6}$/,
        message: "按鈕顏色必須是有效的十六進位色碼"
      },
      {
        field: "properties.height",
        type: "enum",
        values: ["sm", "md", "lg"],
        message: "按鈕高度必須是有效值"
      },
      {
        field: "properties.gravity",
        type: "enum",
        values: ["top", "bottom", "center"],
        message: "垂直對齊必須是有效值"
      },
      {
        field: "properties.justifyContent",
        type: "enum",
        values: ["start", "end", "center"],
        message: "水平對齊必須是有效值"
      },
      {
        field: "properties.alignItems",
        type: "enum",
        values: ["start", "end", "center", "stretch"],
        message: "內容對齊必須是有效值"
      }
    ]
  }
};
