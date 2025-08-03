import { Layers } from "lucide-react";
import { BlockDefinition } from "../types";
import { BlockCategory, WorkspaceContext } from "../../../../types/block";

export const carouselContainer: BlockDefinition = {
  id: "carousel-container",
  blockType: "flex-container",
  category: BlockCategory.FLEX_CONTAINER,
  displayName: "Carousel 容器",
  description: "可以滑動的多張 Bubble 容器",
  icon: Layers,
  color: "bg-indigo-500",
  compatibility: [WorkspaceContext.LOGIC, WorkspaceContext.FLEX],
  defaultData: {
    title: "Carousel 容器",
    containerType: "carousel",
  },
  tags: ["flex", "容器", "carousel"],
  version: "1.0.0",
  usageHints: ["用於創建可滑動的多張卡片容器"],
};
