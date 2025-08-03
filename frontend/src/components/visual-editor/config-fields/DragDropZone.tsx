import React, { useState, useRef } from "react";
import { Upload, X, File, Image, Grid, List } from "lucide-react";
import { Button } from "../../ui/button";
import { BlockConfigOption } from "../blocks/types";

interface DragDropZoneProps {
  /** 配置選項定義 */
  option: BlockConfigOption;
  /** 當前值 */
  value: string | string[] | null;
  /** 值變更回調 */
  onChange: (value: string | string[] | null) => void;
  /** 是否為只讀模式 */
  readonly?: boolean;
  /** 額外的 CSS 類名 */
  className?: string;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploading?: boolean;
  error?: string;
}

/**
 * 拖拽上傳區域組件
 * 
 * 支援拖拽檔案上傳和點擊選擇
 * 提供多種預覽模式
 * 支援多檔案上傳和管理
 */
const DragDropZone: React.FC<DragDropZoneProps> = ({
  option,
  value,
  onChange,
  readonly = false,
  className = "",
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [previewMode, setPreviewMode] = useState<"list" | "grid" | "none">("list");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const dropConfig = option.dragDropZone;
  if (!dropConfig) {
    return <div className="text-red-400">拖拽上傳配置錯誤</div>;
  }

  /**
   * 格式化檔案大小
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  /**
   * 檢查檔案類型
   */
  const isValidFileType = (file: File): boolean => {
    if (!dropConfig.accept) return true;
    
    const acceptedTypes = dropConfig.accept.split(",").map(type => type.trim());
    return acceptedTypes.some(type => {
      if (type.startsWith(".")) {
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      } else if (type.includes("*")) {
        const mainType = type.split("/")[0];
        return file.type.startsWith(mainType);
      } else {
        return file.type === type;
      }
    });
  };

  /**
   * 檢查檔案大小
   */
  const isValidFileSize = (file: File): boolean => {
    if (!dropConfig.maxSize) return true;
    return file.size <= dropConfig.maxSize;
  };

  /**
   * 模擬檔案上傳
   */
  const simulateUpload = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.1) { // 90% 成功率
          const fileUrl = URL.createObjectURL(file);
          resolve(fileUrl);
        } else {
          reject(new Error("上傳失敗"));
        }
      }, 1000 + Math.random() * 2000);
    });
  };

  /**
   * 處理檔案上傳
   */
  const handleFileUpload = async (files: FileList) => {
    const fileArray = Array.from(files);
    
    if (!dropConfig.multiple && fileArray.length > 1) {
      alert("只能選擇一個檔案");
      return;
    }
    
    if (!dropConfig.multiple && uploadedFiles.length > 0) {
      setUploadedFiles([]);
    }

    for (const file of fileArray) {
      if (!isValidFileType(file)) {
        alert(`檔案 "${file.name}" 類型不被支援`);
        continue;
      }
      
      if (!isValidFileSize(file)) {
        alert(`檔案 "${file.name}" 大小超過限制`);
        continue;
      }

      const uploadFile: UploadedFile = {
        id: Date.now() + Math.random().toString(),
        name: file.name,
        size: file.size,
        type: file.type,
        url: "",
        uploading: true,
      };

      setUploadedFiles(prev => [...prev, uploadFile]);

      try {
        const uploadedUrl = await simulateUpload(file);
        
        setUploadedFiles(prev => prev.map(f => 
          f.id === uploadFile.id 
            ? { ...f, url: uploadedUrl, uploading: false }
            : f
        ));

        if (dropConfig.multiple) {
          const currentUrls = Array.isArray(value) ? value : (value ? [value] : []);
          onChange([...currentUrls, uploadedUrl]);
        } else {
          onChange(uploadedUrl);
        }

      } catch (error) {
        setUploadedFiles(prev => prev.map(f => 
          f.id === uploadFile.id 
            ? { ...f, uploading: false, error: (error as Error).message }
            : f
        ));
      }
    }
  };

  /**
   * 拖拽事件處理
   */
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!readonly) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    if (readonly) return;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  /**
   * 點擊上傳
   */
  const handleClick = () => {
    if (readonly) return;
    fileInputRef.current?.click();
  };

  /**
   * 移除檔案
   */
  const removeFile = (fileId: string) => {
    const fileToRemove = uploadedFiles.find(f => f.id === fileId);
    if (!fileToRemove) return;

    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));

    if (dropConfig.multiple && Array.isArray(value)) {
      const newUrls = value.filter(url => url !== fileToRemove.url);
      onChange(newUrls.length > 0 ? newUrls : null);
    } else {
      onChange(null);
    }

    if (fileToRemove.url) {
      URL.revokeObjectURL(fileToRemove.url);
    }
  };

  /**
   * 判斷是否為圖片
   */
  const isImage = (type: string): boolean => {
    return type.startsWith("image/");
  };

  /**
   * 渲染檔案預覽 - 列表模式
   */
  const renderListView = () => (
    <div className="space-y-2">
      {uploadedFiles.map((file) => (
        <div 
          key={file.id}
          className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded"
        >
          <div className="flex-shrink-0">
            {isImage(file.type) && file.url ? (
              <img 
                src={file.url} 
                alt={file.name}
                className="w-10 h-10 object-cover rounded"
              />
            ) : (
              <div className="w-10 h-10 bg-white/10 rounded flex items-center justify-center">
                {isImage(file.type) ? (
                  <Image className="h-5 w-5 text-white/60" />
                ) : (
                  <File className="h-5 w-5 text-white/60" />
                )}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-sm text-white/90 truncate">{file.name}</div>
            <div className="text-xs text-white/60">{formatFileSize(file.size)}</div>
            
            {file.uploading && (
              <div className="text-xs text-blue-400 mt-1">上傳中...</div>
            )}
            
            {file.error && (
              <div className="text-xs text-red-400 mt-1">{file.error}</div>
            )}
          </div>

          {!readonly && !file.uploading && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeFile(file.id)}
              className="text-red-400 hover:text-red-300 hover:bg-red-400/10 flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );

  /**
   * 渲染檔案預覽 - 網格模式
   */
  const renderGridView = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {uploadedFiles.map((file) => (
        <div 
          key={file.id}
          className="relative bg-white/5 border border-white/10 rounded p-2 aspect-square"
        >
          <div className="w-full h-full flex flex-col items-center justify-center">
            {isImage(file.type) && file.url ? (
              <img 
                src={file.url} 
                alt={file.name}
                className="w-full h-full object-cover rounded"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <File className="h-8 w-8 text-white/60 mb-2" />
                <div className="text-xs text-white/80 text-center truncate w-full px-1">
                  {file.name}
                </div>
              </div>
            )}
          </div>

          {file.uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded">
              <div className="text-xs text-blue-400">上傳中...</div>
            </div>
          )}

          {file.error && (
            <div className="absolute inset-0 bg-red-900/50 flex items-center justify-center rounded">
              <div className="text-xs text-red-400 text-center px-1">{file.error}</div>
            </div>
          )}

          {!readonly && !file.uploading && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeFile(file.id)}
              className="absolute top-1 right-1 text-red-400 hover:text-red-300 hover:bg-red-400/20 h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );

  // 根據配置設定預覽模式
  React.useEffect(() => {
    if (dropConfig.previewMode && dropConfig.previewMode !== "none") {
      setPreviewMode(dropConfig.previewMode);
    }
  }, [dropConfig.previewMode]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 隱藏的檔案輸入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept={dropConfig.accept}
        multiple={dropConfig.multiple}
        onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
        className="hidden"
      />

      {/* 拖拽上傳區域 */}
      {!readonly && (
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleClick}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragOver 
              ? 'border-blue-400 bg-blue-400/10' 
              : 'border-white/30 hover:border-white/50 hover:bg-white/5'
            }
          `}
        >
          <Upload className="h-12 w-12 text-white/60 mx-auto mb-4" />
          <div className="text-white/80 mb-2">
            {dropConfig.placeholder || "拖拽檔案到這裡或點擊選擇"}
          </div>
          <div className="text-sm text-white/60">
            {dropConfig.accept && `支援: ${dropConfig.accept}`}
            {dropConfig.maxSize && ` | 最大: ${formatFileSize(dropConfig.maxSize)}`}
          </div>
        </div>
      )}

      {/* 預覽模式切換 */}
      {uploadedFiles.length > 0 && dropConfig.previewMode !== "none" && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-white/80">
            已上傳 {uploadedFiles.length} 個檔案
          </div>
          
          {uploadedFiles.length > 1 && (
            <div className="flex gap-1">
              <Button
                variant={previewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setPreviewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={previewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setPreviewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* 檔案預覽 */}
      {uploadedFiles.length > 0 && dropConfig.previewMode !== "none" && (
        <div>
          {previewMode === "grid" ? renderGridView() : renderListView()}
        </div>
      )}
    </div>
  );
};

export default DragDropZone;