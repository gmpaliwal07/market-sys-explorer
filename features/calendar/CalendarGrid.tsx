import React, { Dispatch, SetStateAction, useMemo } from "react";
import { motion } from "motion/react";
import { generateDayGrid, generateWeekGrid, generateMonthGrid } from "@/features/calendar/utils";
import { ChartData } from "@/features/dashboard/types";
import { CalendarCell } from "@/features/calendar/types";
import { cn } from "@/lib/utils";
import { TrendingUpIcon, TrendingDownIcon, LucideMoveUp, LucideMoveDown } from "lucide-react";

interface CalendarGridProps {
  view: "day" | "week" | "month";
  currentDate: Date;
  data: ChartData[];
  today: Date;
  hoveredCell: number | null;
  setHoveredCell: Dispatch<SetStateAction<number | null>>;
  selectedCell: number | null;
  setSelectedCell: Dispatch<SetStateAction<number | null>>;
  filterMode: "all" | "gains" | "losses";
  volatilityThresholds: { low: number; medium: number };
  maxVolume: number;
}

export default function CalendarGrid({
  view,
  currentDate,
  data,
  today,
  hoveredCell,
  setHoveredCell,
  selectedCell,
  setSelectedCell,
  filterMode,
  volatilityThresholds,
  maxVolume,
}: CalendarGridProps) {
  const renderGrid = useMemo(() => {
    let grid: CalendarCell[][];
    if (view === "day") grid = generateDayGrid(currentDate, data);
    else if (view === "week") grid = generateWeekGrid(currentDate, data);
    else grid = generateMonthGrid(currentDate.getFullYear(), currentDate.getMonth(), data);

    const allCells = grid.flat();

    return allCells.map(({ date, change, volatility, volume, high, low }, idx) => {
      const isToday = date.toDateString() === today.toDateString();
      const isCurrentMonth = date.getMonth() === currentDate.getMonth();
      const isHovered = hoveredCell === idx;
      const isSelected = selectedCell === idx;

      const isFiltered =
        filterMode !== "all" &&
        ((filterMode === "gains" && (!change || change <= 0)) ||
          (filterMode === "losses" && (!change || change >= 0)));

      const getVolatilityStyle = (vol: number | undefined) => {
        if (vol === undefined)
          return {
            bg: "bg-slate-50/80 dark:bg-slate-800/50",
            border: "border-slate-200/60 dark:border-slate-700/60",
            glow: "",
          };
        if (vol < volatilityThresholds.low)
          return {
            bg: "bg-gradient-to-br from-emerald-50 to-green-100/50 dark:from-emerald-950/30 dark:to-green-900/20",
            border: "border-emerald-200/70 dark:border-emerald-700/50",
            glow: "shadow-emerald-200/30 dark:shadow-emerald-900/20",
          };
        if (vol < volatilityThresholds.medium)
          return {
            bg: "bg-gradient-to-br from-amber-50 to-orange-100/50 dark:from-amber-950/30 dark:to-orange-900/20",
            border: "border-amber-200/70 dark:border-amber-700/50",
            glow: "shadow-amber-200/30 dark:shadow-amber-900/20",
          };
        return {
          bg: "bg-gradient-to-br from-rose-50 to-red-100/50 dark:from-rose-950/30 dark:to-red-900/20",
          border: "border-rose-200/70 dark:border-rose-700/50",
          glow: "shadow-rose-200/30 dark:shadow-rose-900/20",
        };
      };

      const volatilityStyle = getVolatilityStyle(volatility);
      const volumeIntensity = volume && maxVolume ? Math.min(volume / maxVolume, 1) : 0;
      const barHeight = Math.max(volumeIntensity * (window.innerWidth < 640 ? 15 : 30), volumeIntensity > 0 ? 3 : 0);

      const getChangeStyle = (changeVal: number | undefined) => {
        if (changeVal === undefined || changeVal === 0)
          return { color: "text-slate-500 dark:text-slate-400", bg: "", icon: null };
        const isPositive = changeVal > 0;
        const intensity = Math.min(Math.abs(changeVal) / 10, 1);
        return {
          color: isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400",
          bg: isPositive ? `bg-emerald-500/10 dark:bg-emerald-400/10` : `bg-rose-500/10 dark:bg-rose-400/10`,
          icon: isPositive ? TrendingUpIcon : TrendingDownIcon,
          intensity,
        };
      };

      const changeStyle = getChangeStyle(change);

      return (
        <motion.div
          key={idx}
          className={cn(
            "aspect-square p-1.5 sm:p-2.5 rounded-xl text-center relative cursor-pointer group transition-all duration-500 ease-out border-2",
            "backdrop-blur-sm focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600",
            isFiltered && "opacity-20 scale-95 pointer-events-none",
            isToday
              ? "bg-blue-100 dark:bg-blue-900/30 text-black dark:text-blue-200 font-semibold ring-1 ring-blue-200 dark:ring-blue-500/40"
              : cn("bg-white/70 dark:bg-slate-900/70 hover:bg-white dark:hover:bg-slate-800", volatilityStyle.bg, volatilityStyle.border),
            !isCurrentMonth && !isToday ? "opacity-30" : "",
            !isToday && !isFiltered && "hover:scale-102 hover:shadow-xl hover:z-20",
            isHovered && !isToday && !isFiltered && cn("shadow-2xl scale-110 z-30", volatilityStyle.glow),
            isSelected && !isToday && "ring-1 ring-blue-400 dark:ring-blue-500 scale-102",
            change !== undefined && change !== 0 && !isToday && changeStyle.bg
          )}
          onMouseEnter={() => !isFiltered && setHoveredCell(idx)}
          onMouseLeave={() => setHoveredCell(null)}
          onClick={() => {
            if (isFiltered) return;
            setSelectedCell(selectedCell === idx ? null : idx);
          }}
          onTouchStart={() => !isFiltered && setHoveredCell(idx)}
          onTouchEnd={() => setHoveredCell(null)}
          aria-label={`Date: ${date.toLocaleDateString()}, Change: ${
            change ? `${change > 0 ? "+" : ""}${change.toFixed(2)}%` : "No data"
          }, Volume: ${volume ? volume.toLocaleString() : "No data"}, Volatility: ${
            volatility ? volatility.toFixed(2) : "No data"
          }, High: ${high ? high.toFixed(2) : "No data"}, Low: ${low ? low.toFixed(2) : "No data"}`}
          title={`Date: ${date.toLocaleDateString()}\nChange: ${
            change ? `${change > 0 ? "+" : ""}${change.toFixed(2)}%` : "No data"
          }\nVolume: ${volume ? volume.toLocaleString() : "No data"}\nVolatility: ${
            volatility ? volatility.toFixed(2) : "No data"
          }\nHigh: ${high ? high.toFixed(2) : "No data"}\nLow: ${low ? low.toFixed(2) : "No data"}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: idx * 0.02, ease: "easeOut" }}
          whileHover={!isFiltered && !isToday ? { scale: 1.02, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" } : {}}
        >
          <div
            className={cn(
              "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300",
              "bg-gradient-to-br from-white/30 via-transparent to-black/10 dark:from-white/15 dark:to-black/20",
              !isFiltered && "group-hover:shadow-inner"
            )}
          />
          <div
            className={cn(
              "relative z-10 text-sm sm:text-base font-bold mb-0.5 sm:mb-1 transition-all duration-300",
              isToday ? "text-white drop-shadow-lg" : "text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100"
            )}
          >
            {date.getDate()}
          </div>
          {change !== undefined && change !== 0 && (
            <motion.div
              className={cn(
                "relative z-10 flex items-center justify-center space-x-1 mb-0.5 sm:mb-1 px-1 py-0.5 rounded-md transition-all duration-200 font-text",
                changeStyle.color,
                isHovered && !isFiltered && "scale-105"
              )}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {changeStyle.icon && <changeStyle.icon className="w-3 h-3 sm:w-5 sm:h-5 animate-pulse" />}
              <span className="text-xs sm:text-sm font-bold tracking-tight font-text">
                {change > 0 ? "+" : ""}{change.toFixed(1)}%
              </span>
            </motion.div>
          )}
          {volume && volume > 0 && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 z-10"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div
                className={cn(
                  "rounded-sm transition-all duration-200 ease-out transform group-hover:scale-y-110 relative overflow-hidden max-h-[15px] sm:max-h-[30px]",
                  change && change > 0
                    ? "bg-green-400 shadow-lg shadow-emerald-500/30"
                    : change && change < 0
                    ? "bg-red-400 shadow-lg shadow-rose-500/30"
                    : "bg-blue-400",
                  isHovered && !isFiltered && "animate-pulse"
                )}
                style={{ height: `${Math.max(barHeight, 2)}px` }}
              >
                <div className="absolute inset-0 from-transparent via-white/30 to-transparent animate-shimmer" />
              </div>
              {volumeIntensity > 0.7 && (
                <motion.div
                  className="absolute -top-1 left-1/2 transform -translate-x-1/2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, type: "spring", stiffness: 100 }}
                >
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-orange-500 animate-ping" />
                </motion.div>
              )}
            </motion.div>
          )}
          {change && Math.abs(change) > 5 && (
            <motion.div
              className={cn(
                "absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 rounded-xl flex items-center justify-center text-[6px] sm:text-[8px] font-bold text-white shadow-lg z-20",
                change > 0 ? "bg-emerald-500 animate-bounce" : "bg-rose-500 animate-bounce"
              )}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 100 }}
            >
              {change > 0 ? <LucideMoveUp /> : <LucideMoveDown />}
            </motion.div>
          )}
          {isHovered && !isToday && !isFiltered && (
            <motion.div
              className={cn(
                "absolute inset-0 rounded-xl ring-2 ring-opacity-50 animate-pulse",
                change && change > 0 ? "ring-emerald-400" : change && change < 0 ? "ring-rose-400" : "ring-blue-400"
              )}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </motion.div>
      );
    });
  }, [view, currentDate, data, today, hoveredCell, selectedCell, filterMode, volatilityThresholds, maxVolume, setHoveredCell, setSelectedCell]);

  return (
    <motion.div
      className="mb-6 sm:mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="grid grid-cols-7 gap-1 sm:gap-4 mb-2 sm:mb-4">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, idx) => (
          <motion.div
            key={day}
            className="text-center py-1 sm:py-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
          >
            <div className="font-bold text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
              {day.slice(0, 3)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1 hidden sm:block">
              {day.slice(3)}
            </div>
          </motion.div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 sm:gap-4 p-1 sm:p-2">{renderGrid}</div>
    </motion.div>
  );
}