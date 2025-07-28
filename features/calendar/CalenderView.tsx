"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { getPerformance, mapTimeframeToInterval } from "@/utils/getPerformance";
import { Timeframe } from "@/types/timeframe";
import { useSwipeable } from "react-swipeable";
import CalendarHeader from "./CalendarHeader";
import CalendarControls from "./CalendarControls";
import CalendarGrid from "./CalendarGrid";
import CalendarStatsPanel from "./CalendarStatsPanel";
import CalendarLegend from "./CalendarLegend";
import { generateMonthGrid, generateWeekGrid } from "@/features/calendar/utils";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChartData } from "@/features/dashboard/types";
import { CalendarViewSkeleton } from "@/components/shared/SkeletonUI";

export default function CalendarView({
  symbol = "BTCUSDT",
  timeframe = "1M",
}: {
  symbol?: string;
  timeframe?: Timeframe;
}) {
  const today = useMemo(() => new Date(), []);
  const [currentDate, setCurrentDate] = useState(today);
  const [view, setView] = useState<"day" | "week" | "month">("month");
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [filterMode, setFilterMode] = useState<"all" | "gains" | "losses">("all");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([symbol]);
  const [volatilityThresholds, setVolatilityThresholds] = useState({ low: 0.3, medium: 0.7 });

  useEffect(() => {
    setLoading(true);
    setError(null);

    const { groupBy, supportedInterval, limit } = mapTimeframeToInterval(timeframe);

    const unsubscribe = getPerformance({
      symbols: selectedSymbols,
      timeframe,
      groupBy,
      interval: supportedInterval,
      limit,
      streamTypes: ["kline"],
      callback: (newData, err) => {
        if (err) {
          setError(err);
          setLoading(false);
          return;
        }
        setData(newData.filter((d) => selectedSymbols.includes(d.symbol)));
        setLoading(false);
      },
    });

    return () => unsubscribe();
  }, [selectedSymbols, timeframe]);

  const handlePrev = useCallback(() => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (view === "day") newDate.setDate(prev.getDate() - 1);
      else if (view === "week") newDate.setDate(prev.getDate() - 7);
      else newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  }, [view]);

  const handleNext = useCallback(() => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (view === "day") newDate.setDate(prev.getDate() + 1);
      else if (view === "week") newDate.setDate(prev.getDate() + 7);
      else newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  }, [view]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          handlePrev();
          break;
        case "ArrowRight":
          e.preventDefault();
          handleNext();
          break;
        case " ":
          e.preventDefault();
          setShowStats(!showStats);
          break;
        case "Escape":
          e.preventDefault();
          setSelectedCell(null);
          setHoveredCell(null);
          break;
        case "+":
          e.preventDefault();
          setZoomLevel((prev) => Math.min(prev + 0.1, 1.5));
          break;
        case "-":
          e.preventDefault();
          setZoomLevel((prev) => Math.max(prev - 0.1, 0.5));
          break;
      }
    },
    [handlePrev, handleNext, showStats]
  );

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleNext(),
    onSwipedRight: () => handlePrev(),
    trackMouse: true,
  });

  const stats = useMemo(() => {
    const validData = data.filter((d) => d.change !== undefined && d.change !== 0);
    if (validData.length === 0) return null;

    const changes = validData.map((d) => d.change);
    const volumes = validData.map((d) => d.volume || 0);
    const totalGains = changes.filter((c) => c > 0).reduce((sum, c) => sum + c, 0);
    const totalLosses = changes.filter((c) => c < 0).reduce((sum, c) => sum + Math.abs(c), 0);
    const avgChange = changes.reduce((sum, c) => sum + c, 0) / changes.length;
    const maxGain = Math.max(...changes);
    const maxLoss = Math.min(...changes);
    const avgVolume = volumes.reduce((sum, v) => sum + v, 0) / volumes.length;
    const volatility = Math.sqrt(
      changes.reduce((sum, c) => sum + Math.pow(c - avgChange, 2), 0) / changes.length
    );

    return {
      totalDays: validData.length,
      gainDays: changes.filter((c) => c > 0).length,
      lossDays: changes.filter((c) => c < 0).length,
      totalGains,
      totalLosses,
      netChange: totalGains - totalLosses,
      avgChange,
      maxGain,
      maxLoss,
      avgVolume,
      volatility,
      winRate: (changes.filter((c) => c > 0).length / changes.length) * 100,
    };
  }, [data]);

  const maxVolume = useMemo(() => {
    return Math.max(...data.map((d) => d.volume || 0), 1);
  }, [data]);

  const summaryData = useMemo(() => {
    if (view === "day") return null;
    const periodData =
      view === "week"
        ? generateWeekGrid(currentDate, data)
        : generateMonthGrid(currentDate.getFullYear(), currentDate.getMonth(), data);
    const flatData = periodData.flat().filter((cell) => cell.change !== undefined);
    if (flatData.length === 0) return null;

    const avgVolatility =
      flatData.reduce((sum, cell) => sum + (cell.volatility || 0), 0) / flatData.length;
    const totalVolume = flatData.reduce((sum, cell) => sum + (cell.volume || 0), 0);
    const avgChange = flatData.reduce((sum, cell) => sum + (cell.change || 0), 0) / flatData.length;

    return {
      avgVolatility: avgVolatility.toFixed(2),
      totalVolume: (totalVolume / 1000000).toFixed(1),
      avgChange: avgChange.toFixed(2),
    };
  }, [view, currentDate, data]);

  if (loading) {
    return (
      <CalendarViewSkeleton />
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-4 sm:p-8 font-title">
        <div className="bg-gradient-to-r from-rose-50 to-red-50 dark:from-rose-950/30 dark:to-red-950/40 rounded-3xl p-4 shadow-xl w-full max-w-md sm:w-1/2 sm:h-1/2">
          <div className="flex flex-col justify-center items-center space-y-3">
            <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/50 rounded-full flex items-center justify-center sm:w-12 sm:h-12">
              <span className="text-rose-600 dark:text-rose-400 text-3xl sm:text-4xl">
                <TriangleAlert />
              </span>
            </div>
            <div className="flex flex-col items-center space-y-2 text-center">
              <div className="font-semibold text-rose-800 dark:text-rose-200 text-base sm:text-lg font-text">
                Connection Error
              </div>
              <div className="text-base text-rose-600 dark:text-rose-400 sm:text-lg">
                {error}
              </div>
            </div>
            <Button
              variant="destructive"
              onClick={() => window.location.reload()}
              className="mt-3 px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-bold hover:bg-rose-700 transition-colors sm:text-md"
            >
              Retry Connection
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id="calendar-container"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className="focus:outline-none mx-auto p-2 sm:p-6 md:p-10 dark:bg-transparent rounded-2xl shadow-2xl backdrop-blur-md max-w-full"
      {...swipeHandlers}
      style={{
        transform: `scale(${Math.min(zoomLevel, 1)})`, // Limit zoom on mobile to avoid overflow
        transition: "transform 0.3s ease",
      }}
    >
      <CalendarHeader
        view={view}
        currentDate={currentDate}
        selectedSymbols={selectedSymbols}
        timeframe={timeframe}
        stats={stats}
        handlePrev={handlePrev}
        handleNext={handleNext}
        setZoomLevel={setZoomLevel}
      />
      <CalendarControls
        view={view}
        setView={setView}
        selectedSymbols={selectedSymbols}
        setSelectedSymbols={setSelectedSymbols}
        volatilityThresholds={volatilityThresholds}
        setVolatilityThresholds={setVolatilityThresholds}
        filterMode={filterMode}
        setFilterMode={setFilterMode}
        data={data}
        timeframe={timeframe}
        stats={stats}
        showStats={showStats}
        setShowStats={setShowStats}
      />
      {summaryData && view !== "day" && (
        <Card className="mb-4 font-logo sm:mb-6">
          <CardContent className="p-3 sm:p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400 sm:text-sm">Avg Volatility</p>
                <p className="text-base font-semibold sm:text-lg">{summaryData.avgVolatility}%</p>
              </div>
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400 sm:text-sm">Total Volume</p>
                <p className="text-base font-semibold sm:text-lg">{summaryData.totalVolume}M</p>
              </div>
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400 sm:text-sm">Avg Change</p>
                <p
                  className={`text-base font-semibold sm:text-lg ${
                    Number(summaryData.avgChange) >= 0 ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {Number(summaryData.avgChange) >= 0 ? "+" : ""}{summaryData.avgChange}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      <CalendarGrid
        view={view}
        currentDate={currentDate}
        data={data}
        today={today}
        hoveredCell={hoveredCell}
        setHoveredCell={setHoveredCell}
        selectedCell={selectedCell}
        setSelectedCell={setSelectedCell}
        filterMode={filterMode}
        volatilityThresholds={volatilityThresholds}
        maxVolume={maxVolume}
      />
      {showStats && stats && <CalendarStatsPanel stats={stats} />}
      <CalendarLegend volatilityThresholds={volatilityThresholds} />
    </div>
  );
}