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
  },
  tags: ["flex", "容器", "bubble"],
  version: "1.0.0",
  usageHints: ["用於創建 Flex Message 的基本容器"],
};
