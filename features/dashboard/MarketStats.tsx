import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TickerData } from "@/features/dashboard/types";
import { MarketStatsSkeleton } from "@/components/shared/SkeletonUI";
import { motion } from "motion/react";

interface MarketStatsProps {
  ticker: TickerData | null;
}

const MarketStats: React.FC<MarketStatsProps> = ({ ticker }) => {
  if (!ticker) {
    return <MarketStatsSkeleton />;
  }

  const stats = [
    {
      label: "Last Price",
      value: `$${parseFloat(ticker.lastPrice).toFixed(2)}`,
    },
    {
      label: "24h Change",
      value: `${parseFloat(ticker.priceChangePercent).toFixed(2)}%`,
      className: parseFloat(ticker.priceChangePercent) >= 0 ? "text-green-600" : "text-red-600",
    },
    {
      label: "24h High",
      value: `$${parseFloat(ticker.highPrice).toFixed(2)}`,
    },
    {
      label: "24h Low",
      value: `$${parseFloat(ticker.lowPrice).toFixed(2)}`,
    },
    {
      label: "24h Volume",
      value: parseFloat(ticker.volume).toLocaleString(),
    },
    {
      label: "Quote Volume",
      value: parseFloat(ticker.quoteVolume).toLocaleString(),
    },
    {
      label: "Bid Price",
      value: `$${parseFloat(ticker.bidPrice).toFixed(2)}`,
    },
    {
      label: "Ask Price",
      value: `$${parseFloat(ticker.askPrice).toFixed(2)}`,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Card className="bg-white dark:bg-[#171717] shadow-xl dark:border dark:border-white/25 rounded-xl">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white font-text">
            Market Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4 lg:gap-12">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <p className="text-sm sm:text-lg text-gray-600 dark:text-gray-100">{stat.label}</p>
                <p
                  className={`text-base sm:text-xl font-semibold text-gray-800 dark:text-white ${
                    stat.className || ""
                  }`}
                >
                  {stat.value}
                </p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MarketStats;