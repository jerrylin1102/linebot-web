import { Square } from "lucide-react";
import { BlockDefinition } from "../types";
import { BlockCategory, WorkspaceContext } from "../../../../types/block";
import { 
  DEFAULT_BOX_PROPERTIES, 
  BoxAdvancedProperties,
  PROPERTY_VALIDATION_RULES 
} from "../../../../types/flexProperties";

export const boxContainer: BlockDefinition = {
  id: "box-container",
  blockType: "flex-container",
  category: BlockCategory.FLEX_CONTAINER,
  displayName: "Box 容器",
  description: "Flex Message 中的 Box 容器元件，支援進階佈局屬性",
  icon: Square,
  color: "bg-indigo-500",
  compatibility: [WorkspaceContext.LOGIC, WorkspaceContext.FLEX],
  defaultData: {
    title: "Box 容器",
    containerType: "box",
    properties: {
      ...DEFAULT_BOX_PROPERTIES,
      layout: "vertical",
      spacing: "md",
      padding: "md",
      backgroundColor: "#FFFFFF",
      justifyContent: "start",
      alignItems: "start"
    } as BoxAdvancedProperties,
    contents: [], // 子元件列表
  },
  tags: ["flex", "容器", "box", "佈局", "進階"],
  version: "2.0.0",
  usageHints: [
    "用於在 Flex Message 中創建佈局容器",
    "支援垂直、水平和基準線佈局",
    "可設定間距、內邊距、背景色等樣式",
    "支援定位、邊框、漸層、陰影等進階效果",
    "可容納其他 Flex 內容元件"
  ],
  configOptions: [
    // 基礎佈局設定
    {
      key: "properties.layout",
      label: "佈局方向",
      type: "select",
      defaultValue: "vertical",
      description: "設定容器內元件的排列方向",
      options: [
        { label: "垂直排列", value: "vertical" },
        { label: "水平排列", value: "horizontal" },
        { label: "基準線對齊", value: "baseline" }
      ],
      required: true
    },
    {
      key: "properties.spacing",
      label: "元件間距",
      type: "select",
      defaultValue: "md",
      description: "設定容器內元件之間的間距",
      options: [
        { label: "無間距", value: "none" },
        { label: "極小", value: "xs" },
        { label: "小", value: "sm" },
        { label: "中等", value: "md" },
        { label: "大", value: "lg" },
        { label: "極大", value: "xl" },
        { label: "超大", value: "xxl" }
      ]
    },
    {
      key: "properties.justifyContent",
      label: "主軸對齊",
      type: "select",
      defaultValue: "start",
      description: "設定元件在主軸上的對齊方式",
      options: [
        { label: "起始對齊", value: "start" },
        { label: "結束對齊", value: "end" },
        { label: "居中對齊", value: "center" },
        { label: "兩端對齊", value: "space-between" },
        { label: "環繞對齊", value: "space-around" },
        { label: "均勻對齊", value: "space-evenly" }
      ]
    },
    {
      key: "properties.alignItems",
      label: "交叉軸對齊",
      type: "select",
      defaultValue: "start",
      description: "設定元件在交叉軸上的對齊方式",
      options: [
        { label: "起始對齊", value: "start" },
        { label: "結束對齊", value: "end" },
        { label: "居中對齊", value: "center" },
        { label: "拉伸填滿", value: "stretch" }
      ]
    },
    
    // 尺寸設定
    {
      key: "properties.width",
      label: "寬度",
      type: "text",
      description: "設定容器寬度（支援 px、% 或 flex 值）",
      validation: {
        pattern: "^(\\d+px|\\d+%|\\d+(\\.\\d+)?)$",
        message: "寬度必須是像素值、百分比或 flex 值"
      }
    },
    {
      key: "properties.height",
      label: "高度",
      type: "text",
      description: "設定容器高度（支援 px、% 或 flex 值）",
      validation: {
        pattern: "^(\\d+px|\\d+%|\\d+(\\.\\d+)?)$",
        message: "高度必須是像素值、百分比或 flex 值"
      }
    },
    {
      key: "properties.flex",
      label: "Flex 係數",
      type: "number",
      description: "設定容器的 flex 增長係數",
      validation: { min: 0, max: 10 }
    },
    
    // 間距設定
    {
      key: "properties.padding",
      label: "統一內邊距",
      type: "select",
      defaultValue: "md",
      description: "設定容器的內邊距",
      options: [
        { label: "無內邊距", value: "none" },
        { label: "極小", value: "xs" },
        { label: "小", value: "sm" },
        { label: "中等", value: "md" },
        { label: "大", value: "lg" },
        { label: "極大", value: "xl" },
        { label: "超大", value: "xxl" }
      ]
    },
    {
      key: "properties.paddingTop",
      label: "上內邊距",
      type: "select",
      description: "設定容器的上內邊距",
      options: [
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
      key: "properties.paddingBottom",
      label: "下內邊距",
      type: "select",
      description: "設定容器的下內邊距",
      options: [
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
      key: "properties.paddingStart",
      label: "起始內邊距",
      type: "select",
      description: "設定容器的起始內邊距",
      options: [
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
      key: "properties.paddingEnd",
      label: "結束內邊距",
      type: "select",
      description: "設定容器的結束內邊距",
      options: [
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
      key: "properties.margin",
      label: "統一外邊距",
      type: "select",
      description: "設定容器的外邊距",
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
      defaultValue: "#FFFFFF",
      description: "設定容器的背景顏色（十六進位色碼）",
      validation: {
        pattern: "^#[0-9A-Fa-f]{6}$",
        message: "背景顏色必須是有效的十六進位色碼"
      }
    },
    
    // 邊框設定
    {
      key: "properties.borderWidth",
      label: "邊框寬度",
      type: "text",
      defaultValue: "0px",
      description: "設定容器的邊框寬度",
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
      description: "設定容器的邊框顏色（十六進位色碼）",
      validation: {
        pattern: "^#[0-9A-Fa-f]{6}$",
        message: "邊框顏色必須是有效的十六進位色碼"
      }
    },
    {
      key: "properties.cornerRadius",
      label: "圓角半徑",
      type: "text",
      defaultValue: "0px",
      description: "設定容器的圓角半徑",
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
      description: "設定容器的定位類型",
      options: [
        { label: "相對定位", value: "relative" },
        { label: "絕對定位", value: "absolute" }
      ]
    },
    {
      key: "properties.offsetTop",
      label: "上偏移",
      type: "text",
      description: "設定容器的上偏移量（支援 px 和 %）"
    },
    {
      key: "properties.offsetBottom",
      label: "下偏移",
      type: "text",
      description: "設定容器的下偏移量（支援 px 和 %）"
    },
    {
      key: "properties.offsetStart",
      label: "起始偏移",
      type: "text",
      description: "設定容器的起始偏移量（支援 px 和 %）"
    },
    {
      key: "properties.offsetEnd",
      label: "結束偏移",
      type: "text",
      description: "設定容器的結束偏移量（支援 px 和 %）"
    },
    
    // 效果設定
    {
      key: "properties.boxShadow",
      label: "盒子陰影",
      type: "text",
      description: "設定容器的盒子陰影效果（CSS 格式）"
    }
  ],
  validation: {
    required: ["properties.layout"],
    rules: [
      {
        field: "properties.layout",
        type: "enum",
        values: ["vertical", "horizontal", "baseline"],
        message: "佈局方向必須是 vertical、horizontal 或 baseline"
      },
      {
        field: "properties.backgroundColor",
        type: "pattern",
        pattern: /^#[0-9A-Fa-f]{6}$/,
        message: "背景顏色必須是有效的十六進位色碼"
      }
    ]
  }
};
