
// Enhanced interfaces (unchanged
export interface ChartData {
  open: number;
  close: number;
  high: number;
  low: number;
  time: string;
  change: number;
  volume?: number;
  sma20?: number;
  sma50?: number;
  ema12?: number;
  ema26?: number;
  macd?: number;
  signal?: number;
  rsi?: number;
  bollinger_upper?: number;
  bollinger_lower?: number;
  bollinger_middle?: number;
  symbol: string; // Optional symbol for clarity

}

export type OrderBookEntry = [number, number];

export interface OrderBook {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  lastUpdateId: number;
}

export interface TickerData {
  price: number;
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  weightedAvgPrice: string;
  prevClosePrice: string;
  lastPrice: string;
  bidPrice: string;
  askPrice: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
  count: number;
}
export interface TimeframeConfig {
  interval: string;
  limit: number;
  label: string;
  wsInterval: string;
}

export type ChartType = 'line' | 'candlestick' | 'area' | 'ohlc';





export type Timeframe = "1d" | "1w" | "1m" | "3m" | "6m" | "ytd" | "1y" | "all" | '5m' | '15m' | '30m' | '1h' | '4h';
export const TIMEFRAME_CONFIGS: { [key in Timeframe]: { interval: string; limit: number; label: string; wsInterval: string } } = {
  "1d": { interval: "1h", limit: 24, label: "1 Day", wsInterval: "1h" },
  "1w": { interval: "1d", limit: 7, label: "1 Week", wsInterval: "1d" },
  "1m": { interval: "1d", limit: 31, label: "1 Month", wsInterval: "1d" },
  "3m": { interval: "1d", limit: 90, label: "3 Months", wsInterval: "1d" },
  "6m": { interval: "1d", limit: 180, label: "6 Months", wsInterval: "1d" },
  "ytd": { interval: "1d", limit: new Date().getUTCMonth() + 1, label: "Year to Date", wsInterval: "1d" },
  "1y": { interval: "1d", limit: 365, label: "1 Year", wsInterval: "1d" },
  "all": { interval: "1d", limit: 1000, label: "All Time", wsInterval: "1d" },
  "5m": { interval: "5m", limit: 288, label: "5 Minutes", wsInterval: "5m" },
  "15m": { interval: "15m", limit: 96, label: "15 Minutes", wsInterval: "15m" },
  "30m": { interval: "30m", limit: 48, label: "30 Minutes", wsInterval: "30m" },
  "1h": { interval: "1h", limit: 24, label: "1 Hour", wsInterval: "1h" },
  "4h": { interval: "4h", limit: 168, label: "4 Hours", wsInterval: "4h" }
};

export class TechnicalIndicators {
  static sma(data: number[], period: number): number[] {
    const result: number[] = [];
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        result.push(NaN);
      } else {
        const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
        result.push(sum / period);
      }
    }
    return result;
  }

  static ema(data: number[], period: number): number[] {
    const result: number[] = [];
    const multiplier = 2 / (period + 1);
    
    for (let i = 0; i < data.length; i++) {
      if (i === 0) {
        result.push(data[i]);
      } else {
        result.push((data[i] - result[i - 1]) * multiplier + result[i - 1]);
      }
    }
    return result;
  }

  static rsi(data: number[], period: number = 14): number[] {
    const result: number[] = [];
    const changes: number[] = [];
    
    for (let i = 1; i < data.length; i++) {
      changes.push(data[i] - data[i - 1]);
    }
    
    for (let i = 0; i < data.length; i++) {
      if (i < period) {
        result.push(NaN);
      } else {
        const gains = changes.slice(i - period, i).filter(x => x > 0);
        const losses = changes.slice(i - period, i).filter(x => x < 0).map(x => Math.abs(x));
        
        const avgGain = gains.length > 0 ? gains.reduce((a, b) => a + b, 0) / period : 0;
        const avgLoss = losses.length > 0 ? losses.reduce((a, b) => a + b, 0) / period : 0;
        
        if (avgLoss === 0) {
          result.push(100);
        } else {
          const rs = avgGain / avgLoss;
          result.push(100 - (100 / (1 + rs)));
        }
      }
    }
    return result;
  }

  static bollinger(data: number[], period: number = 20, stdDev: number = 2): { upper: number[], middle: number[], lower: number[] } {
    const smaValues = this.sma(data, period);
    const upper: number[] = [];
    const lower: number[] = [];
    
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        upper.push(NaN);
        lower.push(NaN);
      } else {
        const slice = data.slice(i - period + 1, i + 1);
        const mean = smaValues[i];
        const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period;
        const standardDeviation = Math.sqrt(variance);
        
        upper.push(mean + (standardDeviation * stdDev));
        lower.push(mean - (standardDeviation * stdDev));
      }
    }
    
    return { upper, middle: smaValues, lower };
  }

  static macd(data: number[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9): { macd: number[], signal: number[] } {
    const emaFast = this.ema(data, fastPeriod);
    const emaSlow = this.ema(data, slowPeriod);
    const macdLine = emaFast.map((fast, i) => fast - emaSlow[i]);
    const signalLine = this.ema(macdLine, signalPeriod);
    
    return { macd: macdLine, signal: signalLine };
  }
}