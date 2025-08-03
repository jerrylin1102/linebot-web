/**
 * 檔案訊息事件積木
 * 當用戶傳送檔案訊息時觸發
 */

import { FileText } from "lucide-react";
import { BlockDefinition } from "../types";
import { BlockCategory, WorkspaceContext } from "../../../../types/block";

export const fileMessageEvent: BlockDefinition = {
  id: "file-message-event",
  blockType: "event",
  category: BlockCategory.EVENT,
  displayName: "當收到檔案訊息時",
  description: "當用戶傳送檔案訊息給 LINE Bot 時觸發此事件",
  icon: FileText,
  color: "bg-orange-500",
  compatibility: [WorkspaceContext.LOGIC],
  defaultData: {
    title: "當收到檔案訊息時",
    eventType: "message.file",
    settings: {
      saveFile: true,
      scanForVirus: true,
      maxFileSize: 100, // MB
      allowedExtensions: ["pdf", "doc", "docx", "txt", "jpg", "png"],
      requireFileName: false,
      enableAnalytics: false,
    },
  },
  tags: ["事件", "訊息", "檔案", "文件", "觸發"],
  version: "1.0.0",
  usageHints: [
    "此積木在用戶傳送檔案訊息時觸發",
    "可以設定允許的檔案類型和大小限制",
    "支援病毒掃描和安全檢查功能",
    "可以要求檔案必須有檔名或特定格式",
  ],
  configOptions: [
    {
      key: "saveFile",
      label: "儲存檔案",
      type: "boolean",
      defaultValue: true,
      description: "是否將接收到的檔案儲存到伺服器",
    },
    {
      key: "scanForVirus",
      label: "病毒掃描",
      type: "boolean",
      defaultValue: true,
      description: "是否對上傳的檔案進行病毒掃描",
    },
    {
      key: "maxFileSize",
      label: "檔案大小限制 (MB)",
      type: "number",
      defaultValue: 100,
      description: "檔案的最大允許大小，超過此大小的檔案將被拒絕",
      validation: {
        min: 1,
        max: 500,
        message: "檔案大小限制必須在 1-500 MB 之間",
      },
    },
    {
      key: "allowedExtensions",
      label: "允許的檔案類型",
      type: "textarea",
      defaultValue: "pdf\ndoc\ndocx\ntxt\njpg\npng",
      description: "允許的檔案副檔名，每行一個（不含點號，如：pdf, doc, txt）",
    },
    {
      key: "requireFileName",
      label: "需要檔案名稱",
      type: "boolean",
      defaultValue: false,
      description: "是否要求檔案必須有明確的檔案名稱",
    },
    {
      key: "enableAnalytics",
      label: "啟用分析",
      type: "boolean",
      defaultValue: false,
      description: "是否記錄檔案訊息的使用統計資料",
    },
    {
      key: "securityLevel",
      label: "安全等級",
      type: "select",
      defaultValue: "medium",
      options: [
        { label: "低 - 基本檢查", value: "low" },
        { label: "中 - 標準檢查", value: "medium" },
        { label: "高 - 嚴格檢查", value: "high" },
        { label: "最高 - 完整掃描", value: "maximum" },
      ],
      description: "檔案安全檢查的嚴格程度",
    },
    {
      key: "autoReply",
      label: "自動回覆模式",
      type: "select",
      defaultValue: "confirm",
      options: [
        { label: "無回覆", value: "none" },
        { label: "確認收到", value: "confirm" },
        { label: "處理狀態", value: "status" },
        { label: "檔案資訊", value: "info" },
      ],
      description: "接收到檔案後的自動回覆行為",
    },
  ],
};