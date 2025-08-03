/**
 * Camera Action 積木
 * 點擊後開啟相機拍照
 */

import { Camera } from "lucide-react";
import { BlockDefinition } from "../types";
import { BlockCategory, WorkspaceContext } from "../../../../types/block";
import { ActionType } from "../../../../types/lineActions";

export const cameraAction: BlockDefinition = {
  id: "camera-action",
  blockType: "action",
  category: BlockCategory.FLEX_CONTENT,
  displayName: "開啟相機",
  description: "點擊後開啟相機拍照",
  icon: Camera,
  color: "bg-red-500",
  compatibility: [WorkspaceContext.LOGIC, WorkspaceContext.FLEX],
  defaultData: {
    title: "開啟相機",
    actionType: ActionType.CAMERA,
    action: {
      type: "camera",
      label: "拍照"
    },
    properties: {
      style: "primary",
      color: "#ef4444",
    },
  },
  tags: ["action", "相機", "拍照", "媒體"],
  version: "1.0.0",
  usageHints: [
    "用於創建開啟相機的按鈕",
    "點擊後會啟動裝置的相機功能",
    "適合需要用戶拍照的場景"
  ],
  validation: {
    required: [],
    rules: []
  }
};