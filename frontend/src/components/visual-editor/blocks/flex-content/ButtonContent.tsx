/**
 * 按鈕內容積木
 * Flex Message 中的按鈕元件
 */

import { MousePointer } from "lucide-react";
import { BlockDefinition } from "../types";
import { BlockCategory, WorkspaceContext } from "../../../../types/block";

export const buttonContent: BlockDefinition = {
  id: "button-content",
  blockType: "flex-content",
  category: BlockCategory.FLEX_CONTENT,
  displayName: "按鈕",
  description: "Flex Message 中的按鈕內容元件",
  icon: MousePointer,
  color: "bg-blue-500",
  compatibility: [WorkspaceContext.LOGIC, WorkspaceContext.FLEX],
  defaultData: {
    title: "按鈕",
    contentType: "button",
    action: {
      type: "postback",
      label: "點擊按鈕",
      data: "button_clicked",
    },
    properties: {
      style: "primary",
      color: "#0084ff",
    },
  },
  tags: ["flex", "內容", "按鈕", "互動"],
  version: "1.0.0",
  usageHints: ["用於在 Flex Message 中創建互動按鈕"],
};
