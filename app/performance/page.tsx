'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PerformanceChart } from '@/features/performance/performanceChart';
import { PerformanceSummary } from '@/features/performance/performanceSummary';
import { Timeframe } from '@/types/timeframe';
import { useDebounce } from 'use-debounce';
import { PerformanceChartSkeleton, PerformanceSummarySkeleton } from '@/components/shared/SkeletonUI';

const SUPPORTED_SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'] as const;
type SupportedSymbol = typeof SUPPORTED_SYMBOLS[number];
type ChartType = 'line' | 'bar';

// Animation variants for Framer Motion
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.5, 
      when: "beforeChildren",
      staggerChildren: 0.1 
    }
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const errorVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
};

export default function PerformancePage() {
  const [selectedSymbol, setSelectedSymbol] = useState<SupportedSymbol>('BTCUSDT');
  const [timeframe, setTimeframe] = useState<Timeframe>('1D');
  const [chartType, setChartType] = useState<ChartType>('line');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce symbol and timeframe changes to prevent excessive API calls
  const [debouncedSymbol] = useDebounce(selectedSymbol, 300);
  const [debouncedTimeframe] = useDebounce(timeframe, 300);

  // Handle loading and error states from child components
  const handleLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  const handleError = useCallback((err: string | null) => {
    setError(err);
  }, []);

  // Reset to default values
  const handleReset = useCallback(() => {
    setSelectedSymbol('BTCUSDT');
    setTimeframe('6M');
    setChartType('line');
    setError(null);
  }, []);

  // Memoize chart and summary components to prevent unnecessary re-renders
  const chartComponent = useMemo(
    () => (
      <PerformanceChart
        symbol={debouncedSymbol}
        timeframe={debouncedTimeframe}
        chartType={chartType}
        onLoading={handleLoading}
        onError={handleError}
      />
    ),
    [debouncedSymbol, debouncedTimeframe, chartType, handleLoading, handleError]
  );

  const summaryComponent = useMemo(
    () => (
      <PerformanceSummary
        symbol={debouncedSymbol}
        timeframe={debouncedTimeframe}
        onLoading={handleLoading}
        onError={handleError}
      />
    ),
    [debouncedSymbol, debouncedTimeframe, handleLoading, handleError]
  );

  return (
    <motion.div 
      className="container mx-auto p-4 max-w-full font-text"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <AnimatePresence>
        {error && (
          <motion.div 
            className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"
            variants={errorVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <span>{error}</span>
            <Button variant="outline" onClick={handleReset}>
              Retry
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-20"
        variants={itemVariants}
      >
        <div className="flex flex-wrap gap-2">
          {(['1D', '1W', '1M', '3M', '6M', 'YTD', '1Y', 'All'] as Timeframe[]).map((tf) => (
            <motion.div key={tf} variants={itemVariants}>
              <Button
                onClick={() => setTimeframe(tf)}
                variant={tf === timeframe ? 'default' : 'outline'}
                className="px-3 py-1 text-sm"
                aria-pressed={tf === timeframe}
                aria-label={`Select timeframe ${tf}`}
              >
                {tf}
              </Button>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <motion.div variants={itemVariants}>
            <Select
              value={selectedSymbol}
              onValueChange={(value) => setSelectedSymbol(value as SupportedSymbol)}
            >
              <SelectTrigger className="w-full sm:w-[180px]" aria-label="Select trading symbol">
                <SelectValue placeholder="Select Symbol" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_SYMBOLS.map((symbol) => (
                  <SelectItem key={symbol} value={symbol}>
                    {symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Select
              value={chartType}
              onValueChange={(value) => setChartType(value as ChartType)}
            >
              <SelectTrigger className="w-full sm:w-[120px]" aria-label="Select chart type">
                <SelectValue placeholder="Chart Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line">Line</SelectItem>
                <SelectItem value="bar">Bar</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Button 
              variant="outline" 
              onClick={handleReset} 
              aria-label="Reset to default settings"
            >
              Reset
            </Button>
          </motion.div>
        </div>
      </motion.div>

      <motion.div 
        className="relative"
        variants={itemVariants}
      >
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <PerformanceChartSkeleton />
              <PerformanceSummarySkeleton />
            </motion.div>
          )}
        </AnimatePresence>
        {chartComponent}
        {summaryComponent}
      </motion.div>
    </motion.div>
  );
}