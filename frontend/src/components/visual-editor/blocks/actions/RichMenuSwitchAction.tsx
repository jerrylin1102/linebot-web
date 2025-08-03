/**
 * Rich Menu Switch Action 積木
 * 點擊後切換豐富選單
 */

import { Menu } from "lucide-react";
import { BlockDefinition } from "../types";
import { BlockCategory, WorkspaceContext } from "../../../../types/block";
import { ActionType } from "../../../../types/lineActions";

export const richMenuSwitchAction: BlockDefinition = {
  id: "richmenu-switch-action",
  blockType: "action",
  category: BlockCategory.FLEX_CONTENT,
  displayName: "切換選單",
  description: "點擊後切換豐富選單",
  icon: Menu,
  color: "bg-pink-500",
  compatibility: [WorkspaceContext.LOGIC, WorkspaceContext.FLEX],
  defaultData: {
    title: "切換選單",
    actionType: ActionType.RICHMENU_SWITCH,
    action: {
      type: "richmenuswitch",
      richMenuAliasId: "alias_1",
      data: "richmenu_switched"
    },
    properties: {
      style: "primary",
      color: "#ec4899",
    },
  },
  tags: ["action", "豐富選單", "選單", "切換", "導航"],
  version: "1.0.0",
  usageHints: [
    "用於創建切換豐富選單的按鈕",
    "可以切換到不同的選單佈局",
    "適合多頁面或多功能的機器人",
    "需要先在 LINE Developers 建立選單別名"
  ],
  validation: {
    required: ["richMenuAliasId", "data"],
    rules: [
      {
        field: "richMenuAliasId",
        type: "string",
        message: "請輸入豐富選單別名"
      },
      {
        field: "data",
        type: "string",
        message: "請輸入回傳數據"
      }
    ]
  }
};