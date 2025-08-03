/**
 * 性能Context定義
 */

import { createContext } from 'react';
import { PerformanceContextValue } from '../hooks/usePerformance';

export const PerformanceContext = createContext<PerformanceContextValue | null>(null);