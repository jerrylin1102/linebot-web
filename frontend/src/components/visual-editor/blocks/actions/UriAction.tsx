/**
 * URI Action 積木
 * 點擊後開啟指定的網頁連結
 */

import { ExternalLink } from "lucide-react";
import { BlockDefinition } from "../types";
import { BlockCategory, WorkspaceContext } from "../../../../types/block";
import { ActionType } from "../../../../types/lineActions";

export const uriAction: BlockDefinition = {
  id: "uri-action",
  blockType: "action",
  category: BlockCategory.FLEX_CONTENT,
  displayName: "開啟連結",
  description: "點擊後開啟指定的網頁連結",
  icon: ExternalLink,
  color: "bg-purple-500",
  compatibility: [WorkspaceContext.LOGIC, WorkspaceContext.FLEX],
  defaultData: {
    title: "開啟連結",
    actionType: ActionType.URI,
    action: {
      type: "uri",
      label: "開啟連結",
      uri: "https://example.com",
      altUri: {
        desktop: "https://example.com"
      }
    },
    properties: {
      style: "primary",
      color: "#6366f1",
    },
  },
  tags: ["action", "連結", "網頁", "URI", "導航"],
  version: "1.0.0",
  usageHints: [
    "用於創建開啟網頁連結的按鈕",
    "可以設定桌面版和行動版不同的連結",
    "適合導向外部網站或內部頁面"
  ],
  validation: {
    required: ["uri"],
    rules: [
      {
        field: "uri",
        type: "url",
        message: "請輸入有效的網址"
      }
    ]
  }
};