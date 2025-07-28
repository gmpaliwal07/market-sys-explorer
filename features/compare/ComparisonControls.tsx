"use client";

import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X, Info, AlertTriangle } from "lucide-react";
import { ComparisonType } from "@/features/compare/types";
import { Timeframe } from "@/types/timeframe";

interface Option {
  value: string;
  label: string;
}

const AVAILABLE_SYMBOLS: Option[] = [
  { value: "BTCUSDT", label: "Bitcoin (BTC)" },
  { value: "ETHUSDT", label: "Ethereum (ETH)" },
  { value: "BNBUSDT", label: "Binance Coin (BNB)" },
  { value: "ADAUSDT", label: "Cardano (ADA)" },
  { value: "SOLUSDT", label: "Solana (SOL)" },
  { value: "DOTUSDT", label: "Polkadot (DOT)" },
];

const BENCHMARKS: Option[] = [
  { value: "BTCUSDT", label: "Bitcoin (Market Leader)" },
  { value: "ETHUSDT", label: "Ethereum (Alternative)" },
  { value: "market-cap", label: "Market Cap Weighted Index" },
  { value: "equal-weight", label: "Equal Weight Index" },
];

interface ComparisonControlsProps {
  comparisonType: ComparisonType;
  selectedSymbols: string[];
  setSelectedSymbols: (symbols: string[] | ((prev: string[]) => string[])) => void;
  selectedBenchmark: string;
  setSelectedBenchmark: (benchmark: string) => void;
  periodA: string;
  setPeriodA: (period: string) => void;
  periodB: string;
  setPeriodB: (period: string) => void;
  timeframe: Timeframe;
  setTimeframe: (timeframe: Timeframe) => void;
  dateOptions: Option[];
}

export function ComparisonControls({
  comparisonType,
  selectedSymbols,
  setSelectedSymbols,
  selectedBenchmark,
  setSelectedBenchmark,
  periodA,
  setPeriodA,
  periodB,
  setPeriodB,
  timeframe,
  setTimeframe,
  dateOptions,
}: ComparisonControlsProps) {
  const handleSymbolToggle = (symbol: string) => {
    setSelectedSymbols((prev: string[]) => {
      const newSelection = prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol];
      return newSelection.length === 0 ? [symbol] : newSelection;
    });
  };

  const TIMEFRAMES: Timeframe[] = ["1W", "1M", "3M", "6M", "1Y"];

  const renderControls = () => {
    switch (comparisonType) {
      case "time-periods":
        return (
          <div className="space-y-4 " >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="text-xs sm:text-sm font-medium mb-1 block">Symbol</label>
                <Select value={selectedSymbols[0]} onValueChange={(value) => setSelectedSymbols([value])}>
                  <SelectTrigger className="text-xs sm:text-sm py-2 sm:py-2.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_SYMBOLS.map((symbol) => (
                      <SelectItem key={symbol.value} value={symbol.value} className="text-xs sm:text-sm">
                        {symbol.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs sm:text-sm font-medium mb-1 block">Period A</label>
                <Select value={periodA} onValueChange={setPeriodA}>
                  <SelectTrigger className="text-xs sm:text-sm py-2 sm:py-2.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dateOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-xs sm:text-sm">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs sm:text-sm font-medium mb-1 block">Period B</label>
                <Select value={periodB} onValueChange={setPeriodB}>
                  <SelectTrigger className="text-xs sm:text-sm py-2 sm:py-2.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dateOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-xs sm:text-sm">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground bg-gray-100 dark:bg-gray-700 p-2 sm:p-3 rounded-lg flex items-center">
              <Info className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-white flex-shrink-0" />
              <span className="dark:text-white">
                Compare the same symbol&apos;s performance across two different time periods
              </span>
            </div>
          </div>
        );

      case "multi-symbol":
        return (
          <div className="space-y-4">
            <div>
              <label className="text-xs sm:text-sm font-medium mb-1 block">
                Select Symbols to Compare (minimum 2)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {AVAILABLE_SYMBOLS.map((symbol) => (
                  <div key={symbol.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={symbol.value}
                      checked={selectedSymbols.includes(symbol.value)}
                      onCheckedChange={() => handleSymbolToggle(symbol.value)}
                      className="h-4 w-4 sm:h-5 sm:w-5"
                    />
                    <label htmlFor={symbol.value} className="text-xs sm:text-sm cursor-pointer">
                      {symbol.label}
                    </label>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2 overflow-x-auto">
                {selectedSymbols.map((symbol) => (
                  <Badge key={symbol} variant="secondary" className="flex items-center gap-1 text-xs sm:text-sm py-1 px-2">
                    {AVAILABLE_SYMBOLS.find((s) => s.value === symbol)?.label}
                    {selectedSymbols.length >= 1 && (
                      <X
                        className="w-3 h-3 sm:w-4 sm:h-4 cursor-pointer hover:text-red-500"
                        onClick={() => handleSymbolToggle(symbol)}
                      />
                    )}
                  </Badge>
                ))}
              </div>
              {selectedSymbols.length < 2 && (
                <div className="text-xs sm:text-sm text-amber-600 bg-orange-50 p-2 sm:p-3 rounded-lg mt-2 flex items-center">
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                  Please select at least 2 symbols for multi-symbol comparison
                </div>
              )}
            </div>
          </div>
        );

      case "benchmark":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="text-xs sm:text-sm font-medium mb-1 block">Symbol</label>
                <Select value={selectedSymbols[0]} onValueChange={(value) => setSelectedSymbols([value])}>
                  <SelectTrigger className="text-xs sm:text-sm py-2 sm:py-2.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_SYMBOLS.map((symbol) => (
                      <SelectItem key={symbol.value} value={symbol.value} className="text-xs sm:text-sm">
                        {symbol.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs sm:text-sm font-medium mb-1 block">Benchmark</label>
                <Select value={selectedBenchmark} onValueChange={setSelectedBenchmark}>
                  <SelectTrigger className="text-xs sm:text-sm py-2 sm:py-2.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BENCHMARKS.filter((b) => b.value !== selectedSymbols[0]).map((benchmark) => (
                      <SelectItem key={benchmark.value} value={benchmark.value} className="text-xs sm:text-sm">
                        {benchmark.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground bg-gray-100 dark:bg-gray-700 p-2 sm:p-3 rounded-lg flex items-center">
              <Info className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-white flex-shrink-0" />
              <span className="dark:text-white">
                Compare your selected symbol against a benchmark. Index benchmarks provide broader market comparison.
              </span>
            </div>
          </div>
        );

      case "period-over-period":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="text-xs sm:text-sm font-medium mb-1 block">Symbol</label>
                <Select value={selectedSymbols[0]} onValueChange={(value) => setSelectedSymbols([value])}>
                  <SelectTrigger className="text-xs sm:text-sm py-2 sm:py-2.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_SYMBOLS.map((symbol) => (
                      <SelectItem key={symbol.value} value={symbol.value} className="text-xs sm:text-sm">
                        {symbol.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs sm:text-sm font-medium mb-1 block">Current Period</label>
                <Select value={periodA} onValueChange={setPeriodA} defaultOpen={true}>
                  <SelectTrigger className="text-xs sm:text-sm py-2 sm:py-2.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dateOptions.slice(0, 12).map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-xs sm:text-sm">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground bg-gray-100 dark:bg-gray-700 p-2 sm:p-3 rounded-lg flex items-center">
              <Info className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-white flex-shrink-0" />
              <span className="dark:text-white">
                Previous period will be automatically calculated (same period, previous year)
              </span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {renderControls()}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div className="w-full sm:w-32">
          <label className="text-xs sm:text-sm font-medium mb-1 block">Timeframe</label>
          <Select value={timeframe} onValueChange={(value) => setTimeframe(value as Timeframe)}>
            <SelectTrigger className="text-xs sm:text-sm py-2 sm:py-2.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEFRAMES.map((tf) => (
                <SelectItem key={tf} value={tf} className="text-xs sm:text-sm">{tf}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}