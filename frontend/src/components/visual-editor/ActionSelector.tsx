/**
 * Action 選擇器組件
 * 用於選擇和配置不同類型的 LINE Bot Action
 */

import React, { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ActionType, 
  LineAction, 
  PostbackAction,
  MessageAction,
  UriAction,
  ACTION_TYPE_CONFIG, 
  createDefaultAction,
  validateAction 
} from "../../types/lineActions";
import { 
  ExternalLink, 
  Camera, 
  Image, 
  MapPin, 
  Calendar, 
  Menu, 
  Copy, 
  MessageSquare, 
  Send 
} from "lucide-react";

interface ActionSelectorProps {
  value: LineAction;
  onChange: (action: LineAction) => void;
  className?: string;
}

// 圖標對應
const iconMap = {
  ExternalLink,
  Camera,
  Image,
  MapPin,
  Calendar,
  Menu,
  Copy,
  MessageSquare,
  Send
};

export const ActionSelector: React.FC<ActionSelectorProps> = ({
  value,
  onChange,
  className = ""
}) => {
  const [selectedType, setSelectedType] = useState<ActionType>(value.type as ActionType);
  const [actionData, setActionData] = useState<LineAction>(value);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // 處理Action類型變更
  const handleTypeChange = (newType: ActionType) => {
    setSelectedType(newType);
    const newAction = createDefaultAction(newType);
    setActionData(newAction);
    
    // 驗證新的Action
    const validation = validateAction(newAction);
    setValidationErrors(validation.errors);
    
    onChange(newAction);
  };

  // 處理Action數據變更
  const handleDataChange = (field: string, value: string) => {
    const updatedAction = {
      ...actionData,
      [field]: value
    };
    
    setActionData(updatedAction);
    
    // 驗證更新後的Action
    const validation = validateAction(updatedAction);
    setValidationErrors(validation.errors);
    
    if (validation.isValid) {
      onChange(updatedAction);
    }
  };

  // 渲染Action特定的配置欄位
  const renderActionFields = () => {
    
    switch (selectedType) {
      case ActionType.POSTBACK: {
        const postback = actionData as PostbackAction;
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="data">回傳數據 *</Label>
              <Input
                id="data"
                value={postback.data || ""}
                onChange={(e) => handleDataChange("data", e.target.value)}
                placeholder="輸入回傳給機器人的數據"
              />
            </div>
            <div>
              <Label htmlFor="text">顯示文字</Label>
              <Input
                id="text"
                value={postback.text || ""}
                onChange={(e) => handleDataChange("text", e.target.value)}
                placeholder="在聊天室顯示的文字（可選）"
              />
            </div>
          </div>
        );
      }

      case ActionType.MESSAGE: {
        const message = actionData as MessageAction;
        return (
          <div>
            <Label htmlFor="text">訊息內容 *</Label>
            <Input
              id="text"
              value={message.text || ""}
              onChange={(e) => handleDataChange("text", e.target.value)}
              placeholder="輸入要發送的訊息"
            />
          </div>
        );
      }

      case ActionType.URI: {
        const uri = actionData as UriAction;
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="uri">網址 *</Label>
              <Input
                id="uri"
                type="url"
                value={uri.uri || ""}
                onChange={(e) => handleDataChange("uri", e.target.value)}
                placeholder="https://example.com"
              />
            </div>
            <div>
              <Label htmlFor="desktop-uri">桌面版網址</Label>
              <Input
                id="desktop-uri"
                type="url"
                value={uri.altUri?.desktop || ""}
                onChange={(e) => handleDataChange("altUri", { desktop: e.target.value })}
                placeholder="桌面版專用網址（可選）"
              />
            </div>
          </div>
        );
      }

      case ActionType.DATETIME_PICKER: {
        const datetime = actionData as { data?: string; mode?: string; initial?: string; max?: string; min?: string };
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="data">回傳數據 *</Label>
              <Input
                id="data"
                value={datetime.data || ""}
                onChange={(e) => handleDataChange("data", e.target.value)}
                placeholder="回傳的數據識別碼"
              />
            </div>
            <div>
              <Label htmlFor="mode">選擇模式 *</Label>
              <Select 
                value={datetime.mode || "datetime"} 
                onValueChange={(value) => handleDataChange("mode", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">僅日期</SelectItem>
                  <SelectItem value="time">僅時間</SelectItem>
                  <SelectItem value="datetime">日期和時間</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="initial">初始值</Label>
              <Input
                id="initial"
                type="datetime-local"
                value={datetime.initial || ""}
                onChange={(e) => handleDataChange("initial", e.target.value)}
              />
            </div>
          </div>
        );
      }

      case ActionType.RICHMENU_SWITCH: {
        const richmenu = actionData as { richMenuAliasId?: string; data?: string };
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="alias">選單別名 *</Label>
              <Input
                id="alias"
                value={richmenu.richMenuAliasId || ""}
                onChange={(e) => handleDataChange("richMenuAliasId", e.target.value)}
                placeholder="輸入豐富選單別名"
              />
            </div>
            <div>
              <Label htmlFor="data">回傳數據 *</Label>
              <Input
                id="data"
                value={richmenu.data || ""}
                onChange={(e) => handleDataChange("data", e.target.value)}
                placeholder="回傳的數據"
              />
            </div>
          </div>
        );
      }

      case ActionType.CLIPBOARD: {
        const clipboard = actionData as { clipboardText?: string };
        return (
          <div>
            <Label htmlFor="clipboardText">複製內容 *</Label>
            <Input
              id="clipboardText"
              value={clipboard.clipboardText || ""}
              onChange={(e) => handleDataChange("clipboardText", e.target.value)}
              placeholder="輸入要複製到剪貼板的文字"
            />
          </div>
        );
      }

      default:
        return (
          <p className="text-sm text-muted-foreground">
            此Action類型無需額外配置
          </p>
        );
    }
  };

  const currentConfig = ACTION_TYPE_CONFIG[selectedType];
  const IconComponent = iconMap[currentConfig.icon as keyof typeof iconMap];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {IconComponent && <IconComponent className="h-5 w-5" />}
          Action 設定
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Action 類型選擇 */}
        <div>
          <Label htmlFor="action-type">Action 類型</Label>
          <Select value={selectedType} onValueChange={handleTypeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.values(ActionType).map((type) => {
                const config = ACTION_TYPE_CONFIG[type];
                const Icon = iconMap[config.icon as keyof typeof iconMap];
                return (
                  <SelectItem key={type} value={type}>
                    <div className="flex items-center gap-2">
                      {Icon && <Icon className="h-4 w-4" />}
                      <span>{config.displayName}</span>
                      <Badge variant="outline" className="ml-auto">
                        {config.category}
                      </Badge>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground mt-1">
            {currentConfig.description}
          </p>
        </div>

        {/* 按鈕標籤 */}
        <div>
          <Label htmlFor="label">按鈕標籤</Label>
          <Input
            id="label"
            value={actionData.label || ""}
            onChange={(e) => handleDataChange("label", e.target.value)}
            placeholder="輸入按鈕顯示文字"
          />
        </div>

        {/* Action特定欄位 */}
        {renderActionFields()}

        {/* 驗證錯誤顯示 */}
        {validationErrors.length > 0 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <h4 className="text-sm font-medium text-red-800 mb-2">配置錯誤：</h4>
            <ul className="text-sm text-red-700 space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 使用提示 */}
        {currentConfig.category && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <h4 className="text-sm font-medium text-blue-800 mb-2">使用提示：</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              {ACTION_TYPE_CONFIG[selectedType].description && (
                <li>• {ACTION_TYPE_CONFIG[selectedType].description}</li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};