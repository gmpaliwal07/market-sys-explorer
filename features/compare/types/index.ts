export interface ComparisonMetrics {
  correlation: number;
  volatilityDifference: number;
  performanceGap: number;
  sharpeRatioA: number;
  sharpeRatioB: number;
}
export interface CompareChartData {
  time: string;
  [key: string]: string | number;
}

export type ComparisonType = "time-periods" | "multi-symbol" | "benchmark" | "period-over-period";