/**
 * 載入狀態和進度顯示系統 - 提供多種載入指示器和進度條
 */

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export interface LoadingState {
  isLoading: boolean;
  progress?: number;
  message?: string;
  type?: 'spinner' | 'progress' | 'skeleton' | 'dots' | 'pulse';
  size?: 'sm' | 'md' | 'lg';
  overlay?: boolean;
}

export interface ProgressStep {
  id: string;
  name: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  progress?: number;
  message?: string;
}

// 基礎載入動畫組件
const SpinnerLoader: React.FC<{ size: string; className?: string }> = ({ size, className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size as keyof typeof sizeClasses]} ${className}`} />
  );
};

const DotsLoader: React.FC<{ size: string; className?: string }> = ({ size, className = '' }) => {
  const dotSizes = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3'
  };

  const dotSize = dotSizes[size as keyof typeof dotSizes];

  return (
    <div className={`flex space-x-1 ${className}`}>
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className={`${dotSize} bg-blue-600 rounded-full animate-pulse`}
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: '0.6s'
          }}
        />
      ))}
    </div>
  );
};

const PulseLoader: React.FC<{ size: string; className?: string }> = ({ size, className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`bg-blue-600 rounded-full animate-pulse ${sizeClasses[size as keyof typeof sizeClasses]} ${className}`} />
  );
};

// 進度條組件
export const ProgressBar: React.FC<{
  progress: number;
  className?: string;
  showText?: boolean;
  color?: 'blue' | 'green' | 'yellow' | 'red';
  size?: 'sm' | 'md' | 'lg';
}> = ({ 
  progress, 
  className = '', 
  showText = true, 
  color = 'blue',
  size = 'md'
}) => {
  const progressClamped = Math.max(0, Math.min(100, progress));
  
  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    yellow: 'bg-yellow-600',
    red: 'bg-red-600'
  };

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  return (
    <div className={`w-full ${className}`}>
      {showText && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-gray-600">進度</span>
          <span className="text-sm font-medium">{progressClamped.toFixed(0)}%</span>
        </div>
      )}
      <div className={`bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`${colorClasses[color]} ${sizeClasses[size]} rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${progressClamped}%` }}
        />
      </div>
    </div>
  );
};

// 圓形進度條
export const CircularProgress: React.FC<{
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showText?: boolean;
}> = ({
  progress,
  size = 80,
  strokeWidth = 8,
  color = '#3b82f6',
  backgroundColor = '#e5e7eb',
  showText = true
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.3s ease-in-out'
          }}
        />
      </svg>
      {showText && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-medium">{Math.round(progress)}%</span>
        </div>
      )}
    </div>
  );
};

// 步驟進度指示器
export const StepProgress: React.FC<{
  steps: ProgressStep[];
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}> = ({ steps, orientation = 'horizontal', className = '' }) => {
  const isHorizontal = orientation === 'horizontal';

  const getStepColor = (status: ProgressStep['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-600 text-white';
      case 'active': return 'bg-blue-600 text-white';
      case 'error': return 'bg-red-600 text-white';
      default: return 'bg-gray-300 text-gray-600';
    }
  };

  const getConnectorColor = (currentIndex: number) => {
    const currentStep = steps[currentIndex];
    const nextStep = steps[currentIndex + 1];
    
    if (currentStep.status === 'completed') {
      return 'bg-green-600';
    }
    if (currentStep.status === 'active' && nextStep) {
      return 'bg-gradient-to-r from-blue-600 to-gray-300';
    }
    return 'bg-gray-300';
  };

  return (
    <div className={`${className}`}>
      <div className={`flex ${isHorizontal ? 'flex-row items-center' : 'flex-col'}`}>
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            {/* 步驟圓圈 */}
            <div className={`flex ${isHorizontal ? 'flex-col items-center' : 'flex-row items-center'}`}>
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${getStepColor(step.status)}
                transition-colors duration-200
              `}>
                {step.status === 'completed' ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : step.status === 'error' ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>

              {/* 步驟標籤 */}
              <div className={`${isHorizontal ? 'mt-2 text-center' : 'ml-3'} flex-1`}>
                <div className="text-sm font-medium text-gray-900">{step.name}</div>
                {step.message && (
                  <div className="text-xs text-gray-500 mt-1">{step.message}</div>
                )}
                {step.progress !== undefined && step.status === 'active' && (
                  <div className="mt-1">
                    <ProgressBar 
                      progress={step.progress} 
                      size="sm" 
                      showText={false}
                      className="max-w-24"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 連接線 */}
            {index < steps.length - 1 && (
              <div className={`
                ${isHorizontal ? 'w-16 h-0.5 mx-2' : 'h-8 w-0.5 ml-4 my-2'}
                ${getConnectorColor(index)}
                transition-colors duration-200
              `} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// 骨架屏組件
export const SkeletonLoader: React.FC<{
  lines?: number;
  className?: string;
  animated?: boolean;
}> = ({ lines = 3, className = '', animated = true }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className={`h-4 bg-gray-300 rounded ${animated ? 'animate-pulse' : ''}`}
          style={{ width: `${Math.random() * 40 + 60}%` }}
        />
      ))}
    </div>
  );
};

// 主要載入組件
export const LoadingIndicator: React.FC<LoadingState & { className?: string }> = ({
  isLoading,
  progress,
  message,
  type = 'spinner',
  size = 'md',
  overlay = false,
  className = ''
}) => {
  if (!isLoading) return null;

  const renderLoader = () => {
    switch (type) {
      case 'progress':
        return progress !== undefined ? (
          <div className="w-64">
            <ProgressBar progress={progress} />
          </div>
        ) : (
          <SpinnerLoader size={size} />
        );
      case 'dots':
        return <DotsLoader size={size} />;
      case 'pulse':
        return <PulseLoader size={size} />;
      case 'skeleton':
        return <SkeletonLoader lines={3} animated />;
      default:
        return <SpinnerLoader size={size} />;
    }
  };

  const content = (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      {renderLoader()}
      {message && (
        <div className="text-sm text-gray-600 text-center max-w-xs">
          {message}
        </div>
      )}
    </div>
  );

  if (overlay) {
    return createPortal(
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 shadow-xl">
          {content}
        </div>
      </div>,
      document.body
    );
  }

  return content;
};

// 載入管理器
export class LoadingManager {
  private loadingStates = new Map<string, LoadingState>();
  private listeners = new Set<(states: Map<string, LoadingState>) => void>();

  /**
   * 顯示載入狀態
   */
  show(id: string, state: Partial<LoadingState> = {}): void {
    const loadingState: LoadingState = {
      isLoading: true,
      type: 'spinner',
      size: 'md',
      overlay: false,
      ...state
    };

    this.loadingStates.set(id, loadingState);
    this.notifyListeners();
  }

  /**
   * 更新載入狀態
   */
  update(id: string, updates: Partial<LoadingState>): void {
    const current = this.loadingStates.get(id);
    if (current) {
      this.loadingStates.set(id, { ...current, ...updates });
      this.notifyListeners();
    }
  }

  /**
   * 隱藏載入狀態
   */
  hide(id: string): void {
    this.loadingStates.delete(id);
    this.notifyListeners();
  }

  /**
   * 獲取載入狀態
   */
  get(id: string): LoadingState | undefined {
    return this.loadingStates.get(id);
  }

  /**
   * 獲取所有載入狀態
   */
  getAll(): Map<string, LoadingState> {
    return new Map(this.loadingStates);
  }

  /**
   * 監聽狀態變化
   */
  subscribe(listener: (states: Map<string, LoadingState>) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * 清除所有載入狀態
   */
  clear(): void {
    this.loadingStates.clear();
    this.notifyListeners();
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(new Map(this.loadingStates));
      } catch (error) {
        console.error('載入狀態監聽器錯誤:', error);
      }
    });
  }
}

// 全局載入管理器
export const globalLoadingManager = new LoadingManager();

// React Hook for loading management
export const useLoading = (id?: string) => {
  const [loadingStates, setLoadingStates] = useState(globalLoadingManager.getAll());

  useEffect(() => {
    return globalLoadingManager.subscribe(setLoadingStates);
  }, []);

  const showLoading = React.useCallback((loadingId: string, state?: Partial<LoadingState>) => {
    globalLoadingManager.show(loadingId, state);
  }, []);

  const updateLoading = React.useCallback((loadingId: string, updates: Partial<LoadingState>) => {
    globalLoadingManager.update(loadingId, updates);
  }, []);

  const hideLoading = React.useCallback((loadingId: string) => {
    globalLoadingManager.hide(loadingId);
  }, []);

  const currentState = id ? loadingStates.get(id) : undefined;

  return {
    loadingStates,
    currentState,
    showLoading,
    updateLoading,
    hideLoading,
    isLoading: currentState?.isLoading || false
  };
};

export default LoadingIndicator;