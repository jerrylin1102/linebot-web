import React, { useState } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Trash2, Plus, GripVertical } from "lucide-react";
import { BlockConfigOption } from "../blocks/types";
import ConfigFormField from "../ConfigFormField";

interface ArrayEditorProps {
  /** 配置選項定義 */
  option: BlockConfigOption;
  /** 當前值 */
  value: unknown[];
  /** 值變更回調 */
  onChange: (value: unknown[]) => void;
  /** 是否為只讀模式 */
  readonly?: boolean;
  /** 額外的 CSS 類名 */
  className?: string;
}

/**
 * 陣列編輯器組件
 * 
 * 支援多種陣列項目類型：文字、數字、布林值、物件
 * 提供新增、刪除、排序功能
 * 支援自定義項目模板（物件類型）
 */
const ArrayEditor: React.FC<ArrayEditorProps> = ({
  option,
  value = [],
  onChange,
  readonly = false,
  className = "",
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  const arrayConfig = option.arrayEditor;
  if (!arrayConfig) {
    return <div className="text-red-400">陣列編輯器配置錯誤</div>;
  }

  /**
   * 新增項目
   */
  const addItem = () => {
    if (arrayConfig.maxItems && value.length >= arrayConfig.maxItems) {
      return;
    }

    let newItem: unknown;
    switch (arrayConfig.itemType) {
      case "text":
        newItem = "";
        break;
      case "number":
        newItem = 0;
        break;
      case "boolean":
        newItem = false;
        break;
      case "object":
        // 根據模板建立預設物件
        if (arrayConfig.itemTemplate) {
          newItem = arrayConfig.itemTemplate.reduce((obj, field) => {
            obj[field.key] = field.defaultValue;
            return obj;
          }, {} as Record<string, unknown>);
        } else {
          newItem = {};
        }
        break;
      default:
        newItem = null;
    }

    onChange([...value, newItem]);
  };

  /**
   * 刪除項目
   */
  const removeItem = (index: number) => {
    const newValue = value.filter((_, i) => i !== index);
    onChange(newValue);
  };

  /**
   * 更新項目值
   */
  const updateItem = (index: number, newItemValue: unknown) => {
    const newValue = [...value];
    newValue[index] = newItemValue;
    onChange(newValue);
  };

  /**
   * 拖拽開始
   */
  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (readonly || !arrayConfig.sortable) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  /**
   * 拖拽結束
   */
  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  /**
   * 拖拽懸停
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  /**
   * 放置項目
   */
  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newValue = [...value];
    const draggedItem = newValue[draggedIndex];
    
    // 移除拖拽項目
    newValue.splice(draggedIndex, 1);
    
    // 插入到新位置
    const adjustedDropIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
    newValue.splice(adjustedDropIndex, 0, draggedItem);
    
    onChange(newValue);
    setDraggedIndex(null);
  };

  /**
   * 渲染簡單類型項目
   */
  const renderSimpleItem = (item: unknown, index: number) => {
    const inputProps = {
      value: String(item || ""),
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        let newValue: unknown = e.target.value;
        
        if (arrayConfig.itemType === "number") {
          const numValue = parseFloat(e.target.value);
          newValue = isNaN(numValue) ? 0 : numValue;
        } else if (arrayConfig.itemType === "boolean") {
          newValue = e.target.checked;
        }
        
        updateItem(index, newValue);
      },
      disabled: readonly,
      className: "flex-1 text-black",
    };

    if (arrayConfig.itemType === "boolean") {
      return (
        <input
          type="checkbox"
          checked={Boolean(item)}
          onChange={(e) => updateItem(index, e.target.checked)}
          disabled={readonly}
          className="h-4 w-4"
        />
      );
    }

    return (
      <Input
        type={arrayConfig.itemType === "number" ? "number" : "text"}
        {...inputProps}
      />
    );
  };

  /**
   * 渲染物件類型項目
   */
  const renderObjectItem = (item: Record<string, unknown>, index: number) => {
    if (!arrayConfig.itemTemplate) {
      return <div className="text-amber-400">缺少物件模板配置</div>;
    }

    return (
      <div className="space-y-3 p-3 bg-white/5 rounded border border-white/10">
        {arrayConfig.itemTemplate.map((field) => (
          <ConfigFormField
            key={field.key}
            option={field}
            value={item[field.key]}
            onChange={(newValue) => {
              const updatedItem = { ...item, [field.key]: newValue };
              updateItem(index, updatedItem);
            }}
            readonly={readonly}
          />
        ))}
      </div>
    );
  };

  /**
   * 渲染項目
   */
  const renderItem = (item: unknown, index: number) => {
    const isDragging = draggedIndex === index;
    
    return (
      <div
        key={index}
        draggable={!readonly && arrayConfig.sortable}
        onDragStart={(e) => handleDragStart(e, index)}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, index)}
        className={`
          flex items-start gap-2 p-3 bg-white/5 rounded border border-white/10
          ${isDragging ? 'opacity-50' : ''}
          ${!readonly && arrayConfig.sortable ? 'cursor-move' : ''}
        `}
      >
        {/* 拖拽手柄 */}
        {!readonly && arrayConfig.sortable && (
          <GripVertical className="h-4 w-4 text-white/40 mt-2 flex-shrink-0" />
        )}

        {/* 項目內容 */}
        <div className="flex-1">
          {arrayConfig.itemType === "object" 
            ? renderObjectItem(item as Record<string, unknown>, index)
            : renderSimpleItem(item, index)
          }
        </div>

        {/* 刪除按鈕 */}
        {!readonly && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeItem(index)}
            className="text-red-400 hover:text-red-300 hover:bg-red-400/10 flex-shrink-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  };

  // 檢查是否可以新增項目
  const canAddItem = !readonly && 
    (!arrayConfig.maxItems || value.length < arrayConfig.maxItems);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* 項目列表 */}
      {value.length > 0 ? (
        <div className="space-y-2">
          {value.map((item, index) => renderItem(item, index))}
        </div>
      ) : (
        <div className="text-center py-8 text-white/60 border border-dashed border-white/20 rounded">
          尚未新增任何項目
        </div>
      )}

      {/* 新增按鈕 */}
      {canAddItem && (
        <Button
          variant="outline"
          onClick={addItem}
          className="w-full border-white/20 text-white/80 hover:bg-white/10"
        >
          <Plus className="h-4 w-4 mr-2" />
          {arrayConfig.addItemText || "新增項目"}
        </Button>
      )}

      {/* 項目數量提示 */}
      <div className="text-xs text-white/60 flex justify-between">
        <span>項目數量: {value.length}</span>
        {arrayConfig.maxItems && (
          <span>最多 {arrayConfig.maxItems} 項</span>
        )}
      </div>
    </div>
  );
};

export default ArrayEditor;