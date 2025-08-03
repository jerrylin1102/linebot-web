/**
 * 填充佈局積木
 * Flex Message 中的填充元件
 */

import { Maximize } from "lucide-react";
import { BlockDefinition } from "../types";
import { BlockCategory, WorkspaceContext } from "../../../../types/block";

export const fillerLayout: BlockDefinition = {
  id: "filler-layout",
  blockType: "flex-layout",
  category: BlockCategory.FLEX_LAYOUT,
  displayName: "填充",
  description: "Flex Message 中的填充佈局元件",
  icon: Maximize,
  color: "bg-teal-500",
  compatibility: [WorkspaceContext.FLEX, WorkspaceContext.LOGIC],
  defaultData: {
    title: "填充",
    layoutType: "filler",
    properties: {
      flex: 1,
    },
  },
  tags: ["flex", "佈局", "填充"],
  version: "1.0.0",
  usageHints: ["用於在 Flex Message 中填充剩餘空間"],
};
