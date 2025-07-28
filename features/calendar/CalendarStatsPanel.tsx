import React from "react";
import { motion } from "motion/react";
import { CalendarStats } from "@/utils/pdfExport";
import { ActivityIcon, BarChart3Icon, CalendarIcon, TrendingUpIcon, TrendingDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarStatsPanelProps {
  stats: CalendarStats;
}

export default function CalendarStatsPanel({ stats }: CalendarStatsPanelProps) {
  return (
    <motion.div
      className="mb-4 sm:mb-8 bg-gradient-to-r from-white/60 via-slate-50/80 to-white/60 dark:from-slate-800/60 dark:via-slate-700/80 dark:to-slate-800/60 rounded-2xl p-3 sm:p-6 backdrop-blur-sm border border-white/30 dark:border-slate-600/30 shadow-xl font-text"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <motion.h4
          className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center space-x-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <ActivityIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="font-title tracking-wider text-lg sm:text-2xl">Performance Statistics</span>
        </motion.h4>
        <motion.div
          className="text-xs sm:text-sm text-slate-500 dark:text-slate-400"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          Based on {stats.totalDays} trading days
        </motion.div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-6">
        {[
          {
            label: "Net Change",
            value: `${stats.netChange >= 0 ? "+" : ""}${stats.netChange.toFixed(2)}%`,
            icon: stats.netChange >= 0 ? TrendingUpIcon : TrendingDownIcon,
            color: stats.netChange >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400",
            iconColor: stats.netChange >= 0 ? "text-emerald-500" : "text-rose-500",
            subtext: "Total gains - losses",
          },
          {
            label: "Max Gain",
            value: `+${stats.maxGain.toFixed(2)}%`,
            icon: TrendingUpIcon,
            color: "text-emerald-600 dark:text-emerald-400",
            iconColor: "text-emerald-500",
            subtext: "Best single day",
          },
          {
            label: "Max Loss",
            value: `${stats.maxLoss.toFixed(2)}%`,
            icon: TrendingDownIcon,
            color: "text-rose-600 dark:text-rose-400",
            iconColor: "text-rose-500",
            subtext: "Worst single day",
          },
          {
            label: "Volatility",
            value: `${stats.volatility.toFixed(2)}%`,
            icon: BarChart3Icon,
            color: "text-amber-600 dark:text-amber-400",
            iconColor: "text-amber-500",
            subtext: "Standard deviation",
          },
          {
            label: "Avg Change",
            value: `${stats.avgChange >= 0 ? "+" : ""}${stats.avgChange.toFixed(2)}%`,
            icon: stats.avgChange >= 0 ? TrendingUpIcon : TrendingDownIcon,
            color: stats.avgChange >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400",
            iconColor: stats.avgChange >= 0 ? "text-emerald-500" : "text-rose-500",
            subtext: "Daily average",
          },
          {
            label: "Avg Volume",
            value: `${(stats.avgVolume / 1000000).toFixed(1)}M`,
            icon: ActivityIcon,
            color: "text-blue-600 dark:text-blue-400",
            iconColor: "text-blue-500",
            subtext: "Daily average",
          },
          {
            label: "Trading Days",
            value: `${stats.totalDays}`,
            icon: CalendarIcon,
            color: "text-indigo-600 dark:text-indigo-400",
            iconColor: "text-indigo-500",
            subtext: "With price data",
          },
        ].map(({ label, value, icon: Icon, color, iconColor, subtext }, idx) => (
          <motion.div
            key={label}
            className="bg-white/50 dark:bg-slate-800/50 rounded-xl p-3 sm:p-4 border border-white/20 dark:border-slate-700/20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: idx * 0.05, ease: "easeOut" }}
            whileHover={{ scale: 1.02, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">{label}</span>
              <div className={cn("w-4 h-4 sm:w-5 sm:h-5", iconColor)}>
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className={cn("text-sm sm:text-2xl font-bold", color)}>
              {value}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{subtext}</div>
          </motion.div>
        ))}
      </div>
      <motion.div
        className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-200/50 dark:border-slate-700/50"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm gap-2 sm:gap-0">
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-emerald-500 rounded-full"></div>
              <span className="text-slate-600 dark:text-slate-400">
                Gain Days: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{stats.gainDays}</span>
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-rose-500 rounded-full"></div>
              <span className="text-slate-600 dark:text-slate-400">
                Loss Days: <span className="font-semibold text-rose-600 dark:text-rose-400">{stats.lossDays}</span>
              </span>
            </div>
          </div>
          <div className="text-slate-500 dark:text-slate-400">
            Risk-Reward Ratio: <span className="font-semibold">
              {stats.totalLosses > 0 ? (stats.totalGains / stats.totalLosses).toFixed(2) : "∞"}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}