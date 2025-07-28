"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { CompareChartData } from "@/features/compare/types";
import { ComparisonType } from "@/features/compare/types";

interface ChartDisplayProps {
  compareData: CompareChartData[];
  comparisonType: ComparisonType;
}

export function ChartDisplay({ compareData, comparisonType }: ChartDisplayProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (compareData.length === 0) return null;

  const getChartColors = () => [
    "#3b82f6",
    "#ef4444",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#06b6d4",
    "#84cc16",
    "#f97316",
    "#ec4899",
    "#14b8a6",
    "#f472b6",
    "#a855f7",
  ];

  const colors = getChartColors();
  const dataKeys = Object.keys(compareData[0]).filter((key) => key !== "time");

  // Responsive chart height based on screen size
  const getChartHeight = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 640) return 300; // Mobile
      if (window.innerWidth < 1024) return 400; // Tablet
      return 450; // Desktop
    }
    return 450;
  };

  // Responsive interval calculation
  const getXAxisInterval = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 640) {
        return Math.max(0, Math.floor(compareData.length / 4)); // Show fewer labels on mobile
      }
      if (window.innerWidth < 1024) {
        return Math.max(0, Math.floor(compareData.length / 6)); // Medium labels on tablet
      }
    }
    return Math.max(0, Math.floor(compareData.length / 10)); // Full labels on desktop
  };

  return (
    <div className={`transition-all duration-700 ease-out transform ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
    }`}>
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl lg:text-2xl">Comparison Chart</CardTitle>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {comparisonType === "benchmark" && "Dashed line shows outperformance vs benchmark"}
            {comparisonType === "period-over-period" && "Dashed line shows year-over-year difference"}
          </p>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          <div data-chart-container className="w-full">
            <ResponsiveContainer width="100%" height={getChartHeight()}>
              <LineChart 
                data={compareData} 
                margin={{ 
                  top: 5, 
                  right: window?.innerWidth < 640 ? 10 : 30, 
                  left: window?.innerWidth < 640 ? 10 : 20, 
                  bottom: window?.innerWidth < 640 ? 80 : 60 
                }}
                className="animate-in fade-in duration-1000"
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="#f0f0f0" 
                  className="opacity-60"
                />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: window?.innerWidth < 640 ? 10 : 11 }}
                  angle={window?.innerWidth < 640 ? -60 : -45}
                  textAnchor="end"
                  height={window?.innerWidth < 640 ? 100 : 80}
                  interval={getXAxisInterval()}
                  className="text-xs sm:text-sm"
                />
                <YAxis 
                  tickFormatter={(value) => `${Number(value).toFixed(1)}%`} 
                  tick={{ fontSize: window?.innerWidth < 640 ? 10 : 11 }}
                  width={window?.innerWidth < 640 ? 40 : 60}
                  className="text-xs sm:text-sm"
                />
                <Tooltip
                  formatter={(value: number, name: string) => [`${Number(value).toFixed(2)}%`, name]}
                  labelStyle={{ fontWeight: "bold", fontSize: window?.innerWidth < 640 ? "12px" : "14px" }}
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.98)",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    fontSize: window?.innerWidth < 640 ? "12px" : "14px",
                    animation: "fadeIn 0.2s ease-out"
                  }}
                  animationDuration={200}
                />
                <Legend 
                  wrapperStyle={{ 
                    paddingTop: "20px",
                    fontSize: window?.innerWidth < 640 ? "12px" : "14px"
                  }}
                  iconType="line"
                />
                {dataKeys.map((key, index) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={colors[index % colors.length]}
                    strokeWidth={key === "Outperformance" || key === "YoY Difference" ? 3 : 2}
                    strokeDasharray={key === "Outperformance" || key === "YoY Difference" ? "5,5" : "0"}
                    dot={{ 
                      r: window?.innerWidth < 640 ? 2 : 3, 
                      strokeWidth: 1,
                      className: "hover:scale-125 transition-transform duration-200"
                    }}
                    activeDot={{ 
                      r: window?.innerWidth < 640 ? 4 : 5, 
                      strokeWidth: 2,
                      className: "animate-pulse"
                    }}
                    name={key}
                    animationBegin={index * 200}
                    animationDuration={1500}
                    className="drop-shadow-sm"
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}