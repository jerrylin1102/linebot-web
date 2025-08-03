/**
 * 分隔線內容積木
 * Flex Message 中的分隔線元件
 */

import { Minus } from "lucide-react";
import { BlockDefinition } from "../types";
import { BlockCategory, WorkspaceContext } from "../../../../types/block";

export const separatorContent: BlockDefinition = {
  id: "separator-content",
  blockType: "flex-layout",
  category: BlockCategory.FLEX_LAYOUT,
  displayName: "分隔線",
  description: "Flex Message 中的分隔線元件",
  icon: Minus,
  color: "bg-blue-500",
  compatibility: [WorkspaceContext.LOGIC, WorkspaceContext.FLEX],
  defaultData: {
    title: "分隔線",
    contentType: "separator",
    properties: {
      margin: "md",
      color: "#CCCCCC",
    },
  },
  tags: ["flex", "內容", "分隔線", "佈局"],
  version: "1.0.0",
  usageHints: ["用於在 Flex Message 中創建視覺分隔線"],
};
