/**
 * 設定變數積木
 * 設定或更新變數的值
 */

import { Variable } from "lucide-react";
import { BlockDefinition } from "../types";
import { BlockCategory, WorkspaceContext } from "../../../../types/block";

export const setVariableSetting: BlockDefinition = {
  id: "set-variable-setting",
  blockType: "setting",
  category: BlockCategory.SETTING,
  displayName: "設定變數",
  description: "設定或更新變數的值",
  icon: Variable,
  color: "bg-gray-500",
  compatibility: [WorkspaceContext.LOGIC],
  defaultData: {
    title: "設定變數",
    settingType: "setVariable",
    variableName: "",
    variableValue: "",
    valueType: "string", // string, number, boolean, object, array, json
    scope: "session", // session, global, user, temporary
    // 變數管理器設定
    variableManager: {
      enabled: true,
      showBrowser: true,
      allowSelection: true,
      autoComplete: true,
      variableList: [],
      recentVariables: [],
    },
    // 資料類型編輯器設定
    dataTypeEditor: {
      string: {
        multiline: false,
        placeholder: "請輸入文字內容",
        maxLength: 1000,
        validation: {
          required: false,
          pattern: null,
        },
      },
      number: {
        min: null,
        max: null,
        step: 1,
        decimals: 2,
        format: "decimal", // decimal, percentage, currency
      },
      boolean: {
        trueLabel: "是",
        falseLabel: "否",
        defaultValue: false,
      },
      array: {
        itemType: "string",
        allowAdd: true,
        allowRemove: true,
        maxItems: 100,
        defaultItems: [],
      },
      object: {
        allowNested: true,
        maxDepth: 5,
        schemaValidation: false,
        jsonEditor: true,
      },
    },
    // 數學運算設定
    mathOperations: {
      enabled: false,
      operation: "set", // set, add, subtract, multiply, divide, modulo, power
      operand: "",
      preserveType: true,
    },
    // 變數轉換設定
    valueTransform: {
      enabled: false,
      transforms: [
        {
          type: "uppercase", // uppercase, lowercase, trim, replace, format
          config: {},
        },
      ],
    },
  },
  tags: ["設定", "變數", "資料", "儲存"],
  version: "1.0.0",
  usageHints: [
    "用於設定或更新變數的值",
    "支援多種資料類型（字串、數字、布林值、物件、陣列、JSON）",
    "可以設定變數的作用域（會話、全域、用戶、暫存）",
    "變數名稱建議使用英文和數字，避免特殊字元",
    "提供變數瀏覽器和自動完成功能",
    "支援數學運算和值轉換操作",
    "包含專用的資料類型編輯器",
  ],
  configOptions: [
    // 變數管理器設定
    {
      key: "variableManager",
      label: "變數管理器",
      type: "object",
      description: "變數瀏覽器和管理功能設定",
      properties: {
        showBrowser: { type: "boolean", label: "顯示變數瀏覽器", defaultValue: true },
        allowSelection: { type: "boolean", label: "允許選擇現有變數", defaultValue: true },
        autoComplete: { type: "boolean", label: "啟用自動完成", defaultValue: true },
        showRecent: { type: "boolean", label: "顯示最近使用", defaultValue: true },
        groupByScope: { type: "boolean", label: "依作用域分組", defaultValue: true },
      },
    },
    // 基本變數設定
    {
      key: "variableName",
      label: "變數名稱",
      type: "text",
      defaultValue: "",
      required: true,
      description: "要設定的變數名稱",
      validation: {
        pattern: "^[a-zA-Z_][a-zA-Z0-9_]*$",
        message: "變數名稱只能包含英文字母、數字和底線，且不能以數字開頭",
      },
      features: {
        autoComplete: true,
        variablePicker: true,
        showSuggestions: true,
      },
    },
    {
      key: "valueType",
      label: "資料類型",
      type: "select",
      defaultValue: "string",
      options: [
        { label: "字串 (String)", value: "string" },
        { label: "數字 (Number)", value: "number" },
        { label: "布林值 (Boolean)", value: "boolean" },
        { label: "陣列 (Array)", value: "array" },
        { label: "物件 (Object)", value: "object" },
        { label: "JSON", value: "json" },
      ],
      description: "變數值的資料類型",
    },
    // 字串類型編輯器
    {
      key: "stringEditor",
      label: "字串編輯器",
      type: "object",
      description: "字串類型的專用編輯器設定",
      showWhen: { valueType: "string" },
      properties: {
        multiline: { type: "boolean", label: "多行編輯", defaultValue: false },
        placeholder: { type: "text", label: "提示文字", defaultValue: "請輸入文字內容" },
        maxLength: { type: "number", label: "最大長度", defaultValue: 1000, min: 1, max: 10000 },
        validation: {
          type: "object",
          label: "驗證規則",
          properties: {
            required: { type: "boolean", label: "必填", defaultValue: false },
            pattern: { type: "text", label: "正規表達式", defaultValue: "" },
            customMessage: { type: "text", label: "自訂錯誤訊息", defaultValue: "" },
          },
        },
      },
    },
    // 數字類型編輯器
    {
      key: "numberEditor",
      label: "數字編輯器",
      type: "object",
      description: "數字類型的專用編輯器設定",
      showWhen: { valueType: "number" },
      properties: {
        min: { type: "number", label: "最小值", defaultValue: null },
        max: { type: "number", label: "最大值", defaultValue: null },
        step: { type: "number", label: "步進值", defaultValue: 1 },
        decimals: { type: "number", label: "小數位數", defaultValue: 2, min: 0, max: 10 },
        format: {
          type: "select",
          label: "顯示格式",
          options: [
            { label: "十進位", value: "decimal" },
            { label: "百分比", value: "percentage" },
            { label: "貨幣", value: "currency" },
            { label: "科學記號", value: "scientific" },
          ],
          defaultValue: "decimal",
        },
      },
    },
    // 陣列類型編輯器
    {
      key: "arrayEditor",
      label: "陣列編輯器",
      type: "object",
      description: "陣列類型的專用編輯器設定",
      showWhen: { valueType: "array" },
      properties: {
        itemType: {
          type: "select",
          label: "元素類型",
          options: [
            { label: "字串", value: "string" },
            { label: "數字", value: "number" },
            { label: "布林值", value: "boolean" },
            { label: "混合", value: "mixed" },
          ],
          defaultValue: "string",
        },
        allowAdd: { type: "boolean", label: "允許新增", defaultValue: true },
        allowRemove: { type: "boolean", label: "允許刪除", defaultValue: true },
        allowReorder: { type: "boolean", label: "允許重新排序", defaultValue: true },
        maxItems: { type: "number", label: "最大元素數", defaultValue: 100, min: 1, max: 1000 },
        defaultItems: { type: "array", label: "預設元素", defaultValue: [] },
      },
    },
    // 物件類型編輯器
    {
      key: "objectEditor",
      label: "物件編輯器",
      type: "object",
      description: "物件類型的專用編輯器設定",
      showWhen: { valueType: ["object", "json"] },
      properties: {
        allowNested: { type: "boolean", label: "允許嵌套", defaultValue: true },
        maxDepth: { type: "number", label: "最大深度", defaultValue: 5, min: 1, max: 10 },
        schemaValidation: { type: "boolean", label: "JSON Schema 驗證", defaultValue: false },
        jsonEditor: { type: "boolean", label: "JSON 編輯器", defaultValue: true },
        prettyPrint: { type: "boolean", label: "格式化顯示", defaultValue: true },
      },
    },
    // 數學運算設定
    {
      key: "mathOperations",
      label: "數學運算",
      type: "object",
      description: "數字變數的數學運算功能",
      showWhen: { valueType: "number" },
      properties: {
        enabled: { type: "boolean", label: "啟用數學運算", defaultValue: false },
        operation: {
          type: "select",
          label: "運算類型",
          options: [
            { label: "設定 (=)", value: "set" },
            { label: "加法 (+)", value: "add" },
            { label: "減法 (-)", value: "subtract" },
            { label: "乘法 (×)", value: "multiply" },
            { label: "除法 (÷)", value: "divide" },
            { label: "取餘數 (%)", value: "modulo" },
            { label: "次方 (^)", value: "power" },
            { label: "遞增 (++)", value: "increment" },
            { label: "遞減 (--)", value: "decrement" },
          ],
          defaultValue: "set",
        },
        operand: { type: "text", label: "運算元", defaultValue: "" },
        preserveType: { type: "boolean", label: "保持資料類型", defaultValue: true },
      },
    },
    // 變數值設定（動態）
    {
      key: "variableValue",
      label: "變數值",
      type: "dynamic",
      defaultValue: "",
      required: true,
      description: "要設定的變數值（根據資料類型顯示不同編輯器）",
      editor: {
        string: "text",
        number: "number",
        boolean: "boolean",
        array: "array",
        object: "json",
        json: "json",
      },
    },
    // 作用域設定
    {
      key: "scope",
      label: "作用域",
      type: "select",
      defaultValue: "session",
      options: [
        { label: "會話 (Session)", value: "session" },
        { label: "全域 (Global)", value: "global" },
        { label: "用戶 (User)", value: "user" },
        { label: "暫存 (Temporary)", value: "temporary" },
      ],
      description: "變數的作用域範圍",
      hints: {
        session: "僅在當前對話期間有效",
        global: "在所有對話中共享",
        user: "特定用戶的個人變數",
        temporary: "執行期間的臨時變數",
      },
    },
    // 值轉換設定
    {
      key: "valueTransform",
      label: "值轉換",
      type: "object",
      description: "變數值的轉換和處理功能",
      properties: {
        enabled: { type: "boolean", label: "啟用值轉換", defaultValue: false },
        transforms: {
          type: "array",
          label: "轉換規則",
          itemType: "object",
          defaultValue: [],
          itemProperties: {
            type: {
              type: "select",
              label: "轉換類型",
              options: [
                { label: "轉大寫", value: "uppercase" },
                { label: "轉小寫", value: "lowercase" },
                { label: "去除空白", value: "trim" },
                { label: "取代文字", value: "replace" },
                { label: "格式化", value: "format" },
                { label: "加密", value: "encrypt" },
                { label: "解密", value: "decrypt" },
              ],
            },
            config: { type: "object", label: "設定參數" },
          },
        },
      },
    },
    // 進階設定
    {
      key: "advancedSettings",
      label: "進階設定",
      type: "object",
      description: "變數設定的進階功能",
      properties: {
        validation: { type: "boolean", label: "啟用驗證", defaultValue: true },
        logging: { type: "boolean", label: "記錄變更", defaultValue: false },
        backup: { type: "boolean", label: "自動備份", defaultValue: false },
        encryption: { type: "boolean", label: "加密儲存", defaultValue: false },
        expiration: {
          type: "object",
          label: "過期設定",
          properties: {
            enabled: { type: "boolean", label: "啟用過期", defaultValue: false },
            duration: { type: "number", label: "持續時間 (秒)", defaultValue: 3600 },
            autoCleanup: { type: "boolean", label: "自動清理", defaultValue: true },
          },
        },
      },
    },
  ],
};
