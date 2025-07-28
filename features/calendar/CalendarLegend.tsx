import React from "react";
import { motion } from "motion/react";
import KeyBoardShortcuts from "@/features/calendar/KeyboardShortcuts";
import { cn } from "@/lib/utils";

interface CalendarLegendProps {
  volatilityThresholds: { low: number; medium: number };
}

export default function CalendarLegend({ volatilityThresholds }: CalendarLegendProps) {
  return (
    <motion.div
      className="bg-gradient-to-r from-white/40 via-slate-50/60 to-white/40 dark:from-slate-800/40 dark:via-slate-700/60 dark:to-slate-800/40 rounded-2xl p-3 sm:p-6 backdrop-blur-sm border border-white/30 dark:border-slate-600/30 font-text"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-6 text-xs sm:text-sm">
        {[
          {
            label: "Low Volatility",
            subtext: `< ${volatilityThresholds.low}%`,
            bg: "bg-gradient-to-br from-emerald-50 to-green-100 border border-emerald-200",
          },
          {
            label: "Med Volatility",
            subtext: `${volatilityThresholds.low}% - ${volatilityThresholds.medium}%`,
            bg: "bg-gradient-to-br from-amber-50 to-orange-100 border border-amber-200",
          },
          {
            label: "High Volatility",
            subtext: `> ${volatilityThresholds.medium}%`,
            bg: "bg-gradient-to-br from-rose-50 to-red-100 border border-rose-200",
          },
          {
            label: "Today",
            subtext: "Current Date",
            bg: "bg-gradient-to-br from-blue-300 to-indigo-500",
          },
          {
            label: "Volume Bar",
            subtext: "Trading Volume",
            bg: "bg-gradient-to-r from-emerald-500 to-emerald-400",
            heightClass: "h-1.5 sm:h-2",
          },
        ].map(({ label, subtext, bg, heightClass }, idx) => (
          <motion.div
            key={label}
            className="flex items-center space-x-2 sm:space-x-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05, ease: "easeOut" }}
            whileHover={{ scale: 1.02, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
          >
            <div className={cn("w-4 h-4 sm:w-5 sm:h-5 rounded-lg shadow-sm", bg, heightClass)}></div>
            <div>
              <div className="font-medium text-slate-700 dark:text-slate-300">{label}</div>
              <div className="text-slate-500 dark:text-slate-400">{subtext}</div>
            </div>
          </motion.div>
        ))}
      </div>
      <KeyBoardShortcuts />
    </motion.div>
  );
}