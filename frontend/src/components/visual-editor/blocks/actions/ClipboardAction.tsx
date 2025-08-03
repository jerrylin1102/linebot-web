/**
 * Clipboard Action 積木
 * 點擊後複製指定文字到剪貼板
 */

import { Copy } from "lucide-react";
import { BlockDefinition } from "../types";
import { BlockCategory, WorkspaceContext } from "../../../../types/block";
import { ActionType } from "../../../../types/lineActions";

export const clipboardAction: BlockDefinition = {
  id: "clipboard-action",
  blockType: "action",
  category: BlockCategory.FLEX_CONTENT,
  displayName: "複製文字",
  description: "點擊後複製指定文字到剪貼板",
  icon: Copy,
  color: "bg-yellow-500",
  compatibility: [WorkspaceContext.LOGIC, WorkspaceContext.FLEX],
  defaultData: {
    title: "複製文字",
    actionType: ActionType.CLIPBOARD,
    action: {
      type: "clipboard",
      clipboardText: "複製的文字內容"
    },
    properties: {
      style: "primary",
      color: "#eab308",
    },
  },
  tags: ["action", "剪貼板", "複製", "文字"],
  version: "1.0.0",
  usageHints: [
    "用於創建複製文字的按鈕",
    "點擊後會將指定文字複製到剪貼板",
    "適合分享代碼、連結或其他文字內容",
    "用戶可以直接貼上複製的內容"
  ],
  validation: {
    required: ["clipboardText"],
    rules: [
      {
        field: "clipboardText",
        type: "string",
        message: "請輸入要複製的文字內容"
      }
    ]
  }
};