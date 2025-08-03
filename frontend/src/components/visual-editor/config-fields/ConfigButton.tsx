import React, { useState } from "react";
import { Button } from "../../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "../../ui/sheet";
import { BlockConfigOption } from "../blocks/types";
import { ExternalLink, Settings, Edit, Plus } from "lucide-react";

interface ConfigButtonProps {
  /** 配置選項定義 */
  option: BlockConfigOption;
  /** 當前值 */
  value: unknown;
  /** 值變更回調 */
  onChange: (value: unknown) => void;
  /** 是否為只讀模式 */
  readonly?: boolean;
  /** 額外的 CSS 類名 */
  className?: string;
}

/**
 * 配置按鈕組件
 * 
 * 支援多種動作類型：開啟對話框、抽屜、導航等
 * 提供自定義按鈕樣式和動作參數
 * 可用於開啟複雜的設計器或配置面板
 */
const ConfigButton: React.FC<ConfigButtonProps> = ({
  option,
  value,
  onChange,
  readonly = false,
  className = "",
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  const buttonConfig = option.button;
  if (!buttonConfig) {
    return <div className="text-red-400">按鈕配置錯誤</div>;
  }

  /**
   * 獲取按鈕圖示
   */
  const getButtonIcon = () => {
    const iconProps = { className: "h-4 w-4" };
    
    switch (buttonConfig.actionType) {
      case "open-dialog":
        return <Settings {...iconProps} />;
      case "open-drawer":
        return <Edit {...iconProps} />;
      case "navigate":
        return <ExternalLink {...iconProps} />;
      default:
        return <Plus {...iconProps} />;
    }
  };

  /**
   * 處理按鈕點擊
   */
  const handleClick = () => {
    if (readonly) return;

    switch (buttonConfig.actionType) {
      case "open-dialog":
        setIsDialogOpen(true);
        break;
        
      case "open-drawer":
        setIsSheetOpen(true);
        break;
        
      case "navigate":
        if (buttonConfig.actionParams?.url) {
          window.open(String(buttonConfig.actionParams.url), "_blank");
        }
        break;
        
      case "custom":
        // 觸發自定義動作
        if (buttonConfig.actionParams?.callback) {
          const callback = buttonConfig.actionParams.callback as Function;
          callback(value, onChange);
        } else {
          // 預設行為：設定或切換值
          onChange(!value);
        }
        break;
        
      default:
        onChange(!value);
    }
  };

  /**
   * 渲染對話框內容
   */
  const renderDialogContent = () => {
    const title = buttonConfig.actionParams?.title as string || "設定";
    const description = buttonConfig.actionParams?.description as string || option.description;
    
    return (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
          
          <div className="space-y-4">
            {/* 這裡可以根據 actionParams 渲染不同的內容 */}
            {buttonConfig.actionParams?.content ? (
              <div dangerouslySetInnerHTML={{ 
                __html: String(buttonConfig.actionParams.content) 
              }} />
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>此功能正在開發中...</p>
                <p className="text-sm mt-2">當前值: {String(value || "未設定")}</p>
              </div>
            )}
            
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                取消
              </Button>
              <Button
                onClick={() => {
                  // 儲存邏輯
                  setIsDialogOpen(false);
                }}
              >
                確定
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  /**
   * 渲染抽屜內容
   */
  const renderSheetContent = () => {
    const title = buttonConfig.actionParams?.title as string || "設定";
    const description = buttonConfig.actionParams?.description as string || option.description;
    
    return (
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
            {description && (
              <SheetDescription>{description}</SheetDescription>
            )}
          </SheetHeader>
          
          <div className="space-y-4 mt-6">
            {buttonConfig.actionParams?.content ? (
              <div dangerouslySetInnerHTML={{ 
                __html: String(buttonConfig.actionParams.content) 
              }} />
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Edit className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>此功能正在開發中...</p>
                <p className="text-sm mt-2">當前值: {String(value || "未設定")}</p>
              </div>
            )}
            
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setIsSheetOpen(false)}
              >
                取消
              </Button>
              <Button
                onClick={() => {
                  // 儲存邏輯
                  setIsSheetOpen(false);
                }}
              >
                確定
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  };

  /**
   * 獲取按鈕文字
   */
  const getButtonText = () => {
    if (buttonConfig.actionParams?.buttonText) {
      return String(buttonConfig.actionParams.buttonText);
    }
    
    switch (buttonConfig.actionType) {
      case "open-dialog":
        return "開啟設定";
      case "open-drawer":
        return "開啟編輯器";
      case "navigate":
        return "開啟連結";
      default:
        return option.label;
    }
  };

  /**
   * 獲取按鈕狀態顯示
   */
  const getStatusText = () => {
    if (!value) return null;
    
    if (typeof value === "boolean") {
      return value ? "已啟用" : "已停用";
    }
    
    if (typeof value === "string" && value.length > 0) {
      return "已設定";
    }
    
    if (typeof value === "object" && value !== null) {
      return "已配置";
    }
    
    return null;
  };

  const statusText = getStatusText();

  return (
    <div className={`space-y-2 ${className}`}>
      {/* 主要按鈕 */}
      <Button
        variant={buttonConfig.variant || "outline"}
        size={buttonConfig.size || "default"}
        onClick={handleClick}
        disabled={readonly}
        className="w-full justify-start border-white/20 text-white/80 hover:bg-white/10"
      >
        {getButtonIcon()}
        <span className="ml-2">{getButtonText()}</span>
        {statusText && (
          <span className="ml-auto text-xs opacity-70">
            {statusText}
          </span>
        )}
      </Button>

      {/* 狀態描述 */}
      {option.description && (
        <div className="text-xs text-white/60">
          {option.description}
        </div>
      )}

      {/* 當前值顯示 */}
      {value && buttonConfig.actionType !== "navigate" && (
        <div className="text-xs text-white/50 bg-white/5 rounded px-2 py-1 font-mono">
          {typeof value === "object" 
            ? JSON.stringify(value, null, 2).substring(0, 100) + "..."
            : String(value)
          }
        </div>
      )}

      {/* 渲染對話框 */}
      {renderDialogContent()}
      
      {/* 渲染抽屜 */}
      {renderSheetContent()}
    </div>
  );
};

export default ConfigButton;