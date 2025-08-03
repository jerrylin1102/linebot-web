/**
 * 儲存用戶資料積木
 * 儲存用戶相關資料到資料庫
 */

import { Database } from "lucide-react";
import { BlockDefinition } from "../types";
import { BlockCategory, WorkspaceContext } from "../../../../types/block";

export const saveUserDataSetting: BlockDefinition = {
  id: "save-user-data-setting",
  blockType: "setting",
  category: BlockCategory.SETTING,
  displayName: "儲存用戶資料",
  description: "儲存用戶相關資料到資料庫",
  icon: Database,
  color: "bg-gray-500",
  compatibility: [WorkspaceContext.LOGIC],
  defaultData: {
    title: "儲存用戶資料",
    settingType: "saveUserData",
    dataType: "profile", // profile, interaction, custom
    fields: {},
    options: {
      overwrite: false,
      validateData: true,
      enableEncryption: false,
    },
  },
  tags: ["設定", "用戶", "資料", "儲存", "資料庫"],
  version: "1.0.0",
  usageHints: [
    "用於儲存用戶相關資料到資料庫",
    "支援儲存用戶資料、互動記錄和自定義資料",
    "可以設定是否覆蓋現有資料",
    "支援資料驗證和加密功能",
  ],
  configOptions: [
    {
      key: "dataType",
      label: "資料類型",
      type: "select",
      defaultValue: "profile",
      options: [
        { label: "用戶資料", value: "profile" },
        { label: "互動記錄", value: "interaction" },
        { label: "自定義資料", value: "custom" },
      ],
      required: true,
      description: "要儲存的資料類型",
    },
    {
      key: "fields",
      label: "資料欄位",
      type: "textarea",
      defaultValue: "{}",
      description: "要儲存的資料欄位（JSON 格式）",
    },
    {
      key: "overwrite",
      label: "覆蓋現有資料",
      type: "boolean",
      defaultValue: false,
      description: "是否覆蓋現有的用戶資料",
    },
    {
      key: "validateData",
      label: "驗證資料",
      type: "boolean",
      defaultValue: true,
      description: "是否在儲存前驗證資料格式",
    },
    {
      key: "enableEncryption",
      label: "啟用加密",
      type: "boolean",
      defaultValue: false,
      description: "是否對敏感資料進行加密儲存",
    },
  ],
};
