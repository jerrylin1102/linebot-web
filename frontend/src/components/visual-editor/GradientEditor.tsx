/**
 * 漸層背景編輯器組件
 * 用於設定 Box 容器的 linearGradient 背景
 */

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Slider } from "@/components/ui/slider";
import { 
  Plus, 
  Trash2, 
  Palette,
  RotateCw,
  Eye,
  GripVertical
} from "lucide-react";
import { LinearGradient, GradientDirection } from "../../types/flexProperties";

interface GradientEditorProps {
  value: LinearGradient | null;
  onChange: (gradient: LinearGradient | null) => void;
  className?: string;
}

interface ColorStop {
  color: string;
  position: string;
}

// 預設漸層方向選項
const GRADIENT_DIRECTIONS: Array<{ label: string; value: string; angle: string }> = [
  { label: "從上到下", value: "to bottom", angle: "180deg" },
  { label: "從下到上", value: "to top", angle: "0deg" },
  { label: "從左到右", value: "to right", angle: "90deg" },
  { label: "從右到左", value: "to left", angle: "270deg" },
  { label: "左上到右下", value: "to bottom right", angle: "135deg" },
  { label: "右上到左下", value: "to bottom left", angle: "225deg" },
  { label: "左下到右上", value: "to top right", angle: "45deg" },
  { label: "右下到左上", value: "to top left", angle: "315deg" }
];

// 預設漸層模板
const GRADIENT_PRESETS: Array<{ name: string; gradient: LinearGradient }> = [
  {
    name: "藍天",
    gradient: {
      type: "linearGradient",
      angle: "180deg",
      colors: [
        { color: "#87CEEB", position: "0%" },
        { color: "#4682B4", position: "100%" }
      ]
    }
  },
  {
    name: "日落",
    gradient: {
      type: "linearGradient", 
      angle: "180deg",
      colors: [
        { color: "#FF6B6B", position: "0%" },
        { color: "#FFE66D", position: "50%" },
        { color: "#FF6B35", position: "100%" }
      ]
    }
  },
  {
    name: "海洋",
    gradient: {
      type: "linearGradient",
      angle: "45deg",
      colors: [
        { color: "#2196F3", position: "0%" },
        { color: "#21CBF3", position: "100%" }
      ]
    }
  },
  {
    name: "森林",
    gradient: {
      type: "linearGradient",
      angle: "135deg",
      colors: [
        { color: "#4CAF50", position: "0%" },
        { color: "#8BC34A", position: "100%" }
      ]
    }
  },
  {
    name: "紫夢",
    gradient: {
      type: "linearGradient",
      angle: "90deg",
      colors: [
        { color: "#9C27B0", position: "0%" },
        { color: "#E91E63", position: "100%" }
      ]
    }
  }
];

export const GradientEditor: React.FC<GradientEditorProps> = ({
  value,
  onChange,
  className = ""
}) => {
  const [isEnabled, setIsEnabled] = useState<boolean>(!!value);
  const [gradient, setGradient] = useState<LinearGradient>(
    value || {
      type: "linearGradient",
      angle: "180deg",
      colors: [
        { color: "#FFFFFF", position: "0%" },
        { color: "#F0F0F0", position: "100%" }
      ]
    }
  );

  // 更新漸層並通知父組件
  const updateGradient = (newGradient: LinearGradient | null) => {
    if (newGradient) {
      setGradient(newGradient);
    }
    onChange(newGradient);
  };

  // 切換漸層啟用狀態
  const toggleGradient = (enabled: boolean) => {
    setIsEnabled(enabled);
    updateGradient(enabled ? gradient : null);
  };

  // 更新漸層角度
  const updateAngle = (angle: string) => {
    const newGradient = { ...gradient, angle };
    setGradient(newGradient);
    if (isEnabled) {
      updateGradient(newGradient);
    }
  };

  // 添加顏色站點
  const addColorStop = () => {
    const newColorStop = {
      color: "#000000",
      position: "50%"
    };
    
    const newGradient = {
      ...gradient,
      colors: [...gradient.colors, newColorStop]
    };
    
    setGradient(newGradient);
    if (isEnabled) {
      updateGradient(newGradient);
    }
  };

  // 刪除顏色站點
  const removeColorStop = (index: number) => {
    if (gradient.colors.length <= 2) return; // 至少保留兩個顏色
    
    const newGradient = {
      ...gradient,
      colors: gradient.colors.filter((_, i) => i !== index)
    };
    
    setGradient(newGradient);
    if (isEnabled) {
      updateGradient(newGradient);
    }
  };

  // 更新顏色站點
  const updateColorStop = (index: number, field: 'color' | 'position', value: string) => {
    const newGradient = {
      ...gradient,
      colors: gradient.colors.map((stop, i) => 
        i === index ? { ...stop, [field]: value } : stop
      )
    };
    
    setGradient(newGradient);
    if (isEnabled) {
      updateGradient(newGradient);
    }
  };

  // 應用預設模板
  const applyPreset = (preset: LinearGradient) => {
    setGradient(preset);
    if (isEnabled) {
      updateGradient(preset);
    }
  };

  // 生成漸層 CSS
  const generateGradientCSS = (grad: LinearGradient): string => {
    const colorStops = grad.colors
      .map(stop => `${stop.color} ${stop.position}`)
      .join(", ");
    return `linear-gradient(${grad.angle || "180deg"}, ${colorStops})`;
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              漸層背景編輯器
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="enable-gradient" className="text-sm">啟用漸層</Label>
              <input
                id="enable-gradient"
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => toggleGradient(e.target.checked)}
                className="w-4 h-4"
              />
            </div>
          </CardTitle>
        </CardHeader>

        {isEnabled && (
          <CardContent className="space-y-6">
            {/* 漸層方向設定 */}
            <div>
              <Label>漸層方向</Label>
              <div className="mt-2 space-y-3">
                <Select
                  value={gradient.angle}
                  onValueChange={updateAngle}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADIENT_DIRECTIONS.map((dir) => (
                      <SelectItem key={dir.angle} value={dir.angle}>
                        {dir.label} ({dir.angle})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* 自定義角度 */}
                <div>
                  <Label className="text-sm text-gray-600">自定義角度: {gradient.angle}</Label>
                  <input
                    type="range"
                    value={parseInt(gradient.angle?.replace('deg', '') || '0')}
                    onChange={(e) => updateAngle(`${e.target.value}deg`)}
                    max="360"
                    min="0"
                    step="1"
                    className="w-full mt-2 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* 顏色站點設定 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>顏色站點</Label>
                <Button onClick={addColorStop} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  新增顏色
                </Button>
              </div>
              
              <div className="space-y-3">
                {gradient.colors.map((colorStop, index) => (
                  <Card key={index} className="p-3">
                    <div className="flex items-center gap-3">
                      <GripVertical className="h-4 w-4 text-gray-400" />
                      
                      {/* 顏色選擇器 */}
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={colorStop.color}
                          onChange={(e) => updateColorStop(index, 'color', e.target.value)}
                          className="w-10 h-8 border rounded cursor-pointer"
                        />
                        <Input
                          value={colorStop.color}
                          onChange={(e) => updateColorStop(index, 'color', e.target.value)}
                          placeholder="#000000"
                          className="w-24"
                        />
                      </div>

                      {/* 位置設定 */}
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">位置:</Label>
                        <Input
                          value={colorStop.position}
                          onChange={(e) => updateColorStop(index, 'position', e.target.value)}
                          placeholder="0%"
                          className="w-16"
                        />
                      </div>

                      {/* 刪除按鈕 */}
                      {gradient.colors.length > 2 && (
                        <Button
                          onClick={() => removeColorStop(index)}
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* 預設模板 */}
            <div>
              <Label>預設模板</Label>
              <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                {GRADIENT_PRESETS.map((preset, index) => (
                  <Button
                    key={index}
                    onClick={() => applyPreset(preset.gradient)}
                    variant="outline"
                    className="h-12 p-2 text-xs"
                    style={{
                      background: generateGradientCSS(preset.gradient),
                      color: "white",
                      textShadow: "1px 1px 2px rgba(0,0,0,0.8)"
                    }}
                  >
                    {preset.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* 即時預覽 */}
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Eye className="h-4 w-4" />
                即時預覽
              </Label>
              <div
                className="w-full h-20 border rounded-lg"
                style={{
                  background: generateGradientCSS(gradient)
                }}
              />
              <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono break-all">
                {generateGradientCSS(gradient)}
              </div>
            </div>

            {/* 使用提示 */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-2">使用提示：</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 漸層會覆蓋原本的 backgroundColor 設定</li>
                <li>• 可以添加多個顏色站點創建複雜的漸層效果</li>
                <li>• 調整角度可以改變漸層的方向</li>
                <li>• 顏色位置使用百分比（如 0%, 50%, 100%）</li>
                <li>• 點擊預設模板可以快速應用常用漸層</li>
              </ul>
            </div>
          </CardContent>
        )}

        {!isEnabled && (
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <Palette className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>啟用漸層背景來開始設定</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};