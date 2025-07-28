"use client";

import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart,
  AreaChart,
  Area,
  ReferenceLine,
} from "recharts";
import {
  ChartData,
  ChartType,
  TickerData,
  TIMEFRAME_CONFIGS,
  TechnicalIndicators,
  OrderBook,
  Timeframe,
} from "@/features/dashboard/types";
import { UnifiedBinanceClient } from "@/utils/UnifiedWebSocket";
import ChartTypeSelector from "@/features/dashboard/ChartSelectorType";
import TechnicalIndicatorsPanel from "@/features/dashboard/TechnicalIndicator";
import OrderBookComponent from "@/features/dashboard/OrderBook";
import TimeIntervalSelector from "@/features/dashboard/TimeSelector";
import EnhancedChart from "@/features/dashboard/EnhancedChart";
import MarketStats from "@/features/dashboard/MarketStats";
import { TrendingUp, Activity, BarChart3, Zap, Signal } from "lucide-react";
import { EnhancedTradingDashboardSkeleton } from "@/components/shared/SkeletonUI";

// Memoized MACD Chart Component
interface MACDChartProps {
  data: ChartData[];
}

const MACDChart = memo(
  ({ data }: MACDChartProps) => {
    // Memoize color configuration
    const colors = React.useMemo(
      () => ({
        text: document.documentElement.classList.contains("dark")
          ? "#ffffff"
          : "#374151",
        axisLine: document.documentElement.classList.contains("dark")
          ? "#4b5563"
          : "#d1d5db",
        tooltipBg: document.documentElement.classList.contains("dark")
          ? "rgba(31, 41, 55, 0.95)"
          : "rgba(255, 255, 255, 0.95)",
        tooltipBorder: document.documentElement.classList.contains("dark")
          ? "#4b5563"
          : "#e2e8f0",
        tooltipShadow: document.documentElement.classList.contains("dark")
          ? "0 10px 25px rgba(0,0,0,0.5)"
          : "0 10px 25px rgba(0,0,0,0.1)",
        refLine: document.documentElement.classList.contains("dark")
          ? "#64748b"
          : "#94a3b8",
        macd: "#f59e0b",
        signal: "#10b981",
      }),
      []
    );

    // Calculate Y-axis domain for MACD
    const yDomain = React.useMemo(() => {
      const macdValues = data.flatMap((d) =>
        [d.macd, d.signal].filter((v) => v != null && !isNaN(v as number))
      ) as number[];
      if (macdValues.length === 0) return ["dataMin", "dataMax"];
      const min = Math.min(...macdValues);
      const max = Math.max(...macdValues);
      const padding = (max - min) * 0.1; // 10% padding
      return [min - padding, max + padding];
    }, [data]);

    return (
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <XAxis
            dataKey="time"
            tickFormatter={(value) =>
              new Date(value).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })
            }
            tick={{ fontSize: 11, fill: colors.text }}
            axisLine={{ stroke: colors.axisLine }}
            tickLine={{ stroke: colors.axisLine }}
            className="text-slate-500 dark:text-slate-400"
          />
          <YAxis
            domain={yDomain}
            tickFormatter={(val) => val.toFixed(2)}
            tick={{ fontSize: 11, fill: colors.text }}
            axisLine={{ stroke: colors.axisLine }}
            tickLine={{ stroke: colors.axisLine }}
            width={60}
            className="text-slate-500 dark:text-slate-400"
          />
          <Tooltip
            labelFormatter={(value) => new Date(value).toLocaleString()}
            formatter={(value: number, name: string) => [value?.toFixed(4), name]}
            contentStyle={{
              backgroundColor: colors.tooltipBg,
              border: `1px solid ${colors.tooltipBorder}`,
              borderRadius: "12px",
              boxShadow: colors.tooltipShadow,
              backdropFilter: "blur(10px)",
            }}
            wrapperClassName="dark:[&>div]:!bg-slate-800/95 dark:[&>div]:!border-slate-600"
          />
          <ReferenceLine
            y={0}
            stroke={colors.refLine}
            strokeDasharray="3 3"
            className="dark:stroke-slate-500"
          />
          <Bar
            dataKey="macd"
            fill="url(#macdGradient)"
            opacity={0.6}
            radius={[2, 2, 0, 0]}
          />
          <Line
            type="monotone"
            dataKey="macd"
            stroke={colors.macd}
            strokeWidth={2}
            dot={false}
            name="MACD"
          />
          <Line
            type="monotone"
            dataKey="signal"
            stroke={colors.signal}
            strokeWidth={2}
            dot={false}
            name="Signal"
          />
          <defs>
            <linearGradient id="macdGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.macd} stopOpacity={0.8} />
              <stop offset="100%" stopColor={colors.macd} stopOpacity={0.1} />
            </linearGradient>
          </defs>
        </ComposedChart>
      </ResponsiveContainer>
    );
  },
  (prevProps, nextProps) => {
    // Compare only macd and signal values for re-render decision
    if (prevProps.data.length !== nextProps.data.length) return false;
    return prevProps.data.every((item, index) => {
      const nextItem = nextProps.data[index];
      return (
        item.time === nextItem.time &&
        item.macd === nextItem.macd &&
        item.signal === nextItem.signal
      );
    });
  }
);

MACDChart.displayName = "MACDChart";

export default function EnhancedTradingDashboard() {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [orderBook, setOrderBook] = useState<OrderBook>({
    bids: [],
    asks: [],
    lastUpdateId: 0,
  });
  const [ticker, setTicker] = useState<TickerData | null>(null);
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [timeframe, setTimeframe] = useState<Timeframe>("15m");
  const [chartType, setChartType] = useState<ChartType>("area");
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");
  const [isLoading, setIsLoading] = useState(true);

  const clientRef = useRef<UnifiedBinanceClient | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate timeframe duration in milliseconds
  const getTimeframeDuration = useCallback((timeframe: Timeframe): number => {
    const timeframeMap: Record<string, number> = {
      "1m": 60_000,
      "3m": 3 * 60_000,
      "5m": 5 * 60_000,
      "15m": 15 * 60_000,
      "30m": 30 * 60_000,
      "1h": 60 * 60_000,
      "2h": 2 * 60 * 60_000,
      "4h": 4 * 60 * 60_000,
      "6h": 6 * 60 * 60_000,
      "8h": 8 * 60 * 60_000,
      "12h": 12 * 60 * 60_000,
      "1d": 24 * 60 * 60_000,
      "3d": 3 * 24 * 60 * 60_000,
      "1w": 7 * 24 * 60 * 60_000,
      "1M": 30 * 24 * 60 * 60_000,
    };
    return timeframeMap[timeframe] || 15 * 60_000; // Default to 15m if undefined
  }, []);

  const calculateIndicators = useCallback((data: ChartData[], timeframe: Timeframe): ChartData[] => {
    if (!data || data.length === 0) {
      console.warn("No data for indicators");
      return data;
    }

    const validData = data.filter(d => d.close != null && !isNaN(d.close));
    
    const minDataPointsMap: Partial<Record<Timeframe, number>> = {
      "1m": 50,
      "5m": 40,
      "15m": 30,
      "1h": 26,
      "4h": 26,
      "1d": 20,
      "3m": 15,
      "6m": 15,
      "1y": 12,
    };
    const minDataPoints = minDataPointsMap[timeframe] ?? 26;

    if (validData.length < minDataPoints) {
      console.warn(`Insufficient valid data for indicators (${timeframe}):`, validData.length);
      return data;
    }

    const closes = validData.map((d) => d.close);
    
    const sma14 = validData.length >= 14 ? TechnicalIndicators.sma(closes, 14) : new Array(validData.length).fill(undefined);
    const sma50 = validData.length >= 50 ? TechnicalIndicators.sma(closes, 50) : new Array(validData.length).fill(undefined);
    const ema12 = validData.length >= 12 ? TechnicalIndicators.ema(closes, 12) : new Array(validData.length).fill(undefined);
    const ema26 = validData.length >= 26 ? TechnicalIndicators.ema(closes, 26) : new Array(validData.length).fill(undefined);
    const rsi = validData.length >= 14 ? TechnicalIndicators.rsi(closes, 14) : new Array(validData.length).fill(undefined);
    const bollinger = validData.length >= 20 ? TechnicalIndicators.bollinger(closes, 20, 2) : {
      upper: new Array(validData.length).fill(undefined),
      middle: new Array(validData.length).fill(undefined),
      lower: new Array(validData.length).fill(undefined),
    };
    const { macd, signal } = validData.length >= 26 ? TechnicalIndicators.macd(closes, 12, 26, 9) : {
      macd: new Array(validData.length).fill(undefined),
      signal: new Array(validData.length).fill(undefined),
    };

    return data.map((item, index) => ({
      ...item,
      sma14: sma14[index] != null && !isNaN(sma14[index]) ? sma14[index] : undefined,
      sma50: sma50[index] != null && !isNaN(sma50[index]) ? sma50[index] : undefined,
      ema12: ema12[index] != null && !isNaN(ema12[index]) ? ema12[index] : undefined,
      ema26: ema26[index] != null && !isNaN(ema26[index]) ? ema26[index] : undefined,
      rsi: rsi[index] != null && !isNaN(rsi[index]) ? rsi[index] : undefined,
      bollinger_upper: bollinger.upper[index] != null && !isNaN(bollinger.upper[index]) ? bollinger.upper[index] : undefined,
      bollinger_middle: bollinger.middle[index] != null && !isNaN(bollinger.middle[index]) ? bollinger.middle[index] : undefined,
      bollinger_lower: bollinger.lower[index] != null && !isNaN(bollinger.lower[index]) ? bollinger.lower[index] : undefined,
      macd: macd[index] != null && !isNaN(macd[index]) ? macd[index] : undefined,
      signal: signal[index] != null && !isNaN(signal[index]) ? signal[index] : undefined,
    }));
  }, []);

  const fetchInitialData = useCallback(
    async (selectedSymbol: string, selectedTimeframe: Timeframe) => {
      setIsLoading(true);
      try {
        const config = TIMEFRAME_CONFIGS[selectedTimeframe];
        if (!config) {
          throw new Error(`Invalid timeframe: ${selectedTimeframe}`);
        }

        const client = new UnifiedBinanceClient();
        const data = await client.fetchInitialData(
          selectedSymbol,
          config.interval,
          config.limit
        );

        if (data.length === 0) {
          console.warn("No data returned from fetchInitialData for:", { selectedSymbol, interval: config.interval });
        } else {
          console.log("Fetched initial data:", data);
        }

        const dataWithIndicators = calculateIndicators(data, selectedTimeframe);
        setChartData(dataWithIndicators);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        setChartData([]);
      } finally {
        setIsLoading(false);
      }
    },
    [calculateIndicators]
  );

  const onKlineUpdate = useCallback(
    (newData: ChartData[], symbol: string, interval: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      
      debounceRef.current = setTimeout(() => {
        setChartData((prev) => {
          if (!newData[0] || interval !== TIMEFRAME_CONFIGS[timeframe].wsInterval || newData[0].symbol !== symbol) return prev;
          
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          const newTime = new Date(newData[0].time).getTime();
          const lastTime = lastIndex >= 0 ? new Date(updated[lastIndex].time).getTime() : 0;
          const timeframeDuration = getTimeframeDuration(timeframe);

          // Align timestamps to timeframe boundaries
          const timeframeStart = Math.floor(newTime / timeframeDuration) * timeframeDuration;
          const lastTimeframeStart = lastIndex >= 0 ? Math.floor(lastTime / timeframeDuration) * timeframeDuration : 0;

          if (lastIndex >= 0 && timeframeStart === lastTimeframeStart) {
            // Update current candlestick if within the same timeframe interval
            updated[lastIndex] = { ...newData[0], symbol };
          } else {
            // Add new candlestick for new timeframe interval
            updated.push({ ...newData[0], symbol, time: new Date(timeframeStart).toISOString() });
            if (updated.length > TIMEFRAME_CONFIGS[timeframe].limit) updated.shift();
          }
          
          const dataWithIndicators = calculateIndicators(updated, timeframe);
          return dataWithIndicators;
        });
      }, 250);
    },
    [timeframe, calculateIndicators, getTimeframeDuration]
  );

  useEffect(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    if (clientRef.current) {
      clientRef.current.close();
      clientRef.current = null;
    }

    fetchInitialData(symbol, timeframe);

    clientRef.current = new UnifiedBinanceClient();
    const config = TIMEFRAME_CONFIGS[timeframe];
    if (config) {
      unsubscribeRef.current = clientRef.current.subscribe(
        symbol,
        config.wsInterval,
        ["kline", "depth", "ticker"],
        {
          onKlineUpdate,
          onOrderBookUpdate: (orderBook, symbol) => {
            console.log("onOrderBookUpdate:", { symbol, orderBook });
            setOrderBook(orderBook);
          },
          onTickerUpdate: (ticker) => {
            setTicker(ticker);
          },
          onConnectionStatus: (status) => {
            console.log("Connection status:", status);
            setConnectionStatus(status);
          },
        },
        "day",
        config.limit
      );
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      if (clientRef.current) {
        clientRef.current.close();
        clientRef.current = null;
      }
    };
  }, [symbol, timeframe, fetchInitialData, onKlineUpdate]);

  const handleSymbolChange = (newSymbol: string) => {
    setSymbol(newSymbol);
    setChartData([]);
    setOrderBook({ bids: [], asks: [], lastUpdateId: 0 });
    setTicker(null);
    setIsLoading(true);
  };

  const handleTimeframeChange = (newTimeframe: Timeframe) => {
    setTimeframe(newTimeframe);
    setChartData([]);
    setIsLoading(true);
  };

  // Memoize margins for Volume Analysis BarChart
  const volumeChartMargins = React.useMemo(() => {
    const isSmallScreen = typeof window !== "undefined" && window.innerWidth < 640;
    return isSmallScreen
      ? { top: 0, right: 0, left: 0, bottom: 0 }
      : { top: 5, right: 15, left: 10, bottom: 5 };
  }, []);

  // Dynamic tick formatter for XAxis based on timeframe
  const formatXAxisTick = useCallback(
    (value: string, timeframe: Timeframe) => {
      const date = new Date(value);
      if (["1m", "3m", "5m", "15m", "30m"].includes(timeframe)) {
        return date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      } else if (["1h", "2h", "4h", "6h", "8h", "12h"].includes(timeframe)) {
        return date.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      } else {
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "2-digit",
        });
      }
    },
    []
  );

  return (
    <div className="min-h-screen">
      <div className="max-w-full mx-auto p-2 sm:p-3 md:p-4 lg:p-6 space-y-3 sm:space-y-4">
        {/* Header */}
        <Card className="bg-white/90 dark:bg-[#171717] backdrop-blur-sm shadow-xl dark:border dark:border-white/25 rounded-xl sm:rounded-2xl border-0 transition-all duration-300 ease-in-out hover:shadow-2xl">
          <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
            <div className="flex flex-col space-y-3 sm:space-y-4 xl:flex-row xl:space-y-0 xl:justify-between xl:items-center">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 sm:p-3 bg-gradient-to-r from-black to-gray-600 rounded-lg sm:rounded-xl shadow-lg transition-transform duration-200 hover:scale-105">
                  <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg sm:text-xl md:text-2xl xl:text-3xl font-bold text-black dark:text-white">
                    Pro Dashboard
                  </CardTitle>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 dark:text-slate-200">Real-time cryptocurrency trading analysis</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-slate-100 dark:text-black rounded-lg sm:rounded-xl transition-all duration-200 hover:bg-slate-200">
                  <div
                    className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                      connectionStatus === "Connected"
                        ? "bg-emerald-500 shadow-lg shadow-emerald-500/30 animate-pulse"
                        : connectionStatus === "Connecting..."
                        ? "bg-amber-500 shadow-lg shadow-amber-500/30 dark:bg-green-300"
                        : "bg-red-500 shadow-lg shadow-red-500/30 dark:bg-red-300"
                    }`}
                  />
                  <span className="text-xs sm:text-sm font-semibold text-slate-700 font-text">{connectionStatus}</span>
                </div>
                <Select value={symbol} onValueChange={handleSymbolChange}>
                  <SelectTrigger className="w-full sm:w-48 md:w-56 rounded-lg sm:rounded-xl shadow-sm transition-all duration-200 hover:shadow-md">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg sm:rounded-xl shadow-2xl">
                    <SelectItem value="BTCUSDT" className="hover:bg-blue-50">Bitcoin (BTC/USDT)</SelectItem>
                    <SelectItem value="ETHUSDT" className="hover:bg-blue-50">Ethereum (ETH/USDT)</SelectItem>
                    <SelectItem value="BNBUSDT" className="hover:bg-blue-50">Binance Coin (BNB/USDT)</SelectItem>
                    <SelectItem value="ADAUSDT" className="hover:bg-blue-50">Cardano (ADA/USDT)</SelectItem>
                    <SelectItem value="SOLUSDT" className="hover:bg-blue-50">Solana (SOL/USDT)</SelectItem>
                    <SelectItem value="DOGEUSDT" className="hover:bg-blue-50">Dogecoin (DOGE/USDT)</SelectItem>
                    <SelectItem value="XRPUSDT" className="hover:bg-blue-50">Ripple (XRP/USDT)</SelectItem>
                    <SelectItem value="DOTUSDT" className="hover:bg-blue-50">Polkadot (DOT/USDT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Market Stats - Full Width */}
        <div className="transition-all duration-300 ease-in-out">
          <MarketStats ticker={ticker} />
        </div>

        {/* Main Content */}
        <div className="space-y-3 sm:space-y-4">
          {/* Main Chart and Controls */}
          <div className="space-y-3 sm:space-y-4">
            {/* Chart Controls */}
            <Card className="bg-white/90 dark:bg-[#171717] backdrop-blur-lg shadow-xl dark:border dark:border-white/25 rounded-lg sm:rounded-xl border-0 transition-all duration-300 ease-in-out hover:shadow-2xl">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col space-y-3 sm:space-y-4 lg:flex-row lg:space-y-0 lg:gap-4 lg:items-center lg:justify-between">
                  <div className="order-2 lg:order-1">
                    <TimeIntervalSelector
                      timeframe={timeframe}
                      onTimeframeChange={handleTimeframeChange}
                    />
                  </div>
                  <div className="order-1 lg:order-2">
                    <ChartTypeSelector
                      chartType={chartType}
                      onChartTypeChange={setChartType}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Main Chart */}
            <Card className="bg-white/90 dark:bg-[#171717] backdrop-blur-lg shadow-xl dark:border dark:border-white/25 rounded-lg sm:rounded-2xl border-0 transition-all duration-300 ease-in-out hover:shadow-2xl">
              <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <Signal className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-500 flex-shrink-0" />
                  <span className="text-sm sm:text-base lg:text-xl">
                    {chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart - {TIMEFRAME_CONFIGS[timeframe]?.label || "Custom"}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                {isLoading ? (
                  <EnhancedTradingDashboardSkeleton />
                ) : (
                  <div className="transition-all duration-500 ease-in-out">
                    <EnhancedChart
                      data={chartData}
                      chartType={chartType}
                      height={400}
                      timeframe={timeframe}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Book and Technical Indicators - Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            {/* Order Book */}
            <Card className="bg-white/90 dark:bg-[#171717] dark:border dark:border-white/25 backdrop-blur-sm shadow-xl rounded-lg sm:rounded-2xl border-0 transition-all duration-300 ease-in-out hover:shadow-2xl">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl font-bold text-slate-800 flex flex-col sm:flex-row sm:items-center gap-2 dark:text-white">
                  <Activity className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-emerald-600 flex-shrink-0" />
                  <span className="text-sm sm:text-base lg:text-xl">Live Order Book</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="transition-all duration-300 ease-in-out">
                  <OrderBookComponent orderBook={orderBook} ticker={ticker} />
                </div>
              </CardContent>
            </Card>

            {/* Technical Indicators Panel */}
            <Card className="bg-white/90 dark:bg-[#171717] backdrop-blur-sm shadow-xl rounded-lg sm:rounded-2xl border-0 dark:border dark:border-white/25 transition-all duration-300 ease-in-out hover:shadow-2xl">
              <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white flex flex-col sm:flex-row sm:items-center gap-2">
                  <Zap className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-purple-600 flex-shrink-0" />
                  <span className="text-sm sm:text-base lg:text-xl">Technical Indicators</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="transition-all duration-300 ease-in-out">
                  <TechnicalIndicatorsPanel data={chartData} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Volume Analysis - Full Width */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl dark:bg-[#171717] dark:border dark:border-white/25 rounded-lg sm:rounded-2xl border-0 transition-all duration-300 ease-in-out hover:shadow-2xl">
            <CardHeader className="border-slate-200/50 pb-3 sm:pb-4 p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white flex flex-col sm:flex-row sm:items-center gap-2">
                <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-indigo-600 flex-shrink-0" />
                <span className="text-sm sm:text-base lg:text-xl">Volume Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <div className="transition-all duration-300 ease-in-out">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData} margin={volumeChartMargins}>
                    <XAxis
                      dataKey="time"
                      tickFormatter={(value) => formatXAxisTick(value, timeframe)}
                      tick={{ 
                        fontSize: 10, 
                        fill: document.documentElement.classList.contains('dark') ? "#ffffff" : "#374151" 
                      }}
                      axisLine={{ 
                        stroke: document.documentElement.classList.contains('dark') ? "#4b5563" : "#d1d5db" 
                      }}
                      tickLine={{ 
                        stroke: document.documentElement.classList.contains('dark') ? "#4b5563" : "#d1d5db" 
                      }}
                      interval="preserveStartEnd"
                      tickCount={5}
                    />
                    <YAxis
                      domain={['dataMin', 'dataMax']}
                      tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`}
                      tick={{ 
                        fontSize: 10, 
                        fill: document.documentElement.classList.contains('dark') ? "#ffffff" : "#374151" 
                      }}
                      axisLine={{ 
                        stroke: document.documentElement.classList.contains('dark') ? "#4b5563" : "#d1d5db" 
                      }}
                      tickLine={{ 
                        stroke: document.documentElement.classList.contains('dark') ? "#4b5563" : "#d1d5db" 
                      }}
                      width={50}
                    />
                    <Tooltip
                      labelFormatter={(value) => formatXAxisTick(value, timeframe)}
                      formatter={(value: number) => [
                        value.toLocaleString(),
                        "Volume",
                      ]}
                      contentStyle={{
                        backgroundColor: document.documentElement.classList.contains('dark') 
                          ? "rgba(31, 41, 55, 0.95)" 
                          : "rgba(255, 255, 255, 0.95)",
                        border: document.documentElement.classList.contains('dark') 
                          ? "1px solid #4b5563" 
                          : "1px solid #e2e8f0",
                        borderRadius: "12px",
                        boxShadow: document.documentElement.classList.contains('dark') 
                          ? "0 10px 25px rgba(0,0,0,0.5)" 
                          : "0 10px 25px rgba(0,0,0,0.1)",
                        backdropFilter: "blur(10px)",
                        color: document.documentElement.classList.contains('dark') ? "#ffffff" : "#1f2937"
                      }}
                    />
                    <Bar 
                      dataKey="volume" 
                      fill="url(#volumeGradient)" 
                      radius={[2, 2, 0, 0]}
                      key={chartData.length}
                    />
                    <defs>
                      <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8}/>
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0.3}/>
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Technical Indicators Charts - Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            {/* MACD Chart */}
            <Card className="bg-white/90 dark:bg-[#171717] backdrop-blur-lg shadow-xl rounded-lg sm:rounded-2xl dark:border dark:border-white/25 border-0 transition-all duration-300 ease-in-out hover:shadow-2xl">
              <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl font-bold text-slate-800 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 dark:text-white">
                  <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-amber-600 flex-shrink-0" />
                  <span className="text-sm sm:text-base lg:text-xl">MACD Indicator (12,26,9)</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                <div className="transition-all duration-300 ease-in-out">
                  <MACDChart data={chartData} />
                </div>
              </CardContent>
            </Card>

            {/* RSI Chart */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl rounded-lg sm:rounded-2xl border-0 dark:bg-[#171717] dark:border dark:border-white/25 transition-all duration-300 ease-in-out hover:shadow-2xl">
              <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl font-bold text-slate-800 flex flex-col sm:flex-row sm:items-center gap-2 dark:text-white">
                  <Activity className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-purple-600 flex-shrink-0" />
                  <span className="text-sm sm:text-base lg:text-xl">RSI Indicator (14)</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                <div className="transition-all duration-300 ease-in-out">
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={chartData} margin={{ top: 5, right: 15, left: 10, bottom: 5 }}>
                      <XAxis
                        dataKey="time"
                        tickFormatter={(value) => formatXAxisTick(value, timeframe)}
                        tick={{ fontSize: 10, fill: "currentColor" }}
                        axisLine={{ stroke: "currentColor" }}
                        tickLine={{ stroke: "currentColor" }}
                        className="text-slate-500 dark:text-slate-400"
                        interval="preserveStartEnd"
                        tickCount={5}
                      />
                      <YAxis
                        domain={[0, 100]}
                        tick={{ fontSize: 10, fill: "currentColor" }}
                        axisLine={{ stroke: "currentColor" }}
                        tickLine={{ stroke: "currentColor" }}
                        width={40}
                        className="text-slate-500 dark:text-slate-400"
                      />
                      <Tooltip
                        labelFormatter={(value) => formatXAxisTick(value, timeframe)}
                        formatter={(value: number) => [value?.toFixed(2), "RSI"]}
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          border: "1px solid #e2e8f0",
                          borderRadius: "12px",
                          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                          backdropFilter: "blur(10px)",
                        }}
                        wrapperClassName="dark:[&>div]:!bg-slate-800/95 dark:[&>div]:!border-slate-600"
                      />
                      <ReferenceLine 
                        y={70} 
                        stroke="#ef4444" 
                        strokeDasharray="5 5" 
                        strokeWidth={1.5}
                        className="dark:stroke-red-400" 
                      />
                      <ReferenceLine 
                        y={30} 
                        stroke="#10b981" 
                        strokeDasharray="5 5" 
                        strokeWidth={1.5}
                        className="dark:stroke-green-400" 
                      />
                      <ReferenceLine 
                        y={50} 
                        stroke="#64748b" 
                        strokeDasharray="2 2" 
                        strokeWidth={1}
                        className="dark:stroke-slate-500" 
                      />
                      <Area
                        type="monotone"
                        dataKey="rsi"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        fill="url(#rsiGradient)"
                        className="dark:stroke-purple-400"
                      />
                      <defs>
                        <linearGradient id="rsiGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.6}/>
                          <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
