import { Skeleton } from "@/components/ui/skeleton";
import React from "react";
import { Card, CardHeader, CardContent } from "../ui/card";

export const PerformanceChartSkeleton = ({ timeframe = "1D" }: { timeframe?: string }) => {
  return (
    <div className="space-y-4">
      {/* Data range info for 1D timeframe */}
      {timeframe === "1D" && (
        <div className="space-y-2">
          <Skeleton className="h-3 w-48 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      )}
      {/* Chart area */}
      <Skeleton className="h-[300px] w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
    </div>
  );
};

export const PerformanceSummarySkeleton = () => {
  return (
    <div className="grid grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-4 rounded-xl bg-gray-100/40 dark:bg-gray-800/40">
          <Skeleton className="h-4 w-20 mb-2 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full bg-gray-200 dark:bg-gray-700" />
            <Skeleton className="h-5 w-16 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const MarketStatsSkeleton = () => {
  return (
    <Card className="bg-white/80 dark:bg-[#171717]/80 shadow-xl border border-gray-200/50 dark:border-white/25 rounded-xl">
      <CardHeader>
        <Skeleton className="h-6 w-40 rounded bg-gray-200 dark:bg-gray-700" />
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i}>
              <Skeleton className="h-4 w-24 mb-2 rounded bg-gray-200 dark:bg-gray-700" />
              <Skeleton className="h-5 w-16 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export const CompareViewSkeleton = () => {
  return (
    <div className="w-full max-w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="bg-white/80 dark:bg-[#171717]/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg border border-gray-200/50 dark:border-white/25">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Skeleton className="h-6 w-40 rounded bg-gray-200 dark:bg-gray-700" />
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm sm:text-base">
            Compare different time periods, symbols, and benchmarks
          </p>
        </div>
      </div>

      {/* Comparison Type Selector */}
      <div className="mb-4">
        <Skeleton className="h-10 w-full rounded-xl bg-gray-200 dark:bg-gray-700" />
      </div>

      {/* Comparison Controls */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-40 rounded-xl bg-gray-200 dark:bg-gray-700" />
        <Skeleton className="h-10 w-40 rounded-xl bg-gray-200 dark:bg-gray-700" />
        <Skeleton className="h-10 w-40 rounded-xl bg-gray-200 dark:bg-gray-700" />
      </div>

      {/* Metrics Display */}
      <div className="space-y-6">
        <Skeleton className="h-6 w-32 rounded bg-gray-200 dark:bg-gray-700" />
        <Skeleton className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
        <Skeleton className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
      </div>

      {/* Chart Display */}
      <div className="space-y-6">
        <Skeleton className="h-[400px] w-full rounded-2xl bg-gray-200 dark:bg-gray-700" />
      </div>

      {/* Export Buttons */}
      <div className="flex justify-start mt-4">
        <Skeleton className="h-12 w-48 rounded-xl bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  );
};

export const EnhancedTradingDashboardSkeleton = () => {
  return (
    <div className="min-h-screen space-y-4 p-3 sm:p-4 lg:p-6 max-w-[1800px] mx-auto">
      {/* Header */}
      <div className="bg-white/80 dark:bg-[#171717]/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200/50 dark:border-white/25">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl bg-gray-200 dark:bg-gray-700" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-40 rounded bg-gray-200 dark:bg-gray-700" />
              <Skeleton className="h-4 w-60 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-24 rounded-xl bg-gray-200 dark:bg-gray-700" />
            <Skeleton className="h-10 w-56 rounded-xl bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      </div>

      {/* Market Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 rounded-xl bg-gray-100/40 dark:bg-gray-800/40">
            <Skeleton className="h-4 w-24 mb-2 rounded bg-gray-200 dark:bg-gray-700" />
            <Skeleton className="h-5 w-16 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        ))}
      </div>

      {/* Chart Controls */}
      <div className="bg-white/80 dark:bg-[#171717]/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-200/50 dark:border-white/25">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <Skeleton className="h-10 w-40 rounded-xl bg-gray-200 dark:bg-gray-700" />
          <Skeleton className="h-10 w-40 rounded-xl bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-white/80 dark:bg-[#171717]/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-white/25">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Skeleton className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700" />
            <Skeleton className="h-6 w-40 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
          <Skeleton className="h-[550px] w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>

      {/* Volume Analysis */}
      <div className="bg-white/80 dark:bg-[#171717]/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-white/25">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700" />
            <Skeleton className="h-6 w-40 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
          <Skeleton className="h-[450px] w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>

      {/* Right Column: Order Book and Technical Indicators */}
      <div className="grid grid-cols-1 2xl:grid-cols-12 gap-3">
        <div className="2xl:col-span-8"></div> {/* Empty to align with left column */}
        <div className="2xl:col-span-4 space-y-6">
          {/* Order Book */}
          <div className="bg-white/80 dark:bg-[#171717]/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-white/25">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Skeleton className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700" />
                <Skeleton className="h-6 w-40 rounded bg-gray-200 dark:bg-gray-700" />
              </div>
              <Skeleton className="h-[300px] w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>

          {/* Technical Indicators Panel */}
          <div className="bg-white/80 dark:bg-[#171717]/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-white/25">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Skeleton className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700" />
                <Skeleton className="h-6 w-40 rounded bg-gray-200 dark:bg-gray-700" />
              </div>
              <Skeleton className="h-[260px] w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Technical Indicators Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* MACD Chart */}
        <div className="bg-white/80 dark:bg-[#171717]/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-white/25">
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <Skeleton className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700" />
              <Skeleton className="h-6 w-40 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
            <Skeleton className="h-[260px] w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>

        {/* RSI Chart */}
        <div className="bg-white/80 dark:bg-[#171717]/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-white/25">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Skeleton className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700" />
              <Skeleton className="h-6 w-40 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
            <Skeleton className="h-[260px] w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const CalendarViewSkeleton = () => {
  return (
    <div className="mx-auto p-2 sm:p-6 md:p-10 space-y-6 max-w-full rounded-2xl shadow-2xl backdrop-blur-md">
      {/* Calendar Header */}
      <div className="bg-white/80 dark:bg-[#171717]/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200/50 dark:border-white/25">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl bg-gray-200 dark:bg-gray-700" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40 rounded bg-gray-200 dark:bg-gray-700" />
            <Skeleton className="h-4 w-60 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      </div>

      {/* Calendar Controls */}
      <div className="flex flex-col lg:flex-row gap-4">
        <Skeleton className="h-10 w-40 rounded-xl bg-gray-200 dark:bg-gray-700" />
        <Skeleton className="h-10 w-40 rounded-xl bg-gray-200 dark:bg-gray-700" />
        <Skeleton className="h-10 w-40 rounded-xl bg-gray-200 dark:bg-gray-700" />
      </div>

      {/* Summary Data (for week/month views) */}
      <div className="bg-white/80 dark:bg-[#171717]/80 backdrop-blur-sm p-3 sm:p-4 rounded-2xl shadow-lg border border-gray-200/50 dark:border-white/25">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          <div>
            <Skeleton className="h-3 w-20 rounded mb-2 bg-gray-200 dark:bg-gray-700" />
            <Skeleton className="h-5 w-16 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
          <div>
            <Skeleton className="h-3 w-20 rounded mb-2 bg-gray-200 dark:bg-gray-700" />
            <Skeleton className="h-5 w-16 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
          <div>
            <Skeleton className="h-3 w-20 rounded mb-2 bg-gray-200 dark:bg-gray-700" />
            <Skeleton className="h-5 w-16 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white/80 dark:bg-[#171717]/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200/50 dark:border-white/25">
        <Skeleton className="h-[400px] w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
      </div>

      {/* Stats Panel */}
      <div className="bg-white/80 dark:bg-[#171717]/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200/50 dark:border-white/25">
        <Skeleton className="h-[260px] w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
      </div>

      {/* Calendar Legend */}
      <div className="bg-white/80 dark:bg-[#171717]/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200/50 dark:border-white/25">
        <Skeleton className="h-[100px] w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  );
};