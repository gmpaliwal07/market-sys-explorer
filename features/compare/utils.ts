import { ChartData, fetchHistoricalKlines, mapTimeframeToInterval } from '@/utils/getPerformance';

export interface CompareChartData {
  time: string;
  [key: string]: string | number;
}

// Enhanced function using existing fetchHistoricalKlines with date filtering
export async function fetchHistoricalDataForPeriod(
  symbol: string,
  interval: string,
  startDate: string,
  endDate: string
): Promise<ChartData[]> {
  try {
    // Use existing utility with a large limit to get enough data
    const data = await fetchHistoricalKlines(symbol, interval, 1000);
    
    // Filter data by date range
    const startTime = new Date(startDate + "-01").getTime();
    const endTime = new Date(endDate + "-01").getTime();
    
    return data.filter(item => {
      const itemTime = new Date(item.time).getTime();
      return itemTime >= startTime && itemTime < endTime;
    });
  } catch (error) {
    console.error('Error fetching historical data for period:', error);
    return [];
  }
}

// Enhanced function using existing fetchHistoricalKlines
export async function fetchRecentHistoricalData(
  symbol: string,
  interval: string,
  limit: number
): Promise<ChartData[]> {
  try {
    return await fetchHistoricalKlines(symbol, interval, limit);
  } catch (error) {
    console.error('Error fetching recent historical data:', error);
    return [];
  }
}

// Time period comparison using existing utilities
export async function fetchTimePeriodComparison(
  symbol: string,
  timeframe: string,
  periodA: string,
  periodB: string
): Promise<CompareChartData[]> {
  try {
    console.log(`Comparing periods: ${periodA} vs ${periodB} for ${symbol} (${timeframe})`);
    
    const { supportedInterval } = mapTimeframeToInterval(timeframe);
    
    // Calculate end dates (next month)
    const periodAEnd = getNextMonth(periodA);
    const periodBEnd = getNextMonth(periodB);
    
    console.log(`Fetching data for periods: ${periodA} to ${periodAEnd}, ${periodB} to ${periodBEnd}`);
    
    const [dataA, dataB] = await Promise.all([
      fetchHistoricalDataForPeriod(symbol, supportedInterval, periodA, periodAEnd),
      fetchHistoricalDataForPeriod(symbol, supportedInterval, periodB, periodBEnd)
    ]);

    console.log(`Data fetched - Period A: ${dataA.length} items, Period B: ${dataB.length} items`);

    if (dataA.length === 0 && dataB.length === 0) {
      console.warn('No data available for either period');
      return [];
    }

    // Create normalized comparison data
    const mergedData: CompareChartData[] = [];
    const maxLength = Math.max(dataA.length, dataB.length);
    
    // Calculate cumulative returns for better comparison
    const cumulativeA = calculateCumulativeReturns(dataA);
    const cumulativeB = calculateCumulativeReturns(dataB);
    
    console.log(`Cumulative returns calculated - A: ${cumulativeA.length}, B: ${cumulativeB.length}`);
    
    for (let i = 0; i < maxLength; i++) {
      mergedData.push({
        time: `Day ${i + 1}`,
        [periodA]: cumulativeA[i] || 0,
        [periodB]: cumulativeB[i] || 0
      });
    }
    
    return mergedData;
  } catch (error) {
    console.error('Error in fetchTimePeriodComparison:', error);
    return [];
  }
}

// Multi-symbol comparison using existing utilities
export async function fetchMultiSymbolComparison(
  symbols: string[],
  timeframe: string,
  limit?: number
): Promise<CompareChartData[]> {
  try {
    console.log(`Multi-symbol comparison for: ${symbols.join(', ')} (${timeframe})`);
    
    if (symbols.length === 0) {
      console.warn('No symbols provided for comparison');
      return [];
    }

    const { supportedInterval, limit: defaultLimit } = mapTimeframeToInterval(timeframe);
    const actualLimit = limit || defaultLimit;
    
    const dataPromises = symbols.map(symbol => 
      fetchHistoricalKlines(symbol, supportedInterval, actualLimit)
        .catch(error => {
          console.error(`Failed to fetch data for ${symbol}:`, error);
          return [];
        })
    );
    
    const allData = await Promise.all(dataPromises);
    console.log(`Data fetched for ${allData.length} symbols`);
    
    const mergedData: CompareChartData[] = [];
    
    if (allData.length === 0 || allData.every(data => data.length === 0)) {
      console.warn('No valid data available for any symbol');
      return mergedData;
    }
    
    // Calculate normalized cumulative returns for each symbol
    const cumulativeData = allData.map(data => calculateCumulativeReturns(data));
    const maxLength = Math.max(...cumulativeData.map(data => data.length));
    
    // Find the data with the most entries to use for time labels
    const referenceData = allData.find(data => data.length > 0) || [];
    
    for (let i = 0; i < maxLength; i++) {
      const entry: CompareChartData = {
        time: referenceData[i]?.time || `Day ${i + 1}`
      };
      
      symbols.forEach((symbol, index) => {
        const symbolLabel = getSymbolLabel(symbol);
        entry[symbolLabel] = cumulativeData[index][i] || 0;
      });
      
      mergedData.push(entry);
    }
    
    return mergedData;
  } catch (error) {
    console.error('Error in fetchMultiSymbolComparison:', error);
    return [];
  }
}

// Benchmark comparison using existing utilities
export async function fetchBenchmarkComparison(
  symbol: string,
  benchmark: string,
  timeframe: string,
  limit?: number
): Promise<CompareChartData[]> {
  try {
    console.log(`Benchmark comparison: ${symbol} vs ${benchmark} (${timeframe})`);
    
    const { supportedInterval, limit: defaultLimit } = mapTimeframeToInterval(timeframe);
    const actualLimit = limit || defaultLimit;
    
    // Handle special benchmark cases
    if (benchmark === 'market-cap' || benchmark === 'equal-weight') {
      return await fetchIndexBenchmarkComparison(symbol, benchmark, timeframe, actualLimit);
    }
    
    // For regular symbol benchmarks (like BTCUSDT)
    const [symbolData, benchmarkData] = await Promise.all([
      fetchHistoricalKlines(symbol, supportedInterval, actualLimit)
        .catch(error => {
          console.error(`Failed to fetch data for ${symbol}:`, error);
          return [];
        }),
      fetchHistoricalKlines(benchmark, supportedInterval, actualLimit)
        .catch(error => {
          console.error(`Failed to fetch data for ${benchmark}:`, error);
          return [];
        })
    ]);
    
    console.log(`Symbol data: ${symbolData.length} items, Benchmark data: ${benchmarkData.length} items`);
    
    if (symbolData.length === 0) {
      console.warn(`No data available for symbol: ${symbol}`);
      return [];
    }
    
    if (benchmarkData.length === 0) {
      console.warn(`No data available for benchmark: ${benchmark}`);
      return [];
    }
    
    // Calculate normalized cumulative returns
    const symbolCumulative = calculateCumulativeReturns(symbolData);
    const benchmarkCumulative = calculateCumulativeReturns(benchmarkData);
    
    const mergedData: CompareChartData[] = [];
    const minLength = Math.min(symbolCumulative.length, benchmarkCumulative.length);
    
    // Use the shorter dataset to avoid undefined values
    for (let i = 0; i < minLength; i++) {
      const symbolReturn = symbolCumulative[i];
      const benchmarkReturn = benchmarkCumulative[i];
      
      mergedData.push({
        time: symbolData[i]?.time || benchmarkData[i]?.time || `Day ${i + 1}`,
        [getSymbolLabel(symbol)]: symbolReturn,
        [getSymbolLabel(benchmark)]: benchmarkReturn,
        'Outperformance': symbolReturn - benchmarkReturn
      });
    }
    
    return mergedData;
  } catch (error) {
    console.error('Error in fetchBenchmarkComparison:', error);
    return [];
  }
}

// Helper function for index-based benchmarks
async function fetchIndexBenchmarkComparison(
  symbol: string,
  benchmarkType: string,
  timeframe: string,
  limit: number
): Promise<CompareChartData[]> {
  try {
    console.log(`Creating ${benchmarkType} benchmark for ${symbol}`);
    
    const { supportedInterval } = mapTimeframeToInterval(timeframe);
    
    // Define major crypto symbols for index creation
    const indexSymbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT', 'DOTUSDT'];
    
    // Fetch data for the main symbol and all index symbols
    const dataPromises = [
      fetchHistoricalKlines(symbol, supportedInterval, limit),
      ...indexSymbols.map(s => fetchHistoricalKlines(s, supportedInterval, limit))
    ];
    
    const allData = await Promise.all(dataPromises.map(p => 
      p.catch(error => {
        console.error(`Failed to fetch data:`, error);
        return [];
      })
    ));
    
    const [symbolData, ...indexData] = allData;
    
    if (symbolData.length === 0) {
      console.warn(`No data available for symbol: ${symbol}`);
      return [];
    }
    
    // Filter out empty datasets
    const validIndexData = indexData.filter(data => data.length > 0);
    
    if (validIndexData.length === 0) {
      console.warn('No valid index data available');
      return [];
    }
    
    // Calculate index benchmark
    const benchmarkData = calculateIndexBenchmark(validIndexData, benchmarkType);
    
    if (benchmarkData.length === 0) {
      console.warn('Failed to calculate benchmark index');
      return [];
    }
    
    // Calculate cumulative returns
    const symbolCumulative = calculateCumulativeReturns(symbolData);
    const benchmarkCumulative = calculateCumulativeReturns(benchmarkData);
    
    const mergedData: CompareChartData[] = [];
    const minLength = Math.min(symbolCumulative.length, benchmarkCumulative.length);
    
    const benchmarkLabel = benchmarkType === 'market-cap' ? 'Market Cap Index' : 'Equal Weight Index';
    
    for (let i = 0; i < minLength; i++) {
      const symbolReturn = symbolCumulative[i];
      const benchmarkReturn = benchmarkCumulative[i];
      
      mergedData.push({
        time: symbolData[i]?.time || `Day ${i + 1}`,
        [getSymbolLabel(symbol)]: symbolReturn,
        [benchmarkLabel]: benchmarkReturn,
        'Outperformance': symbolReturn - benchmarkReturn
      });
    }
    
    return mergedData;
  } catch (error) {
    console.error('Error creating index benchmark:', error);
    return [];
  }
}

// Helper function to calculate index benchmark
function calculateIndexBenchmark(indexData: ChartData[][], benchmarkType: string): ChartData[] {
  if (indexData.length === 0) return [];
  
  // Find the minimum length across all datasets
  const minLength = Math.min(...indexData.map(data => data.length));
  if (minLength === 0) return [];
  
  const benchmarkData: ChartData[] = [];
  
  for (let i = 0; i < minLength; i++) {
    let totalChange = 0;
    let totalVolume = 0;
    let validCount = 0;
    
    for (const data of indexData) {
      if (data[i] && typeof data[i].change === 'number' && isFinite(data[i].change)) {
        if (benchmarkType === 'market-cap') {
          // Weight by volume as proxy for market cap
          const weight = data[i].volume || 1;
          totalChange += data[i].change * weight;
          totalVolume += weight;
        } else {
          // Equal weight
          totalChange += data[i].change;
        }
        validCount++;
      }
    }
    
    if (validCount > 0) {
      const avgChange = benchmarkType === 'market-cap' && totalVolume > 0
        ? totalChange / totalVolume
        : totalChange / validCount;
      
      benchmarkData.push({
        time: indexData[0][i]?.time || `Day ${i + 1}`,
        change: parseFloat(avgChange.toFixed(2)),
        volume: totalVolume / validCount
      });
    }
  }
  
  return benchmarkData;
}

// Period-over-period comparison using existing utilities
export async function fetchPeriodOverPeriodComparison(
  symbol: string,
  timeframe: string,
  currentPeriod: string
): Promise<CompareChartData[]> {
  try {
    console.log(`Period-over-period comparison for ${symbol}: ${currentPeriod} (${timeframe})`);
    
    const { supportedInterval } = mapTimeframeToInterval(timeframe);
    
    // Calculate previous year period
    const currentDate = new Date(currentPeriod + "-01");
    const previousYear = currentDate.getFullYear() - 1;
    const previousPeriod = `${previousYear}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    
    const currentEnd = getNextMonth(currentPeriod);
    const previousEnd = getNextMonth(previousPeriod);
    
    console.log(`Comparing ${currentPeriod} to ${previousEnd} vs ${previousPeriod} to ${previousEnd}`);
    
    const [currentData, previousData] = await Promise.all([
      fetchHistoricalDataForPeriod(symbol, supportedInterval, currentPeriod, currentEnd),
      fetchHistoricalDataForPeriod(symbol, supportedInterval, previousPeriod, previousEnd)
    ]);
    
    console.log(`Current data: ${currentData.length} items, Previous data: ${previousData.length} items`);
    
    if (currentData.length === 0 && previousData.length === 0) {
      console.warn('No data available for either period');
      return [];
    }
    
    // Calculate cumulative returns for both periods
    const currentCumulative = calculateCumulativeReturns(currentData);
    const previousCumulative = calculateCumulativeReturns(previousData);
    
    const mergedData: CompareChartData[] = [];
    const maxLength = Math.max(currentCumulative.length, previousCumulative.length);
    
    for (let i = 0; i < maxLength; i++) {
      const current = currentCumulative[i] || 0;
      const previous = previousCumulative[i] || 0;
      const yoyChange = previous !== 0 ? ((current - previous) / Math.abs(previous)) * 100 : current - previous;
      
      mergedData.push({
        time: `Day ${i + 1}`,
        [`${currentPeriod} (Current)`]: current,
        [`${previousPeriod} (Previous Year)`]: previous,
        'YoY Difference': yoyChange
      });
    }
    
    return mergedData;
  } catch (error) {
    console.error('Error in fetchPeriodOverPeriodComparison:', error);
    return [];
  }
}

// Helper function to calculate cumulative returns for better comparison visualization
function calculateCumulativeReturns(data: ChartData[]): number[] {
  if (data.length === 0) return [];
  
  const cumulativeReturns = [0]; // Start at 0% for baseline
  
  for (let i = 0; i < data.length; i++) {
    const dailyReturn = data[i].change / 100; // Convert percentage to decimal
    const previousCumulative = cumulativeReturns[i];
    
    // Handle edge cases
    if (isNaN(dailyReturn) || !isFinite(dailyReturn)) {
      cumulativeReturns.push(previousCumulative);
      continue;
    }
    
    const newCumulative = ((1 + previousCumulative / 100) * (1 + dailyReturn) - 1) * 100;
    cumulativeReturns.push(parseFloat(newCumulative.toFixed(2)));
  }
  
  return cumulativeReturns.slice(1); // Remove the initial 0
}

// Helper functions
function getNextMonth(period: string): string {
  try {
    const date = new Date(period + "-01");
    if (isNaN(date.getTime())) {
      console.error(`Invalid date format: ${period}`);
      return period;
    }
    
    date.setMonth(date.getMonth() + 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  } catch (error) {
    console.error('Error calculating next month:', error);
    return period;
  }
}

function getSymbolLabel(symbol: string): string {
  const symbolMap: Record<string, string> = {
    'BTCUSDT': 'Bitcoin',
    'ETHUSDT': 'Ethereum', 
    'BNBUSDT': 'BNB',
    'ADAUSDT': 'Cardano',
    'SOLUSDT': 'Solana',
    'DOTUSDT': 'Polkadot'
  };
  return symbolMap[symbol] || symbol.replace('USDT', '');
}

// Enhanced aggregation function using existing patterns
export function aggregateDataByMonth(data: ChartData[]): ChartData[] {
  if (!data || data.length === 0) return [];
  
  const grouped: Record<string, { changes: number[]; volumes: number[] }> = {};

  data.forEach((item) => {
    if (!item || !item.time) return;
    
    const monthKey = item.time.substring(0, 7); // YYYY-MM
    
    if (!grouped[monthKey]) {
      grouped[monthKey] = { changes: [], volumes: [] };
    }
    
    if (typeof item.change === 'number' && isFinite(item.change)) {
      grouped[monthKey].changes.push(item.change);
    }
    
    if (item.volume && typeof item.volume === 'number' && isFinite(item.volume)) {
      grouped[monthKey].volumes.push(item.volume);
    }
  });

  return Object.entries(grouped)
    .filter(([, { changes }]) => changes.length > 0)
    .map(([monthKey, { changes, volumes }]) => {
      const avgChange = changes.reduce((sum, change) => sum + change, 0) / changes.length;
      const avgVolume = volumes.length > 0 
        ? volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length 
        : 0;

      return {
        time: monthKey + "-01",
        change: parseFloat(avgChange.toFixed(2)),
        volume: parseFloat(avgVolume.toFixed(0))
      };
    })
    .sort((a, b) => a.time.localeCompare(b.time));
}

// Additional utility for calculating performance metrics
export function calculatePerformanceMetrics(dataA: number[], dataB: number[]) {
  try {
    // Filter out invalid values
    const validDataA = dataA.filter(val => typeof val === 'number' && isFinite(val));
    const validDataB = dataB.filter(val => typeof val === 'number' && isFinite(val));
    
    if (validDataA.length === 0 || validDataB.length === 0) {
      return {
        correlation: 0,
        volatilityDifference: 0,
        performanceGap: 0,
        sharpeRatioA: 0,
        sharpeRatioB: 0
      };
    }
    
    const correlation = calculateCorrelation(validDataA, validDataB);
    const volatilityA = calculateStandardDeviation(validDataA);
    const volatilityB = calculateStandardDeviation(validDataB);
    const avgReturnA = validDataA.reduce((sum, val) => sum + val, 0) / validDataA.length;
    const avgReturnB = validDataB.reduce((sum, val) => sum + val, 0) / validDataB.length;
    
    return {
      correlation,
      volatilityDifference: Math.abs(volatilityA - volatilityB),
      performanceGap: avgReturnA - avgReturnB,
      sharpeRatioA: volatilityA !== 0 ? avgReturnA / volatilityA : 0,
      sharpeRatioB: volatilityB !== 0 ? avgReturnB / volatilityB : 0
    };
  } catch (error) {
    console.error('Error calculating performance metrics:', error);
    return {
      correlation: 0,
      volatilityDifference: 0,
      performanceGap: 0,
      sharpeRatioA: 0,
      sharpeRatioB: 0
    };
  }
}

function calculateCorrelation(x: number[], y: number[]): number {
  try {
    const n = Math.min(x.length, y.length);
    if (n === 0) return 0;
    
    const sumX = x.slice(0, n).reduce((sum, val) => sum + val, 0);
    const sumY = y.slice(0, n).reduce((sum, val) => sum + val, 0);
    const sumXY = x.slice(0, n).reduce((sum, val, i) => sum + val * y[i], 0);
    const sumXX = x.slice(0, n).reduce((sum, val) => sum + val * val, 0);
    const sumYY = y.slice(0, n).reduce((sum, val) => sum + val * val, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
    
    if (denominator === 0 || !isFinite(denominator)) return 0;
    
    const correlation = numerator / denominator;
    return isFinite(correlation) ? correlation : 0;
  } catch (error) {
    console.error('Error calculating correlation:', error);
    return 0;
  }
}

function calculateStandardDeviation(values: number[]): number {
  try {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    
    if (variance < 0 || !isFinite(variance)) return 0;
    
    return Math.sqrt(variance);
  } catch (error) {
    console.error('Error calculating standard deviation:', error);
    return 0;
  }
}