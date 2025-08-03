/**
 * LINE Bot Action 類型定義
 * 支援 LINE Messaging API 的所有 Action 類型
 */

// 基礎 Action 介面
export interface BaseAction {
  type: string;
  label?: string; // 顯示標籤（某些 Action 類型需要）
}

// Postback Action - 回傳數據給機器人
export interface PostbackAction extends BaseAction {
  type: "postback";
  label?: string;
  data: string; // 回傳的數據
  text?: string; // 發送給聊天室的文字（可選）
  displayText?: string; // 顯示在聊天室的文字（可選）
}

// Message Action - 發送訊息
export interface MessageAction extends BaseAction {
  type: "message";
  label?: string;
  text: string; // 要發送的訊息文字
}

// URI Action - 開啟網頁連結
export interface UriAction extends BaseAction {
  type: "uri";
  label?: string;
  uri: string; // 要開啟的 URL
  altUri?: {
    desktop?: string; // 桌面版 URL
  };
}

// Camera Action - 開啟相機
export interface CameraAction extends BaseAction {
  type: "camera";
  label?: string;
}

// Camera Roll Action - 開啟相機膠卷
export interface CameraRollAction extends BaseAction {
  type: "cameraRoll";
  label?: string;
}

// Location Action - 位置分享
export interface LocationAction extends BaseAction {
  type: "location";
  label?: string;
}

// Datetime Picker Action - 日期時間選擇器
export interface DatetimePickerAction extends BaseAction {
  type: "datetimepicker";
  label?: string;
  data: string; // 回傳的數據
  mode: "date" | "time" | "datetime"; // 選擇模式
  initial?: string; // 初始值 (ISO 8601 格式)
  max?: string; // 最大值 (ISO 8601 格式)
  min?: string; // 最小值 (ISO 8601 格式)
}

// Rich Menu Switch Action - 豐富選單切換
export interface RichMenuSwitchAction extends BaseAction {
  type: "richmenuswitch";
  richMenuAliasId: string; // 要切換到的豐富選單別名
  data: string; // 回傳的數據
}

// Clipboard Action - 剪貼板動作
export interface ClipboardAction extends BaseAction {
  type: "clipboard";
  clipboardText: string; // 要複製到剪貼板的文字
}

// 聯合類型 - 所有支援的 Action 類型
export type LineAction = 
  | PostbackAction
  | MessageAction
  | UriAction
  | CameraAction
  | CameraRollAction
  | LocationAction
  | DatetimePickerAction
  | RichMenuSwitchAction
  | ClipboardAction;

// Action 類型枚舉
export enum ActionType {
  POSTBACK = "postback",
  MESSAGE = "message",
  URI = "uri",
  CAMERA = "camera",
  CAMERA_ROLL = "cameraRoll",
  LOCATION = "location",
  DATETIME_PICKER = "datetimepicker",
  RICHMENU_SWITCH = "richmenuswitch",
  CLIPBOARD = "clipboard"
}

// Action 類型資訊
export interface ActionTypeInfo {
  type: ActionType;
  displayName: string;
  description: string;
  icon: string; // Lucide icon name
  color: string; // Tailwind color class
  category: "basic" | "media" | "input" | "navigation";
  requiresInput: boolean; // 是否需要用戶輸入
}

// Action 類型配置
export const ACTION_TYPE_CONFIG: Record<ActionType, ActionTypeInfo> = {
  [ActionType.POSTBACK]: {
    type: ActionType.POSTBACK,
    displayName: "回傳數據",
    description: "點擊後回傳指定數據給機器人",
    icon: "MessageSquare",
    color: "bg-blue-500",
    category: "basic",
    requiresInput: true
  },
  [ActionType.MESSAGE]: {
    type: ActionType.MESSAGE,
    displayName: "發送訊息",
    description: "點擊後在聊天室發送指定訊息",
    icon: "Send",
    color: "bg-green-500",
    category: "basic",
    requiresInput: true
  },
  [ActionType.URI]: {
    type: ActionType.URI,
    displayName: "開啟連結",
    description: "點擊後開啟指定的網頁連結",
    icon: "ExternalLink",
    color: "bg-purple-500",
    category: "navigation",
    requiresInput: true
  },
  [ActionType.CAMERA]: {
    type: ActionType.CAMERA,
    displayName: "開啟相機",
    description: "點擊後開啟相機拍照",
    icon: "Camera",
    color: "bg-red-500",
    category: "media",
    requiresInput: false
  },
  [ActionType.CAMERA_ROLL]: {
    type: ActionType.CAMERA_ROLL,
    displayName: "選擇照片",
    description: "點擊後開啟相機膠卷選擇照片",
    icon: "Image",
    color: "bg-orange-500",
    category: "media",
    requiresInput: false
  },
  [ActionType.LOCATION]: {
    type: ActionType.LOCATION,
    displayName: "分享位置",
    description: "點擊後分享當前位置",
    icon: "MapPin",
    color: "bg-cyan-500",
    category: "input",
    requiresInput: false
  },
  [ActionType.DATETIME_PICKER]: {
    type: ActionType.DATETIME_PICKER,
    displayName: "選擇日期時間",
    description: "點擊後開啟日期時間選擇器",
    icon: "Calendar",
    color: "bg-indigo-500",
    category: "input",
    requiresInput: true
  },
  [ActionType.RICHMENU_SWITCH]: {
    type: ActionType.RICHMENU_SWITCH,
    displayName: "切換選單",
    description: "點擊後切換豐富選單",
    icon: "Menu",
    color: "bg-pink-500",
    category: "navigation",
    requiresInput: true
  },
  [ActionType.CLIPBOARD]: {
    type: ActionType.CLIPBOARD,
    displayName: "複製文字",
    description: "點擊後複製指定文字到剪貼板",
    icon: "Copy",
    color: "bg-yellow-500",
    category: "basic",
    requiresInput: true
  }
};

// Action 驗證函數
export function validateAction(action: Partial<LineAction>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!action.type) {
    errors.push("Action 類型不能為空");
    return { isValid: false, errors };
  }

  const config = ACTION_TYPE_CONFIG[action.type as ActionType];
  if (!config) {
    errors.push(`不支援的 Action 類型: ${action.type}`);
    return { isValid: false, errors };
  }

  // 根據不同類型進行特定驗證
  switch (action.type) {
    case ActionType.POSTBACK:
      const postback = action as PostbackAction;
      if (!postback.data) {
        errors.push("Postback Action 需要 data 參數");
      }
      break;

    case ActionType.MESSAGE:
      const message = action as MessageAction;
      if (!message.text) {
        errors.push("Message Action 需要 text 參數");
      }
      break;

    case ActionType.URI:
      const uri = action as UriAction;
      if (!uri.uri) {
        errors.push("URI Action 需要 uri 參數");
      } else if (!isValidUrl(uri.uri)) {
        errors.push("URI 格式不正確");
      }
      break;

    case ActionType.DATETIME_PICKER:
      const datetime = action as DatetimePickerAction;
      if (!datetime.data) {
        errors.push("Datetime Picker Action 需要 data 參數");
      }
      if (!datetime.mode) {
        errors.push("Datetime Picker Action 需要 mode 參數");
      }
      if (datetime.mode && !["date", "time", "datetime"].includes(datetime.mode)) {
        errors.push("Datetime Picker mode 必須是 date、time 或 datetime");
      }
      break;

    case ActionType.RICHMENU_SWITCH:
      const richmenu = action as RichMenuSwitchAction;
      if (!richmenu.richMenuAliasId) {
        errors.push("Rich Menu Switch Action 需要 richMenuAliasId 參數");
      }
      if (!richmenu.data) {
        errors.push("Rich Menu Switch Action 需要 data 參數");
      }
      break;

    case ActionType.CLIPBOARD:
      const clipboard = action as ClipboardAction;
      if (!clipboard.clipboardText) {
        errors.push("Clipboard Action 需要 clipboardText 參數");
      }
      break;
  }

  return { isValid: errors.length === 0, errors };
}

// URL 驗證輔助函數
function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// 創建預設 Action 的工廠函數
export function createDefaultAction(type: ActionType): LineAction {
  const config = ACTION_TYPE_CONFIG[type];
  
  const baseAction = {
    type,
    label: config.displayName
  };

  switch (type) {
    case ActionType.POSTBACK:
      return {
        ...baseAction,
        type: "postback",
        data: "action_data",
        text: "點擊了按鈕"
      } as PostbackAction;

    case ActionType.MESSAGE:
      return {
        ...baseAction,
        type: "message",
        text: "Hello, World!"
      } as MessageAction;

    case ActionType.URI:
      return {
        ...baseAction,
        type: "uri",
        uri: "https://example.com"
      } as UriAction;

    case ActionType.CAMERA:
      return {
        ...baseAction,
        type: "camera"
      } as CameraAction;

    case ActionType.CAMERA_ROLL:
      return {
        ...baseAction,
        type: "cameraRoll"
      } as CameraRollAction;

    case ActionType.LOCATION:
      return {
        ...baseAction,
        type: "location"
      } as LocationAction;

    case ActionType.DATETIME_PICKER:
      return {
        ...baseAction,
        type: "datetimepicker",
        data: "datetime_selected",
        mode: "datetime"
      } as DatetimePickerAction;

    case ActionType.RICHMENU_SWITCH:
      return {
        ...baseAction,
        type: "richmenuswitch",
        richMenuAliasId: "alias_1",
        data: "richmenu_switched"
      } as RichMenuSwitchAction;

    case ActionType.CLIPBOARD:
      return {
        ...baseAction,
        type: "clipboard",
        clipboardText: "複製的文字內容"
      } as ClipboardAction;

    default:
      throw new Error(`不支援的 Action 類型: ${type}`);
  }
}