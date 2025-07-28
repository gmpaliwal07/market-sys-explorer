import React, { useEffect, useState } from "react";
import { getPerformance, mapTimeframeToInterval } from "@/utils/getPerformance";
import { Timeframe } from "@/types/timeframe";
import { ChartData } from "@/features/dashboard/types";
import { motion } from "motion/react";
import { ArrowUp, ArrowDown } from "lucide-react";

interface SummaryProps {
  symbol: "BTCUSDT" | "ETHUSDT" | "BNBUSDT";
  timeframe: Timeframe;
  onLoading?: (loading: boolean) => void;
  onError?: (error: string | null) => void;
}

export function PerformanceSummary({ symbol, timeframe, onLoading, onError }: SummaryProps) {
  const [summary, setSummary] = useState({
    totalChange: 0,
    bestPeriod: "",
    worstPeriod: "",
    trend: "up",
  });

  const cardVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    hover: { scale: 1.02, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", transition: { duration: 0.2 } },
  };

  useEffect(() => {
    let isMounted = true;

    onLoading?.(true);
    const { limit, groupBy, supportedInterval } = mapTimeframeToInterval(timeframe);

    const unsubscribe = getPerformance({
      symbols: [symbol],
      timeframe,
      groupBy,
      interval: supportedInterval,
      limit,
      streamTypes: ["kline"],
      callback: (data, error) => {
        if (!isMounted) return;
        if (error) {
          onError?.("Failed to load summary data");
          setSummary({
            totalChange: 0,
            bestPeriod: "-",
            worstPeriod: "-",
            trend: "up",
          });
          onLoading?.(false);
          return;
        }
        processData(data);
        onLoading?.(false);
      },
    });

    function processData(data: ChartData[]) {
      let filtered = data.filter((d) => d.symbol.toUpperCase() === symbol.toUpperCase());

      if (timeframe === "YTD" && groupBy === "day") {
        const startOfYear = new Date(new Date().getFullYear(), 0, 1).getTime();
        filtered = filtered.filter((d) => new Date(d.time).getTime() >= startOfYear);
      } else if (timeframe === "6M" && groupBy === "day") {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        filtered = filtered.filter((d) => new Date(d.time).getTime() >= sixMonthsAgo.getTime());
      } else if (timeframe === "1Y" && groupBy === "week") {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        filtered = filtered.filter((d) => new Date(d.time).getTime() >= oneYearAgo.getTime());
      }

      if (filtered.length === 0) {
        console.warn("PerformanceSummary - No data after filtering:", { symbol, timeframe });
        setSummary({
          totalChange: 0,
          bestPeriod: "-",
          worstPeriod: "-",
          trend: "up",
        });
        return;
      }

      const totalChange = filtered.reduce((acc, cur) => acc + (Number(cur.change) || 0), 0);
      const best = filtered.reduce((a, b) => (Number(a.change) || 0) > (Number(b.change) || 0) ? a : b, filtered[0]);
      const worst = filtered.reduce((a, b) => (Number(a.change) || 0) < (Number(b.change) || 0) ? a : b, filtered[0]);
      const trend = totalChange >= 0 ? "up" : "down";

      const formatPeriod = (time: string) => {
        const date = new Date(time);
        if (groupBy === "hour") {
          return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
        } else if (groupBy === "week") {
          return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
        } else {
          return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        }
      };

      setSummary({
        totalChange: parseFloat(totalChange.toFixed(2)),
        bestPeriod: best?.time ? formatPeriod(best.time) : "-",
        worstPeriod: worst?.time ? formatPeriod(worst.time) : "-",
        trend,
      });
    }

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [symbol, timeframe, onLoading, onError]);

  return (
    <motion.div
      className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm p-2 sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, staggerChildren: 0.1 }}
    >
      <motion.div
        className="p-3 sm:p-4 rounded-xl bg-muted/40 shadow-sm"
        variants={cardVariants}
        whileHover="hover"
      >
        <p className="text-muted-foreground mb-1 text-[10px] sm:text-xs">Performance</p>
        <p className="flex items-center gap-1 text-base sm:text-lg font-semibold">
          {summary.trend === "up" ? (
            <ArrowUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
          ) : (
            <ArrowDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
          )}
          {summary.totalChange}%
        </p>
      </motion.div>
      <motion.div
        className="p-3 sm:p-4 rounded-xl bg-muted/40 shadow-sm"
        variants={cardVariants}
        whileHover="hover"
      >
        <p className="text-muted-foreground mb-1 text-[10px] sm:text-xs">Best Period</p>
        <p className="text-base sm:text-lg font-semibold">{summary.bestPeriod}</p>
      </motion.div>
      <motion.div
        className="p-3 sm:p-4 rounded-xl bg-muted/40 shadow-sm"
        variants={cardVariants}
        whileHover="hover"
      >
        <p className="text-muted-foreground mb-1 text-[10px] sm:text-xs">Worst Period</p>
        <p className="text-base sm:text-lg font-semibold">{summary.worstPeriod}</p>
      </motion.div>
    </motion.div>
  );
}