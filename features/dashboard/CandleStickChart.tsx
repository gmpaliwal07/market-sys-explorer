"use client";

import React from "react";
import { Bar, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis, BarProps } from "recharts";
import { ChartData } from "@/features/dashboard/types";

const CandlestickChart: React.FC<{ data: ChartData[]; height: number }> = ({ data, height }) => {
  interface CandlestickBarProps extends BarProps {
    dataKey: string;
    payload?: ChartData;
  }

  const CandlestickBar = (props: CandlestickBarProps) => {
    const { x = 0, y = 0, width = 0, height: barHeight = 0, payload } = props;
    
    if (!payload || payload.open == null || payload.close == null || payload.high == null || payload.low == null) {
      return null;
    }

    // Get the price range for scaling
    const priceRange = payload.high - payload.low;
    if (priceRange === 0) return null;

    const isPositive = payload.close >= payload.open;
    const color = isPositive ? "#22c55e" : "#ef4444";
    
    // Calculate positions relative to the bar's coordinate system
    const candleWidth = Math.max(Number(width) * 0.6, 2); // Minimum width of 2px
    const candleX = Number(x) + (Number(width) - candleWidth) / 2;
    const centerX = Number(x) + Number(width) / 2;
    
    // Calculate body dimensions
    const bodyTop = Math.min(payload.open, payload.close);
    const bodyBottom = Math.max(payload.open, payload.close);
    
    // Scale positions to fit within the bar height
    const scale = Number(barHeight) / priceRange;
    const baseY = Number(y) + Number(barHeight);
    
    // Calculate scaled positions
    const highY = baseY - (payload.high - payload.low) * scale;
    const lowY = baseY;
    const bodyTopY = baseY - (bodyTop - payload.low) * scale;
    const bodyBottomY = baseY - (bodyBottom - payload.low) * scale;
    const scaledBodyHeight = Math.max(Math.abs(bodyBottomY - bodyTopY), 1);

    return (
      <g>
        {/* High-Low Wick */}
        <line
          x1={centerX}
          y1={highY}
          x2={centerX}
          y2={lowY}
          stroke={color}
          strokeWidth={1}
        />
        
        {/* Candle Body */}
        <rect
          x={candleX}
          y={Math.min(bodyTopY, bodyBottomY)}
          width={candleWidth}
          height={scaledBodyHeight}
          fill={color}
          stroke={color}
          strokeWidth={1}
        />
      </g>
    );
  };

  // Calculate Y-axis domain with proper padding
  const allPrices = data.flatMap(d => [d.high, d.low].filter(p => p != null)) as number[];
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const padding = (maxPrice - minPrice) * 0.05; // 5% padding

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data}>
        <XAxis
          dataKey="time"
          tickFormatter={(value) => new Date(value).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          tick={{ fontSize: 12, fill: "#6b7280" }}
          axisLine={{ stroke: "#e5e7eb" }}
        />
        <YAxis
          domain={[minPrice - padding, maxPrice + padding]}
          tickFormatter={(val) => `$${val.toFixed(2)}`}
          tick={{ fontSize: 12, fill: "#6b7280" }}
          axisLine={{ stroke: "#e5e7eb" }}
        />
        <Tooltip
          contentStyle={{ 
            backgroundColor: "#ffffff", 
            border: "1px solid #e5e7eb", 
            borderRadius: "8px", 
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)" 
          }}
          content={({ active, payload, label }) => {
            if (active && payload && payload[0]) {
              const data = payload[0].payload as ChartData;
              return (
                <div className="bg-white p-4 border rounded-lg shadow-md">
                  <p className="text-sm font-semibold text-gray-800">
                    {label ? new Date(label).toLocaleString() : ""}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                    <div>Open: <span className="font-semibold text-gray-900">${data.open?.toFixed(4)}</span></div>
                    <div>High: <span className="font-semibold text-green-600">${data.high?.toFixed(4)}</span></div>
                    <div>Low: <span className="font-semibold text-red-600">${data.low?.toFixed(4)}</span></div>
                    <div>Close: <span className="font-semibold text-gray-900">${data.close?.toFixed(4)}</span></div>
                  </div>
                  <div className="text-sm mt-2">
                    Volume: <span className="font-semibold">{data.volume?.toLocaleString()}</span>
                  </div>
                </div>
              );
            }
            return null;
          }}
        />
        <Bar dataKey="low" shape={<CandlestickBar dataKey="low" />} />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default CandlestickChart;