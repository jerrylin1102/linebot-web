import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle, RotateCcw } from 'lucide-react';
import { 
  InitializationState, 
  getInitializationState,
  addInitializationListener
} from './blocks';

interface InitializationStatusIndicatorProps {
  className?: string;
  showDetails?: boolean;
}

/**
 * 積木初始化狀態指示器
 * 顯示當前初始化狀態和進度
 */
export const InitializationStatusIndicator: React.FC<InitializationStatusIndicatorProps> = ({
  className = "",
  showDetails = false
}) => {
  const [state, setState] = useState<InitializationState>(InitializationState.IDLE);
  const [progress, setProgress] = useState({
    percentage: 0,
    currentOperation: "等待初始化",
    completed: 0,
    total: 0
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);

  useEffect(() => {
    // 獲取當前狀態
    setState(getInitializationState());

    // 監聽狀態變更
    const unsubscribeState = addInitializationListener('state-changed', (event) => {
      setState(event.data.state);
    });

    // 監聽進度更新
    const unsubscribeProgress = addInitializationListener('progress-updated', (event) => {
      const progressData = event.data.progress;
      setProgress({
        percentage: progressData.percentage,
        currentOperation: progressData.currentOperation,
        completed: progressData.completed,
        total: progressData.total
      });
      setWarnings(progressData.warnings || []);
    });

    // 監聽錯誤
    const unsubscribeError = addInitializationListener('error-occurred', (event) => {
      const error = event.data.error;
      setErrors(prev => [...prev, error.message]);
    });

    // 監聽初始化完成
    const unsubscribeComplete = addInitializationListener('initialization-completed', (event) => {
      const result = event.data.result;
      if (result.warnings && result.warnings.length > 0) {
        setWarnings(result.warnings);
      }
    });

    return () => {
      unsubscribeState();
      unsubscribeProgress();
      unsubscribeError();
      unsubscribeComplete();
    };
  }, []);

  const getStateIcon = () => {
    switch (state) {
      case InitializationState.READY:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case InitializationState.ERROR:
        return <XCircle className="w-4 h-4 text-red-500" />;
      case InitializationState.RETRYING:
        return <RotateCcw className="w-4 h-4 text-orange-500 animate-spin" />;
      case InitializationState.LOADING:
      case InitializationState.RESOLVING_DEPENDENCIES:
      case InitializationState.REGISTERING_BLOCKS:
      case InitializationState.VALIDATING:
        return <Clock className="w-4 h-4 text-blue-500 animate-pulse" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStateText = () => {
    switch (state) {
      case InitializationState.IDLE:
        return "等待初始化";
      case InitializationState.LOADING:
        return "載入中";
      case InitializationState.RESOLVING_DEPENDENCIES:
        return "解析依賴";
      case InitializationState.REGISTERING_BLOCKS:
        return "註冊積木";
      case InitializationState.VALIDATING:
        return "驗證中";
      case InitializationState.READY:
        return "已就緒";
      case InitializationState.ERROR:
        return "初始化失敗";
      case InitializationState.RETRYING:
        return "重試中";
      default:
        return "未知狀態";
    }
  };

  const getStateColor = () => {
    switch (state) {
      case InitializationState.READY:
        return "text-green-600 bg-green-50 border-green-200";
      case InitializationState.ERROR:
        return "text-red-600 bg-red-50 border-red-200";
      case InitializationState.RETRYING:
        return "text-orange-600 bg-orange-50 border-orange-200";
      case InitializationState.LOADING:
      case InitializationState.RESOLVING_DEPENDENCIES:
      case InitializationState.REGISTERING_BLOCKS:
      case InitializationState.VALIDATING:
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className={`inline-flex items-center space-x-2 ${className}`}>
      {/* 狀態指示器 */}
      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${getStateColor()}`}>
        {getStateIcon()}
        <span className="text-xs font-medium">{getStateText()}</span>
        
        {/* 進度百分比 */}
        {state !== InitializationState.READY && state !== InitializationState.ERROR && state !== InitializationState.IDLE && (
          <span className="text-xs opacity-75">
            {progress.percentage}%
          </span>
        )}
      </div>

      {/* 詳細資訊 */}
      {showDetails && (
        <div className="text-xs text-gray-500 space-y-1">
          {/* 當前操作 */}
          {state !== InitializationState.READY && state !== InitializationState.ERROR && (
            <div>{progress.currentOperation}</div>
          )}
          
          {/* 進度條 */}
          {progress.percentage > 0 && state !== InitializationState.READY && (
            <div className="w-32 bg-gray-200 rounded-full h-1">
              <div 
                className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          )}

          {/* 警告訊息 */}
          {warnings.length > 0 && (
            <div className="text-orange-600 text-xs">
              {warnings.length} 個警告
            </div>
          )}

          {/* 錯誤訊息 */}
          {errors.length > 0 && (
            <div className="text-red-600 text-xs">
              {errors.length} 個錯誤
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InitializationStatusIndicator;