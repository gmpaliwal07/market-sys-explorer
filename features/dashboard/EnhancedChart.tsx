"use client";

import React, { useMemo } from "react";
import { Area, AreaChart, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import CandlestickChart from "@/features/dashboard/CandleStickChart";
import { ChartData, ChartType } from "@/features/dashboard/types";
import { TrendingUp } from "lucide-react";

interface EnhancedChartProps {
  data: ChartData[];
  chartType: ChartType;
  timeframe: string;
  height: number;
}

// Utility to compare data arrays for memoization
const areDataEqual = (prevData: ChartData[], nextData: ChartData[]) => {
  if (prevData.length !== nextData.length) return false;
  return prevData.every((item, index) => {
    const nextItem = nextData[index];
    return (
      item.time === nextItem.time &&
      item.open === nextItem.open &&
      item.high === nextItem.high &&
      item.low === nextItem.low &&
      item.close === nextItem.close &&
      item.sma20 === nextItem.sma20 &&
      item.sma50 === nextItem.sma50 &&
      item.bollinger_upper === nextItem.bollinger_upper &&
      item.bollinger_lower === nextItem.bollinger_lower &&
      item.bollinger_middle === nextItem.bollinger_middle
    );
  });
};

const EnhancedChart: React.FC<EnhancedChartProps> = React.memo(
  ({ data, chartType, timeframe, height }) => {
    // Memoize responsive margins based on screen size
    const margins = useMemo(() => {
      const isSmallScreen = typeof window !== "undefined" && window.innerWidth < 640; // Tailwind's 'sm' breakpoint
      return isSmallScreen
        ? { top: 0, right: 0, left: 0, bottom: 0 } // No padding for small screens
        : chartType === "area"
        ? { top: 5, right: 5, left: 20, bottom: 0 } // Existing margins for area chart
        : { top: 10, right: 30, left: 10, bottom: 10 }; // Existing margins for other charts
    }, [chartType]);

    const formatChartTime = (timeStr: string) => {
      if (!timeStr) return "";
      const date = new Date(timeStr);
      if (["1m", "3m", "5m", "15m", "30m"].includes(timeframe)) {
        return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
      } else if (["1h", "2h", "4h", "6h", "8h", "12h"].includes(timeframe)) {
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit" });
      }
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    // Memoize Y-axis domain calculation
    const yDomain = useMemo(() => {
      const allPrices = data.flatMap(d =>
        [d.high, d.low, d.open, d.close, d.sma20, d.sma50, d.bollinger_upper, d.bollinger_lower].filter(
          p => p != null
        )
      ) as number[];

      if (allPrices.length === 0) return ["dataMin", "dataMax"];

      const minPrice = Math.min(...allPrices);
      const maxPrice = Math.max(...allPrices);
      const padding = (maxPrice - minPrice) * 0.02; // 2% padding
      return [minPrice - padding, maxPrice + padding];
    }, [data]);

    // Memoize color scheme based on dark mode
    const colors = useMemo(() => {
      const isDarkMode = typeof document !== "undefined" && document.documentElement.classList.contains('dark');
      return {
        text: isDarkMode ? "#ffffff" : "#374151",
        textSecondary: isDarkMode ? "#d1d5db" : "#6b7280",
        axisLine: isDarkMode ? "#4b5563" : "#d1d5db",
        tooltipBg: isDarkMode ? "#1f2937" : "#ffffff",
        tooltipBorder: isDarkMode ? "#4b5563" : "#e5e7eb",
        tooltipText: isDarkMode ? "#ffffff" : "#1f2937",
        primary: "#10b981", // emerald-500
        secondary: "#1f2937", // gray-800
        accent: "#6366f1", // indigo-500
        warning: "#f59e0b", // amber-500
        success: "#22c55e", // green-500
        purple: "#8b5cf6", // violet-500
      };
    }, []);

    if (!data || data.length === 0) {
      return (
        <div className="h-96 flex items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
          <div className="text-center">
            <div className="text-2xl mb-2"><TrendingUp /></div>
            <div>No chart data available</div>
          </div>
        </div>
      );
    }

    if (chartType === "candlestick") {
      return <CandlestickChart data={data} height={height} />;
    }

    if (chartType === "area") {
      return (
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data} margin={margins}>
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.primary} stopOpacity={0.4} />
                <stop offset="95%" stopColor={colors.primary} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              tickFormatter={formatChartTime}
              tick={{ fontSize: 11, fill: colors.text }}
              axisLine={{ stroke: colors.axisLine, strokeWidth: 1 }}
              tickLine={{ stroke: colors.axisLine }}
            />
            <YAxis
              domain={yDomain}
              tickFormatter={(val) => `$${val.toFixed(2)}`}
              tick={{ fontSize: 11, fill: colors.text }}
              axisLine={{ stroke: colors.axisLine, strokeWidth: 1 }}
              tickLine={{ stroke: colors.axisLine }}
              width={60}
            />
            <Tooltip
              labelFormatter={(label) => formatChartTime(label?.toString() || "")}
              formatter={(value: number, name: string) => [`$${value.toFixed(4)}`, name]}
              contentStyle={{
                backgroundColor: colors.tooltipBg,
                border: `1px solid ${colors.tooltipBorder}`,
                borderRadius: "12px",
                boxShadow: colors.tooltipBg.includes("1f2937")
                  ? "0 10px 25px rgba(0,0,0,0.5)"
                  : "0 10px 25px rgba(0,0,0,0.15)",
                fontSize: "13px",
                color: colors.tooltipText,
              }}
              cursor={{ stroke: colors.textSecondary, strokeWidth: 1, strokeDasharray: "3 3" }}
            />
            <Area
              type="monotone"
              dataKey="close"
              stroke={colors.primary}
              fill="url(#areaGradient)"
              strokeWidth={2.5}
              name="Price"
            />
            {data[0]?.sma20 && (
              <Line
                type="monotone"
                dataKey="sma20"
                stroke={colors.warning}
                strokeWidth={2}
                dot={false}
                strokeDasharray="5 5"
                name="SMA 20"
              />
            )}
            {data[0]?.bollinger_upper && (
              <>
                <Line
                  type="monotone"
                  dataKey="bollinger_upper"
                  stroke={colors.purple}
                  strokeWidth={1.5}
                  dot={false}
                  strokeDasharray="2 2"
                  name="BB Upper"
                />
                <Line
                  type="monotone"
                  dataKey="bollinger_lower"
                  stroke={colors.purple}
                  strokeWidth={1.5}
                  dot={false}
                  strokeDasharray="2 2"
                  name="BB Lower"
                />
              </>
            )}
          </AreaChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === "ohlc") {
      return (
        <ResponsiveContainer width="100%" height={height}>
          <ComposedChart data={data} margin={margins}>
            <XAxis
              dataKey="time"
              tickFormatter={formatChartTime}
              tick={{ fontSize: 11, fill: colors.text }}
              axisLine={{ stroke: colors.axisLine, strokeWidth: 1 }}
              tickLine={{ stroke: colors.axisLine }}
            />
            <YAxis
              domain={yDomain}
              tickFormatter={(val) => `${val.toFixed(2)}`}
              tick={{ fontSize: 11, fill: colors.text }}
              axisLine={{ stroke: colors.axisLine, strokeWidth: 1 }}
              tickLine={{ stroke: colors.axisLine }}
              width={60}
            />
            <Tooltip
              labelFormatter={(label) => formatChartTime(label?.toString() || "")}
              formatter={(value: number, name: string) => [`${value.toFixed(4)}`, name]}
              contentStyle={{
                backgroundColor: colors.tooltipBg,
                border: `1px solid ${colors.tooltipBorder}`,
                borderRadius: "12px",
                boxShadow: colors.tooltipBg.includes("1f2937")
                  ? "0 10px 25px rgba(0,0,0,0.5)"
                  : "0 10px 25px rgba(0,0,0,0.15)",
                fontSize: "13px",
                color: colors.tooltipText,
              }}
              cursor={{ stroke: colors.textSecondary, strokeWidth: 1, strokeDasharray: "3 3" }}
            />
            <Line
              type="monotone"
              dataKey="open"
              stroke={colors.accent}
              strokeWidth={2}
              dot={false}
              name="Open"
            />
            <Line
              type="monotone"
              dataKey="high"
              stroke={colors.success}
              strokeWidth={2}
              dot={false}
              name="High"
            />
            <Line
              type="monotone"
              dataKey="low"
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
              name="Low"
            />
            <Line
              type="monotone"
              dataKey="close"
              stroke={colors.primary}
              strokeWidth={2.5}
              dot={false}
              name="Close"
            />
            {data[0]?.sma20 && (
              <Line
                type="monotone"
                dataKey="sma20"
                stroke={colors.warning}
                strokeWidth={2}
                dot={false}
                strokeDasharray="5 5"
                name="SMA 20"
              />
            )}
            {data[0]?.bollinger_upper && (
              <>
                <Line
                  type="monotone"
                  dataKey="bollinger_upper"
                  stroke={colors.purple}
                  strokeWidth={1.5}
                  dot={false}
                  strokeDasharray="2 2"
                  name="BB Upper"
                />
                <Line
                  type="monotone"
                  dataKey="bollinger_lower"
                  stroke={colors.purple}
                  strokeWidth={1.5}
                  dot={false}
                  strokeDasharray="2 2"
                  name="BB Lower"
                />
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      );
    }

    // Default line chart
    return (
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data} margin={margins}>
          <defs>
            <linearGradient id="closeGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={colors.primary} />
              <stop offset="100%" stopColor={colors.success} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="time"
            tickFormatter={formatChartTime}
            tick={{ fontSize: 11, fill: colors.text }}
            axisLine={{ stroke: colors.axisLine, strokeWidth: 1 }}
            tickLine={{ stroke: colors.axisLine }}
          />
          <YAxis
            domain={yDomain}
            tickFormatter={(val) => `$${val.toFixed(2)}`}
            tick={{ fontSize: 11, fill: colors.text }}
            axisLine={{ stroke: colors.axisLine, strokeWidth: 1 }}
            tickLine={{ stroke: colors.axisLine }}
            width={60}
          />
          <Tooltip
            labelFormatter={(label) => formatChartTime(label?.toString() || "")}
            formatter={(value: number, name: string) => {
              const formatValue = name.includes("price") || name === "close" || name.includes("sma") || name.includes("bollinger")
                ? `$${value.toFixed(4)}`
                : value.toFixed(4);
              return [formatValue, name];
            }}
            contentStyle={{
              backgroundColor: colors.tooltipBg,
              border: `1px solid ${colors.tooltipBorder}`,
              borderRadius: "12px",
              boxShadow: colors.tooltipBg.includes("1f2937")
                ? "0 10px 25px rgba(0,0,0,0.5)"
                : "0 10px 25px rgba(0,0,0,0.15)",
              fontSize: "13px",
              color: colors.tooltipText,
            }}
            cursor={{ stroke: colors.textSecondary, strokeWidth: 1, strokeDasharray: "3 3" }}
          />
          <Line
            type="monotone"
            dataKey="close"
            stroke="url(#closeGradient)"
            strokeWidth={3}
            dot={false}
            name="Close Price"
          />
          {data[0]?.sma20 && (
            <Line
              type="monotone"
              dataKey="sma20"
              stroke={colors.warning}
              strokeWidth={2}
              dot={false}
              strokeDasharray="5 5"
              name="SMA 20"
            />
          )}
          {data[0]?.sma50 && (
            <Line
              type="monotone"
              dataKey="sma50"
              stroke={colors.accent}
              strokeWidth={2}
              dot={false}
              strokeDasharray="8 6"
              name="SMA 50"
            />
          )}
          {data[0]?.bollinger_upper && (
            <>
              <Line
                type="monotone"
                dataKey="bollinger_upper"
                stroke={colors.purple}
                strokeWidth={1.5}
                dot={false}
                strokeDasharray="3 3"
                name="BB Upper"
              />
              <Line
                type="monotone"
                dataKey="bollinger_lower"
                stroke={colors.purple}
                strokeWidth={1.5}
                dot={false}
                strokeDasharray="3 3"
                name="BB Lower"
              />
              <Line
                type="monotone"
                dataKey="bollinger_middle"
                stroke={colors.purple}
                strokeWidth={2}
                dot={false}
                strokeOpacity={0.8}
                name="BB Middle"
              />
            </>
          )}
        </ComposedChart>
      </ResponsiveContainer>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.chartType === nextProps.chartType &&
      prevProps.timeframe === nextProps.timeframe &&
      prevProps.height === nextProps.height &&
      areDataEqual(prevProps.data, nextProps.data)
    );
  }
);

EnhancedChart.displayName = "EnhancedChart";

export default EnhancedChart;