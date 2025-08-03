/**
 * Location Action 積木
 * 點擊後分享當前位置
 */

import { MapPin } from "lucide-react";
import { BlockDefinition } from "../types";
import { BlockCategory, WorkspaceContext } from "../../../../types/block";
import { ActionType } from "../../../../types/lineActions";

export const locationAction: BlockDefinition = {
  id: "location-action",
  blockType: "action",
  category: BlockCategory.ACTION,
  displayName: "分享位置",
  description: "點擊後分享當前位置",
  icon: MapPin,
  color: "bg-cyan-500",
  compatibility: [WorkspaceContext.LOGIC, WorkspaceContext.FLEX],
  defaultData: {
    title: "分享位置",
    actionType: ActionType.LOCATION,
    action: {
      type: "location",
      label: "分享位置"
    },
    properties: {
      style: "primary",
      color: "#06b6d4",
    },
  },
  tags: ["action", "位置", "地理位置", "分享", "定位"],
  version: "1.0.0",
  usageHints: [
    "用於創建分享位置的按鈕",
    "點擊後會請求用戶分享當前位置",
    "適合需要位置資訊的服務場景"
  ],
  validation: {
    required: [],
    rules: []
  }
};