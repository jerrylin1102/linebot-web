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
  category: BlockCategory.ACTION,
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
    // 進階 URI 設定
    advancedSettings: {
      // 分別設定行動版和桌面版
      platformSpecific: {
        enabled: false,
        mobile: {
          uri: "",
          label: "",
          customScheme: "",
        },
        desktop: {
          uri: "",
          label: "",
          customScheme: "",
        },
      },
      // 目標視窗設定
      targetWindow: {
        enabled: false,
        target: "_blank", // _blank, _self, _parent, _top, custom
        customTarget: "",
        features: {
          width: 800,
          height: 600,
          resizable: true,
          scrollbars: true,
          toolbar: false,
          menubar: false,
          status: false,
        },
      },
      // URI 參數編輯器
      parameters: {
        enabled: false,
        baseUrl: "",
        queryParams: [],
        hashParams: [],
        pathParams: [],
      },
      // 條件式 URI
      conditionalUri: {
        enabled: false,
        conditions: [],
        fallbackUri: "",
      },
      // 追蹤和分析
      tracking: {
        enabled: false,
        utmSource: "",
        utmMedium: "",
        utmCampaign: "",
        utmTerm: "",
        utmContent: "",
        customTracking: [],
      },
    },
  },
  tags: ["action", "連結", "網頁", "URI", "導航"],
  version: "1.0.0",
  usageHints: [
    "用於創建開啟網頁連結的按鈕",
    "可以設定桌面版和行動版不同的連結",
    "適合導向外部網站或內部頁面",
    "支援自訂 URL 參數和追蹤設定",
    "可以設定目標視窗和開啟方式",
    "支援條件式連結和動態 URI 生成",
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
  },
  configOptions: [
    // 基本 URI 設定
    {
      key: "uri",
      label: "連結網址",
      type: "text",
      defaultValue: "https://example.com",
      required: true,
      description: "要開啟的網頁連結",
      validation: {
        pattern: "^https?://.*",
        message: "請輸入有效的 HTTP/HTTPS 網址",
      },
    },
    {
      key: "label",
      label: "顯示文字",
      type: "text",
      defaultValue: "開啟連結",
      required: true,
      description: "按鈕上顯示的文字",
    },
    // 平台特定設定
    {
      key: "platformSpecific",
      label: "平台特定設定",
      type: "object",
      description: "為不同平台設定不同的連結",
      properties: {
        enabled: { type: "boolean", label: "啟用平台特定設定", defaultValue: false },
        mobile: {
          type: "object",
          label: "行動版設定",
          properties: {
            uri: { type: "text", label: "行動版連結", defaultValue: "" },
            label: { type: "text", label: "行動版標籤", defaultValue: "" },
            customScheme: { type: "text", label: "自訂 Scheme", defaultValue: "", placeholder: "app://", description: "如 app:// 或 myapp://" },
          },
        },
        desktop: {
          type: "object",
          label: "桌面版設定",
          properties: {
            uri: { type: "text", label: "桌面版連結", defaultValue: "" },
            label: { type: "text", label: "桌面版標籤", defaultValue: "" },
            customScheme: { type: "text", label: "自訂 Scheme", defaultValue: "", placeholder: "app://", description: "如 app:// 或 myapp://" },
          },
        },
      },
    },
    // 目標視窗設定
    {
      key: "targetWindow",
      label: "目標視窗",
      type: "object",
      description: "設定連結開啟的目標視窗",
      properties: {
        enabled: { type: "boolean", label: "啟用目標視窗設定", defaultValue: false },
        target: {
          type: "select",
          label: "目標視窗",
          options: [
            { label: "新視窗 (_blank)", value: "_blank" },
            { label: "當前視窗 (_self)", value: "_self" },
            { label: "父視窗 (_parent)", value: "_parent" },
            { label: "頂層視窗 (_top)", value: "_top" },
            { label: "自訂", value: "custom" },
          ],
          defaultValue: "_blank",
        },
        customTarget: { type: "text", label: "自訂目標名稱", defaultValue: "", showWhen: { target: "custom" } },
        features: {
          type: "object",
          label: "視窗特性",
          showWhen: { target: "_blank" },
          properties: {
            width: { type: "number", label: "寬度", defaultValue: 800, min: 200, max: 2000 },
            height: { type: "number", label: "高度", defaultValue: 600, min: 200, max: 1500 },
            resizable: { type: "boolean", label: "可調整大小", defaultValue: true },
            scrollbars: { type: "boolean", label: "顯示捲軸", defaultValue: true },
            toolbar: { type: "boolean", label: "顯示工具列", defaultValue: false },
            menubar: { type: "boolean", label: "顯示選單列", defaultValue: false },
            status: { type: "boolean", label: "顯示狀態列", defaultValue: false },
          },
        },
      },
    },
    // URI 參數編輯器
    {
      key: "parameters",
      label: "URI 參數編輯器",
      type: "object",
      description: "動態設定 URI 參數",
      properties: {
        enabled: { type: "boolean", label: "啟用參數編輯器", defaultValue: false },
        baseUrl: { type: "text", label: "基礎 URL", defaultValue: "", description: "不包含參數的基礎網址" },
        queryParams: {
          type: "array",
          label: "查詢參數 (?key=value)",
          itemType: "object",
          defaultValue: [],
          itemProperties: {
            key: { type: "text", label: "參數名稱", required: true },
            value: { type: "text", label: "參數值", required: true },
            encode: { type: "boolean", label: "URL 編碼", defaultValue: true },
          },
        },
        hashParams: {
          type: "array",
          label: "雜湊參數 (#key=value)",
          itemType: "object",
          defaultValue: [],
          itemProperties: {
            key: { type: "text", label: "參數名稱", required: true },
            value: { type: "text", label: "參數值", required: true },
          },
        },
        pathParams: {
          type: "array",
          label: "路徑參數 (/path/{param})",
          itemType: "object",
          defaultValue: [],
          itemProperties: {
            placeholder: { type: "text", label: "佔位符", required: true, placeholder: "{param}" },
            value: { type: "text", label: "實際值", required: true },
          },
        },
      },
    },
    // 條件式 URI
    {
      key: "conditionalUri",
      label: "條件式 URI",
      type: "object",
      description: "根據條件動態決定連結",
      properties: {
        enabled: { type: "boolean", label: "啟用條件式 URI", defaultValue: false },
        conditions: {
          type: "array",
          label: "條件規則",
          itemType: "object",
          defaultValue: [],
          itemProperties: {
            condition: { type: "text", label: "條件表達式", required: true, placeholder: "user.type === 'premium'" },
            uri: { type: "text", label: "目標 URI", required: true },
            label: { type: "text", label: "顯示標籤", defaultValue: "" },
            priority: { type: "number", label: "優先順序", defaultValue: 1, min: 1, max: 100 },
          },
        },
        fallbackUri: { type: "text", label: "預設 URI", defaultValue: "", description: "當所有條件都不符合時使用" },
      },
    },
    // 追蹤和分析
    {
      key: "tracking",
      label: "追蹤和分析",
      type: "object",
      description: "設定 UTM 參數和自訂追蹤",
      properties: {
        enabled: { type: "boolean", label: "啟用追蹤", defaultValue: false },
        utmSource: { type: "text", label: "UTM Source", defaultValue: "", placeholder: "linebot" },
        utmMedium: { type: "text", label: "UTM Medium", defaultValue: "", placeholder: "chatbot" },
        utmCampaign: { type: "text", label: "UTM Campaign", defaultValue: "", placeholder: "spring_sale" },
        utmTerm: { type: "text", label: "UTM Term", defaultValue: "", placeholder: "關鍵字" },
        utmContent: { type: "text", label: "UTM Content", defaultValue: "", placeholder: "banner_ad" },
        customTracking: {
          type: "array",
          label: "自訂追蹤參數",
          itemType: "object",
          defaultValue: [],
          itemProperties: {
            name: { type: "text", label: "參數名稱", required: true },
            value: { type: "text", label: "參數值", required: true },
            description: { type: "text", label: "說明", defaultValue: "" },
          },
        },
      },
    },
    // 進階設定
    {
      key: "advancedSettings",
      label: "進階設定",
      type: "object",
      description: "進階 URI 功能設定",
      properties: {
        preload: { type: "boolean", label: "預先載入", defaultValue: false, description: "提前載入目標頁面" },
        nofollow: { type: "boolean", label: "No Follow", defaultValue: false, description: "新增 rel='nofollow' 屬性" },
        noopener: { type: "boolean", label: "No Opener", defaultValue: true, description: "新增 rel='noopener' 屬性（安全性）" },
        noreferrer: { type: "boolean", label: "No Referrer", defaultValue: false, description: "新增 rel='noreferrer' 屬性" },
        timeout: { type: "number", label: "載入逾時 (秒)", defaultValue: 30, min: 5, max: 300 },
        retryAttempts: { type: "number", label: "重試次數", defaultValue: 0, min: 0, max: 5 },
        errorHandling: {
          type: "select",
          label: "錯誤處理",
          options: [
            { label: "顯示錯誤訊息", value: "show_error" },
            { label: "導向錯誤頁面", value: "error_page" },
            { label: "靜默失敗", value: "silent" },
            { label: "重試", value: "retry" },
          ],
          defaultValue: "show_error",
        },
      },
    },
    // 外觀設定
    {
      key: "appearance",
      label: "外觀設定",
      type: "object",
      description: "按鈕外觀和樣式設定",
      properties: {
        style: {
          type: "select",
          label: "按鈕樣式",
          options: [
            { label: "主要", value: "primary" },
            { label: "次要", value: "secondary" },
            { label: "成功", value: "success" },
            { label: "警告", value: "warning" },
            { label: "危險", value: "danger" },
            { label: "資訊", value: "info" },
            { label: "自訂", value: "custom" },
          ],
          defaultValue: "primary",
        },
        color: { type: "color", label: "按鈕顏色", defaultValue: "#6366f1" },
        textColor: { type: "color", label: "文字顏色", defaultValue: "#ffffff" },
        icon: { type: "text", label: "圖示", defaultValue: "", placeholder: "ex: external-link" },
        iconPosition: {
          type: "select",
          label: "圖示位置",
          options: [
            { label: "左側", value: "left" },
            { label: "右側", value: "right" },
            { label: "上方", value: "top" },
            { label: "下方", value: "bottom" },
          ],
          defaultValue: "left",
        },
      },
    },
  ]
};