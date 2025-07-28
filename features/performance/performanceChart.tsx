"use client";

import React, { useEffect, useState } from "react";
import { getPerformance, mapTimeframeToInterval } from "@/utils/getPerformance";
import { Timeframe } from "@/types/timeframe";
import { ChartData } from "@/features/dashboard/types";
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PerformanceChartSkeleton } from "@/components/shared/SkeletonUI";
import { motion, AnimatePresence } from "framer-motion";

interface ChartProps {
  symbol: string;
  timeframe: Timeframe;
  chartType: "line" | "bar";
  onLoading?: (loading: boolean) => void;
  onError?: (error: string | null) => void;
}

export function PerformanceChart({ symbol, timeframe, chartType, onLoading, onError }: ChartProps) {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const infoVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  };

  useEffect(() => {
    if (timeframe === "1D") {
      const interval = setInterval(() => {
        setCurrentTime(new Date());
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [timeframe]);

  useEffect(() => {
    let isMounted = true;

    setLoading(true);
    onLoading?.(true);
    setError(null);
    onError?.(null);

    const { groupBy, supportedInterval, limit } = mapTimeframeToInterval(timeframe);

    const unsubscribe = getPerformance({
      symbols: [symbol],
      timeframe,
      groupBy,
      interval: supportedInterval,
      limit,
      streamTypes: ["kline"],
      callback: (newData, error) => {
        if (!isMounted) return;

        if (error) {
          setError("Failed to load chart data");
          onError?.("Failed to load chart data");
          setLoading(false);
          onLoading?.(false);
          return;
        }

        const filteredData = newData.filter((d) => d.symbol.toUpperCase() === symbol.toUpperCase());
        setChartData(filteredData);
        setLoading(false);
        onLoading?.(false);
      },
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [symbol, timeframe, onLoading, onError]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <PerformanceChartSkeleton />
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-sm text-red-500 p-2 sm:p-4"
      >
        Error: {error}
      </motion.div>
    );
  }

  if (chartData.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-sm text-yellow-500 p-2 sm:p-4"
      >
        No data available for {symbol} on {timeframe}
      </motion.div>
    );
  }

  const getDataRangeInfo = () => {
    if (timeframe === "1D" && chartData.length > 0) {
      const firstTime = new Date(chartData[0].time);
      const lastTime = new Date(chartData[chartData.length - 1].time);

      return (
        <motion.div
          className="text-[10px] sm:text-xs text-muted-foreground mb-2 px-2 sm:px-0"
          variants={infoVariants}
          initial="hidden"
          animate="visible"
        >
          Data from {firstTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
          {" "}to {lastTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
          {" "}(Current: {currentTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })})
          {" "}• {chartData.length} points
        </motion.div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const formattedData = chartData.map((item) => ({
      time: item.time,
      change: Number(item.change) || 0,
      volume: Number(item.volume) || 0,
    }));

    const formatXAxisTick = (value: string) => {
      const date = new Date(value);
      if (timeframe === "1D") {
        return date.toLocaleTimeString("en-US", {
          hour: "numeric",
          hour12: true,
          timeZone: "UTC",
        });
      }
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    };

    const formatTooltipLabel = (label: string) => {
      const date = new Date(label);
      if (timeframe === "1D") {
        return date.toLocaleString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
          timeZone: "UTC",
        });
      }
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    if (chartType === "bar") {
      return (
        <BarChart data={formattedData}>
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10 }}
            tickFormatter={formatXAxisTick}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={["auto", "auto"]}
            tick={{ fontSize: 10 }}
            tickFormatter={(val) => `${Number(val).toFixed(1)}%`}
          />
          <Tooltip
            formatter={(value: number) => [`${Number(value).toFixed(2)}%`, "Change"]}
            labelStyle={{ fontWeight: "bold", fontSize: 12 }}
            labelFormatter={formatTooltipLabel}
          />
          <Bar
            dataKey="change"
            fill="#0ea5e9"
            barSize={timeframe === "1D" ? 10 : 15}
          />
        </BarChart>
      );
    }

    return (
      <LineChart data={formattedData}>
        <XAxis
          dataKey="time"
          tick={{ fontSize: 10 }}
          tickFormatter={formatXAxisTick}
          interval={timeframe === "1D" ? 2 : "preserveStartEnd"}
          angle={timeframe === "1D" ? -45 : 0}
          textAnchor={timeframe === "1D" ? "end" : "middle"}
          height={timeframe === "1D" ? 50 : 30}
        />
        <YAxis
          domain={["auto", "auto"]}
          tick={{ fontSize: 10 }}
          tickFormatter={(val) => `${Number(val).toFixed(1)}%`}
        />
        <Tooltip
          formatter={(value: number) => [`${Number(value).toFixed(2)}%`, "Change"]}
          labelStyle={{ fontWeight: "bold", fontSize: 12 }}
          labelFormatter={formatTooltipLabel}
        />
        <Line
          type="monotone"
          dataKey="change"
          stroke={timeframe === "1D" ? "#f59e0b" : "#0ea5e9"}
          strokeWidth={timeframe === "1D" ? 2 : 1.5}
          dot={{ r: timeframe === "1D" ? 2 : 3 }}
          activeDot={{ r: timeframe === "1D" ? 4 : 5 }}
        />
      </LineChart>
    );
  };

  return (
    <motion.div
      
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <AnimatePresence>{getDataRangeInfo()}</AnimatePresence>
      <ResponsiveContainer width="100%" height={250} className="min-h-[100px] sm:min-h-[250px]">
        {renderChart()}
      </ResponsiveContainer>
    </motion.div>
  );
}