import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import ErrorBoundary from "../ui/ErrorBoundary";
import { useErrorHandler } from "../../hooks/useErrorHandler";
import PreviewErrorHandler from "../../services/PreviewErrorHandler";
import { Copy, Download, Eye, AlertTriangle, RefreshCw } from "lucide-react";

interface BlockData {
  [key: string]: unknown;
}

interface Block {
  blockType: string;
  blockData: BlockData;
}

interface FlexMessagePreviewProps {
  blocks: Block[];
  onError?: (error: Error) => void;
}

// 簡化的 Flex Message 生成器
class FlexMessageGenerator {
  generateFlexMessage(blocks: Block[]): Record<string, unknown> {
    if (!blocks || !Array.isArray(blocks)) {
      throw new Error("Invalid blocks data: blocks must be an array");
    }
    const bubble = {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [],
      },
    };

    try {
      blocks.forEach((block, index) => {
        if (!block || typeof block !== "object") {
          throw new Error(`Invalid block at index ${index}: block must be an object`);
        }
        
        if (!block.blockType) {
          throw new Error(`Invalid block at index ${index}: missing blockType`);
        }
        
        if (!block.blockData || typeof block.blockData !== "object") {
          throw new Error(`Invalid block at index ${index}: invalid blockData`);
        }

        if (block.blockType === "flex-content") {
          switch (block.blockData.contentType) {
          case "text":
            bubble.body.contents.push({
              type: "text",
              text: block.blockData.text || "示例文字",
              size: block.blockData.size || "md",
              weight: block.blockData.weight || "regular",
              color: block.blockData.color || "#000000",
            });
            break;
          case "image":
            bubble.body.contents.push({
              type: "image",
              url: block.blockData.url || "https://via.placeholder.com/300x200",
            });
            break;
          case "button":
            bubble.body.contents.push({
              type: "button",
              action: {
                type: "message",
                label: block.blockData.text || "按鈕",
                text: block.blockData.text || "按鈕被點擊",
              },
            });
            break;
          case "separator":
            bubble.body.contents.push({
              type: "separator",
              margin: "md",
            });
            break;
          case "video":
            bubble.body.contents.push({
              type: "video",
              url: block.blockData.url || "https://example.com/video.mp4",
              previewUrl: block.blockData.previewUrl || "https://via.placeholder.com/300x200",
              aspectRatio: block.blockData.properties?.aspectRatio || "20:13",
              aspectMode: block.blockData.properties?.aspectMode || "cover",
              backgroundColor: block.blockData.properties?.backgroundColor || "#FFFFFF",
            });
            break;
          case "icon":
            bubble.body.contents.push({
              type: "icon",
              url: block.blockData.url || "https://via.placeholder.com/24x24",
              size: block.blockData.properties?.size || "md",
              margin: block.blockData.properties?.margin || "none",
            });
            break;
          case "span":
            // Span 元件需要在 text 元件的 contents 中使用
            bubble.body.contents.push({
              type: "text",
              text: "",
              contents: [{
                type: "span",
                text: block.blockData.text || "跨段文字",
                size: block.blockData.properties?.size || "md",
                weight: block.blockData.properties?.weight || "regular",
                color: block.blockData.properties?.color || "#000000",
                decoration: block.blockData.properties?.decoration || "none",
                style: block.blockData.properties?.style || "normal",
              }]
            });
            break;
          default:
            console.warn(`Unknown content type: ${block.blockData.contentType}`);
          }
        }
      });
    } catch (error) {
      throw new Error(`Flex message generation failed: ${(error as Error).message}`);
    }

    return bubble;
  }

  generatePreviewHTML(flexMessage: Record<string, unknown>): string {
    try {
      if (!flexMessage || !flexMessage.body) {
        return '<div class="text-gray-500 text-center py-8">請加入 Flex 組件來設計您的訊息</div>';
      }

      if (!flexMessage.body.contents || !Array.isArray(flexMessage.body.contents)) {
        throw new Error("Invalid flex message structure: body.contents must be an array");
      }

    let html =
      '<div class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm" style="max-width: 300px;">';

    flexMessage.body.contents.forEach((content: Record<string, unknown>) => {
      switch (content.type) {
        case "text":
          let textContent = content.text || "";
          // 處理 span contents
          if (content.contents && Array.isArray(content.contents)) {
            textContent = content.contents.map((span: any) => {
              if (span.type === "span") {
                const spanStyle = [
                  span.color ? `color: ${span.color}` : "",
                  span.size ? `font-size: ${this.getSizeInPx(span.size)}` : "",
                  span.weight ? `font-weight: ${span.weight}` : "",
                  span.decoration && span.decoration !== "none" ? `text-decoration: ${span.decoration}` : "",
                  span.style && span.style !== "normal" ? `font-style: ${span.style}` : "",
                ].filter(Boolean).join("; ");
                return `<span style="${spanStyle}">${span.text}</span>`;
              }
              return span.text || "";
            }).join("");
          }
          html += `<div class="mb-2" style="color: ${content.color}; font-size: ${this.getSizeInPx(content.size)}; font-weight: ${content.weight}">${textContent}</div>`;
          break;
        case "image":
          html += `<img src="${content.url}" class="w-full rounded mb-2" style="max-height: 200px; object-fit: cover;" />`;
          break;
        case "button":
          html += `<button class="w-full bg-blue-500 text-white py-2 px-4 rounded mb-2 hover:bg-blue-600">${content.action.label}</button>`;
          break;
        case "separator":
          html += '<hr class="my-2 border-gray-300" />';
          break;
        case "video":
          html += `<div class="relative mb-2" style="background-color: ${content.backgroundColor || '#000'}; aspect-ratio: ${content.aspectRatio?.replace(':', ' / ') || '20 / 13'};">`;
          if (content.previewUrl) {
            html += `<img src="${content.previewUrl}" class="w-full h-full object-${content.aspectMode === 'fit' ? 'contain' : 'cover'}" />`;
          }
          html += '<div class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">';
          html += '<div class="w-12 h-12 bg-white bg-opacity-80 rounded-full flex items-center justify-center">';
          html += '<div class="w-0 h-0 border-l-4 border-l-gray-800 border-t-2 border-t-transparent border-b-2 border-b-transparent ml-1"></div>';
          html += '</div></div></div>';
          break;
        case "icon":
          const iconSizeMap: { [key: string]: string } = {
            xs: "16px", sm: "20px", md: "24px", lg: "28px", xl: "32px",
            xxl: "36px", "3xl": "40px", "4xl": "44px", "5xl": "48px"
          };
          const iconSize = iconSizeMap[content.size] || "24px";
          html += `<img src="${content.url}" class="inline-block" style="width: ${iconSize}; height: ${iconSize}; margin: ${content.margin || 'none'};" />`;
          break;
      }
    });

      html += "</div>";
      return html;
    } catch (error) {
      console.error("Preview HTML generation failed:", error);
      return `<div class="text-red-500 text-center py-8 border border-red-200 rounded bg-red-50">
        預覽生成失敗: ${(error as Error).message}
      </div>`;
    }
  }

  private getSizeInPx(size: string): string {
    const sizeMap: { [key: string]: string } = {
      xs: "12px",
      sm: "14px",
      md: "16px",
      lg: "18px",
      xl: "20px",
    };
    return sizeMap[size] || "16px";
  }
}

const FlexMessagePreview: React.FC<FlexMessagePreviewProps> = ({ blocks, onError }) => {
  const [flexMessage, setFlexMessage] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [previewHTML, setPreviewHTML] = useState("");
  const [generator] = useState(new FlexMessageGenerator());
  const [hasError, setHasError] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const { handleErrorAsync } = useErrorHandler();
  const previewErrorHandler = PreviewErrorHandler.getInstance();

  useEffect(() => {
    const generatePreview = async () => {
      try {
        setHasError(false);
        
        if (blocks && blocks.length > 0) {
          // 驗證積木數據
          const validation = previewErrorHandler.validatePreviewData(blocks);
          if (!validation.isValid) {
            await previewErrorHandler.handlePreviewDataError(
              blocks,
              validation.errors,
              { component: "FlexMessagePreview", operation: "validate" }
            );
            throw new Error(`預覽數據驗證失敗: ${validation.errors.join(", ")}`);
          }

          const generated = generator.generateFlexMessage(blocks);
          setFlexMessage(generated);
          setPreviewHTML(generator.generatePreviewHTML(generated));
        } else {
          setFlexMessage(null);
          setPreviewHTML(
            '<div class="text-gray-500 text-center py-8">請加入 Flex 組件來設計您的訊息</div>'
          );
        }
      } catch (error) {
        console.error("Preview generation error:", error);
        setHasError(true);
        
        // 處理預覽錯誤
        await handleErrorAsync(
          async () => {
            // 將 blocks 轉換為 UnifiedBlock 格式
            const unifiedBlocks = blocks.map((block, index) => ({
              id: `block-${index}`,
              blockType: block.blockType,
              category: "flex-content" as any,
              blockData: block.blockData,
              compatibility: [],
            }));

            await previewErrorHandler.handleFlexPreviewError(
              error as Error,
              unifiedBlocks,
              { component: "FlexMessagePreview", operation: "generate" }
            );
            throw error;
          },
          { component: "FlexMessagePreview", operation: "previewGeneration" }
        );

        onError?.(error as Error);
        
        // 設置錯誤預覽
        setPreviewHTML(
          `<div class="text-red-500 text-center py-8 border border-red-200 rounded bg-red-50">
            <div class="mb-2">⚠️ 預覽生成失敗</div>
            <div class="text-sm">${(error as Error).message}</div>
          </div>`
        );
      }
    };

    generatePreview();
  }, [blocks, generator, handleErrorAsync, previewErrorHandler, onError]);

  const handleRetry = async () => {
    setIsRetrying(true);
    setHasError(false);
    
    try {
      if (blocks && blocks.length > 0) {
        const generated = generator.generateFlexMessage(blocks);
        setFlexMessage(generated);
        setPreviewHTML(generator.generatePreviewHTML(generated));
      }
    } catch (error) {
      setHasError(true);
      onError?.(error as Error);
    } finally {
      setIsRetrying(false);
    }
  };

  const copyFlexMessage = async () => {
    try {
      if (flexMessage) {
        await navigator.clipboard.writeText(JSON.stringify(flexMessage, null, 2));
      }
    } catch (error) {
      await handleErrorAsync(
        async () => {
          throw error;
        },
        { component: "FlexMessagePreview", operation: "copy" }
      );
    }
  };

  const downloadFlexMessage = async () => {
    try {
      if (flexMessage) {
        const blob = new Blob([JSON.stringify(flexMessage, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "flex-message.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      await handleErrorAsync(
        async () => {
          throw error;
        },
        { component: "FlexMessagePreview", operation: "download" }
      );
    }
  };

  return (
    <ErrorBoundary 
      level="section"
      onError={(error) => {
        setHasError(true);
        onError?.(error.originalError || new Error(error.message));
      }}
    >
      <div 
        className="bg-white rounded-lg border border-gray-200 p-4 h-full flex flex-col"
        data-testid="flex-message-preview"
        data-flex-preview
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-600 flex items-center">
            {hasError ? (
              <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
            ) : (
              <Eye className="w-5 h-5 mr-2" />
            )}
            即時預覽 {hasError && "- 錯誤"}
          </h3>
          <div className="flex space-x-2">
            {hasError && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRetry}
                disabled={isRetrying}
              >
                {isRetrying ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                重試
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={copyFlexMessage}
              disabled={!flexMessage || hasError}
            >
              <Copy className="w-4 h-4 mr-2" />
              複製 JSON
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={downloadFlexMessage}
              disabled={!flexMessage || hasError}
            >
              <Download className="w-4 h-4 mr-2" />
              下載
            </Button>
          </div>
        </div>

      {/* 預覽區域 */}
      <div className="flex-1 bg-gray-50 rounded-lg p-4 overflow-auto">
        <div className="max-w-sm mx-auto">
          <div
            className="flex-message-preview"
            dangerouslySetInnerHTML={{ __html: previewHTML }}
          />
        </div>
      </div>

      {/* JSON 預覽 */}
      {flexMessage && (
        <div className="mt-4 border-t pt-4">
          <h4 className="text-sm font-medium text-gray-600 mb-2">
            Flex Message JSON:
          </h4>
          <div className="bg-gray-900 rounded p-3 max-h-32 overflow-auto">
            <pre className="text-green-400 text-xs font-mono">
              {JSON.stringify(flexMessage, null, 2)}
            </pre>
          </div>
        </div>
      )}

        <div className="mt-2 text-xs text-gray-500">
          💡 這個預覽模擬了 LINE 中 Flex Message 的外觀
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default FlexMessagePreview;
