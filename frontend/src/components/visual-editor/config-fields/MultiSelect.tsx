import React, { useState, useRef, useEffect } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Badge } from "../../ui/badge";
import { X, ChevronDown, Plus, Search } from "lucide-react";
import { BlockConfigOption } from "../blocks/types";

interface MultiSelectProps {
  /** 配置選項定義 */
  option: BlockConfigOption;
  /** 當前值 */
  value: string[] | null;
  /** 值變更回調 */
  onChange: (value: string[] | null) => void;
  /** 是否為只讀模式 */
  readonly?: boolean;
  /** 額外的 CSS 類名 */
  className?: string;
}

/**
 * 多選下拉選單組件
 * 
 * 支援多選、搜尋、自定義標籤
 * 提供選擇數量限制
 * 鍵盤操作支援
 */
const MultiSelect: React.FC<MultiSelectProps> = ({
  option,
  value = [],
  onChange,
  readonly = false,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [customTag, setCustomTag] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const multiSelectConfig = option.multiSelect;
  if (!multiSelectConfig) {
    return <div className="text-red-400">多選配置錯誤</div>;
  }

  const selectedValues = Array.isArray(value) ? value : [];

  /**
   * 獲取可選選項（過濾已選擇和搜尋）
   */
  const getAvailableOptions = () => {
    if (!option.options) return [];
    
    return option.options
      .filter(opt => !selectedValues.includes(String(opt.value)))
      .filter(opt => 
        !searchTerm || 
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
      );
  };

  const availableOptions = getAvailableOptions();

  /**
   * 添加選項
   */
  const addOption = (optionValue: string) => {
    if (selectedValues.includes(optionValue)) return;
    
    // 檢查最大選擇數量
    if (multiSelectConfig.maxSelections && 
        selectedValues.length >= multiSelectConfig.maxSelections) {
      return;
    }

    const newValue = [...selectedValues, optionValue];
    onChange(newValue.length > 0 ? newValue : null);
    setSearchTerm("");
    
    // 重新聚焦搜尋框
    if (multiSelectConfig.searchable) {
      setTimeout(() => searchInputRef.current?.focus(), 0);
    }
  };

  /**
   * 移除選項
   */
  const removeOption = (optionValue: string) => {
    const newValue = selectedValues.filter(v => v !== optionValue);
    onChange(newValue.length > 0 ? newValue : null);
  };

  /**
   * 添加自定義標籤
   */
  const addCustomTag = () => {
    if (!customTag.trim() || !multiSelectConfig.allowCustomTags) return;
    
    const tagValue = customTag.trim();
    if (selectedValues.includes(tagValue)) {
      setCustomTag("");
      return;
    }

    // 檢查最大選擇數量
    if (multiSelectConfig.maxSelections && 
        selectedValues.length >= multiSelectConfig.maxSelections) {
      return;
    }

    addOption(tagValue);
    setCustomTag("");
  };

  /**
   * 處理鍵盤事件
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (readonly) return;

    switch (e.key) {
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < availableOptions.length) {
          addOption(String(availableOptions[highlightedIndex].value));
        } else if (multiSelectConfig.allowCustomTags && customTag.trim()) {
          addCustomTag();
        }
        break;
        
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < availableOptions.length - 1 ? prev + 1 : prev
        );
        break;
        
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
        
      case "Escape":
        setIsOpen(false);
        setSearchTerm("");
        setCustomTag("");
        break;
        
      case "Backspace":
        if (!searchTerm && !customTag && selectedValues.length > 0) {
          removeOption(selectedValues[selectedValues.length - 1]);
        }
        break;
    }
  };

  /**
   * 處理點擊外部關閉
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
        setCustomTag("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  /**
   * 重置高亮索引
   */
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [searchTerm, availableOptions.length]);

  /**
   * 獲取選項標籤
   */
  const getOptionLabel = (value: string): string => {
    const option = option.options?.find(opt => String(opt.value) === value);
    return option ? option.label : value;
  };

  /**
   * 檢查是否可以添加更多選項
   */
  const canAddMore = !multiSelectConfig.maxSelections || 
    selectedValues.length < multiSelectConfig.maxSelections;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* 主要輸入區域 */}
      <div
        className={`
          min-h-[40px] border border-white/20 rounded px-3 py-2 bg-white text-black
          ${readonly ? 'bg-gray-100 cursor-not-allowed' : 'cursor-text'}
          ${isOpen ? 'border-blue-400' : 'hover:border-white/40'}
        `}
        onClick={() => !readonly && setIsOpen(true)}
      >
        {/* 已選標籤 */}
        <div className="flex flex-wrap gap-1 mb-1">
          {selectedValues.map((selectedValue) => (
            <Badge
              key={selectedValue}
              variant="secondary"
              className="text-xs bg-blue-100 text-blue-800 hover:bg-blue-200"
            >
              {getOptionLabel(selectedValue)}
              {!readonly && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeOption(selectedValue);
                  }}
                  className="ml-1 hover:text-blue-600"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>

        {/* 搜尋輸入 */}
        {!readonly && isOpen && multiSelectConfig.searchable && (
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="搜尋選項..."
              className="flex-1 outline-none bg-transparent text-sm"
              autoFocus
            />
          </div>
        )}

        {/* 自定義標籤輸入 */}
        {!readonly && isOpen && multiSelectConfig.allowCustomTags && canAddMore && (
          <div className="flex items-center gap-2 mt-1">
            <Plus className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="輸入自定義標籤"
              className="flex-1 outline-none bg-transparent text-sm"
            />
            {customTag.trim() && (
              <Button
                type="button"
                size="sm"
                onClick={addCustomTag}
                className="h-6 px-2 text-xs"
              >
                新增
              </Button>
            )}
          </div>
        )}

        {/* 下拉箭頭 */}
        {!readonly && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <ChevronDown 
              className={`h-4 w-4 text-gray-400 transition-transform ${
                isOpen ? 'rotate-180' : ''
              }`} 
            />
          </div>
        )}
      </div>

      {/* 下拉選項 */}
      {!readonly && isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-white/20 rounded shadow-lg max-h-60 overflow-y-auto">
          {availableOptions.length > 0 ? (
            availableOptions.map((opt, index) => (
              <div
                key={String(opt.value)}
                onClick={() => canAddMore && addOption(String(opt.value))}
                className={`
                  px-3 py-2 cursor-pointer text-sm text-black
                  ${index === highlightedIndex ? 'bg-blue-100' : 'hover:bg-gray-100'}
                  ${!canAddMore ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {opt.label}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-gray-500">
              {searchTerm ? "無符合的選項" : "無可選選項"}
            </div>
          )}
        </div>
      )}

      {/* 選擇狀態提示 */}
      <div className="flex justify-between items-center mt-1 text-xs text-white/60">
        <span>已選擇 {selectedValues.length} 項</span>
        {multiSelectConfig.maxSelections && (
          <span>最多 {multiSelectConfig.maxSelections} 項</span>
        )}
      </div>
    </div>
  );
};

export default MultiSelect;