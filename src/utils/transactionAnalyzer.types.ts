/**
 * Types و Interfaces برای Transaction Analyzer
 */

export interface Transaction {
  orderId: string;
  timestamp: number;
  model: number;
  symbol: string;
  price: string;
  quantity: string;
  side: 'buy' | 'sell';
  duration: number;
  success: boolean;
}

export interface CorrelatedLog {
  timestamp: number;
  level: string;
  location: string;
  message: string;
  data?: any;
  performance?: {
    operation: string;
    duration: number;
  };
}

export interface CorrelatedLogs {
  transaction: Transaction;
  buyLog?: CorrelatedLog;
  performanceLogs: CorrelatedLog[];
  infoLogs: CorrelatedLog[];
  formValueLogs: CorrelatedLog[];
  browserLogs: CorrelatedLog[];
  apiPhaseLogs: CorrelatedLog[];
  timeRange: {
    start: number;
    end: number;
  };
}

export interface PhaseTiming {
  name: string;
  duration: number;
  percentage: number;
  startTime: number;
  endTime: number;
  logs: CorrelatedLog[];
  details?: any;
}

export interface TimingBreakdown {
  phases: PhaseTiming[];
  totalDuration: number;
  overheadDuration: number;
  overheadPercentage: number;
  unaccountedTime: number;
  unaccountedPercentage: number;
}

export interface Bottleneck {
  phase: string;
  duration: number;
  percentage: number;
  severity: 'high' | 'medium' | 'low';
  recommendation: string;
  expectedImprovement?: string;
}

export interface OptimizationSuggestion {
  type: 'model-migration' | 'code-optimization' | 'cache-enhancement' | 'verification-skip' | 'wait-reduction' | 'parallel-operations';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  expectedImprovement: string;
  implementation: string;
  impact?: {
    timeSaved: number;
    percentageSaved: number;
  };
}

export interface ModelComparison {
  currentModel: number;
  currentDuration: number;
  alternatives: Array<{
    model: number;
    modelName: string;
    estimatedDuration: number;
    improvement: number;
    improvementPercentage: number;
    pros: string[];
    cons: string[];
    migrationComplexity: 'low' | 'medium' | 'high';
  }>;
}

export interface DetailedReport {
  transaction: Transaction;
  timingBreakdown: TimingBreakdown;
  bottlenecks: Bottleneck[];
  suggestions: OptimizationSuggestion[];
  modelComparison: ModelComparison;
  summary: {
    totalDuration: number;
    benchmarkComparison: {
      model4Benchmark: number;
      model5Benchmark: number;
      model6Target: number;
      vsModel4: number;
      vsModel5: number;
      vsModel6: number;
    };
    keyFindings: string[];
  };
}

