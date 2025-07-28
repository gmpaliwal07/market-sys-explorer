"use client";

import React, { useMemo, useEffect, useState } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { OrderBook, OrderBookEntry, TickerData } from "@/features/dashboard/types";
import { Skeleton } from "@/components/ui/skeleton";

interface OrderBookComponentProps {
  orderBook: OrderBook;
  ticker: TickerData | null;
  connectionStatus?: string;
}

const OrderBookComponent: React.FC<OrderBookComponentProps> = ({ 
  orderBook, 
  ticker, 
}) => {
  const [lastUpdateTime, setLastUpdateTime] = useState<string>("");
  const [, setUpdateCount] = useState(0);

  // Track updates for debugging
  useEffect(() => {
    if (orderBook?.lastUpdateId) {
      setLastUpdateTime(new Date().toLocaleTimeString());
      setUpdateCount(prev => prev + 1);
      console.log("OrderBook updated:", {
        updateId: orderBook.lastUpdateId,
        bidsCount: orderBook.bids?.length || 0,
        asksCount: orderBook.asks?.length || 0,
        time: new Date().toLocaleTimeString()
      });
    }
  }, [orderBook.asks?.length, orderBook.bids?.length, orderBook.lastUpdateId]);

  const formatPrice = (price: string | number) => {
    const num = typeof price === 'number' ? price : parseFloat(price);
    return isNaN(num) ? "0.0000" : num.toFixed(4);
  };

  const formatQuantity = (qty: string | number) => {
    const num = typeof qty === 'number' ? qty : parseFloat(qty);
    return isNaN(num) ? "0.000000" : num.toFixed(6);
  };

  const currentPrice = ticker ? parseFloat(ticker.lastPrice) : 0;
  const priceChange = ticker ? parseFloat(ticker.priceChangePercent) : 0;
  const isPositive = priceChange >= 0;

  // Enhanced safety checks with better error handling
  const hasBids = orderBook?.bids && Array.isArray(orderBook.bids) && orderBook.bids.length > 0;
  const hasAsks = orderBook?.asks && Array.isArray(orderBook.asks) && orderBook.asks.length > 0;

  // Calculate depth with error handling
  const calculateDepth = useMemo(() => {
    return (orders: OrderBookEntry[]) => {
      if (!orders || !Array.isArray(orders)) return [];
      
      let total = 0;
      return orders.map(([price, qty]) => {
        try {
          const numPrice = typeof price === 'number' ? price : parseFloat(price);
          const numQty = typeof qty === 'number' ? qty : parseFloat(qty);
          
          if (isNaN(numPrice) || isNaN(numQty)) {
            console.warn("Invalid order data:", { price, qty });
            return { price: 0, qty: 0, total: total };
          }
          
          total += numQty;
          return { price: numPrice, qty: numQty, total };
        } catch (error) {
          console.error("Error processing order:", { price, qty, error });
          return { price: 0, qty: 0, total: total };
        }
      }).filter(order => order.price > 0 && order.qty > 0);
    };
  }, []);

  const bidsWithDepth = useMemo(() => {
    return hasBids ? calculateDepth(orderBook.bids.slice(0, 15)) : [];
  }, [hasBids, orderBook?.bids, calculateDepth]);

  const asksWithDepth = useMemo(() => {
    return hasAsks ? calculateDepth(orderBook.asks.slice(0, 15)) : [];
  }, [hasAsks, orderBook?.asks, calculateDepth]);

  const maxBidTotal = useMemo(() => {
    return bidsWithDepth.length > 0 ? Math.max(...bidsWithDepth.map((b) => b.total), 0) : 0;
  }, [bidsWithDepth]);

  const maxAskTotal = useMemo(() => {
    return asksWithDepth.length > 0 ? Math.max(...asksWithDepth.map((a) => a.total), 0) : 0;
  }, [asksWithDepth]);

  if (!hasBids && !hasAsks) {
    return (
      <div
   
        className="p-4 sm:p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700" />
          <Skeleton className="h-6 w-40 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
        <Skeleton className="h-[300px] w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
      </div>
    );
  }

  return (
    <div
  
      className="flex flex-col overflow-hidden"
    >
      {/* Header with current price and update info */}
      <div
   
        className="p-4 sm:p-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
          <div className="text-left sm:text-right">
            <div className={`text-xl sm:text-2xl font-bold ${isPositive ? "text-emerald-600" : "text-red-500"}`}>
              ${currentPrice.toFixed(2)}
            </div>
            <div className={`text-base sm:text-lg font-medium ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
              {isPositive ? "+ " : ""}{priceChange.toFixed(2)}%
            </div>
          </div>
          <div className="text-left sm:text-right text-xs sm:text-sm text-gray-500 dark:text-gray-200">
            <div>Last Update: {lastUpdateTime}</div>
            <div>ID: #{orderBook?.lastUpdateId || 0}</div>
          </div>
        </div>
      </div>

      {/* Main order book grid */}
      <div className="flex flex-col sm:grid sm:grid-cols-2 gap-0 flex-1 min-h-0">
        {/* Asks (Sell Orders) */}
        <div
     
          className="bg-white/95 dark:bg-transparent border-b sm:border-r sm:border-b-0 border-gray-100 dark:border-gray-700 flex flex-col"
        >
          <div className="p-3 sm:p-4 bg-white/95 dark:bg-transparent border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm sm:text-md font-bold text-red-500 flex items-center justify-between font-text">
              <div className="flex items-center">
                <div className="p-1.5 sm:p-2 bg-red-200 rounded mr-2">
                  <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                Asks (Sell)
              </div>
              <span className="text-xs text-red-600 bg-red-100 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded">
                {hasAsks ? asksWithDepth.length : 0} orders
              </span>
            </h3>
          </div>
          
          {/* Column headers */}
          <div className="grid grid-cols-3 gap-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs font-bold text-gray-600 dark:text-white bg-gray-50 dark:bg-[#171717] border-b border-gray-200 dark:border-gray-700">
            <span className="text-center">Price ($)</span>
            <span className="text-center">Amount</span>
            <span className="text-center">Total</span>
          </div>
          
          {/* Orders list */}
          <div className="flex-1 min-h-0 overflow-y-auto" style={{ 
            scrollbarWidth: 'thin',
            scrollbarColor: '#cbd5e1 #f1f5f9'
          }}>
            {hasAsks ? [...asksWithDepth].reverse().map((ask, index) => {
              const depthPercentage = maxAskTotal > 0 ? Math.min((ask.total / maxAskTotal) * 100, 100) : 0;
              return (
                <div
                  key={`${ask.price}-${ask.qty}-${index}`}
                  className="relative group"
                >
                  <div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent to-transparent transition-all duration-200 dark:from-red-900 dark:to-transparent" 
                    style={{ width: `${depthPercentage}%` }} 
                  />
                  <div className="relative grid grid-cols-3 gap-1 px-2 sm:px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700 transition-all duration-150 border-b border-gray-50 dark:border-gray-700">
                    <span className="font-semibold text-xs sm:text-sm text-center">{formatPrice(ask.price)}</span>
                    <span className="text-xs sm:text-sm text-center">{formatQuantity(ask.qty)}</span>
                    <span className="text-xs sm:text-sm text-gray-500 dark:text-white font-medium text-center">{formatQuantity(ask.total)}</span>
                  </div>
                </div>
              );
            }) : (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-xs sm:text-sm">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-red-400 mx-auto mb-2"></div>
                  Loading ask orders...
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bids (Buy Orders) */}
        <div

          className="bg-white/95 dark:bg-transparent border-t sm:border-t-0 sm:border-l border-gray-100 dark:border-gray-700 flex flex-col"
        >
          <div className="p-3 sm:p-4 bg-white/95 dark:bg-transparent border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm sm:text-md font-bold text-emerald-700 flex items-center justify-between font-text">
              <div className="flex items-center">
                <div className="p-1.5 sm:p-2 bg-emerald-200 rounded mr-2">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                Bids (Buy)
              </div>
              <span className="text-xs text-emerald-600 bg-emerald-100 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded">
                {hasBids ? bidsWithDepth.length : 0} orders
              </span>
            </h3>
          </div>
          
          {/* Column headers */}
          <div className="grid grid-cols-3 gap-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs font-bold text-gray-600 bg-gray-50 border-b border-gray-200 dark:bg-[#171717] dark:text-white dark:border-gray-700">
            <span className="text-center">Price ($)</span>
            <span className="text-center">Amount</span>
            <span className="text-center">Total</span>
          </div>
          
          {/* Orders list */}
          <div className="flex-1 min-h-0 overflow-y-auto" style={{ 
            scrollbarWidth: 'thin',
            scrollbarColor: '#cbd5e1 #f1f5f9'
          }}>
            {hasBids ? bidsWithDepth.map((bid, index) => {
              const depthPercentage = maxBidTotal > 0 ? Math.min((bid.total / maxBidTotal) * 100, 100) : 0;
              return (
                <div
                  key={`${bid.price}-${bid.qty}-${index}`}
                  className="relative group"
                >
                  <div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent-50 to-transparent transition-all duration-300 dark:from-emerald-900 dark:to-transparent dark:group-hover:from-emerald-800 dark:group-hover:to-transparent" 
                    style={{ width: `${depthPercentage}%` }} 
                  />
                  <div className="relative grid grid-cols-3 gap-1 px-2 sm:px-3 py-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-800 transition-all duration-150 border-b border-gray-50 dark:border-gray-700">
                    <span className="font-semibold text-xs sm:text-sm text-right">{formatPrice(bid.price)}</span>
                    <span className="text-xs sm:text-sm text-right">{formatQuantity(bid.qty)}</span>
                    <span className="text-xs sm:text-sm text-gray-500 dark:text-white font-medium text-right">{formatQuantity(bid.total)}</span>
                  </div>
                </div>
              );
            }) : (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-xs sm:text-sm">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-emerald-400 mx-auto mb-2"></div>
                  Loading bid orders...
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderBookComponent;