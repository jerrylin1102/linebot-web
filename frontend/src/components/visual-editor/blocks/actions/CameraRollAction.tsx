/**
 * Camera Roll Action 積木
 * 點擊後開啟相機膠卷選擇照片
 */

import { Image } from "lucide-react";
import { BlockDefinition } from "../types";
import { BlockCategory, WorkspaceContext } from "../../../../types/block";
import { ActionType } from "../../../../types/lineActions";

export const cameraRollAction: BlockDefinition = {
  id: "camera-roll-action",
  blockType: "action",
  category: BlockCategory.ACTION,
  displayName: "選擇照片",
  description: "點擊後開啟相機膠卷選擇照片",
  icon: Image,
  color: "bg-orange-500",
  compatibility: [WorkspaceContext.LOGIC, WorkspaceContext.FLEX],
  defaultData: {
    title: "選擇照片",
    actionType: ActionType.CAMERA_ROLL,
    action: {
      type: "cameraRoll",
      label: "選擇照片"
    },
    properties: {
      style: "primary",
      color: "#f97316",
    },
  },
  tags: ["action", "相機膠卷", "照片", "媒體", "選擇"],
  version: "1.0.0",
  usageHints: [
    "用於創建選擇照片的按鈕",
    "點擊後會開啟相機膠卷或相簿",
    "適合需要用戶上傳圖片的場景"
  ],
  validation: {
    required: [],
    rules: []
  }
};