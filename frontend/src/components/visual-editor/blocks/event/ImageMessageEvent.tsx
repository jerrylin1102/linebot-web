/**
 * 圖片訊息事件積木
 * 當用戶傳送圖片訊息時觸發
 */

import { ImageIcon } from "lucide-react";
import { BlockDefinition } from "../types";
import { BlockCategory, WorkspaceContext } from "../../../../types/block";

export const imageMessageEvent: BlockDefinition = {
  id: "image-message-event",
  blockType: "event",
  category: BlockCategory.EVENT,
  displayName: "當收到圖片訊息時",
  description: "當用戶傳送圖片訊息給 LINE Bot 時觸發此事件",
  icon: ImageIcon,
  color: "bg-orange-500",
  compatibility: [WorkspaceContext.LOGIC],
  defaultData: {
    title: "當收到圖片訊息時",
    eventType: "message.image",
    processing: {
      saveImage: false,
      processImageText: false,
      resizeImage: false,
      maxFileSize: 10, // MB
    },
  },
  tags: ["事件", "訊息", "圖片", "觸發", "多媒體"],
  version: "1.0.0",
  usageHints: [
    "此積木當用戶傳送圖片時觸發，可用於處理圖片相關功能",
    "可以設定是否儲存圖片到伺服器",
    "支援圖片文字識別（OCR）功能",
    "可以限制接受的圖片檔案大小",
  ],
  configOptions: [
    {
      key: "saveImage",
      label: "儲存圖片",
      type: "boolean",
      defaultValue: false,
      description: "是否將接收到的圖片儲存到伺服器",
    },
    {
      key: "processImageText",
      label: "處理圖片文字",
      type: "boolean",
      defaultValue: false,
      description: "是否使用 OCR 技術識別圖片中的文字",
    },
    {
      key: "resizeImage",
      label: "調整圖片大小",
      type: "boolean",
      defaultValue: false,
      description: "是否自動調整圖片大小以節省儲存空間",
    },
    {
      key: "maxFileSize",
      label: "最大檔案大小 (MB)",
      type: "number",
      defaultValue: 10,
      description: "接受的圖片檔案最大大小，超過此大小將拒絕處理",
      validation: {
        min: 1,
        max: 100,
        message: "檔案大小必須在 1-100 MB 之間",
      },
    },
  ],
};
