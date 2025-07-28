import React from 'react';
import { pdfExporter, CalendarStats } from '@/utils/pdfExport';

// Example usage of PDF export functionality
export const PDFExportExample: React.FC = () => {
  
  // Example calendar statistics
  const exampleStats: CalendarStats = {
    totalDays: 30,
    gainDays: 18,
    lossDays: 12,
    totalGains: 15.5,
    totalLosses: 8.2,
    netChange: 7.3,
    avgChange: 0.24,
    maxGain: 3.2,
    maxLoss: -2.1,
    avgVolume: 1234567,
    volatility: 1.8,
    winRate: 60.0
  };

  // Example data
  const exampleData = [
    { time: '2025-07-01', change: 2.1, volume: 1500000 },
    { time: '2025-07-02', change: -1.5, volume: 1200000 },
    { time: '2025-07-03', change: 0.8, volume: 980000 }
  ];

  const handleExportData = async () => {
    try {
      await pdfExporter.exportCalendarData(exampleData, {
        title: 'Sample Performance Data',
        symbol: 'BTCUSDT', 
        timeframe: '1M',
        includeStats: true,
        pageOrientation: 'portrait'
      }, exampleStats);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">PDF Export Examples</h2>
      
      <div className="space-y-2">
     
        
        <button 
          onClick={handleExportData}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Export Data Table
        </button>
      </div>
      
      {/* Example calendar content */}
      <div id="example-calendar" className="p-4 border rounded bg-white">
        <h3 className="text-lg font-semibold mb-2">Sample Calendar</h3>
        <p>This would be your calendar content...</p>
        {/* Add actual calendar content here */}
      </div>
    </div>
  );
};
