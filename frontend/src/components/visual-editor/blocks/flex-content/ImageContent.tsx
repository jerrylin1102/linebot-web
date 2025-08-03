/**
 * 圖片內容積木
 * Flex Message 中的圖片元件
 */

import { ImageIcon } from "lucide-react";
import { BlockDefinition } from "../types";
import { BlockCategory, WorkspaceContext } from "../../../../types/block";

export const imageContent: BlockDefinition = {
  id: "image-content",
  blockType: "flex-content",
  category: BlockCategory.FLEX_CONTENT,
  displayName: "圖片",
  description: "Flex Message 中的圖片內容元件",
  icon: ImageIcon,
  color: "bg-blue-500",
  compatibility: [WorkspaceContext.LOGIC, WorkspaceContext.FLEX],
  defaultData: {
    title: "圖片",
    contentType: "image",
    url: "https://example.com/image.jpg",
    properties: {
      aspectRatio: "1:1",
      aspectMode: "cover",
      size: "full",
    },
  },
  tags: ["flex", "內容", "圖片"],
  version: "1.0.0",
  usageHints: ["用於在 Flex Message 中顯示圖片內容"],
};
