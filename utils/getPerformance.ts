import { UnifiedBinanceClient, UnifiedCallbacks } from "@/utils/UnifiedWebSocket";
import { Timeframe } from "@/types/timeframe";
import { ChartData } from "@/features/dashboard/types";

export type GroupBy = "hour" | "day" | "week" | "month";

interface PerformanceParams {
  symbols: string[];
  timeframe: Timeframe;
  groupBy: GroupBy;
  interval: string;
  limit: number;
  streamTypes: ("kline" | "depth" | "ticker")[];
  indicators?: string[];
  callback: (data: ChartData[], error?: string) => void;
}

// Use a single shared client instance to avoid multiple connections
let sharedClient: UnifiedBinanceClient | null = null;

function getSharedClient(): UnifiedBinanceClient {
  if (!sharedClient) {
    sharedClient = new UnifiedBinanceClient();
  }
  return sharedClient;
}

export function mapTimeframeToInterval(timeframe: Timeframe): {
  supportedInterval: string;
  limit: number;
  groupBy: GroupBy;
} {
  switch (timeframe) {
    case "1D":
      return { supportedInterval: "1h", limit: 24, groupBy: "hour" };
    case "1W":
      return { supportedInterval: "4h", limit: 42, groupBy: "hour" }; // 7 days * 6 points per day
    case "1M":
      return { supportedInterval: "1d", limit: 30, groupBy: "day" }; // Changed from 31 to 30
    case "3M":
      return { supportedInterval: "1d", limit: 90, groupBy: "day" };
    case "6M":
      return { supportedInterval: "1d", limit: 180, groupBy: "day" };
    case "1Y":
      return { supportedInterval: "1w", limit: 52, groupBy: "week" };
    case "YTD":
      const now = new Date();
      const yearStart = new Date(now.getFullYear(), 0, 1);
      const daysSinceYearStart = Math.floor((now.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24));
      
      // Use weekly intervals if YTD span is more than 3 months
      if (daysSinceYearStart > 90) {
        const weeksSinceYearStart = Math.ceil(daysSinceYearStart / 7);
        return { supportedInterval: "1w", limit: weeksSinceYearStart, groupBy: "week" };
      }
      
      return { supportedInterval: "1d", limit: Math.max(daysSinceYearStart + 1, 1), groupBy: "day" };
    default:
      return { supportedInterval: "1d", limit: 100, groupBy: "day" };
  }
}


export async function fetchHistoricalKlines(
  symbol: string,
  interval: string,
  limit: number
): Promise<ChartData[]> {
  const baseUrl = "https://api.binance.com/api/v3/klines";
  let apiUrl = `${baseUrl}?symbol=${symbol.toUpperCase()}&interval=${interval}&limit=${Math.min(limit, 1000)}`;
  
  // For hourly data, get the last 24 hours
  if (interval === "1h") {
    const endTime = Date.now();
    const startTime = endTime - (24 * 60 * 60 * 1000); // 24 hours ago
    apiUrl = `${baseUrl}?symbol=${symbol.toUpperCase()}&interval=${interval}&startTime=${startTime}&endTime=${endTime}`;
  }

  try {
    console.log(`Fetching historical data: ${apiUrl}`);
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const rawData: [string, string, string, string, string, string, string, string, string, string, string, string][] = await response.json();
    
    if (!Array.isArray(rawData) || rawData.length === 0) {
      console.warn(`No data received for ${symbol}`);
      return [];
    }

    const processedData = rawData.map(([timestamp, openStr, highStr, lowStr, closeStr, volumeStr]) => {
      const timestampNum = parseInt(timestamp);
      const open = parseFloat(openStr);
      const high = parseFloat(highStr);
      const low = parseFloat(lowStr);
      const close = parseFloat(closeStr);
      const volume = parseFloat(volumeStr);
      
      // Validate data
      if ([timestampNum, open, high, low, close, volume].some(val => isNaN(val))) {
        console.warn(`Invalid data point for ${symbol}:`, { timestamp, openStr, highStr, lowStr, closeStr, volumeStr });
        return null;
      }

      const change = open !== 0 ? ((close - open) / open) * 100 : 0;

      return {
        symbol: symbol.toUpperCase(),
        time: formatTimestamp(timestampNum, interval),
        open,
        close,
        high,
        low,
        change: parseFloat(change.toFixed(2)),
        volume,
      };
    });

    const filteredData = processedData.filter((item) => item !== null);

    console.log(`Successfully fetched ${filteredData.length} data points for ${symbol}`);
    return filteredData;
  } catch (error) {
    console.error(`Failed to fetch historical data for ${symbol}:`, error);
    throw new Error(`Failed to fetch historical data for ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function formatTimestamp(timestamp: number, interval: string): string {
  const date = new Date(timestamp);
  
  // For hourly intervals, return full ISO string
  if (interval.includes('h') || interval.includes('m')) {
    return date.toISOString();
  }
  
  // For daily and longer intervals, return date only
  return date.toISOString().split('T')[0];
}

export function getPerformance({
  symbols,
  timeframe,
  groupBy,
  callback,
  limit,
  interval,
  streamTypes = ["kline"],
}: PerformanceParams): () => void {
  const symbolArray = Array.isArray(symbols) ? symbols : [symbols];
  const { supportedInterval } = mapTimeframeToInterval(timeframe);
  const effectiveInterval = interval || supportedInterval;
  const effectiveLimit = Math.min(limit || 100, 1000); // Binance API limit

  console.log('getPerformance called with:', {
    symbols: symbolArray,
    timeframe,
    effectiveInterval,
    effectiveLimit,
    groupBy,
    streamTypes
  });

  let isDestroyed = false;
  let currentData: ChartData[] = [];

  // Fetch initial historical data
  const fetchInitialData = async () => {
    if (isDestroyed) return;
    
    try {
      console.log('Fetching initial historical data...');
      const allDataPromises = symbolArray.map(async (symbol) => {
        try {
          return await fetchHistoricalKlines(symbol, effectiveInterval, effectiveLimit);
        } catch (error) {
          console.error(`Error fetching data for ${symbol}:`, error);
          return [];
        }
      });

      const allDataResults = await Promise.all(allDataPromises);
      const combinedData = allDataResults.flat();
      
      if (combinedData.length === 0) {
        console.warn('No historical data received');
        callback([], 'No historical data available');
        return;
      }

      // Sort by timestamp
      const sortedData = combinedData.sort((a, b) => {
        const timeA = new Date(a.time).getTime();
        const timeB = new Date(b.time).getTime();
        return timeA - timeB;
      });

      // Apply grouping if necessary
      const processedData = groupBy === "month" ? aggregateByMonth(sortedData) : sortedData;
      
      // Limit the data
      const limitedData = processedData.slice(-effectiveLimit);
      
      currentData = limitedData;
      console.log(`Initial data loaded: ${limitedData.length} points`);
      
      if (!isDestroyed) {
        callback(limitedData);
      }
    } catch (error) {
      console.error("Failed to fetch initial data:", error);
      if (!isDestroyed) {
        callback([], `Failed to fetch initial data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  // Set up real-time data subscription
  const client = getSharedClient();
  let isConnected = false;

  const callbacks: UnifiedCallbacks = {
    onKlineUpdate: (data, symbol, receivedInterval) => {
      if (isDestroyed || receivedInterval !== effectiveInterval) return;
      
      console.log(`Real-time kline update for ${symbol}:`, data.length, 'points');
      
      if (data && data.length > 0) {
        // Merge with current data
        const dataMap = new Map<string, ChartData>();
        
        // Add existing data
        currentData.forEach(item => {
          dataMap.set(`${item.symbol}_${item.time}`, item);
        });
        
        // Add/update with new data
        data.forEach(item => {
          if (symbolArray.includes(item.symbol)) {
            dataMap.set(`${item.symbol}_${item.time}`, item);
          }
        });
        
        // Convert back to array and sort
        const mergedData = Array.from(dataMap.values()).sort((a, b) => {
          const timeA = new Date(a.time).getTime();
          const timeB = new Date(b.time).getTime();
          return timeA - timeB;
        });
        
        // Apply grouping and limit
        const processedData = groupBy === "month" ? aggregateByMonth(mergedData) : mergedData;
        const limitedData = processedData.slice(-effectiveLimit);
        
        currentData = limitedData;
        callback(limitedData);
      }
    },

    onOrderBookUpdate: (orderBook, symbol) => {
      console.log(`Order book update for ${symbol}:`, {
        bids: orderBook.bids?.length || 0,
        asks: orderBook.asks?.length || 0
      });
    },

    onTickerUpdate: (ticker, symbol) => {
      console.log(`Ticker update for ${symbol}:`, ticker.lastPrice);
    },

    onConnectionStatus: (status) => {
      console.log('WebSocket connection status:', status);
      const wasConnected = isConnected;
      isConnected = status === "Connected";
      
      // If we just connected and have no data, fetch initial data
      if (isConnected && !wasConnected && currentData.length === 0) {
        fetchInitialData();
      }
    }
  };

  // Start initial data fetch
  fetchInitialData();

  // Subscribe to real-time updates
  console.log('Setting up real-time subscription...');
  const unsubscribe = client.subscribe(
    symbolArray,
    effectiveInterval,
    streamTypes,
    callbacks,
    groupBy,
    effectiveLimit
  );

  // Return cleanup function
  return () => {
    console.log('Cleaning up getPerformance subscription');
    isDestroyed = true;
    unsubscribe();
    
    // Clear connection status callback
    if (callbacks.onConnectionStatus) {
      client.off("connectionStatus", callbacks.onConnectionStatus);
    }
  };
}

function aggregateByMonth(data: ChartData[]): ChartData[] {
  const grouped: Record<string, {
    symbols: Set<string>;
    changes: number[];
    volume: number;
    high: number;
    low: number;
    open: number;
    close: number;
    count: number;
  }> = {};

  data.forEach((item) => {
    const date = new Date(item.time);
    const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-01`;
    
    if (!grouped[key]) {
      grouped[key] = {
        symbols: new Set([item.symbol]),
        changes: [item.change],
        volume: item.volume || 0,
        high: item.high || 0,
        low: item.low || Number.MAX_VALUE,
        open: item.open || 0,
        close: item.close || 0,
        count: 1,
      };
    } else {
      grouped[key].symbols.add(item.symbol);
      grouped[key].changes.push(item.change);
      grouped[key].volume += item.volume || 0;
      grouped[key].high = Math.max(grouped[key].high, item.high || 0);
      grouped[key].low = Math.min(grouped[key].low, item.low || Number.MAX_VALUE);
      grouped[key].close = item.close || grouped[key].close; // Use latest close
      grouped[key].count++;
    }
  });

  return Object.entries(grouped)
    .map(([time, data]) => ({
      symbol: Array.from(data.symbols).join(","),
      time,
      change: parseFloat((data.changes.reduce((a, b) => a + b, 0) / data.changes.length).toFixed(2)),
      volume: data.volume,
      high: data.high,
      low: data.low === Number.MAX_VALUE ? 0 : data.low,
      open: data.open,
      close: data.close,
    }))
    .sort((a, b) => a.time.localeCompare(b.time));
}