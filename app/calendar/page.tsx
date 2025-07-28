"use client";
import CalendarView from "@/features/calendar/CalenderView";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Timeframe } from "@/types/timeframe";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export default function CalendarPage() {
  const [symbol] = useState<"BTCUSDT" | "ETHUSDT" | "BNBUSDT">("BTCUSDT");
  const [timeframe, setTimeframe] = useState<Timeframe>("1M");

  const interval = ["1W", "1M", "3M", "6M", "1Y", "All"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="p-2 sm:p-4 w-full font-text"
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="flex flex-wrap gap-2 sm:gap-4 mb-4 font-text"
      >
        {interval.map((item, idx) => (
          <motion.div
            key={item}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: idx * 0.05, ease: "easeOut" }}
            whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant={"ghost"}
              onClick={() => setTimeframe(item as Timeframe)}
              className={cn(
                "text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-2 rounded-full",
                timeframe === item
                  ? "bg-gray-200 text-black font-semibold ring-1 ring-gray-300 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50"
              )}
            >
              {item}
            </Button>
          </motion.div>
        ))}
      </motion.div>

      <CalendarView symbol={symbol} timeframe={timeframe} />
    </motion.div>
  );
}