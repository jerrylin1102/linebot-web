/**
 * 位置回覆積木
 * 回覆地理位置訊息給用戶
 */

import { MapPin } from "lucide-react";
import { BlockDefinition } from "../types";
import { BlockCategory, WorkspaceContext } from "../../../../types/block";

export const locationReply: BlockDefinition = {
  id: "location-reply",
  blockType: "reply",
  category: BlockCategory.REPLY,
  displayName: "回覆位置訊息",
  description: "發送地理位置資訊回覆給用戶",
  icon: MapPin,
  color: "bg-green-500",
  compatibility: [WorkspaceContext.LOGIC],
  defaultData: {
    title: "回覆位置訊息",
    replyType: "location",
    locationTitle: "我的位置",
    address: "台北市信義區市府路1號",
    latitude: 25.0408578889,
    longitude: 121.567904444,
    options: {
      showMap: true,
      enableNavigation: true,
      mapZoom: 15,
      markerColor: "red",
      showAddress: true,
      enableSharing: false,
    },
  },
  tags: ["回覆", "位置", "地圖", "地理", "導航"],
  version: "1.0.0",
  usageHints: [
    "用於發送地理位置資訊給用戶",
    "需要提供位置標題、地址和經緯度座標",
    "用戶可以點擊位置訊息開啟地圖應用程式",
    "經緯度座標用於精確定位",
    "地址資訊用於顯示和搜尋",
  ],
  configOptions: [
    {
      key: "locationTitle",
      label: "位置標題",
      type: "text",
      defaultValue: "我的位置",
      required: true,
      description: "位置的顯示標題",
      validation: {
        min: 1,
        max: 100,
        message: "位置標題長度必須在 1-100 字元之間",
      },
    },
    {
      key: "address",
      label: "地址",
      type: "text",
      defaultValue: "台北市信義區市府路1號",
      required: true,
      description: "位置的詳細地址",
      validation: {
        min: 1,
        max: 200,
        message: "地址長度必須在 1-200 字元之間",
      },
    },
    {
      key: "latitude",
      label: "緯度",
      type: "number",
      defaultValue: 25.0408578889,
      required: true,
      description: "位置的緯度座標（-90 到 90 之間）",
      validation: {
        min: -90,
        max: 90,
        message: "緯度必須在 -90 到 90 之間",
      },
    },
    {
      key: "longitude",
      label: "經度",
      type: "number",
      defaultValue: 121.567904444,
      required: true,
      description: "位置的經度座標（-180 到 180 之間）",
      validation: {
        min: -180,
        max: 180,
        message: "經度必須在 -180 到 180 之間",
      },
    },
    {
      key: "showMap",
      label: "顯示地圖",
      type: "boolean",
      defaultValue: true,
      description: "是否在位置訊息中顯示地圖預覽",
    },
    {
      key: "enableNavigation",
      label: "啟用導航",
      type: "boolean",
      defaultValue: true,
      description: "是否允許用戶點擊位置開啟導航應用程式",
    },
    {
      key: "mapZoom",
      label: "地圖縮放等級",
      type: "number",
      defaultValue: 15,
      description: "地圖的縮放等級（1-20，數字越大越詳細）",
      validation: {
        min: 1,
        max: 20,
        message: "地圖縮放等級必須在 1-20 之間",
      },
    },
    {
      key: "markerColor",
      label: "標記顏色",
      type: "select",
      defaultValue: "red",
      options: [
        { label: "紅色", value: "red" },
        { label: "藍色", value: "blue" },
        { label: "綠色", value: "green" },
        { label: "黃色", value: "yellow" },
        { label: "紫色", value: "purple" },
      ],
      description: "地圖標記的顏色",
    },
    {
      key: "showAddress",
      label: "顯示地址",
      type: "boolean",
      defaultValue: true,
      description: "是否在位置訊息中顯示詳細地址",
    },
    {
      key: "enableSharing",
      label: "允許分享",
      type: "boolean",
      defaultValue: false,
      description: "是否允許用戶分享此位置資訊",
    },
  ],
};