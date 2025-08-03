/**
 * 語音訊息事件積木
 * 當用戶傳送語音訊息時觸發
 */

import { Mic } from "lucide-react";
import { BlockDefinition } from "../types";
import { BlockCategory, WorkspaceContext } from "../../../../types/block";

export const audioMessageEvent: BlockDefinition = {
  id: "audio-message-event",
  blockType: "event",
  category: BlockCategory.EVENT,
  displayName: "當收到語音訊息時",
  description: "當用戶傳送語音訊息給 LINE Bot 時觸發此事件",
  icon: Mic,
  color: "bg-orange-500",
  compatibility: [WorkspaceContext.LOGIC],
  defaultData: {
    title: "當收到語音訊息時",
    eventType: "message.audio",
    settings: {
      saveAudioFile: true,
      transcribeAudio: false,
      durationLimit: 300, // 秒
      enableAnalytics: false,
    },
  },
  tags: ["事件", "訊息", "語音", "音頻", "觸發"],
  version: "1.0.0",
  usageHints: [
    "此積木在用戶傳送語音訊息時觸發",
    "可以選擇是否儲存語音檔案或進行語音轉文字",
    "支援設定語音訊息的最大時長限制",
    "可以配合語音分析功能來處理音頻內容",
  ],
  configOptions: [
    {
      key: "saveAudioFile",
      label: "儲存語音檔案",
      type: "boolean",
      defaultValue: true,
      description: "是否將接收到的語音檔案儲存到伺服器",
    },
    {
      key: "transcribeAudio",
      label: "語音轉文字",
      type: "boolean",
      defaultValue: false,
      description: "是否啟用語音轉文字功能（需要額外的 API 支援）",
    },
    {
      key: "durationLimit",
      label: "時長限制 (秒)",
      type: "number",
      defaultValue: 300,
      description: "語音訊息的最大允許時長，超過此時長的訊息將被忽略",
      validation: {
        min: 1,
        max: 600,
        message: "時長限制必須在 1-600 秒之間",
      },
    },
    {
      key: "enableAnalytics",
      label: "啟用分析",
      type: "boolean",
      defaultValue: false,
      description: "是否記錄語音訊息的使用統計資料",
    },
    {
      key: "autoReply",
      label: "自動回覆模式",
      type: "select",
      defaultValue: "none",
      options: [
        { label: "無自動回覆", value: "none" },
        { label: "確認收到", value: "acknowledge" },
        { label: "處理中提示", value: "processing" },
        { label: "轉換結果", value: "transcription" },
      ],
      description: "接收到語音訊息時的自動回覆行為",
    },
  ],
};