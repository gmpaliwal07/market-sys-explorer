  import { ChartData, OrderBook, TickerData } from "@/features/dashboard/types";
  import { GroupBy } from "@/utils/getPerformance";

  export interface UnifiedCallbacks {
    onKlineUpdate?: (data: ChartData[], symbol: string, interval: string) => void;
    onOrderBookUpdate?: (orderBook: OrderBook, symbol: string) => void;
    onTickerUpdate?: (ticker: TickerData, symbol: string) => void;
    onConnectionStatus?: (status: string) => void;
  }

  interface Subscription {
    symbols: string[];
    intervals: string[];
    streamTypes: ("kline" | "depth" | "ticker")[];
    callbacks: UnifiedCallbacks;
    groupBy?: GroupBy;
    limit?: number;
  }

  

const WS_STREAM_URL = process.env.NEXT_PUBLIC_WS_STREAM_URL;
const API_URL = process.env.NEXT_PUBLIC_API_URL;
const DEPTH_API_URL = process.env.NEXT_PUBLIC_DEPTH_API_URL;

  export class UnifiedBinanceClient {
    private ws: WebSocket | null = null;
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 3;
    private reconnectDelay: number = 1000;
    private subscriptions: Map<string, Subscription> = new Map();
    private dataMap: Map<string, Map<string, ChartData>> = new Map();
    private orderBookMap: Map<string, OrderBook> = new Map();
    private depthUpdateBuffer: Map<string, { u: number; U: number; b: [string, string][]; a: [string, string][] }[]> = new Map();
    private updateQueue: { type: string; data: any; symbol: string; interval?: string }[] = [];
    private debounceTimeout: NodeJS.Timeout | null = null;

    constructor() {}

    async fetchInitialData(symbol: string, interval: string, limit: number): Promise<ChartData[]> {
      try {
        const response = await fetch(`${API_URL}?symbol=${symbol.toUpperCase()}&interval=${interval}&limit=${limit}`);
        if (!response.ok) throw new Error(`API request failed: ${response.status}`);
        const data = await response.json();
        return data.map((kline: [number, string, string, string, string, string]) => ({
          open: parseFloat(kline[1]),
          high: parseFloat(kline[2]),
          low: parseFloat(kline[3]),
          close: parseFloat(kline[4]),
          time: new Date(kline[0]).toISOString(),
          change: ((parseFloat(kline[4]) - parseFloat(kline[1])) / parseFloat(kline[1])) * 100,
          volume: parseFloat(kline[5]),
        }));
      } catch (error) {
        console.error("Error fetching initial data:", error);
        return [];
      }
    }

  async fetchInitialOrderBook(symbol: string, limit: number = 20): Promise<OrderBook | null> {
    try {
      console.log(`Fetching initial order book for ${symbol}`);
      const response = await fetch(`${DEPTH_API_URL}?symbol=${symbol.toUpperCase()}&limit=${limit}`);
      if (!response.ok) throw new Error(`Order book API request failed: ${response.status}`);
      const data = await response.json();
      
      const orderBook: OrderBook = {
        bids: data.bids.map(([price, qty]: [string, string]) => [parseFloat(price), parseFloat(qty)]),
        asks: data.asks.map(([price, qty]: [string, string]) => [parseFloat(price), parseFloat(qty)]),
        lastUpdateId: data.lastUpdateId || 0,
      };

      this.orderBookMap.set(symbol.toUpperCase(), orderBook);
      
      console.log("Initial order book fetched successfully:", { 
        symbol, 
        bidsCount: orderBook.bids.length,
        asksCount: orderBook.asks.length,
        lastUpdateId: orderBook.lastUpdateId 
      });
      
      // Process any buffered updates
      this.processBufferedDepthUpdates(symbol.toUpperCase());

      return orderBook;
    } catch (error) {
      console.error("Error fetching initial order book:", error);
      return null;
    }
  }

  private processBufferedDepthUpdates(symbol: string): void {
    const bufferedUpdates = this.depthUpdateBuffer.get(symbol) || [];
    const orderBook = this.orderBookMap.get(symbol);
    
    console.log(`Processing ${bufferedUpdates.length} buffered updates for ${symbol}`);
    
    if (!orderBook || bufferedUpdates.length === 0) return;

    bufferedUpdates.sort((a, b) => a.u - b.u);

    let processedCount = 0;
    bufferedUpdates.forEach(update => {
      if (update.U <= orderBook.lastUpdateId + 1 && update.u >= orderBook.lastUpdateId + 1) {
        console.log(`Processing buffered update ${update.u} for ${symbol}`);
        this.applyDepthUpdate(symbol, update);
        processedCount++;
      } else {
        console.log(`Skipping buffered update ${update.u} (out of sequence) for ${symbol}`);
      }
    });

    console.log(`Processed ${processedCount} buffered updates for ${symbol}`);
    this.depthUpdateBuffer.set(symbol, []);
  }

    private applyDepthUpdate(symbol: string, update: { u: number; U: number; b: [string, string][]; a: [string, string][] }): void {
    const orderBook = this.orderBookMap.get(symbol);
    if (!orderBook) {
      console.warn("No orderbook found for symbol:", symbol);
      return;
    }

    console.log("Applying depth update:", { symbol, updateId: update.u, bidsCount: update.b?.length, asksCount: update.a?.length });

    // Process bids
    const bids = [...orderBook.bids];
    const bidUpdates = update.b || [];
    bidUpdates.forEach(([price, qty]: [string, string]) => {
      const priceNum = parseFloat(price);
      const qtyNum = parseFloat(qty);
      
      if (isNaN(priceNum) || isNaN(qtyNum)) {
        console.warn("Invalid bid data:", { price, qty });
        return;
      }
      
      const index = bids.findIndex(([p]) => p === priceNum);
      if (qtyNum === 0 && index !== -1) {
        // Remove the bid
        bids.splice(index, 1);
      } else if (qtyNum > 0) {
        if (index !== -1) {
          // Update existing bid
          bids[index] = [priceNum, qtyNum];
        } else {
          // Add new bid
          bids.push([priceNum, qtyNum]);
        }
      }
    });
      const asks = [...orderBook.asks];
    const askUpdates = update.a || [];
    askUpdates.forEach(([price, qty]: [string, string]) => {
      const priceNum = parseFloat(price);
      const qtyNum = parseFloat(qty);
      
      if (isNaN(priceNum) || isNaN(qtyNum)) {
        console.warn("Invalid ask data:", { price, qty });
        return;
      }
      
      const index = asks.findIndex(([p]) => p === priceNum);
      if (qtyNum === 0 && index !== -1) {
        // Remove the ask
        asks.splice(index, 1);
      } else if (qtyNum > 0) {
        if (index !== -1) {
          // Update existing ask
          asks[index] = [priceNum, qtyNum];
        } else {
          // Add new ask
          asks.push([priceNum, qtyNum]);
        }
      }
      });




      
      const updatedOrderBook: OrderBook = {
      bids: bids.sort((a, b) => b[0] - a[0]).slice(0, 20),
      asks: asks.sort((a, b) => a[0] - b[0]).slice(0, 20),
      lastUpdateId: update.u,
    };

    this.orderBookMap.set(symbol, updatedOrderBook);

    // Enhanced logging
    console.log("OrderBook updated:", {
      symbol,
      bidsCount: updatedOrderBook.bids.length,
      asksCount: updatedOrderBook.asks.length,
      updateId: updatedOrderBook.lastUpdateId,
      bestBid: updatedOrderBook.bids[0]?.[0],
      bestAsk: updatedOrderBook.asks[0]?.[0],
      spread: updatedOrderBook.asks[0] && updatedOrderBook.bids[0] ? 
        (updatedOrderBook.asks[0][0] - updatedOrderBook.bids[0][0]).toFixed(4) : 'N/A'
    });

    const sub = Array.from(this.subscriptions.values()).find(s => 
      s.symbols.includes(symbol) && s.streamTypes.includes("depth")
    );
    if (sub) {
      sub.callbacks.onOrderBookUpdate?.(updatedOrderBook, symbol);
    } else {
      console.warn("No subscription found for depth update:", symbol);
    }
  }


    subscribe(
      symbols: string | string[],
      intervals: string | string[],
      streamTypes: ("kline" | "depth" | "ticker")[],
      callbacks: UnifiedCallbacks,
      groupBy: GroupBy = "day",
      limit: number = 30
    ): () => void {
      const symbolArray = Array.isArray(symbols) ? symbols.map(s => s.toUpperCase()) : [symbols.toUpperCase()];
      const intervalArray = Array.isArray(intervals) ? intervals : [intervals];
      const subscriptionKey = `${symbolArray.sort().join("_")}_${intervalArray.sort().join("_")}_${streamTypes.join("_")}`;

      console.log("Subscribing:", { subscriptionKey, symbols: symbolArray, intervals: intervalArray, streamTypes });

      if (this.subscriptions.has(subscriptionKey)) {
        const sub = this.subscriptions.get(subscriptionKey)!;
        sub.callbacks = { ...sub.callbacks, ...callbacks };
        sub.symbols = symbolArray;
        sub.intervals = intervalArray;
        sub.streamTypes = streamTypes;
        sub.groupBy = groupBy;
        sub.limit = limit;
        return () => this.unsubscribe(subscriptionKey);
      }

      this.subscriptions.set(subscriptionKey, {
        symbols: symbolArray,
        intervals: intervalArray,
        streamTypes,
        callbacks,
        groupBy,
        limit,
      });

      symbolArray.forEach(symbol => {
        intervalArray.forEach(interval => {
          if (streamTypes.includes("kline")) {
            this.fetchInitialData(symbol, interval, limit).then(data => {
              if (data.length) callbacks.onKlineUpdate?.(data, symbol, interval);
            });
          }
        });

        if (streamTypes.includes("depth")) {
          this.fetchInitialOrderBook(symbol, 20).then(orderBook => {
            if (orderBook) {
              callbacks.onOrderBookUpdate?.(orderBook, symbol);
            }
          });
        }
      });

      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        this.connect();
      } else {
        this.updateSubscriptions();
      }

      return () => this.unsubscribe(subscriptionKey);
    }

    private connect(): void {
      if (!WS_STREAM_URL) {
        throw new Error("WebSocket stream URL is not defined.");
      }
      console.log("Connecting to WebSocket:", WS_STREAM_URL);
      this.ws = new WebSocket(WS_STREAM_URL);
      this.setupWebSocketHandlers();
    }

  private updateSubscriptions(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const streams = Array.from(this.subscriptions.values()).flatMap(sub =>
      sub.symbols.flatMap(symbol =>
        sub.intervals.flatMap(interval =>
          sub.streamTypes.map(type => {
            if (type === "kline") return `${symbol.toLowerCase()}@kline_${interval}`;
            if (type === "depth") return `${symbol.toLowerCase()}@depth20`;
            if (type === "ticker") return `${symbol.toLowerCase()}@ticker`;
            return "";
          })
        )
      )
    ).filter(s => s);

    console.log("Updating subscriptions with streams:", streams);

    if (streams.length > 0) {
      const subscribeMessage = {
        method: "SUBSCRIBE",
        params: streams,
        id: Date.now()
      };
      console.log("Sending subscription message:", subscribeMessage);
      this.ws.send(JSON.stringify(subscribeMessage));
    }
  }

    private setupWebSocketHandlers(): void {
      if (!this.ws) return;

      this.ws.onopen = () => {
        console.log("WebSocket connected");
        this.reconnectAttempts = 0;
        this.subscriptions.forEach((sub) => {
          sub.callbacks.onConnectionStatus?.("Connected");
        });
        this.updateSubscriptions();
      };

      this.ws.onmessage = (event) => {
        this.handleStreamMessage(event.data);
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        this.subscriptions.forEach((sub) => {
          sub.callbacks.onConnectionStatus?.("Error");
        });
      };

      this.ws.onclose = (event) => {
        console.log("WebSocket closed:", { code: event.code, reason: event.reason });
        this.subscriptions.forEach((sub) => {
          sub.callbacks.onConnectionStatus?.("Disconnected");
        });
        this.handleReconnection();
      };
    }

  private handleStreamMessage(data: string): void {
    try {
      const message = JSON.parse(data);
      
      // Skip ping/pong and subscription confirmation messages
      if (!message.stream || !message.data) {
        if (message.result === null && message.id) {
          console.log("Subscription confirmed for ID:", message.id);
        }
        return;
      }

      const streamParts = message.stream.split("@");
      const symbol = streamParts[0].toUpperCase();
      const streamTypeFull = streamParts[1];
      
      console.log("Stream message received:", { stream: message.stream, symbol });
      
      let streamType: "kline" | "depth" | "ticker";
      let interval: string | undefined;
      
      if (streamTypeFull.startsWith("kline_")) {
        streamType = "kline";
        interval = streamTypeFull.split("_")[1];
      } else if (streamTypeFull.startsWith("depth")) {
        streamType = "depth";
      } else if (streamTypeFull === "ticker") {
        streamType = "ticker";
      } else {
        console.warn("Unknown stream type:", streamTypeFull);
        return;
      }

      const sub = Array.from(this.subscriptions.values()).find(s =>
        s.symbols.includes(symbol) && s.streamTypes.includes(streamType)
      );

      if (!sub) {
        console.warn("No subscription found for stream:", message.stream);
        return;
      }

      if (streamType === "depth") {
        if (!this.orderBookMap.has(symbol)) {
          console.log(`Buffering depth update for ${symbol}, waiting for initial snapshot`);
          if (!this.depthUpdateBuffer.has(symbol)) {
            this.depthUpdateBuffer.set(symbol, []);
          }
          this.depthUpdateBuffer.get(symbol)!.push(message.data);
          return;
        }
      }

      this.updateQueue.push({ type: streamType, data: message.data, symbol, interval });

      if (!this.debounceTimeout) {
        this.debounceTimeout = setTimeout(() => {
          this.processUpdateQueue();
        }, 50); // Reduced debounce for faster updates
      }
    } catch (error) {
      console.error("Error processing stream message:", error, "Message:", data);
    }
  }

    private processUpdateQueue(): void {
      const queue = [...this.updateQueue];
      this.updateQueue = [];
      this.debounceTimeout = null;

      queue.forEach(({ type, data, symbol, interval }) => {
        const sub = Array.from(this.subscriptions.values()).find(s =>
          s.symbols.includes(symbol) && s.streamTypes.includes(type as "kline" | "depth" | "ticker")
        );
        if (!sub) return;

        if (type === "kline" && interval) {
          const kline = data.k;
          if (kline) {
            const klineData: ChartData = {
              open: parseFloat(kline.o),
              high: parseFloat(kline.h),
              low: parseFloat(kline.l),
              close: parseFloat(kline.c),
              time: new Date(kline.t).toISOString(),
              change: ((parseFloat(kline.c) - parseFloat(kline.o)) / parseFloat(kline.o)) * 100,
              volume: parseFloat(kline.v),
              symbol: symbol.toLowerCase(),
            };
            this.processKlinesData([klineData], sub, symbol, interval);
          }
        } else if (type === "depth") {
    console.log("Depth update received:", { symbol, data });
    
    // Check for the correct data structure
    // Binance depth stream can have two formats:
    // 1. Differential updates: { u, U, b, a } - incremental updates
    // 2. Full snapshot: { lastUpdateId, bids, asks } - full orderbook
    
    if (data.b && data.a && data.u) {
      // This is a differential update with bid/ask arrays and update IDs
      console.log("Processing differential depth update");
      this.applyDepthUpdate(symbol, data);
    } else if (data.bids && data.asks && data.lastUpdateId) {
      // This is a full snapshot - convert it to the expected format
      console.log("Processing full depth snapshot");
      const convertedData = {
        u: data.lastUpdateId,
        U: data.lastUpdateId,
        b: data.bids,
        a: data.asks
      };
      this.applyDepthUpdate(symbol, convertedData);
    } else {
      console.warn("Invalid depth data structure:", data);
      console.log("Expected either { b, a, u } or { bids, asks, lastUpdateId }");
    }
  } else if (type === "ticker") {
          sub.callbacks.onTickerUpdate?.({
            symbol: data.s,
            priceChange: data.p.toString(),
            priceChangePercent: data.P.toString(),
            weightedAvgPrice: data.w.toString(),
            prevClosePrice: data.x.toString(),
            lastPrice: data.c.toString(),
            bidPrice: data.b.toString(),
            askPrice: data.a.toString(),
            openPrice: data.o.toString(),
            highPrice: data.h.toString(),
            lowPrice: data.l.toString(),
            volume: data.v.toString(),
            quoteVolume: data.q.toString(),
            count: data.n,
            price: parseFloat(data.c),
          }, symbol);
        }
      });
    }

    private processKlinesData(
      klines: ChartData[],
      sub: Subscription,
      symbol: string,
      interval: string
    ): void {
    
      const key = `${symbol}_${interval}`;
      if (!this.dataMap.has(key)) {
        this.dataMap.set(key, new Map());
      }
      const dataMap = this.dataMap.get(key)!;

      klines.forEach((kline) => {
        const { time, open, close, high, low, volume, change } = kline;
        if (!time || !open || !close) return;

        const date = new Date(time);
        const timeKey =
          sub.groupBy === "month"
            ? `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-01`
            : interval === "1h"
            ? date.toISOString()
            : date.toISOString().split("T")[0];

        const existing = dataMap.get(timeKey);
        if (existing) {
          dataMap.set(timeKey, {
            symbol,
            open,
            close,
            time: timeKey,
            volume: (existing.volume || 0) + (volume ?? 0),
            change: (existing.change + change) / 2,
            high: Math.max(existing.high || 0, high),
            low: Math.min(existing.low || Number.MAX_VALUE, low),
          });
        } else {
          dataMap.set(timeKey, { symbol, open, close, time: timeKey, change, volume, high, low });
        }
      });

      const sortedData = Array.from(dataMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-(sub.limit || 30))
        .map(([, value]) => value);

    
      sub.callbacks.onKlineUpdate?.(sortedData, symbol, interval);
    }

    private handleReconnection(): void {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        console.log(`Reconnecting attempt ${this.reconnectAttempts} in ${this.reconnectDelay * this.reconnectAttempts}ms`);
        setTimeout(() => {
          this.connect();
          this.subscriptions.forEach(sub => {
            if (sub.streamTypes.includes("depth")) {
              sub.symbols.forEach(symbol => {
                this.fetchInitialOrderBook(symbol, sub.limit || 20).then(orderBook => {
                  if (orderBook) {
                    sub.callbacks.onOrderBookUpdate?.(orderBook, symbol);
                  }
                });
              });
            }
          });
        }, this.reconnectDelay * this.reconnectAttempts);
      } else {
        console.error("Max reconnect attempts reached");

        this.subscriptions.forEach((sub) => {
          sub.callbacks.onConnectionStatus?.("Failed to reconnect");
        });
      }
    }

    private unsubscribe(subscriptionKey: string): void {
      const sub = this.subscriptions.get(subscriptionKey);
      if (sub && this.ws && this.ws.readyState === WebSocket.OPEN) {
        const streams = sub.symbols.flatMap(symbol =>
          sub.intervals.flatMap(interval =>
            sub.streamTypes.map(type => {
              if (type === "kline") return `${symbol.toLowerCase()}@kline_${interval}`;
              if (type === "depth") return `${symbol.toLowerCase()}@depth20`;
              if (type === "ticker") return `${symbol.toLowerCase()}@ticker`;
              return "";
            })
          )
        ).filter(s => s);
        this.ws.send(JSON.stringify({ method: "UNSUBSCRIBE", params: streams, id: Date.now() }));
      }
      this.subscriptions.delete(subscriptionKey);
      this.dataMap.delete(subscriptionKey);
      this.orderBookMap.delete(subscriptionKey);
      this.depthUpdateBuffer.delete(subscriptionKey);
      if (this.subscriptions.size === 0) {
        this.close();
      }
    }

    public off(event: 'connectionStatus', handler: (status: string) => void): void {
      if (!this.ws) return;
      if (event === "connectionStatus" && this.subscriptions.size > 0) {
        this.subscriptions.forEach((sub) => {
          if (sub.callbacks.onConnectionStatus === handler) {
            sub.callbacks.onConnectionStatus = undefined;
          }
        });
      }
    }

    public reconnect(): void {
      this.connect();
    }

    public close(): void {
      if (this.ws) {
        this.ws.close();
        this.ws = null;
      }
      this.subscriptions.clear();
      this.dataMap.clear();
      this.orderBookMap.clear();
      this.depthUpdateBuffer.clear();
    }
  }