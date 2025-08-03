/**
 * 載入管理器和相關hook
 */

import { useState, useEffect, useCallback } from 'react';

export interface LoadingState {
  isLoading: boolean;
  progress?: number;
  message?: string;
  type?: 'spinner' | 'progress' | 'skeleton' | 'dots' | 'pulse';
  size?: 'sm' | 'md' | 'lg';
  overlay?: boolean;
}

// 載入管理器類
class LoadingManager {
  private loadingStates = new Map<string, LoadingState>();
  private listeners = new Set<(states: Map<string, LoadingState>) => void>();

  show(id: string, state: Partial<LoadingState> = {}) {
    const newState: LoadingState = {
      isLoading: true,
      type: 'spinner',
      size: 'md',
      overlay: false,
      ...state,
    };
    
    this.loadingStates.set(id, newState);
    this.notifyListeners();
  }

  update(id: string, updates: Partial<LoadingState>) {
    const currentState = this.loadingStates.get(id);
    if (currentState) {
      this.loadingStates.set(id, { ...currentState, ...updates });
      this.notifyListeners();
    }
  }

  hide(id: string) {
    this.loadingStates.delete(id);
    this.notifyListeners();
  }

  get(id: string): LoadingState | undefined {
    return this.loadingStates.get(id);
  }

  getAll(): Map<string, LoadingState> {
    return new Map(this.loadingStates);
  }

  clear() {
    this.loadingStates.clear();
    this.notifyListeners();
  }

  subscribe(listener: (states: Map<string, LoadingState>) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
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

  const showLoading = useCallback((loadingId: string, state?: Partial<LoadingState>) => {
    globalLoadingManager.show(loadingId, state);
  }, []);

  const updateLoading = useCallback((loadingId: string, updates: Partial<LoadingState>) => {
    globalLoadingManager.update(loadingId, updates);
  }, []);

  const hideLoading = useCallback((loadingId: string) => {
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