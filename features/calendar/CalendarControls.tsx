import React, { Dispatch, SetStateAction } from "react";
import { motion } from "motion/react";
import { Timeframe } from "@/types/timeframe";
import { CalendarStats, exportCalendarDataAsPDF, exportEnhancedCalendarDataAsPDF, exportDataAsCSV } from "@/utils/pdfExport";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MaximizeIcon, TrendingUpIcon, TrendingDownIcon, FileTextIcon, ActivityIcon, BarChart3Icon, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChartData } from "@/features/dashboard/types";

interface CalendarControlsProps {
  view: "day" | "week" | "month";
  setView: Dispatch<SetStateAction<"day" | "week" | "month">>;
  selectedSymbols: string[];
  setSelectedSymbols: Dispatch<SetStateAction<string[]>>;
  volatilityThresholds: { low: number; medium: number };
  setVolatilityThresholds: Dispatch<SetStateAction<{ low: number; medium: number }>>;
  filterMode: "all" | "gains" | "losses";
  setFilterMode: Dispatch<SetStateAction<"all" | "gains" | "losses">>;
  data: ChartData[];
  timeframe: Timeframe;
  stats: CalendarStats | null;
  showStats: boolean;
  setShowStats: Dispatch<SetStateAction<boolean>>;
}

const AVAILABLE_SYMBOLS = [
  { value: "BTCUSDT", label: "Bitcoin (BTC)" },
  { value: "ETHUSDT", label: "Ethereum (ETH)" },
  { value: "BNBUSDT", label: "Binance Coin (BNB)" },
  { value: "ADAUSDT", label: "Cardano (ADA)" },
  { value: "SOLUSDT", label: "Solana (SOL)" },
];

export default function CalendarControls({
  view,
  setView,
  selectedSymbols,
  setSelectedSymbols,
  volatilityThresholds,
  setVolatilityThresholds,
  filterMode,
  setFilterMode,
  data,
  timeframe,
  stats,
  showStats,
  setShowStats,
}: CalendarControlsProps) {
  const handleExportDataPDF = async () => {
    try {
      if (!data || data.length === 0) {
        alert("No data available for export");
        return;
      }
      await exportCalendarDataAsPDF(data, {
        title: "Market Performance Data",
        symbol: selectedSymbols.join(", "),
        timeframe,
        includeStats: true,
        pageOrientation: "portrait",
      }, stats as CalendarStats);
    } catch (error) {
      console.error("Failed to export data PDF:", error);
      alert("Failed to export data. Please try again.");
    }
  };

  const handleExportEnhancedDataPDF = async () => {
    try {
      if (!data || data.length === 0) {
        alert("No data available for export");
        return;
      }
      await exportEnhancedCalendarDataAsPDF(data, {
        title: "Market Performance Report",
        symbol: selectedSymbols.join(", "),
        timeframe,
        includeStats: true,
        pageOrientation: "portrait",
      }, stats as CalendarStats);
    } catch (error) {
      console.error("Failed to export enhanced data PDF:", error);
      alert("Failed to export enhanced data. Please try again.");
    }
  };

  const handleCSVExport = async () => {
    try {
      if (!data || data.length === 0) {
        alert("No data available for CSV export");
        return;
      }
      await exportDataAsCSV(data, {
        title: "Market Performance Data",
        symbol: selectedSymbols.join(", "),
        timeframe,
      });
    } catch (error) {
      console.error("Failed to export CSV:", error);
      alert("Failed to export data as CSV. Please try again.");
    }
  };

  return (
    <motion.div
      className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 gap-2 sm:gap-4 font-text"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <motion.div
        className="bg-white/50 dark:bg-slate-800/50 rounded-full p-1 sm:p-2 shadow-xl backdrop-blur-sm border border-white/20 dark:border-slate-700/50"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex space-x-1 sm:space-x-2">
          {[
            { key: "day", label: "Day", icon: CalendarIcon },
            { key: "week", label: "Week", icon: BarChart3Icon },
            { key: "month", label: "Month", icon: CalendarIcon },
          ].map(({ key, label, icon: Icon }) => (
            <motion.div
              key={key}
              whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
              transition={{ duration: 0.2 }}
            >
              <Button
                variant="ghost"
                onClick={() => setView(key as "day" | "week" | "month")}
                className={cn(
                  "flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1 sm:py-2 rounded-full cursor-pointer font-semibold text-xs transition-all duration-300 transform hover:scale-102",
                  view === key
                    ? "text-black dark:text-white shadow-lg"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                )}
                aria-label={`Switch to ${label} view`}
              >
                <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{label}</span>
              </Button>
            </motion.div>
          ))}
        </div>
      </motion.div>
      <motion.div
        className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 font-text font-medium w-full sm:w-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Select value={selectedSymbols[0]} onValueChange={(value) => setSelectedSymbols([value])}>
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="Select symbols" />
          </SelectTrigger>
          <SelectContent>
            {AVAILABLE_SYMBOLS.map((sym) => (
              <SelectItem key={sym.value} value={sym.value}>
                {sym.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={`${volatilityThresholds.low},${volatilityThresholds.medium}`}
          onValueChange={(value) => {
            const [low, medium] = value.split(",").map(Number);
            setVolatilityThresholds({ low, medium });
          }}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Volatility thresholds" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0.2,0.6">Low: 0.2%, Med: 0.6%</SelectItem>
            <SelectItem value="0.3,0.7">Low: 0.3%, Med: 0.7%</SelectItem>
            <SelectItem value="0.4,0.8">Low: 0.4%, Med: 0.8%</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>
      <motion.div
        className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="bg-white/50 dark:bg-slate-800/50 rounded-full p-1 sm:p-2 shadow-xl backdrop-blur-sm border border-white/20 dark:border-slate-700/50">
          <div className="flex space-x-1">
            {[
              { key: "all", label: "All", icon: MaximizeIcon },
              { key: "gains", label: "Gains", icon: TrendingUpIcon },
              { key: "losses", label: "Losses", icon: TrendingDownIcon },
            ].map(({ key, label, icon: Icon }) => (
              <motion.div
                key={key}
                whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  variant="ghost"
                  onClick={() => setFilterMode(key as "all" | "gains" | "losses")}
                  className={cn(
                    "flex items-center space-x-1 px-2 sm:px-3 py-1 sm:py-2 rounded-full text-xs font-medium transition-all duration-200",
                    filterMode === key
                      ? key === "gains"
                        ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                        : key === "losses"
                        ? "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300"
                        : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                  )}
                  aria-label={`Filter by ${label}`}
                >
                  <Icon className="w-3 h-3 sm:w-3 sm:h-3" />
                  <span>{label}</span>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="bg-white/50 dark:bg-slate-800/50 rounded-full p-1 sm:p-2 shadow-xl backdrop-blur-sm border border-white/20 dark:border-slate-700/50 font-text">
          <div className="flex space-x-1">
            <motion.div whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }} transition={{ duration: 0.2 }}>
              <Button
                variant="ghost"
                onClick={handleExportDataPDF}
                className="flex items-center space-x-1 px-2 sm:px-3 py-1 sm:py-2 rounded-full text-xs font-medium transition-all duration-200 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-green-600 dark:hover:text-green-400"
                title="Export data table as PDF"
                aria-label="Export data as PDF"
              >
                <FileTextIcon className="w-3 h-3 sm:w-3 sm:h-3" />
                <span>Data</span>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }} transition={{ duration: 0.2 }}>
              <Button
                variant="ghost"
                onClick={handleExportEnhancedDataPDF}
                className="flex items-center space-x-1 px-2 sm:px-3 py-1 sm:py-2 rounded-full text-xs font-medium transition-all duration-200 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-purple-600 dark:hover:text-purple-400"
                title="Export enhanced report as PDF"
                aria-label="Export enhanced report as PDF"
              >
                <FileTextIcon className="w-3 h-3 sm:w-3 sm:h-3" />
                <span>Report</span>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }} transition={{ duration: 0.2 }}>
              <Button
                variant="ghost"
                onClick={handleCSVExport}
                className="flex items-center space-x-1 px-2 sm:px-3 py-1 sm:py-2 rounded-full text-xs font-medium transition-all duration-200 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-purple-600 dark:hover:text-purple-400"
                title="Export data as CSV"
                aria-label="Export data as CSV"
              >
                <FileTextIcon className="w-3 h-3 sm:w-3 sm:h-3" />
                <span>CSV</span>
              </Button>
            </motion.div>
          </div>
        </div>
        <motion.div
          className="bg-white/50 dark:bg-slate-800/50 rounded-full p-1 sm:p-2 shadow-xl backdrop-blur-sm border border-white/20 dark:border-slate-700/50 font-text"
          whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
          transition={{ duration: 0.2 }}
        >
          <Button
            variant="ghost"
            onClick={() => setShowStats(!showStats)}
            className="flex items-center space-x-1 px-2 sm:px-3 py-1 sm:py-2 rounded-full text-xs font-medium transition-all duration-200 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50"
            aria-label="Toggle statistics panel"
          >
            <ActivityIcon className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Stats</span>
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}