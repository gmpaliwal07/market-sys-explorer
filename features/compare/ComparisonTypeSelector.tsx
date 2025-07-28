
"use client";

import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ComparisonType } from "@/features/compare/types";

interface ComparisonTypeSelectorProps {
  comparisonType: ComparisonType;
  setComparisonType: (value: ComparisonType) => void;
}

export function ComparisonTypeSelector({ comparisonType, setComparisonType }: ComparisonTypeSelectorProps) {
  return (
    <Tabs value={comparisonType} onValueChange={(value) => setComparisonType(value as ComparisonType)}>
      <TabsList className="grid w-full grid-cols-4 gap-1">
        <TabsTrigger value="time-periods">Time Periods</TabsTrigger>
        <TabsTrigger value="multi-symbol">Multi-Symbol</TabsTrigger>
        <TabsTrigger value="benchmark">Benchmark</TabsTrigger>
        <TabsTrigger value="period-over-period">YoY/MoM</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
