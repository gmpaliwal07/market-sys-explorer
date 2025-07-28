export type CalendarCell = {
  low: number; // Low price value for the period
  high: number; // High price value for the period
  date: Date;
  change?: number;
  volatility?: number; // Volatility calculated based on change
  volume?: number;
};
