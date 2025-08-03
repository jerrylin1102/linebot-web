import React, { useRef, useState } from "react";
import { Button } from "../../ui/button";
import { Upload, X, File, Image } from "lucide-react";
import { BlockConfigOption } from "../blocks/types";

interface FileUploaderProps {
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
 * 檔案上傳組件
 * 
 * 支援單檔案或多檔案上傳
 * 提供檔案類型和大小限制
 * 顯示上傳進度和預覽
 */
const FileUploader: React.FC<FileUploaderProps> = ({
  option,
  value,
  onChange,
  readonly = false,
  className = "",
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  
  const fileConfig = option.fileUpload;
  if (!fileConfig) {
    return <div className="text-red-400">檔案上傳配置錯誤</div>;
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
    if (!fileConfig.accept) return true;
    
    const acceptedTypes = fileConfig.accept.split(",").map(type => type.trim());
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
    if (!fileConfig.maxSize) return true;
    return file.size <= fileConfig.maxSize;
  };

  /**
   * 模擬檔案上傳
   */
  const simulateUpload = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      // 模擬上傳過程
      setTimeout(() => {
        if (Math.random() > 0.1) { // 90% 成功率
          const fileUrl = URL.createObjectURL(file);
          resolve(fileUrl);
        } else {
          reject(new Error("上傳失敗"));
        }
      }, 1000 + Math.random() * 2000); // 1-3秒上傳時間
    });
  };

  /**
   * 處理檔案選擇
   */
  const handleFileSelect = async (files: FileList) => {
    const fileArray = Array.from(files);
    
    // 檢查檔案數量限制
    const currentCount = uploadedFiles.length;
    const newCount = fileArray.length;
    
    if (!fileConfig.multiple && newCount > 1) {
      alert("只能選擇一個檔案");
      return;
    }
    
    if (!fileConfig.multiple && currentCount > 0) {
      // 單檔案模式，替換現有檔案
      setUploadedFiles([]);
    }

    // 檢查每個檔案
    for (const file of fileArray) {
      if (!isValidFileType(file)) {
        alert(`檔案 "${file.name}" 類型不被支援`);
        continue;
      }
      
      if (!isValidFileSize(file)) {
        alert(`檔案 "${file.name}" 大小超過限制 (${formatFileSize(fileConfig.maxSize!)})`);
        continue;
      }

      // 建立上傳項目
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
        // 執行上傳
        const uploadedUrl = await simulateUpload(file);
        
        setUploadedFiles(prev => prev.map(f => 
          f.id === uploadFile.id 
            ? { ...f, url: uploadedUrl, uploading: false }
            : f
        ));

        // 更新值
        if (fileConfig.multiple) {
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
   * 移除檔案
   */
  const removeFile = (fileId: string) => {
    const fileToRemove = uploadedFiles.find(f => f.id === fileId);
    if (!fileToRemove) return;

    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));

    if (fileConfig.multiple && Array.isArray(value)) {
      const newUrls = value.filter(url => url !== fileToRemove.url);
      onChange(newUrls.length > 0 ? newUrls : null);
    } else {
      onChange(null);
    }

    // 釋放 URL
    if (fileToRemove.url) {
      URL.revokeObjectURL(fileToRemove.url);
    }
  };

  /**
   * 處理點擊上傳
   */
  const handleUploadClick = () => {
    if (readonly) return;
    fileInputRef.current?.click();
  };

  /**
   * 判斷是否為圖片
   */
  const isImage = (type: string): boolean => {
    return type.startsWith("image/");
  };

  /**
   * 渲染檔案預覽
   */
  const renderFilePreview = (file: UploadedFile) => {
    return (
      <div 
        key={file.id}
        className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded"
      >
        {/* 檔案圖示或預覽 */}
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

        {/* 檔案資訊 */}
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

        {/* 移除按鈕 */}
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
    );
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* 隱藏的檔案輸入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept={fileConfig.accept}
        multiple={fileConfig.multiple}
        onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* 上傳按鈕 */}
      {!readonly && (
        <Button
          variant="outline"
          onClick={handleUploadClick}
          className="w-full border-white/20 text-white/80 hover:bg-white/10"
        >
          <Upload className="h-4 w-4 mr-2" />
          選擇檔案
        </Button>
      )}

      {/* 檔案清單 */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          {uploadedFiles.map(renderFilePreview)}
        </div>
      )}

      {/* 檔案限制說明 */}
      <div className="text-xs text-white/60 space-y-1">
        {fileConfig.accept && (
          <div>支援檔案類型: {fileConfig.accept}</div>
        )}
        {fileConfig.maxSize && (
          <div>最大檔案大小: {formatFileSize(fileConfig.maxSize)}</div>
        )}
        {fileConfig.multiple ? (
          <div>可選擇多個檔案</div>
        ) : (
          <div>只能選擇一個檔案</div>
        )}
      </div>
    </div>
  );
};

export default FileUploader;