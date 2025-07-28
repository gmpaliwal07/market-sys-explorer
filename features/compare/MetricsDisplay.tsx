
"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { ComparisonMetrics } from "@/features/compare/types";

interface MetricsDisplayProps {
  metrics: ComparisonMetrics | null;
}

export function MetricsDisplay({ metrics }: MetricsDisplayProps) {
  if (!metrics) return null;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Comparison Metrics</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Correlation</p>
                <p className="text-2xl font-bold">{(metrics.correlation * 100).toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.abs(metrics.correlation) > 0.7 ? "High" : Math.abs(metrics.correlation) > 0.3 ? "Moderate" : "Low"}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Volatility Difference</p>
                <p className="text-2xl font-bold">{metrics.volatilityDifference.toFixed(2)}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {metrics.volatilityDifference > 5 ? "High" : metrics.volatilityDifference > 2 ? "Moderate" : "Low"}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Performance Gap</p>
                <p className={`text-2xl font-bold ${metrics.performanceGap >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {metrics.performanceGap >= 0 ? "+" : ""}{metrics.performanceGap.toFixed(2)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">Difference in returns</p>
              </div>
              {metrics.performanceGap >= 0 ? (
                <TrendingUp className="w-8 h-8 text-green-500" />
              ) : (
                <TrendingDown className="w-8 h-8 text-red-500" />
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Risk-Adjusted Return</p>
                <p className="text-2xl font-bold">{metrics.sharpeRatioA.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {metrics.sharpeRatioA > 1 ? "Excellent" : metrics.sharpeRatioA > 0.5 ? "Good" : metrics.sharpeRatioA > 0 ? "Fair" : "Poor"}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
