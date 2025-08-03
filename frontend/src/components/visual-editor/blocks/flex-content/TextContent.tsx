/**
 * 文字內容積木
 * Flex Message 中的文字元件
 */

import { Type } from "lucide-react";
import { BlockDefinition } from "../types";
import { BlockCategory, WorkspaceContext } from "../../../../types/block";

export const textContent: BlockDefinition = {
  id: "text-content",
  blockType: "flex-content",
  category: BlockCategory.FLEX_CONTENT,
  displayName: "文字",
  description: "Flex Message 中的文字內容元件",
  icon: Type,
  color: "bg-blue-500",
  compatibility: [WorkspaceContext.LOGIC, WorkspaceContext.FLEX],
  defaultData: {
    title: "文字",
    contentType: "text",
    text: "範例文字",
    properties: {
      size: "md",
      weight: "regular",
      color: "#000000",
      align: "start",
    },
  },
  tags: ["flex", "內容", "文字"],
  version: "1.0.0",
  usageHints: ["用於在 Flex Message 中顯示文字內容"],
};
