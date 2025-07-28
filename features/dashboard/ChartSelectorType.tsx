"use client";

import React from "react";
import { Activity, BarChart3, TrendingUp, Volume2 } from "lucide-react";
import { ChartType } from "@/features/dashboard/types";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";

const ChartTypeSelector: React.FC<{
  chartType: ChartType;
  onChartTypeChange: (type: ChartType) => void;
}> = ({ chartType, onChartTypeChange }) => {
  const chartTypes: { value: ChartType; label: string; icon: React.ReactNode }[] = [
    { value: "line", label: "Line", icon: <Activity className="h-5 w-5 sm:h-6 sm:w-6" /> },
    { value: "candlestick", label: "Candlestick", icon: <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6" /> },
    { value: "area", label: "Area", icon: <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" /> },
    { value: "ohlc", label: "OHLC", icon: <Volume2 className="h-5 w-5 sm:h-6 sm:w-6" /> },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full sm:flex sm:items-center sm:space-x-2"
    >
      {/* Mobile: Select component */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex-1 block sm:hidden mb-5"
      >
        <label className="text-xs font-medium mb-1 block">Chart Type</label>
        <Select value={chartType} onValueChange={(value) => onChartTypeChange(value as ChartType)}>
          <SelectTrigger className="text-xs py-2 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {chartTypes.map((type) => (
              <SelectItem key={type.value} value={type.value} className="text-xs">
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Desktop: Tab-like buttons */}
      <div className="hidden sm:flex flex-wrap gap-2 rounded-lg bg-gray-100 dark:bg-[#171717] p-1">
        {chartTypes.map((type, index) => (
          <motion.div
            key={type.value}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Button
              variant="ghost"
              onClick={() => onChartTypeChange(type.value)}
              className={`flex items-center space-x-1 px-4 py-2 text-sm rounded-md transition-all duration-200 ${
                chartType === type.value
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm border border-gray-300 dark:border-gray-600"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
            >
              {type.icon}
              <span>{type.label}</span>
            </Button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ChartTypeSelector;