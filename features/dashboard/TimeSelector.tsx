"use client";

import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Timeframe } from "@/features/dashboard/types";
import { motion } from "framer-motion";

interface TimeIntervalSelectorProps {
  timeframe: Timeframe;
  onTimeframeChange: (timeframe: Timeframe) => void;
}

const TimeIntervalSelector: React.FC<TimeIntervalSelectorProps> = ({ 
  timeframe, 
  onTimeframeChange 
}) => {
  const timeframes = [
    { value: "1m", label: "1 Minute" },
    { value: "5m", label: "5 Minutes" },
    { value: "15m", label: "15 Minutes" },
    { value: "1h", label: "1 Hour" },
    { value: "4h", label: "4 Hours" },
    { value: "3m", label: "3 Months" },
    { value: "6m", label: "6 Months" },
    { value: "1y", label: "1 Year" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex-1 sm:flex sm:items-center sm:gap-3"
    >
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex items-center gap-2 sm:gap-3"
      >
        
        <div className="w-full sm:w-32">
          <Select value={timeframe} onValueChange={onTimeframeChange}>
            <SelectTrigger className="text-xs py-2 w-full sm:text-sm sm:py-2.5 sm:w-32 rounded-lg shadow-sm transition-all duration-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl shadow-xl min-w-[120px]">
              {timeframes.map((tf) => (
                <SelectItem
                  key={tf.value}
                  value={tf.value}
                  className="text-xs sm:text-sm hover:bg-blue-50 cursor-pointer"
                >
                  {tf.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TimeIntervalSelector;