import React from "react";
import { motion } from "motion/react";
import { format } from "date-fns";
import { Timeframe } from "@/types/timeframe";
import { CalendarStats } from "@/utils/pdfExport";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon, Dot, ZoomInIcon, ZoomOutIcon } from "lucide-react";

interface CalendarHeaderProps {
  view: "day" | "week" | "month";
  currentDate: Date;
  selectedSymbols: string[];
  timeframe: Timeframe;
  stats: CalendarStats | null;
  handlePrev: () => void;
  handleNext: () => void;
  setZoomLevel: (setter: (prev: number) => number) => void;
}

export default function CalendarHeader({
  view,
  currentDate,
  selectedSymbols,
  timeframe,
  stats,
  handlePrev,
  handleNext,
  setZoomLevel,
}: CalendarHeaderProps) {
  return (
    <motion.div
      className="flex flex-col select-none sm:flex-row justify-between items-center mb-4 sm:mb-8 pb-4 sm:pb-6 border-b-2 border-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <motion.div
        className="flex space-x-2 sm:space-x-3 mb-3 sm:mb-0"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <motion.div whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }} transition={{ duration: 0.2 }}>
          <Button
            variant="ghost"
            onClick={handlePrev}
            className="group flex cursor-pointer items-center space-x-2 sm:space-x-3 px-3 sm:px-6 py-2 sm:py-3 rounded-2xl bg-gray-300 dark:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:translate-x-1"
            aria-label="Previous period"
          >
            <ChevronLeftIcon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-300 group-hover:text-gray-400 dark:group-hover:text-gray-400 transition-colors" />
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }} transition={{ duration: 0.2 }}>
          <Button
            variant="ghost"
            onClick={handleNext}
            className="group flex cursor-pointer items-center space-x-2 sm:space-x-3 px-3 sm:px-6 py-2 sm:py-3 rounded-2xl bg-gray-300 dark:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:translate-x-1"
            aria-label="Next period"
          >
            <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-300 group-hover:text-gray-400 dark:group-hover:text-gray-400 transition-colors" />
          </Button>
        </motion.div>
      </motion.div>
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h3 className="text-xl sm:text-3xl font-title font-bold dark:text-white text-black mb-1 sm:mb-2">
          {view === "day"
            ? format(currentDate, "MMMM d, yyyy")
            : view === "week"
            ? `Week of ${format(currentDate, "MMMM do, yyyy")}`
            : format(currentDate, "MMMM yyyy")}
        </h3>
        <div className="flex flex-wrap items-center justify-center space-x-2 sm:space-x-3 text-sm sm:text-sm text-gray-600 dark:text-gray-400 font-text font-semibold">
          <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4" />
          <span>{selectedSymbols.join(", ")}</span>
          <span><Dot /></span>
          <span>{timeframe}</span>
          {!!stats && (
            <>
              <span><Dot /></span>
              <span className="text-emerald-600 dark:text-emerald-400">
                {stats.winRate.toFixed(0)}% win rate
              </span>
            </>
          )}
        </div>
      </motion.div>
      <motion.div
        className="flex space-x-2 sm:space-x-3 mt-3 sm:mt-0"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <motion.div whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }} transition={{ duration: 0.2 }}>
          <Button
            variant="ghost"
            onClick={() => setZoomLevel((prev) => Math.min(prev + 0.1, 1.5))}
            className="group flex cursor-pointer items-center space-x-2 sm:space-x-3 px-3 sm:px-6 py-2 sm:py-3 rounded-2xl bg-gray-300 dark:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl transform"
            aria-label="Zoom in"
          >
            <ZoomInIcon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-300 group-hover:text-gray-400 dark:group-hover:text-gray-400 transition-colors" />
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }} transition={{ duration: 0.2 }}>
          <Button
            variant="ghost"
            onClick={() => setZoomLevel((prev) => Math.max(prev - 0.1, 0.5))}
            className="group flex cursor-pointer items-center space-x-2 sm:space-x-3 px-3 sm:px-6 py-2 sm:py-3 rounded-2xl bg-gray-300 dark:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl transform"
            aria-label="Zoom out"
          >
            <ZoomOutIcon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-300 group-hover:text-gray-400 dark:group-hover:text-gray-400 transition-colors" />
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}