import { CalendarCell } from "@/features/calendar/types/index";

export function generateMonthGrid(
  year: number,
  month: number,
  data: { time: string; change: number; volume?: number; high?: number; low?: number }[]
): CalendarCell[][] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const weeks: CalendarCell[][] = [];
  const current = new Date(firstDay);
  current.setDate(current.getDate() - current.getDay());

  // Create data map with improved date format handling
  const dataMap = new Map<string, { change: number; volume?: number; high?: number; low?: number }>();
  
  data.forEach((item) => {
    // Handle both formatted month labels and ISO dates
    const monthLabelRegex = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}$/;
    
    if (monthLabelRegex.test(item.time)) {
      // Skip monthly labels for monthly calendar
      return;
    } else if (item.time.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // Handle ISO date format "YYYY-MM-DD"
      dataMap.set(item.time, { 
        change: item.change, 
        volume: item.volume, 
        high: item.high, 
        low: item.low 
      });
    } else {
      // Handle invalid date formats (optional logging for debugging)
      console.warn(`Invalid date format: ${item.time}`);
    }
  });

  while (current <= lastDay) {
    const week: CalendarCell[] = [];
    for (let i = 0; i < 7; i++) {
      // Use UTC date string to match WebSocket data format
      const dateStr = `${current.getUTCFullYear()}-${String(current.getUTCMonth() + 1).padStart(2, '0')}-${String(current.getUTCDate()).padStart(2, '0')}`;
      const entry = dataMap.get(dateStr) || { change: undefined, volume: undefined, high: undefined, low: undefined };
      
      const change = entry.change;
      const volume = entry.volume;
      const high = entry.high !== undefined ? entry.high : 0; // Default to 0 if undefined
      const low = entry.low !== undefined ? entry.low : 0; // Default to 0 if undefined
      const volatility = change ? Math.min(Math.abs(change) / 10, 1) : undefined;
      
      week.push({
        low,
        high,
        date: new Date(current),
        change,
        volume,
        volatility,
      });
      current.setDate(current.getDate() + 1);
    }
    weeks.push(week);
    
    // Break if we've filled the month and are past it
    if (current > lastDay) break;
  }
  return weeks;
}

export function generateWeekGrid(
  startDate: Date,
  data: { time: string; change: number; volume?: number; high?: number; low?: number }[]
): CalendarCell[][] {
  const weeks: CalendarCell[][] = [];
  const current = new Date(startDate);
  current.setDate(current.getDate() - current.getDay());

  const week: CalendarCell[] = [];
  
  // Create data map with improved date format handling
  const dataMap = new Map<string, { change: number; volume?: number; high?: number; low?: number }>();
  
  data.forEach((item) => {
    // Handle both formatted month labels and ISO dates
    const monthLabelRegex = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}$/;
    
    if (monthLabelRegex.test(item.time)) {
      // Skip monthly labels for weekly calendar
      return;
    } else if (item.time.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // Handle ISO date format "YYYY-MM-DD"
      dataMap.set(item.time, { 
        change: item.change, 
        volume: item.volume, 
        high: item.high, 
        low: item.low 
      });
    } else {
      // Handle invalid date formats (optional logging for debugging)
      console.warn(`Invalid date format: ${item.time}`);
    }
  });

  for (let i = 0; i < 7; i++) {
    // Use UTC date string to match WebSocket data format
    const dateStr = `${current.getUTCFullYear()}-${String(current.getUTCMonth() + 1).padStart(2, '0')}-${String(current.getUTCDate()).padStart(2, '0')}`;
    const entry = dataMap.get(dateStr) || { change: undefined, volume: undefined, high: undefined, low: undefined };
    const change = entry.change;
    const volume = entry.volume;
    const high = entry.high !== undefined ? entry.high : 0; // Default to 0 if undefined
    const low = entry.low !== undefined ? entry.low : 0; // Default to 0 if undefined
    const volatility = change ? Math.min(Math.abs(change) / 10, 1) : undefined;
    
    week.push({
      date: new Date(current),
      change,
      volume,
      volatility,
      high,
      low,
    });
    current.setDate(current.getDate() + 1);
  }
  weeks.push(week);
  return weeks;
}

export function generateDayGrid(
  date: Date,
  data: { time: string; change: number; volume?: number; high?: number; low?: number }[]
): CalendarCell[][] {
  const days: CalendarCell[] = [];
  const current = new Date(date);
  // Use UTC date string to match WebSocket data format
  const dateStr = `${current.getUTCFullYear()}-${String(current.getUTCMonth() + 1).padStart(2, '0')}-${String(current.getUTCDate()).padStart(2, '0')}`;
  
  // Create data map with improved date format handling
  const dataMap = new Map<string, { change: number; volume?: number; high?: number; low?: number }>();
  
  data.forEach((item) => {
    // Handle both formatted month labels and ISO dates
    const monthLabelRegex = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}$/;
    
    if (monthLabelRegex.test(item.time)) {
      // Skip monthly labels for daily calendar
      return;
    } else if (item.time.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // Handle ISO date format "YYYY-MM-DD"
      dataMap.set(item.time, { 
        change: item.change, 
        volume: item.volume, 
        high: item.high, 
        low: item.low 
      });
    } else {
      // Handle invalid date formats (optional logging for debugging)
      console.warn(`Invalid date format: ${item.time}`);
    }
  });
  
  const entry = dataMap.get(dateStr) || { change: undefined, volume: undefined, high: undefined, low: undefined };
  const change = entry.change;
  const volume = entry.volume;
  const high = entry.high !== undefined ? entry.high : 0; // Default to 0 if undefined
  const low = entry.low !== undefined ? entry.low : 0; // Default to 0 if undefined
  const volatility = change ? Math.min(Math.abs(change) / 10, 1) : undefined;
  
  days.push({
    date: new Date(current),
    change,
    volatility,
    volume,
    high,
    low,
  });
  return [days];
}