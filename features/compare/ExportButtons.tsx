
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { CompareChartData, ComparisonMetrics } from "@/features/compare/types";
import { ComparisonType } from "@/features/compare/types";
import { Timeframe } from "@/types/timeframe";

interface ExportButtonsProps {
  compareData: CompareChartData[];
  metrics: ComparisonMetrics | null;
  comparisonType: ComparisonType;
  selectedSymbols: string[];
  selectedBenchmark: string;
  timeframe: Timeframe;
  periodA: string;
  periodB: string;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export function ExportButtons({
  compareData,
  metrics,
  comparisonType,
  selectedSymbols,
  selectedBenchmark,
  timeframe,
  periodA,
  periodB,
  setError,
  setLoading,
}: ExportButtonsProps) {
  const exportData = async (format: "pdf" | "csv" | "chart" = "csv") => {
    if (compareData.length === 0) {
      setError("No data available to export.");
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const chartElement = document.querySelector("[data-chart-container]") as HTMLElement;
    if (!chartElement) {
      setError("Chart container not found. Please ensure the chart is loaded.");
      console.error("Chart element not found: [data-chart-container]");
      return;
    }

    const exportOptions = {
      comparisonType,
      symbols: selectedSymbols,
      benchmark: selectedBenchmark,
      timeframe,
      periods: comparisonType === "time-periods" ? [periodA, periodB] : comparisonType === "period-over-period" ? [periodA] : undefined,
    };

    try {
      setLoading(true);
      switch (format) {
        case "pdf":
          const { exportComparisonAnalysis } = await import("@/features/compare/exportData");
          await exportComparisonAnalysis(compareData, metrics, chartElement, exportOptions);
          window.location.reload();
          break;
        case "chart":
          const { exportComparisonChart } = await import("@/features/compare/exportData");
          await exportComparisonChart(chartElement, exportOptions);
          window.location.reload();
          break;
        case "csv":
        default:
          const { exportComparisonDataAsCSV } = await import("@/features/compare/exportData");
          await exportComparisonDataAsCSV(compareData, exportOptions);
          break;
      }
      setError(null);
    } catch (error) {
      console.error("Export failed:", error);
      setError("Failed to export data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        onClick={() => exportData("csv")}
        disabled={compareData.length === 0}
      >
        <Download className="w-4 h-4" />
        CSV
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        onClick={() => exportData("chart")}
        disabled={compareData.length === 0}
      >
        <Download className="w-4 h-4" />
        Chart
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        onClick={() => exportData("pdf")}
        disabled={compareData.length === 0}
      >
        <Download className="w-4 h-4" />
        Full Report
      </Button>
    </div>
  );
}
