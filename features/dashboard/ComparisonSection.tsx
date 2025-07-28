"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { CompareView } from "@/features/compare/CompareVIew"

const ComparisonSection: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="bg-white shadow-lg rounded-xl mt-6">
      <CardHeader className="border-b border-gray-200 flex justify-between items-center">
        <CardTitle className="text-xl font-semibold text-gray-800">Comparison Analysis</CardTitle>
        <Button variant="ghost" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </Button>
      </CardHeader>
      {isOpen && (
        <CardContent className="p-6">
          <CompareView />
        </CardContent>
      )}
    </Card>
  );
};

export default ComparisonSection;
