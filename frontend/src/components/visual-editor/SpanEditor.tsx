/**
 * Span 編輯器組件
 * 用於管理 Text 積木中的 span contents 陣列
 */

import React, { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Eye,
  Type,
  Bold,
  Italic,
  Underline,
  Strikethrough
} from "lucide-react";
import { SpanElement, FlexSize, FlexWeight } from "../../types/flexProperties";

interface SpanEditorProps {
  value: SpanElement[];
  onChange: (spans: SpanElement[]) => void;
  className?: string;
}

interface SpanPreviewProps {
  spans: SpanElement[];
}

// Span 預覽組件
const SpanPreview: React.FC<SpanPreviewProps> = ({ spans }) => {
  if (!spans || spans.length === 0) {
    return (
      <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500">
        尚未設定任何 Span 元件
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
        <Eye className="h-4 w-4" />
        預覽效果
      </h4>
      <div className="bg-white p-3 rounded border">
        {spans.map((span, index) => (
          <span
            key={index}
            style={{
              fontSize: getSizeValue(span.size),
              fontWeight: getWeightValue(span.weight),
              color: span.color || "#000000",
              textDecoration: span.decoration === "underline" ? "underline" : 
                             span.decoration === "line-through" ? "line-through" : "none",
              fontStyle: span.style === "italic" ? "italic" : "normal"
            }}
          >
            {span.text}
          </span>
        ))}
      </div>
    </div>
  );
};

// 輔助函數
const getSizeValue = (size?: FlexSize): string => {
  const sizeMap = {
    "xs": "0.75rem",
    "sm": "0.875rem", 
    "md": "1rem",
    "lg": "1.125rem",
    "xl": "1.25rem",
    "xxl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
    "5xl": "3rem"
  };
  return sizeMap[size || "md"];
};

const getWeightValue = (weight?: FlexWeight): string => {
  const weightMap = {
    "ultralight": "100",
    "light": "300",
    "regular": "400", 
    "bold": "700"
  };
  return weightMap[weight || "regular"];
};

export const SpanEditor: React.FC<SpanEditorProps> = ({
  value = [],
  onChange,
  className = ""
}) => {
  const [spans, setSpans] = useState<SpanElement[]>(value);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // 更新 spans 並通知父組件
  const updateSpans = (newSpans: SpanElement[]) => {
    setSpans(newSpans);
    onChange(newSpans);
  };

  // 添加新的 span
  const addSpan = () => {
    const newSpan: SpanElement = {
      type: "span",
      text: "新文字",
      size: "md",
      weight: "regular",
      color: "#000000",
      decoration: "none",
      style: "normal"
    };
    
    const newSpans = [...spans, newSpan];
    updateSpans(newSpans);
    setEditingIndex(newSpans.length - 1);
  };

  // 刪除 span
  const deleteSpan = (index: number) => {
    const newSpans = spans.filter((_, i) => i !== index);
    updateSpans(newSpans);
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  // 更新 span 屬性
  const updateSpan = (index: number, field: keyof SpanElement, value: any) => {
    const newSpans = [...spans];
    newSpans[index] = { ...newSpans[index], [field]: value };
    updateSpans(newSpans);
  };

  // 移動 span
  const moveSpan = (fromIndex: number, toIndex: number) => {
    const newSpans = [...spans];
    const [moved] = newSpans.splice(fromIndex, 1);
    newSpans.splice(toIndex, 0, moved);
    updateSpans(newSpans);
  };

  // 渲染 span 編輯表單
  const renderSpanEditor = (span: SpanElement, index: number) => {
    return (
      <Card key={index} className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
              <Type className="h-4 w-4" />
              <span className="text-sm">Span {index + 1}</span>
              <Badge variant="outline">{span.text.substring(0, 10)}{span.text.length > 10 ? "..." : ""}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingIndex(editingIndex === index ? null : index)}
              >
                {editingIndex === index ? "收起" : "編輯"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => deleteSpan(index)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        
        {editingIndex === index && (
          <CardContent className="space-y-4">
            {/* 文字內容 */}
            <div>
              <Label htmlFor={`text-${index}`}>文字內容 *</Label>
              <Textarea
                id={`text-${index}`}
                value={span.text}
                onChange={(e) => updateSpan(index, "text", e.target.value)}
                placeholder="輸入文字內容"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* 字體大小 */}
              <div>
                <Label htmlFor={`size-${index}`}>字體大小</Label>
                <Select 
                  value={span.size || "md"} 
                  onValueChange={(value) => updateSpan(index, "size", value as FlexSize)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="xs">極小 (xs)</SelectItem>
                    <SelectItem value="sm">小 (sm)</SelectItem>
                    <SelectItem value="md">中等 (md)</SelectItem>
                    <SelectItem value="lg">大 (lg)</SelectItem>
                    <SelectItem value="xl">極大 (xl)</SelectItem>
                    <SelectItem value="xxl">超大 (xxl)</SelectItem>
                    <SelectItem value="3xl">巨大 (3xl)</SelectItem>
                    <SelectItem value="4xl">超巨大 (4xl)</SelectItem>
                    <SelectItem value="5xl">極巨大 (5xl)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 字體粗細 */}
              <div>
                <Label htmlFor={`weight-${index}`}>字體粗細</Label>
                <Select 
                  value={span.weight || "regular"} 
                  onValueChange={(value) => updateSpan(index, "weight", value as FlexWeight)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ultralight">超細</SelectItem>
                    <SelectItem value="light">細</SelectItem>
                    <SelectItem value="regular">一般</SelectItem>
                    <SelectItem value="bold">粗體</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* 文字顏色 */}
              <div>
                <Label htmlFor={`color-${index}`}>文字顏色</Label>
                <div className="flex gap-2">
                  <Input
                    id={`color-${index}`}
                    type="color"
                    value={span.color || "#000000"}
                    onChange={(e) => updateSpan(index, "color", e.target.value)}
                    className="w-16 h-10 p-1 border rounded"
                  />
                  <Input
                    value={span.color || "#000000"}
                    onChange={(e) => updateSpan(index, "color", e.target.value)}
                    placeholder="#000000"
                    className="flex-1"
                  />
                </div>
              </div>

              {/* 文字樣式 */}
              <div>
                <Label htmlFor={`style-${index}`}>文字樣式</Label>
                <Select 
                  value={span.style || "normal"} 
                  onValueChange={(value) => updateSpan(index, "style", value as "normal" | "italic")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">
                      <div className="flex items-center gap-2">
                        <Type className="h-4 w-4" />
                        正常
                      </div>
                    </SelectItem>
                    <SelectItem value="italic">
                      <div className="flex items-center gap-2">
                        <Italic className="h-4 w-4" />
                        斜體
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 文字裝飾 */}
            <div>
              <Label htmlFor={`decoration-${index}`}>文字裝飾</Label>
              <Select 
                value={span.decoration || "none"} 
                onValueChange={(value) => updateSpan(index, "decoration", value as "none" | "underline" | "line-through")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    <div className="flex items-center gap-2">
                      <Type className="h-4 w-4" />
                      無裝飾
                    </div>
                  </SelectItem>
                  <SelectItem value="underline">
                    <div className="flex items-center gap-2">
                      <Underline className="h-4 w-4" />
                      底線
                    </div>
                  </SelectItem>
                  <SelectItem value="line-through">
                    <div className="flex items-center gap-2">
                      <Strikethrough className="h-4 w-4" />
                      刪除線
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Type className="h-5 w-5" />
              Span 混合樣式編輯器
            </div>
            <Button onClick={addSpan} size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              新增 Span
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Span 列表 */}
          {spans.length > 0 ? (
            <div className="space-y-2">
              {spans.map((span, index) => renderSpanEditor(span, index))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Type className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>尚未設定任何 Span 元件</p>
              <p className="text-sm">點擊「新增 Span」開始建立混合樣式文字</p>
            </div>
          )}

          {/* 預覽區域 */}
          {spans.length > 0 && <SpanPreview spans={spans} />}

          {/* 使用提示 */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-2">使用提示：</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Span 用於在單一文字元件中創建不同樣式的文字段落</li>
              <li>• 可以設定不同的字體大小、顏色、粗細和裝飾效果</li>
              <li>• 多個 Span 會依序連接顯示，形成豐富的文字效果</li>
              <li>• 拖拽左側的拖拉圖示可以重新排序 Span</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};