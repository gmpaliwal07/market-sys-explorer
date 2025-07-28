"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { mapTimeframeToInterval } from "@/utils/getPerformance";
import { ComparisonType, CompareChartData, ComparisonMetrics } from "@/features/compare/types";
import { Timeframe } from "@/types/timeframe";
import { ComparisonTypeSelector } from "./ComparisonTypeSelector";
import { ComparisonControls } from "./ComparisonControls";
import { MetricsDisplay } from "./MetricsDisplay";
import { ChartDisplay } from "./ChartDisplay";
import { ExportButtons } from "./ExportButtons";
import { fetchBenchmarkComparison, fetchMultiSymbolComparison, fetchPeriodOverPeriodComparison, fetchTimePeriodComparison } from "./utils";
import { CompareViewSkeleton } from "@/components/shared/SkeletonUI";

export function CompareView() {
  const [comparisonType, setComparisonType] = useState<ComparisonType>("time-periods");
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>(["BTCUSDT"]);
  const [selectedBenchmark, setSelectedBenchmark] = useState<string>("BTCUSDT");
  const [timeframe, setTimeframe] = useState<Timeframe>("1M");
  const [periodA, setPeriodA] = useState<string>("2024-12");
  const [periodB, setPeriodB] = useState<string>("2024-01");
  const [compareData, setCompareData] = useState<CompareChartData[]>([]);
  const [metrics, setMetrics] = useState<ComparisonMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dateOptions = useMemo(() => {
    const options = [];
    const currentDate = new Date();
    for (let i = 0; i < 24; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const label = date.toLocaleDateString("en-US", { year: "numeric", month: "long" });
      options.push({ value, label });
    }
    return options;
  }, []);

  const calculateMetrics = useCallback((data: CompareChartData[]) => {
    if (data.length === 0) {
      setMetrics(null);
      return;
    }

    const keys = Object.keys(data[0]).filter((key) => key !== "time" && key !== "Outperformance" && key !== "YoY Difference");
    if (keys.length < 2) {
      setMetrics(null);
      return;
    }

    const values1 = data.map((item) => Number(item[keys[0]]) || 0);
    const values2 = data.map((item) => Number(item[keys[1]]) || 0);

    const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
    const variance = (arr: number[], m: number) => arr.reduce((a, b) => a + Math.pow(b - m, 2), 0) / arr.length;
    const covariance = (arr1: number[], arr2: number[], m1: number, m2: number) =>
      arr1.reduce((a, b, i) => a + (b - m1) * (arr2[i] - m2), 0) / arr1.length;

    const mean1 = mean(values1);
    const mean2 = mean(values2);
    const var1 = variance(values1, mean1);
    const var2 = variance(values2, mean2);
    const cov = covariance(values1, values2, mean1, mean2);
    const correlation = cov / Math.sqrt(var1 * var2) || 0;
    const volatilityDifference = Math.sqrt(var1) - Math.sqrt(var2);
    const performanceGap = mean1 - mean2;
    const sharpeRatioA = mean1 / Math.sqrt(var1) || 0;
    const sharpeRatioB = mean2 / Math.sqrt(var2) || 0;

    setMetrics({
      correlation: isNaN(correlation) ? 0 : correlation,
      volatilityDifference: isNaN(volatilityDifference) ? 0 : volatilityDifference,
      performanceGap: isNaN(performanceGap) ? 0 : performanceGap,
      sharpeRatioA: isNaN(sharpeRatioA) ? 0 : sharpeRatioA,
      sharpeRatioB: isNaN(sharpeRatioB) ? 0 : sharpeRatioB,
    });
  }, []);

  const fetchComparisonData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { limit } = mapTimeframeToInterval(timeframe);

    try {
      let processedData: CompareChartData[] = [];

      switch (comparisonType) {
        case "time-periods":
          processedData = await fetchTimePeriodComparison(selectedSymbols[0], timeframe, periodA, periodB);
          break;
        case "multi-symbol":
          processedData = await fetchMultiSymbolComparison(selectedSymbols, timeframe, limit);
          break;
        case "benchmark":
          processedData = await fetchBenchmarkComparison(selectedSymbols[0], selectedBenchmark, timeframe, limit);
          break;
        case "period-over-period":
          processedData = await fetchPeriodOverPeriodComparison(selectedSymbols[0], timeframe, periodA);
          break;
      }

      console.log("Processed data:", processedData);

      setCompareData(processedData);
      calculateMetrics(processedData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching comparison data:", error);
      setError("Failed to fetch comparison data. Please try again.");
      setLoading(false);
    }
  }, [comparisonType, selectedSymbols, selectedBenchmark, timeframe, periodA, periodB, calculateMetrics]);

  useEffect(() => {
    fetchComparisonData();
  }, [fetchComparisonData]);

  return (
    <div className="w-full max-w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 font-text">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-title">Compare Analysis</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Compare different time periods, symbols, benchmarks, and analyze period-over-period changes
          </p>
        </div>
        <div className="flex justify-start mt-4">
          <ExportButtons
            compareData={compareData}
            metrics={metrics}
            comparisonType={comparisonType}
            selectedSymbols={selectedSymbols}
            selectedBenchmark={selectedBenchmark}
            timeframe={timeframe}
            periodA={periodA}
            periodB={periodB}
            setError={setError}
            setLoading={setLoading}
          />
        </div>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-text">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
            Comparison Type
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 ">
          <ComparisonTypeSelector comparisonType={comparisonType} setComparisonType={setComparisonType} />


          <ComparisonControls
            comparisonType={comparisonType}
            selectedSymbols={selectedSymbols}
            setSelectedSymbols={setSelectedSymbols}
            selectedBenchmark={selectedBenchmark}
            setSelectedBenchmark={setSelectedBenchmark}
            periodA={periodA}
            setPeriodA={setPeriodA}
            periodB={periodB}
            setPeriodB={setPeriodB}
            timeframe={timeframe}
            setTimeframe={setTimeframe}
            dateOptions={dateOptions}
          />
          <Button
            onClick={fetchComparisonData}
            disabled={loading || (comparisonType === "multi-symbol" && selectedSymbols.length < 2)}
            className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base"
          >
            {loading ? "Loading..." : "Compare"}
          </Button>
        </CardContent>
      </Card>

      {loading && (
        <CompareViewSkeleton />
      )}

      {error && (
        <Card className="w-full border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
              <p className="text-red-600 text-sm sm:text-base">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        <MetricsDisplay metrics={metrics} />
        <ChartDisplay compareData={compareData} comparisonType={comparisonType} />
      </div>

      {!loading && !error && compareData.length === 0 && (
        <Card className="w-full">
          <CardContent className="pt-6">
            <div className="text-center p-6 sm:p-8">
              <AlertTriangle className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-sm sm:text-base">
                No comparison data available. Try adjusting your selection or time period.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}