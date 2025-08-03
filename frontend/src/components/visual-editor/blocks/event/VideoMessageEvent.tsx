/**
 * 影片訊息事件積木
 * 當用戶傳送影片訊息時觸發
 */

import { Video } from "lucide-react";
import { BlockDefinition } from "../types";
import { BlockCategory, WorkspaceContext } from "../../../../types/block";

export const videoMessageEvent: BlockDefinition = {
  id: "video-message-event",
  blockType: "event",
  category: BlockCategory.EVENT,
  displayName: "當收到影片訊息時",
  description: "當用戶傳送影片訊息給 LINE Bot 時觸發此事件",
  icon: Video,
  color: "bg-orange-500",
  compatibility: [WorkspaceContext.LOGIC],
  defaultData: {
    title: "當收到影片訊息時",
    eventType: "message.video",
    settings: {
      saveVideoFile: true,
      generateThumbnail: true,
      maxFileSize: 200, // MB
      allowedFormats: ["mp4", "mov", "avi"],
      enableAnalytics: false,
    },
  },
  tags: ["事件", "訊息", "影片", "視頻", "觸發"],
  version: "1.0.0",
  usageHints: [
    "此積木在用戶傳送影片訊息時觸發",
    "可以設定影片檔案的大小限制和格式限制",
    "支援自動產生影片縮圖功能",
    "可以儲存影片檔案供後續處理使用",
  ],
  configOptions: [
    {
      key: "saveVideoFile",
      label: "儲存影片檔案",
      type: "boolean",
      defaultValue: true,
      description: "是否將接收到的影片檔案儲存到伺服器",
    },
    {
      key: "generateThumbnail",
      label: "產生縮圖",
      type: "boolean",
      defaultValue: true,
      description: "是否自動為影片產生縮圖",
    },
    {
      key: "maxFileSize",
      label: "檔案大小限制 (MB)",
      type: "number",
      defaultValue: 200,
      description: "影片檔案的最大允許大小，超過此大小的檔案將被拒絕",
      validation: {
        min: 1,
        max: 1000,
        message: "檔案大小限制必須在 1-1000 MB 之間",
      },
    },
    {
      key: "allowedFormats",
      label: "允許的格式",
      type: "textarea",
      defaultValue: "mp4\nmov\navi",
      description: "允許的影片格式，每行一個格式（如：mp4, mov, avi）",
    },
    {
      key: "enableAnalytics",
      label: "啟用分析",
      type: "boolean",
      defaultValue: false,
      description: "是否記錄影片訊息的使用統計資料",
    },
    {
      key: "processingMode",
      label: "處理模式",
      type: "select",
      defaultValue: "basic",
      options: [
        { label: "基本處理", value: "basic" },
        { label: "壓縮處理", value: "compress" },
        { label: "格式轉換", value: "convert" },
        { label: "內容分析", value: "analyze" },
      ],
      description: "接收到影片後的處理方式",
    },
    {
      key: "autoReply",
      label: "自動回覆",
      type: "boolean",
      defaultValue: true,
      description: "是否在接收到影片後自動回覆確認訊息",
    },
  ],
};