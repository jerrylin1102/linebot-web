/**
 * 對齊佈局積木
 * Flex Message 中的對齊元件
 */

import { AlignCenter } from "lucide-react";
import { BlockDefinition } from "../types";
import { BlockCategory, WorkspaceContext } from "../../../../types/block";

export const alignLayout: BlockDefinition = {
  id: "align-layout",
  blockType: "flex-layout",
  category: BlockCategory.FLEX_LAYOUT,
  displayName: "對齊",
  description: "Flex Message 中的對齊佈局元件",
  icon: AlignCenter,
  color: "bg-teal-500",
  compatibility: [WorkspaceContext.FLEX, WorkspaceContext.LOGIC],
  defaultData: {
    title: "對齊",
    layoutType: "align",
    properties: {
      gravity: "center",
      align: "center",
    },
  },
  tags: ["flex", "佈局", "對齊"],
  version: "1.0.0",
  usageHints: ["用於在 Flex Message 中設定內容對齊方式"],
};
