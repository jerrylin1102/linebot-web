/**
 * 影片內容積木
 * Flex Message 中的影片元件
 */

import { Play } from "lucide-react";
import { BlockDefinition } from "../types";
import { BlockCategory, WorkspaceContext } from "../../../../types/block";

export const videoContent: BlockDefinition = {
  id: "video-content",
  blockType: "flex-content",
  category: BlockCategory.FLEX_CONTENT,
  displayName: "影片",
  description: "Flex Message 中的影片內容元件",
  icon: Play,
  color: "bg-blue-500",
  compatibility: [WorkspaceContext.LOGIC, WorkspaceContext.FLEX],
  defaultData: {
    title: "影片",
    contentType: "video",
    url: "https://example.com/video.mp4",
    previewUrl: "https://example.com/video_preview.jpg",
    properties: {
      aspectRatio: "20:13",
      aspectMode: "cover",
      backgroundColor: "#FFFFFF",
      action: null,
      altContent: {
        type: "image",
        url: "https://example.com/fallback_image.jpg",
        size: "full",
        aspectRatio: "20:13",
        aspectMode: "cover"
      }
    },
  },
  tags: ["flex", "內容", "影片", "媒體"],
  version: "1.0.0",
  usageHints: [
    "用於在 Flex Message 中顯示影片內容",
    "支援自訂預覽圖片和寬高比",
    "可設定影片播放失敗時的替代內容",
    "建議使用 MP4 格式以確保相容性"
  ],
  configOptions: [
    {
      key: "url",
      label: "影片網址",
      type: "text",
      required: true,
      description: "影片檔案的網址，建議使用 HTTPS"
    },
    {
      key: "previewUrl", 
      label: "預覽圖片網址",
      type: "text",
      required: true,
      description: "影片縮圖的網址，在影片載入前顯示"
    },
    {
      key: "properties.aspectRatio",
      label: "寬高比",
      type: "select",
      defaultValue: "20:13",
      description: "影片顯示的寬高比例",
      options: [
        { label: "20:13 (電影比例)", value: "20:13" },
        { label: "16:9 (寬螢幕)", value: "16:9" },
        { label: "4:3 (標準比例)", value: "4:3" },
        { label: "1:1 (正方形)", value: "1:1" },
        { label: "9:16 (直立)", value: "9:16" }
      ]
    },
    {
      key: "properties.aspectMode",
      label: "顯示模式",
      type: "select",
      defaultValue: "cover",
      description: "影片如何適應容器大小",
      options: [
        { label: "Cover (覆蓋)", value: "cover" },
        { label: "Fit (適應)", value: "fit" }
      ]
    },
    {
      key: "properties.backgroundColor",
      label: "背景顏色",
      type: "text",
      defaultValue: "#FFFFFF",
      description: "影片容器的背景顏色 (十六進位色碼)"
    },
    {
      key: "properties.altContent.url",
      label: "替代圖片網址",
      type: "text",
      description: "當影片無法播放時顯示的替代圖片"
    }
  ]
};