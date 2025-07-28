import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChartData } from "@/features/dashboard/types";

interface TechnicalIndicatorsPanelProps {
  data: ChartData[];
}

const TechnicalIndicatorsPanel: React.FC<TechnicalIndicatorsPanelProps> = ({
  data,
}) => {
  if (!data || data.length === 0) {
    return <div className="text-gray-500">No indicator data available</div>;
  }

  const latest = data[data.length - 1];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      <Card className="bg-gray-50 dark:bg-transparent dark:border dark:border-white/25">
        <CardContent className="p-4">
          <p className="text-md text-gray-600 dark:text-white/50">SMA 20</p>
          <p className="text-xl font-semibold text-gray-800 dark:text-white">
            {latest.sma20 != null && !isNaN(latest.sma20) ? latest.sma20.toFixed(2) : "N/A"}
          </p>
        </CardContent>
      </Card>
           <Card className="bg-gray-50 dark:bg-transparent dark:border dark:border-white/25">

        <CardContent className="p-4">
          <p className="text-md text-gray-600 dark:text-white/50">SMA 50</p>
          <p className="text-xl font-semibold text-gray-800 dark:text-white">
            {latest.sma50 != null && !isNaN(latest.sma50) ? latest.sma50.toFixed(2) : "N/A"}
          </p>
        </CardContent>
      </Card>
           <Card className="bg-gray-50 dark:bg-transparent dark:border dark:border-white/25">

        <CardContent className="p-4">
          <p className="text-md text-gray-600 dark:text-white/50">EMA 12</p>
          <p className="text-xl font-semibold text-gray-800 dark:text-white">
            {latest.ema12 != null && !isNaN(latest.ema12) ? latest.ema12.toFixed(2) : "N/A"}
          </p>
        </CardContent>
      </Card>
           <Card className="bg-gray-50 dark:bg-transparent dark:border dark:border-white/25">

        <CardContent className="p-4">
          <p className="text-md text-gray-600 dark:text-white/50">EMA 26</p>
          <p className="text-xl font-semibold text-gray-800 dark:text-white">
            {latest.ema26 != null && !isNaN(latest.ema26) ? latest.ema26.toFixed(2) : "N/A"}
          </p>
        </CardContent>
      </Card>
           <Card className="bg-gray-50 dark:bg-transparent dark:border dark:border-white/25">

        <CardContent className="p-4">
          <p className="text-md text-gray-600 dark:text-white/50">RSI</p>
          <p className="text-xl font-semibold text-gray-800 dark:text-white">
            {latest.rsi != null && !isNaN(latest.rsi) ? latest.rsi.toFixed(2) : "N/A"}
          </p>
        </CardContent>
      </Card>
           <Card className="bg-gray-50 dark:bg-transparent dark:border dark:border-white/25">

        <CardContent className="p-4">
          <p className="text-md text-gray-600 dark:text-white/50">MACD</p>
          <p className="text-xl font-semibold text-gray-800 dark:text-white">
            {latest.macd != null && !isNaN(latest.macd) ? latest.macd.toFixed(2) : "N/A"}
          </p>
        </CardContent>
      </Card>
           <Card className="bg-gray-50 dark:bg-transparent dark:border dark:border-white/25">

        <CardContent className="p-4">
          <p className="text-md text-gray-600 dark:text-white/50">Signal</p>
          <p className="text-xl font-semibold text-gray-800 dark:text-white">
            {latest.signal != null && !isNaN(latest.signal) ? latest.signal.toFixed(2) : "N/A"}
          </p>
        </CardContent>
      </Card>
           <Card className="bg-gray-50 dark:bg-transparent dark:border dark:border-white/25">

        <CardContent className="p-4">
          <p className="text-md text-gray-600 dark:text-white/50">Bollinger Upper</p>
          <p className="text-xl font-semibold text-gray-800 dark:text-white">
            {latest.bollinger_upper != null && !isNaN(latest.bollinger_upper) ? latest.bollinger_upper.toFixed(2) : "N/A"}
          </p>
        </CardContent>
      </Card>
           <Card className="bg-gray-50 dark:bg-transparent dark:border dark:border-white/25">

        <CardContent className="p-4">
          <p className="text-md text-gray-600 dark:text-white/50">Bollinger Middle</p>
          <p className="text-xl font-semibold text-gray-800 dark:text-white">
            {latest.bollinger_middle != null && !isNaN(latest.bollinger_middle) ? latest.bollinger_middle.toFixed(2) : "N/A"}
          </p>
        </CardContent>
      </Card>
           <Card className="bg-gray-50 dark:bg-transparent dark:border dark:border-white/25">

        <CardContent className="p-4">
          <p className="text-md text-gray-600 dark:text-white/50">Bollinger Lower</p>
          <p className="text-xl font-semibold text-gray-800 dark:text-white">
            {latest.bollinger_lower != null && !isNaN(latest.bollinger_lower) ? latest.bollinger_lower.toFixed(2) : "N/A"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TechnicalIndicatorsPanel;
