/**
 * 間距佈局積木
 * Flex Message 中的間距元件
 */

import { Square } from "lucide-react";
import { BlockDefinition } from "../types";
import { BlockCategory, WorkspaceContext } from "../../../../types/block";

export const spacerLayout: BlockDefinition = {
  id: "spacer-layout",
  blockType: "flex-layout",
  category: BlockCategory.FLEX_LAYOUT,
  displayName: "間距",
  description: "Flex Message 中的間距佈局元件",
  icon: Square,
  color: "bg-teal-500",
  compatibility: [WorkspaceContext.FLEX, WorkspaceContext.LOGIC],
  defaultData: {
    title: "間距",
    layoutType: "spacer",
    properties: {
      size: "md",
    },
  },
  tags: ["flex", "佈局", "間距"],
  version: "1.0.0",
  usageHints: ["用於在 Flex Message 中創建空白間距"],
};
