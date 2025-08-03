import React, { useState } from "react";
import { Slider } from "../../ui/slider";
import { BlockConfigOption } from "../blocks/types";

interface ConfigSliderProps {
  /** 配置選項定義 */
  option: BlockConfigOption;
  /** 當前值 */
  value: number;
  /** 值變更回調 */
  onChange: (value: number) => void;
  /** 是否為只讀模式 */
  readonly?: boolean;
  /** 額外的 CSS 類名 */
  className?: string;
}

/**
 * 配置滑桿組件
 * 
 * 基於 UI 滑桿組件的配置專用包裝器
 * 支援自定義範圍、步進、標記
 * 提供即時值顯示和格式化
 */
const ConfigSlider: React.FC<ConfigSliderProps> = ({
  option,
  value,
  onChange,
  readonly = false,
  className = "",
}) => {
  const [isDragging, setIsDragging] = useState(false);
  
  const sliderConfig = option.slider;
  if (!sliderConfig) {
    return <div className="text-red-400">滑桿配置錯誤</div>;
  }

  const currentValue = typeof value === "number" ? value : sliderConfig.min;

  /**
   * 處理值變更
   */
  const handleValueChange = (newValue: number[]) => {
    if (readonly) return;
    onChange(newValue[0]);
  };

  /**
   * 處理拖拽開始
   */
  const handleDragStart = () => {
    setIsDragging(true);
  };

  /**
   * 處理拖拽結束
   */
  const handleDragEnd = () => {
    setIsDragging(false);
  };

  /**
   * 格式化顯示值
   */
  const formatValue = (val: number): string => {
    // 如果有自定義標記，嘗試使用標記標籤
    if (sliderConfig.marks) {
      const mark = sliderConfig.marks.find(m => m.value === val);
      if (mark) {
        return mark.label;
      }
    }
    
    // 根據步進值決定小數位數
    const step = sliderConfig.step || 1;
    const decimals = step < 1 ? 2 : step < 0.1 ? 3 : 0;
    
    return val.toFixed(decimals);
  };

  /**
   * 獲取進度百分比
   */
  const getProgressPercentage = (): number => {
    const range = sliderConfig.max - sliderConfig.min;
    const progress = (currentValue - sliderConfig.min) / range;
    return Math.max(0, Math.min(100, progress * 100));
  };

  /**
   * 渲染標記
   */
  const renderMarks = () => {
    if (!sliderConfig.showMarks && !sliderConfig.marks) return null;

    const marks = sliderConfig.marks || [];
    if (marks.length === 0 && sliderConfig.showMarks) {
      // 自動生成標記
      const step = sliderConfig.step || 1;
      const range = sliderConfig.max - sliderConfig.min;
      const markCount = Math.min(11, Math.floor(range / step) + 1); // 最多11個標記
      const markStep = range / (markCount - 1);
      
      for (let i = 0; i < markCount; i++) {
        const markValue = sliderConfig.min + (markStep * i);
        marks.push({
          value: markValue,
          label: formatValue(markValue),
        });
      }
    }

    return (
      <div className="relative mt-2">
        {marks.map((mark) => {
          const percentage = ((mark.value - sliderConfig.min) / (sliderConfig.max - sliderConfig.min)) * 100;
          return (
            <div
              key={mark.value}
              className="absolute transform -translate-x-1/2"
              style={{ left: `${percentage}%` }}
            >
              {/* 標記點 */}
              <div className="w-1 h-1 bg-white/40 rounded-full mx-auto mb-1" />
              {/* 標記標籤 */}
              <div className="text-xs text-white/60 text-center whitespace-nowrap">
                {mark.label}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* 當前值顯示 */}
      <div className="flex justify-between items-center">
        <span className="text-sm text-white/80">
          當前值: <span className="font-mono">{formatValue(currentValue)}</span>
        </span>
        <span className="text-xs text-white/60">
          {sliderConfig.min} - {sliderConfig.max}
        </span>
      </div>

      {/* 進度條視覺指示 */}
      <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
        <div 
          className={`h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-200 ${
            isDragging ? 'shadow-lg shadow-blue-500/30' : ''
          }`}
          style={{ width: `${getProgressPercentage()}%` }}
        />
        {/* 當前值指示器 */}
        <div 
          className={`absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full border-2 border-blue-500 transition-all duration-200 ${
            isDragging ? 'scale-125 shadow-lg' : ''
          }`}
          style={{ left: `${getProgressPercentage()}%` }}
        />
      </div>

      {/* 滑桿控件 */}
      <div className="px-2">
        <Slider
          value={[currentValue]}
          onValueChange={handleValueChange}
          onValueCommit={() => handleDragEnd()}
          min={sliderConfig.min}
          max={sliderConfig.max}
          step={sliderConfig.step || 1}
          disabled={readonly}
          className="w-full"
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        />
      </div>

      {/* 標記 */}
      {renderMarks()}

      {/* 範圍提示 */}
      <div className="flex justify-between text-xs text-white/50">
        <span>{formatValue(sliderConfig.min)}</span>
        <span>{formatValue(sliderConfig.max)}</span>
      </div>

      {/* 步進提示 */}
      {sliderConfig.step && sliderConfig.step !== 1 && (
        <div className="text-xs text-white/50 text-center">
          步進: {sliderConfig.step}
        </div>
      )}
    </div>
  );
};

export default ConfigSlider;