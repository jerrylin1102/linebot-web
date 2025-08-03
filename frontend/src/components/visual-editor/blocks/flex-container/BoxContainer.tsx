import { Square } from "lucide-react";
import { BlockDefinition } from "../types";
import { BlockCategory, WorkspaceContext } from "../../../../types/block";

export const boxContainer: BlockDefinition = {
  id: "box-container",
  blockType: "flex-container",
  category: BlockCategory.FLEX_CONTAINER,
  displayName: "Box 容器",
  description: "Flex Message 中的 Box 容器元件",
  icon: Square,
  color: "bg-indigo-500",
  compatibility: [WorkspaceContext.LOGIC, WorkspaceContext.FLEX],
  defaultData: {
    title: "Box 容器",
    containerType: "box",
  },
  tags: ["flex", "容器", "box"],
  version: "1.0.0",
  usageHints: ["用於在 Flex Message 中創建佈局容器"],
};
